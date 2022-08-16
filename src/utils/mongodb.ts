import { MongoClient } from 'mongodb'
import config from '../config/database'

const mongoClient = new MongoClient(config.url)

export default mongoClient