import { Keys, AllKeys } from '../images'

function matchDragon(
  allKeyDiffs: {
    key: Keys
    percentages: number[]
  }[]
) {
  let averageKey: 'dragons' | 'miniDragon'
  let averageMin: number

  allKeyDiffs
    .filter((item): item is { key: 'dragons' | 'miniDragon'; percentages: number[] } =>
      ['dragons', 'miniDragon'].includes(item.key)
    )
    .forEach((item) => {
      const average = item.percentages.reduce((mome, item) => (mome += item), 0) / item.percentages.length

      if (!averageMin || !averageKey) {
        averageMin = average
        averageKey = item.key
      }
      if (average < averageMin) {
        averageMin = average
        averageKey = item.key
      }
    })

  return averageMin! < 50 ? averageKey! : undefined
}

export default function matchKeyByDiffs(
  allKeyDiffs: {
    key: Keys
    percentages: number[]
  }[]
): AllKeys {
  const dragonKey = matchDragon(allKeyDiffs)

  if (dragonKey) {
    return dragonKey
  }

  let key: AllKeys

  const newKeyDiffs = allKeyDiffs.filter((item) => !['dragons', 'miniDragon'].includes(item.key))

  for (let i = 0; i < newKeyDiffs.length; i++) {
    const diffs = newKeyDiffs[i]

    if (diffs.percentages.some((percentage) => percentage < 35)) {
      return diffs.key
    }

    if (diffs.percentages.filter((item) => item < 45).length > 3) {
      key = diffs.key
    }
  }

  return key! || 'unknown'
}
