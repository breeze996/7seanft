import mongodb from './utils/mongodb'
import databaseConfig from './config/database'
import logger from './utils/logger'

;(async () => {
  await mongodb.connect()
  logger.info(`connected successfully to mongodb`)

  const db = mongodb.db(databaseConfig.db)
  const cachesCollection = db.collection(databaseConfig.cachesCollectionName)

  const findResult = await cachesCollection.find({ diffs: { $ne: null } }).toArray()
  for (let index = 0; index < findResult.length; index++) {
    const item = findResult[index]
    await cachesCollection.updateOne(
      { id: item.id },
      {
        $set: {
          diffs: item.diffs.map((item: { key: string; percentages: string[] }) => ({
            ...item,
            percentages: item.percentages.map((item) => parseFloat(item)),
          })),
        },
      }
    )

    logger.info(`update ${item.id}`)
  }

  mongodb.close()
})()
