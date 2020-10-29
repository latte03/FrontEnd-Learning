# 通过proxy 代理对象的key

可以通过配置设置key代理映射关系，优雅的代理对象访问

```js
let dataArry = [
  {
    org_name: "mxx",
    org_code: "212121"
  },
  {
    org_name: "mxss",
    org_code: "212121"
  }
]
let option = {
  org_name: "mxxName",
  org_code: "mxxCode"
}
function proxyArryKey(arry, option) {
  return new Proxy(arry, {
    get(target, key, receiver) {
      const newTarget = Object.keys(target[key]).reduce((prev, cur) => {
        prev[option[cur]] = target[key][cur]
        return prev
      }, {})

      return newTarget
    }
  })
}
console.log(dataArry)
let newDataArry = proxyArryKey(dataArry, option)
console.log(newDataArry[1].mxxName)
```