# 洋葱模型

<!-- TODO: 实现思路 -->



![洋葱模型](https://raw.githubusercontent.com/Agan29/img-for-picgo/main/img/20201030143833.png)

个人理解，简单来说就是函数的嵌套执行，会先执行外层函数在嵌套函数之前的语句，之后有内层函数执行内层函数，直到内层函数执行完全，在往外一层层执行外层函数剩下的语句。

用侵入式的写法就是

```js
function A(){
    console.log(1)
    B()
    function B(){
        console.log(3)
            C()
            function C(){
                console.log(5)
            }
         console.log(4)
    }
    console.log(2)
}

A()

// 输出
// 1
// 3
// 5
// 4
// 2
```

但是这样子写就很不优雅，如果有许多个深层嵌套会很傻逼，也不好扩展。
所以就有了优雅的写法

## 通过递归实现

先定一个app，模拟koa的app实例，middleware用来存储需要执行的函数

```js
let app = {
    middleware: []
}
```

app.use 就是向middleware数组添加函数，最后通过compose执行各个中间件

```js
app.use = function (fn) {
    app.middleware.push(fn)
}


app.use((next) => {
    console.log(0)
    next()
    console.log(4)
})
app.use((next) => {
    console.log(1)
    request()
    next()
    console.log(3)
})
app.use((next) => {
    console.log(2)
    next()
})
app.compose();
```

compose函数会按照顺序调用middleware中的函数，并且给每一个小函数传递一个参数： next函数；如果在小函数中执行next，就会调用这个函数的下一个函数，如果没有执行next，程序就不会往下走.

```js
app.compose = function () {
    dispath(0);
    function dispath(index) {
        if (index === app.middleware.length) return ()=>{};
        const fn = app.middleware[index];
        return fn(function next() {
                return dispath(index + 1);
            });
    }
}

```

## 使用 reduce 函数实现

```js
app.compose = function () {
   // 如果没有中间件，返回空函数执行
    if (app.middleware.length === 0) {
      return ()=>{}; // 返回Promise 成功状态
    }
    // 如果就一个中间件，执行该中间件
    if (app.middleware.length === 1) {
      // 穿一个空函数进去，为了最后一次调用next()不出错
      return app.middleware[0](() => {});
    }
     // reduce ，返回的嵌套函数立即执行，
      app.middleware.reduce((a, b) => {
        return (arg) => a(() => b(arg));
      })(() =>{})
  };
}
```

## 添加异步功能

返回的是一个promise 对象

```js
app.compose = function () {
    dispath(0);
    function dispath(index) {
      if (index === app.middleware.length) return Promise.resolve(); // 返回Promise 成功状态
      const fn = app.middleware[index];
      return Promise.resolve(
        fn(function next() {
          return dispath(index + 1);
        })
      );
    }
}

```

在边界条件中返回promise对象

```js
app.compose = function () {
    // 如果没有中间件，返回空函数执行
    if (app.middleware.length === 0) {
      return Promise.resolve(); // 返回Promise 成功状态
    }
    // 如果就一个中间件，执行该中间件
    if (app.middleware.length === 1) {
      // 穿一个空函数进去，为了最后一次调用next()不出错
      return Promise.resolve(app.middleware[0](() => Promise.resolve()));
    }
    return Promise.resolve(
      // reduce ，返回的嵌套函数立即执行，
      app.middleware.reduce((a, b) => {
        return (arg) => Promise.resolve(a(() => b(arg)));
      })(() => Promise.resolve())
    );
  };
}

```