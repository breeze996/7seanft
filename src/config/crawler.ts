const userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36`
const referer = `https://www.7seasnft.com/`

export const CrawlerConfig = {
  maxConnections: 5,
  rateLimit: 2000,
  timeout: 1000 * 60 * 5,
  method: 'POST',
  headers: {
    'veri-ex-client': 'web',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  jquery: false,
  userAgent,
  referer,
}

export const commonBody = {
  isOrderByQuotedPrice: 1,
  isOrderByCurPendingEndTime: 1,
  'statusList[0]': 5,
}

export const PAGE_SIZE = 100

export const URL = 'https://www.7seasnft.com/web_api/artwork/list'
