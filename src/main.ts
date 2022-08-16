import Crawler from 'crawler'
import logger from './utils/logger'
import { CrawlerConfig } from './config/crawler'
import getActiveTotal from './utils/getActiveTotal'
import getActiveAuctions from './utils/getActiveAuctions'
import { output } from './utils/xlsx'
import AuctionCachesManager from './utils/AuctionCachesManager'

async function main() {
  const crawler = new Crawler(CrawlerConfig)
  const startTime = new Date().getTime()

  logger.info(`Start crawler`)

  // const total = await getActiveTotal(crawler)
  const total = 1110
  try {
    const auctions = await getActiveAuctions(crawler, total)
    const filteredAuctions = auctions.filter((item) => {
      return item.auctionEndTime ? item.auctionEndTime > new Date().getTime() : true
    })

    const endTime = new Date().getTime()

    logger.info(`End crawler,Period is:${((endTime - startTime) / (1000 * 60)).toFixed(2)} minute`)
    output(filteredAuctions)
    AuctionCachesManager.set(filteredAuctions)
  } catch (error) {
    console.log(error)
  }
}

main()
