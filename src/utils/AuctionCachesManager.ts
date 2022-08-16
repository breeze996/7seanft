import * as fs from 'fs'
import path from 'path'
import { Auction } from '../types'

const auctionsJsonPath = path.resolve(__dirname, '../data/auctions.json')

export default class AuctionCachesManager {
  static get() {
    return JSON.parse(fs.readFileSync(auctionsJsonPath).toString()) as Auction[]
  }

  static set(auctions: Auction[]) {
    fs.writeFileSync(auctionsJsonPath, JSON.stringify(auctions))
  }

  static remove() {
    fs.unlinkSync(auctionsJsonPath)
  }
}
