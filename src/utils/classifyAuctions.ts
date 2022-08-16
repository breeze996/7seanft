import { createCanvas, loadImage } from 'canvas'
import { Collection, Document } from 'mongodb'
import { allKeys, AllKeys, Keys } from '../images'
import images from '../images/images.json'
import { Auction } from '../types'
import { getDiff } from './getDiff'
import logger from './logger'
import mongodb from './mongodb'
import databaseConfig from '../config/database'
import matchKeyByDiffs from './matchKeyByDiffs'
import retry from './retry'
import groupingArray from './groupingArray'

async function classifyAuctions(
  auctions: Auction[],
  classes: { [K in AllKeys]: Auction[] },
  cachesCollection: Collection<Document>
) {
  await Promise.all(
    auctions.map(async (auction) => {
      try {
        await retry(classifyAuction, { delay: 3000 }, [auction, classes, cachesCollection])
      } catch (error) {
        logger.error(`ClassifyAuctions:diff error`)
        console.log(error)
        classes['error'].push(auction)
      }
    })
  )
}

async function classifyAuction([auction, classes, cachesCollection]: [
  Auction,
  { [K in AllKeys]: Auction[] },
  Collection<Document>
]) {
  const [cache] = await cachesCollection.find({ id: auction.id }).toArray()
  if (cache) {
    const key = cache.key as AllKeys
    classes[key].push(auction)
    return
  }

  try {
    const image = await loadImage(auction.miniImageUrl)
    const canvas = createCanvas(290, 290)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)

    const allKeyDiffs = (await Promise.all(
      (images as { sources: string[]; key: Keys }[]).map(async ({ sources, key }) => ({
        key,
        percentages: await getDiff(sources, canvas.toBuffer()),
      }))
    )) as {
      key: Keys
      percentages: number[]
    }[]
    const key = matchKeyByDiffs(allKeyDiffs)

    classes[key].push(auction)
    await cachesCollection.insertMany([{ id: auction.id, key: key, image: auction.miniImageUrl, diffs: allKeyDiffs }])
  } catch (error) {
    // throw error
  }
}

process.on('message', async ([auctions]: [Auction[]]) => {
  await mongodb.connect()
  logger.info(`child process ${process.pid} connected successfully to mongodb,diff ${auctions.length}`)

  const db = mongodb.db(databaseConfig.db)
  const cachesCollection = db.collection(databaseConfig.cachesCollectionName)

  const classes = allKeys.reduce<{ [K in AllKeys]: Auction[] }>((memo, key) => {
    memo[key] = []
    return memo
  }, {} as any)

  const groupAuctions = groupingArray(auctions, 100)

  for (let index = 0; index < groupAuctions.length; index++) {
    const element = groupAuctions[index]
    await classifyAuctions(element, classes, cachesCollection)
  }

  mongodb.close()
  process?.send?.({ message: 'end', classes })
  logger.info(
    `child process ${process.pid} analyze ${
      Object.values(classes).reduce((memo, item) => memo.concat(item), [] as Auction[]).length
    } successfully`
  )
  process.exit(0)
})
