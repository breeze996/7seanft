import Crawler, { CrawlerRequestResponse, CreateCrawlerOptions } from 'crawler'
import qs from 'qs'
import logger from './logger'
import { URL, commonBody, PAGE_SIZE } from '../config/crawler'
import { Auction } from '../types'
import groupingArray from './groupingArray'

function getItem(crawler: Crawler, pages: number[]): Promise<Auction[]> {
  const auctions: Auction[] = []

  return new Promise((resolve, reject) => {
    try {
      crawler.queue(
        pages.map((page) => ({
          uri: URL,
          preRequest: (options: CreateCrawlerOptions, done: () => void) => {
            options.body = qs.stringify({ ...commonBody, page, pageSize: PAGE_SIZE })
            done()
          },
          callback(error: Error | undefined, res: CrawlerRequestResponse, done: () => void) {
            if (error) {
              logger.error(`Request ${page} failed`, error)
              reject(error)
              return
            }
            auctions.push(JSON.parse(res.body instanceof Buffer ? res.body.toString() : res.body).data)
            done()
            if (auctions.length === pages.length) {
              resolve(auctions.reduce<Auction[]>((memo, item) => memo.concat(item), []))
              logger.info(
                'Finish pages',
                !(pages[0] - 1) ? 1 : (pages[0] - 1) * PAGE_SIZE,
                '-',
                pages[pages.length - 1] * PAGE_SIZE
              )
            }
          },
        }))
      )
    } catch (error) {
      logger.error(`Request ${pages} failed`, error)
      reject(error)
    }
  })
}

export default async function getActiveAuctions(crawler: Crawler, total: number) {
  const groupPages = groupingArray(
    Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1),
    5
  )
  const orders = await Promise.all(groupPages.map((pages) => getItem(crawler, pages)))
  return orders.reduce<Auction[]>((t, i) => t.concat(i), [])
}
