# Vue3

## Vue2.0和Vue3.0的区别

1. 重构响应式系统，使用Proxy替换`Object.defineProperty`，使用Proxy优势：
   - 可直接监听数组类型的数据变化
   - 监听的目标为对象本身，不需要像`Object.defineProperty`一样遍历每个属性，有一定的性能提升
   - 可拦截`apply`、`ownKeys`、`has`等13种方法，而`Object.defineProperty`不行
   - 直接实现对象属性的新增/删除
2. 新增`Composition API`，更好的逻辑复用和代码组织
3. 重构 `Virtual DOM`
   - 模板编译时的优化，将一些静态节点编译成常量
   - `slot`优化，将`slot`编译为`lazy`函数，将`slot`的渲染的决定权交给子组件
   - 模板 中内联事件的提取并重用（原本每次渲染都重新生成内联函数）
4. 代码结构调整，更便于`Tree shaking`，使得体积更小
5. 使用`Typescript`替换`Flow`



## 为什么要新增`Composition API`，它能解决什么问题

`Vue2.0`中，随着功能的增加，组件变得越来越复杂，越来越难维护，而难以维护的根本原因是`Vue`的`API`设计迫使开发者使用`watch`，computed，`methods`选项组织代码，而不是实际的业务逻辑。
另外Vue2.0缺少一种较为简洁的低成本的机制来完成逻辑复用，虽然可以`minxis`完成逻辑复用，但是当`mixin`变多的时候，会使得难以找到对应的`data`、`computed`或者`method`来源于哪个mixin，使得类型推断难以进行。
所以`Composition API`的出现，主要是也是为了解决`Option API`带来的问题，第一个是代码组织问题，`Compostion API`可以让开发者根据业务逻辑组织自己的代码，让代码具备更好的可读性和可扩展性，也就是说当下一个开发者接触这一段不是他自己写的代码时，他可以更好的利用代码的组织反推出实际的业务逻辑，或者根据业务逻辑更好的理解代码。
第二个是实现代码的逻辑提取与复用，当然`mixin`也可以实现逻辑提取与复用，但是像前面所说的，多个`mixin`作用在同一个组件时，很难看出property是来源于哪个`mixin`，来源不清楚，另外，多个`mixin`的`property`存在变量命名冲突的风险。而`Composition API`刚好解决了这两个问题。



## 在Vue3.0优雅的使用v-model


在`Vue2.0`中如何实现双向数据绑定一种是`v-model`，另一种是`.sync`。因为一个组件只能用于一个`v-model`，但是有的组件需要有多个可以双向响应的数据，所以就出现了`.sync`。在`Vue3.0`中为了实现统一，实现了让一个组件可以拥有多个`v-model`，同时删除掉了`.sync`。在vue3.0中，`v-model`后面需要跟一个`modelValue`，即要双向绑定的属性名，`Vue3.0`就是通过给不同的`v-model`指定不同的`modelValue`来实现多个`v-model`。

> 参考地址: https://v3.vuejs.org/guide/migration/v-model.html#overview

## SSR是什么，原理是什么？

在客户端请求服务器的时候，服务器到数据库中获取到相关的数据，并且在服务器内部将`Vue`组件渲染成`HTML`，并且将数据、`HTML`一并返回给客户端，这个在服务器将数据和组件转化为HTML的过程，叫做服务端渲染`SSR`。

而当客户端拿到服务器渲染的`HTML`和数据之后，由于数据已经有了，客户端不需要再一次请求数据，而只需要将数据同步到组件或者`Vuex`内部即可。除了数据意外，`HTML`也结构已经有了，客户端在渲染组件的时候，也只需要将`HTML`的`DOM`节点映射到`Virtual DOM`即可，不需要重新创建`DOM`节点，这个将数据和`HTML`同步的过程，又叫做客户端激活。

**使用SSR的好处：**

- **有利于`SEO`：**其实就是有利于爬虫来爬你的页面，因为部分页面爬虫是不支持执行`JavaScript`的，这种不支持执行`JavaScript`的爬虫抓取到的非SSR的页面会是一个空的`HTML`页面，而有了`SSR`以后，这些爬虫就可以获取到完整的`HTML`结构的数据，进而收录到搜索引擎中。

- **白屏时间更短：**相对于客户端渲染，服务端渲染在浏览器请求`URL`之后已经得到了一个带有数据的`HTML`文本，浏览器只需要解析`HTML`，直接构建`DOM`树就可以。而客户端渲染，需要先得到一个空的`HTML`页面，这个时候页面已经进入白屏，之后还需要经过加载并执行 `JavaScript`、请求后端服务器获取数据、`JavaScript` 渲染页面几个过程才可以看到最后的页面。特别是在复杂应用中，由于需要加载 `JavaScript` 脚本，越是复杂的应用，需要加载的 `JavaScript` 脚本就越多、越大，这会导致应用的首屏加载时间非常长，进而降低了体验感。



## Composition API与React Hook的区别

从`React Hook`的实现角度看，`React Hook`是根据`useState`调用的顺序来确定下一次重渲染时的`state`是来源于哪个`useState`，所以出现了以下限制

- 不能在循环、条件、嵌套函数中调用Hook[^Hook]
- 必须确保总是在你的React函数的顶层调用Hook
- `useEffect`、`useMemo`等函数必须手动确定依赖关系

而`Composition API`是基于`Vue`的响应式系统实现的，与`React Hook`的相比声明在`setup`函数内，一次组件实例化只调用一次`setup`，而`React Hook`每次重渲染都需要调用`Hook`，使得`React`的`GC`比`Vue`更有压力，性能也相对于`Vue`来说也较慢;

 `Compositon API`的调用不需要顾虑调用顺序，也可以在循环、条件、嵌套函数中使用;

响应式系统自动实现了依赖收集，进而组件的部分的性能优化由`Vue`内部自己完成，而`React Hook`需要手动传入依赖，而且必须必须保证依赖的顺序，让`useEffect`、`useMemo`等函数正确的捕获依赖变量，否则会由于依赖不正确使得组件性能下降。

虽然`Compositon API`看起来比`React Hook`好用，但是其设计思想也是借鉴`React Hook`的。



[^Hook]:  React 靠的是 Hook 调用的顺序,知道哪个 state 对应哪个 useState,只要 Hook 的调用顺序在多次渲染之间保持一致，React 就能正确地将内部 state 和对应的 Hook 进行关联 [Hook rules](https://zh-hans.reactjs.org/docs/hooks-rules.html#explanation)