import path from 'path'
import * as fs from 'fs'
import { sources } from '.'

const images = sources.map(({ key, sources }) => {
  return {
    key: key,
    sources: Array.from({ length: sources }, (_, i) => i + 1).map((item) =>
      fs.readFileSync(path.resolve(__dirname, `./sources/${key}/${item}.png`))
    ),
  }
})

;(() => {
  fs.writeFileSync(
    path.resolve(__dirname, `./images.json`),
    JSON.stringify(
      images.map((item) => ({
        key: item.key,
        sources: item.sources.map((source) => source.toString('base64')),
      }))
    )
  )
})()
