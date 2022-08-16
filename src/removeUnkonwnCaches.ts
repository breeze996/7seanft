import mongodb from './utils/mongodb'
import databaseConfig from './config/database'
import logger from './utils/logger'


;(async () => {
  await mongodb.connect()
  logger.info(`connected successfully to mongodb`)

  const db = mongodb.db(databaseConfig.db)
  const cachesCollection = db.collection(databaseConfig.cachesCollectionName)

  const findResult = await cachesCollection.find({ key: 'unknown' }).toArray()

  await cachesCollection.deleteMany({ key: "unknown"});
  
  logger.info(`deleted ${findResult.length} unkonwn caches`)
  
  mongodb.close()
})()
