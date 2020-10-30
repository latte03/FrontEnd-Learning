/*
 * @Author: Agan
 * @Date: 2020-10-29 09:56:27
 * @LastEditors: Agan
 * @LastEditTime: 2020-10-30 14:52:57
 * @Description:
 */
// 通过递归和reduce实现一个简单洋葱模型，类似koa中的实现方式

let app = {
  middleware: [],
};

// 当我们尝试执行fn的时候，它会按照顺序调用之前函数数组中的函数，并且给每一个小函数传递一个参数： next函数。
// 如果在小函数中执行next，就会调用这个函数的下一个函数，如果没有执行next，程序就不会往下走.
// 洋葱模型实际是函数的嵌套执行，会先执行外层函数在嵌套函数之前的语句，之后有内层函数执行内层函数，直到内层函数执行完全，在往外一层层执行外层函数剩下的语句
// 洋葱模型重点是如何优雅的实现，可以通过递归和reduce函数实现
// 同时可以支持异步，async/await

app.compose = function () {
  // let f0 = app.middleware[0]
  // f0(function next() {
  // 	let f1 = app.middleware[1]
  // 	f1(function next() {
  // 		let f2 = app.middleware[2]
  // 		//...
  // 	})
  // })

  const useDispatch = () => {
    //  递归实现, 添加了 异步实现
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
  };
  useDispatch();

  const composeReduce = () => {
    // reduce 实现
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

  // composeReduce()
};

app.use = function (fn) {
  app.middleware.push(fn);
};

const request = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
      console.log("这是异步");
    }, 5000);
  });
};

app.use(async (next) => {
  console.log(0);
  await next();
  console.log(4);
});
app.use(async (next) => {
  console.log(1);
  await request();
  await next();
  console.log(3);
});
app.use((next) => {
  console.log(2);
  next();
});

app.compose();

// let fn = compose(middleware)
// fn()
