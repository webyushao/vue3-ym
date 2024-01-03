
const queue = []

let isFlashing = false

const reslovePromise = Promise.resolve()
export const queueJob = (job) => {
  console.log(job, 'job')
  if (!queue.includes(job)) {
    queue.push(job)
  }
  // 最终我要清空队列
  if (!isFlashing) {
    isFlashing = true
   
    reslovePromise.then(() => {
      console.log(queue, 'QUEUE')
      isFlashing = false
      const copy = queue.slice(0)
      queue.length = 0
      copy.forEach(c => {
        c()
      })
      
    })
  }
}