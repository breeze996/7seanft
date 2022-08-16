import { allKeys, AllKeys } from './images'
import * as fs from 'fs'
import { Auction } from './types'
import groupingArray from './utils/groupingArray'
import logger from './utils/logger'
import xlsx from 'node-xlsx'
import { commonColumn, normalAuction } from './utils/xlsx'
import childProcess from 'child_process'
import os from 'os'
import path from 'path'
import AuctionCachesManager from './utils/AuctionCachesManager'

const cpus = os.cpus().length

type Classes = { [K in AllKeys]: Auction[] }

const CLASSES = allKeys.reduce<Classes>((memo, key) => {
  memo[key] = []
  return memo
}, {} as any)

async function main() {
  const auctions = AuctionCachesManager.get()
  const groupAuctions = groupingArray(auctions, Math.ceil(auctions.length / cpus))

  logger.info(`diff length ${auctions.length},${cpus} processes`)

  function createWorker(auctionGrouped: Auction[]) {
    if (!auctionGrouped || !auctionGrouped.length) {
      return Promise.resolve<Classes>(CLASSES)
    }

    return new Promise<Classes>((resolve) => {
      const worker = childProcess.fork(path.resolve(__dirname, './utils/classifyAuctions.ts'))
      worker.send([auctionGrouped])
      worker.on('message', function ({ message, classes }: { message: string; classes: Classes }) {
        if (message === 'end') {
          resolve(classes)
        }
      })
    })
  }

  const classList = await Promise.all(groupAuctions.map(async (data) => createWorker(data)))

  const classes = classList.reduce((memo, item) => {
    for (const key in memo) {
      memo[key as AllKeys] = memo[key as AllKeys].concat(item[key as AllKeys])
    }
    return memo
  }, CLASSES)

  const worksheets = (Object.keys(classes) as AllKeys[]).map((key) => ({
    name: key,
    data: [commonColumn, ...classes[key].map((item) => normalAuction(item))],
    options: {},
  }))

  const buffer = xlsx.build(worksheets)
  fs.writeFileSync(`./${new Date().getTime()}_types.xlsx`, buffer, {
    flag: 'w',
  })
  AuctionCachesManager.remove()
  logger.info(`classify:diff ended`)
}

main()
