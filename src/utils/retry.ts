const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export default function retry<T, A>(
  fn: (args: A) => Promise<T>,
  options: { delay?: number; maxRetry?: number },
  args: A
) {
  const { maxRetry = 3, delay = 0 } = options
  let currentRetry = maxRetry

  return new Promise(async (resolve, reject) => {
    while (currentRetry > 0) {
      try {
        const res = await fn(args)
        resolve(res)
        break
      } catch (error) {
        await wait(delay)
        currentRetry--
        console.warn(`retry: lave retry${currentRetry}`)
        if (!currentRetry) {
          reject(error)
          break
        }
      }
    }
  })
}
