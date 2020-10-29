
# 字节编程题：实现一个add方法

例如

```sh
add(1)(2,3)(4).value()
输出： 10

```

```js
function add(...a) {
    function _add(...b) {
        return add(...a, ...b)
    }
    _add.value = () =>  a.reduce((i, n) => i + n)
    return _add

}

add(1)(2, 3)(3)(7)(7).value()

```
