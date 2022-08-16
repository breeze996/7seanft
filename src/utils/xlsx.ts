import xlsx from 'node-xlsx'
import * as fs from 'fs'
import formatDate from './formatDate'
import { Auction } from '../types'

export const commonColumn = [
  'id',
  'title',
  'maxQuotedPrice',
  'lastTradePrice',
  'auctionStartingPrice',
  'auctionBeginTime',
  'auctionEndTime',
]

export const normalAuction = (element: Auction) => {
  const maxQuotedPrice = parseFloat(element.maxQuotedPrice)
  return [
    element.id,
    element.title,
    Number.isNaN(maxQuotedPrice) ? parseFloat(element.auctionStartingPrice) : maxQuotedPrice,
    parseFloat(element.lastTradePrice),
    parseFloat(element.auctionStartingPrice),
    formatDate(element.auctionBeginTime),
    element.auctionEndTime ? formatDate(element.auctionEndTime) : '',
  ]
}

export function output(auctions: Auction[], path = `./${Date.now()}_output.xlsx`) {
  const data = [commonColumn].concat(auctions.map((item) => normalAuction(item)) as any[])

  const buffer = xlsx.build([{ name: 'sheet1', data, options: {} }])
  fs.writeFileSync(path, buffer, {
    flag: 'w',
  })
}
