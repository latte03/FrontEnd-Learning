# 蜗牛爬井

```js

function getDate(m, h) {
  let n = h * 100
  let res = 0,
    downL = 0
  date = 0
  for (let i = 0; res < n; i++) {
    res = m - downL + res
    if (res > n) {
      date = i + 1
      return date
    } else {
      downL = downL + m / Math.pow(2, i + 1)
    }
  }
}
console.log(getDate(60, 1))

```

```js
function getCom(m) {
  return m * 100
}

// day用的天数，height爬的高度
function getDay(day, height, n, m) {
  height = height + getDown(n, day, 0)
  if (height >= m) {
    return day
  } else {
    //day = day + 1;
    height = height + n - getDown(n, day, 0)
    return getDay(++day, height, n, m)
  }
}
function getDown(n, day, cm) {
  if (day === 1) {
    cm = cm + n / 2
    return cm
  } else {
    cm += n / Math.pow(2, day)
    return n, --day, cm
  }
}
function main(n, m) {
  m = getCom(m)
  return getDay(1, 0, n, m)
}
const day = main(60, 1)
console.log(day)
```