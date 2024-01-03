
// 最长递增子序列


// 最优情况 [1, 2, 3, 4 , 5, 6] -> [0, 1, 2, 3, 4, 5]

// 采用2分查找 + 贪心算法实现


function getSequence (arr) {
  let len = arr.length
  let result = [0]
  let resultLastIndex
  let middle
  let start, end
  let p = arr.slice(0)

  for (let i = 0; i < arr.length; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex // 让当前最后一项记住前一项的索引
        continue
      }

      start = 0
      end = result.length - 1
      middle;
      while (start < end) {
        middle = (end + start) / 2 | 0
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }

      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1] // 记住换的那个前一项的索引
        result[start] = i
      }
    }
  }
  // 追溯
  let i = result.length
  let last = result[i - 1] // 最后一项的索引
  console.log(p)
  while (i-- > 0) {
    result[i] = last // 用最后一项的索引来追溯
    last = p[last] // 用p的索引来追溯
  } 

  return result
}
console.log(getSequence([2, 5, 8, 4, 6, 7, 9, 3]))

// 1. 看最新的一项和尾部的关系，如果比他大，直接放在后面
// 2. 去列表中查找，比当前值大的做替换

// 2  5 8 4 6 7 9 3

// 2
// 2 5
// 2 5 8
// 2 4 8
// 2 4 6 
// 2 4 6 7
// 2 4 6 7 9
// 2 3 6 7 9  虽然结果不对，但是个数对 但是可以通过前驱节点来修复