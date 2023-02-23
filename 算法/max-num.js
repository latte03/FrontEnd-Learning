// 找出最大两个数的索引
const test = [1, 2, 3, 3, 9]

function find(test) {
  const first = { index: 0, value: 0 }
  const second = { index: 0, value: 0 }
  test.forEach((item, index) => {
    if (index === 0) {
      first.index = index
      first.value = item

      return
    }

    if (second.value > item) {
      return
    }

    if (first.value < item) {
      second.index = first.index
      second.value = first.value
      first.index = index
      first.value = item
      return
    }

    if (first.value >= item && second.value < item) {
      second.index = index
      second.value = item
      return
    }
  })

  return [first.index, second.index]
}

console.log(find(test))
