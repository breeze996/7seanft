import { createCanvas, loadImage } from 'canvas'
import mongodb from './utils/mongodb'
import groupingArray from './utils/groupingArray'
import databaseConfig from './config/database'
import retry from './utils/retry'
import { AllKeys, Keys } from './images'
import images from './images/images.json'
import logger from './utils/logger'
import { getDiff } from './utils/getDiff'

interface Caches {
  id: number
  image: string
  key: AllKeys
  diffs: {
    key: string
    percentages: number[]
  }[]
}

;(async () => {
  await mongodb.connect()
  logger.info(`connected successfully to mongodb`)

  const db = mongodb.db(databaseConfig.db)
  const cachesCollection = db.collection(databaseConfig.cachesCollectionName)

  const findResult = await cachesCollection.find({ key: 'unknown', image: { $ne: null } }).toArray()

  async function update([item]: [Caches]) {
    try {
      const image = await loadImage(item.image)
      const canvas = createCanvas(290, 290)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)

      const allKeyDiffs = await Promise.all(
        (images as { sources: string[]; key: Keys }[]).map(async ({ sources, key }) => ({
          key,
          percentages: await getDiff(sources, canvas.toBuffer()),
        }))
      )

      let key: AllKeys | undefined = undefined
      for (let index = 0; index < allKeyDiffs.length; index++) {
        const element = allKeyDiffs[index]
        if (element.key !== 'dragons' && element.key !== 'miniDragon') {
          if (element.percentages.some((item) => item < 35)) {
            key = element.key
          } else if (element.percentages.filter((item) => item < 50).length > 3) {
            key = element.key
          }
        }
      }
      if (key) {
        logger.info('update', item.id, 'to', key)
      }
      await cachesCollection.updateOne({ id: item.id }, { $set: { key: key ? key : 'unknown', allKeyDiffs } })
    } catch (error) {
      throw error
    }
  }

  async function classify(items: Caches[]) {
    await Promise.all(
      items.map(async (item) => {
        try {
          await retry(update, { delay: 1500 }, [item])
        } catch (error) {
          console.log(error)
          throw error
        }
      })
    )
  }

  const groupData = groupingArray(findResult, 50)

  for (let index = 0; index < groupData.length; index++) {
    const item = groupData[index]
    console.log('start update', index)
    try {
      await classify(item as unknown as Caches[])
    } catch (error) {
      console.log(`update ${index} error`, error)
    } finally {
      console.log('end update', index)
    }
  }

  mongodb.close()
})()
