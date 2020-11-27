# intersectionobserver

传统的实现方法是，监听到scroll事件后，调用目标元素（绿色方块）的getBoundingClientRect()方法，得到它对应于视口左上角的坐标，再判断是否在视口之内。这种方法的缺点是，由于scroll事件密集发生，计算量很大，容易造成性能问题。

目前有一个新的 IntersectionObserver API，可以自动"观察"元素是否可见，Chrome 51+ 已经支持。由于可见（visible）的本质是，目标元素与视口产生一个交叉区，所以这个 API 叫做"交叉观察器"。


IntersectionObserver API 是异步的，不随着目标元素的滚动同步触发。

规格写明，IntersectionObserver的实现，应该采用requestIdleCallback()，即只有线程空闲下来，才会执行观察器。这意味着，这个观察器的优先级非常低，只在其他任务执行完，浏览器有了空闲才会执行

## intersection-observer

IntersectionObserver polyfill

```ssh
npm i intersection-observer
```

With these polyfills, IntersectionObserver has been tested an known to work in the following browsers:

| Chrome | Firefox | Safari | Edge | Internet Explorer | Opera | Android |
| ------ | ------- | ------ | ---- | ----------------- | ----- | ------- |
| ✅      | ✅       | 6+     | ✅    | 7+                | ✅     | 4.4     |
