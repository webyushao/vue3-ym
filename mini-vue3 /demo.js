function getSequence (arr) { // [1, 2, 3, 5, 4] result [0, 1, 2, 3]
  let len = arr.length
  let result = [0]
  let p = arr.slice(0)
  let resultLastIndex
  let start
  let end
  let middle
  for (let i = 0; i < len; i++) {
    const arrI = arr[i]
    resultLastIndex = result[result.length - 1]
    if (arrI > arr[resultLastIndex]) {
      result.push(i)
      p[i] = resultLastIndex
      continue
    }
    let start = 0
    let end = result.length - 1
    while (start < end) {
      middle = (start + end) / 2 | 0
      if (arrI > arr[result[middle]]) {
        start = middle + 1
      } else {
        end = middle
      }
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1]
        result[start] = i
      }
    }
  }

  let i = result.length
  let last = result[i - 1]
  console.log(p)
  while (i-- > 0) {
    result[i] = last
    last = p[last]
  }

  return result
}


console.log(getSequence([1, 2, 4, 3, 7, 6, 5]))