export const keys = ['dragons', 'phoenixs', 'miniDragon', 'mouses', 'rabbits'] as const
export type Keys = typeof keys[number]

export const allKeys = ['unknown', 'error', ...keys] as const
export type AllKeys = typeof allKeys[number]

export const sources: { key: Keys; sources: number }[] = [
  { key: 'dragons', sources: 6 },
  { key: 'miniDragon', sources: 6 },
  { key: 'phoenixs', sources: 12 },
  { key: 'mouses', sources: 21 },
  { key: 'rabbits', sources: 8 },
]
