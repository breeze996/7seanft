export default function groupingArray<T>(array: T[], sliceNumber = 5) {
  const ret: T[][] = []
  for (let i = 0; i < array.length; i += sliceNumber) {
    ret.push(array.slice(i, i + sliceNumber))
  }
  return ret
}
