import Crawler from 'crawler'
import qs from 'qs'
import logger from './logger'
import { URL, commonBody } from '../config/crawler'

export default function getActiveTotal(crawler: Crawler): Promise<number> {
  return new Promise((resolve, reject) => {
    crawler.queue({
      uri: URL,
      preRequest: (options, done: () => void) => {
        options.body = qs.stringify({ ...commonBody, page: 1, pageSize: 1 })
        done()
      },
      callback(error, res, done) {
        if (error) {
          logger.error('Failed to get active total')
          reject(error)
          return
        }
        const total = JSON.parse(res.body instanceof Buffer ? res.body.toString() : res.body).total
        logger.info('Active total', total)
        resolve(total)
        done()
      },
    })
  })
}
