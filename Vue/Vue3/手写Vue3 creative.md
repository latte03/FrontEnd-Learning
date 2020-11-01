# vue3 creative 实现原理

## 整体思路

1. 通过 `proxy` 包装 `state`
2. 在 `useEffct` 初始化执行时，完成依赖收集，get 的时候，track 函数收集依赖于` state[WeakMap]:value[Map]`的副作用
   - 对每一个`key[Set]`，使用`new Set()`收集依赖于它的`effct`
3. 在 set 的时候，`trigger` 函数分发执行副作用函数
   - 不存在依赖于他的副作用函数时，直接`return`
   - 对收集的副作用函数进行分类，`effct`和`computed`进行区别，分别循环调用`effect`和`computed`

最后需要维护的对象结构大概如下

```js
{
   state[WeakMap]:[Map]{
      key[Set]:[effect1,effect2],
       key[Set]:[effect1,effect2]
   }
 }
```

**源码**如下

```js
/**
 * 收集依赖于state的函数，使用弱引用，方便垃圾回收
 * 最后我们希望得到的targetMap对象的形式如下target即是被包装的对象
 * 最后维护的对象
 * {
 *  target[WeakMap]:[Map]{
 *      key[Set]:[effect1,effect2]
 *  }
 * }
 * weakMap 通过键/值对的形式存储对象,键必须是对象，而值可以是任意的,
 * 原始数据类型 是不能作为 key 的（比如 Symbol）
 * 原生的 WeakMap 持有的是每个键对象的“弱引用”，这意味着在没有其他引用存在时垃圾回收能正确进行。
 * 原生 WeakMap 的结构是特殊且有效的，其用于映射的 key 只有在其没有被回收时才是有效的。
 * 正由于这样的弱引用，WeakMap 的 key 是不可枚举的 (没有方法能给出所有的 key)。
 * 如果key 是可枚举的话，其列表将会受垃圾回收机制的影响，从而得到不确定的结果。
 * 要往对象上添加数据，又不想干扰垃圾回收机制，就可以使用 WeakMap
 * WeakMap.length = 0
 *
 */
const targetMap = new WeakMap()
/**
 * effect 缓存数组
 */
const effectStack = []
// 依赖收集函数
function track(target, key) {
  // 获取到最新的依赖
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    // targetMap 中有没有依赖于该state的函数
    // 如果没有贼执行以下方法，定义个空的map，把map存储到targetMap中
    if (depMap === undefined) {
      // Map 对象保存键值对，并且能够记住键的原始插入顺序。
      // 任何值(对象或者原始值) 都可以作为一个键或一个值。
      depMap = new Map()
      targetMap.set(target, depMap)
    }
    // 此时，depMap存在，在depMap中获取依赖于该属性的函数，
    // 如果不存在，则，定一个new set，
    // Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。
    // Set对象是值的集合，你可以按照插入的顺序迭代它的元素。
    // Set中的元素只会出现一次，即 Set 中的元素是唯一的。
    let dep = depMap.get(key)
    if (dep === undefined) {
      dep = new Set()
      depMap.set(key, dep)
    }
    // 完成了初始化
    // 下面就需要收集了
    // 双向缓存,effect的依赖收集器里存储其关联的依赖
    if (!dep.has(effect)) {
      dep.add(effect) // 把effect放在dep里面 存储
      effect.deps.push(dep)
    }
  }
}
// 响应分发，state改变，通知相关函数执行
function trigger(target, key, info) {
  // 此时的 depMap 结构 [Map]{ key[Set]:[effect1,effect2]}
  const depMap = targetMap.get(target)
  // 不存在依赖，return
  if (depMap === undefined) {
    return
  }

  const effects = new Set()
  const computeds = new Set()
  // 确保操作在正确的key 上
  if (key) {
    // 此时的 deps 的结构  key[Set]:[effect1,effect2]
    const deps = depMap.get(key)
    deps.forEach((effect) => {
      // todo
      if (effect.computed) {
        computeds.add(effect)
      } else {
        effects.add(effect)
      }
    })

    effects.forEach((effect) => effect())
    computeds.forEach((computed) => computed())
  }
}
// proxy handler属性，就是代理属性
const handler = {
  get(target, key) {
    const res = Reflect.get(target, key)
    // 收集依赖
    track(target, key)
    return typeof res === "object" ? reactive(res) : res
  },
  set(target, key, val) {
    // 存储新旧数据
    const info = { oldVal: Reflect.get(target, key), newVal: val }
    Reflect.set(target, key, val)
    // todo  更新后，通知useEffect 去执行相关方法
    // 分发
    trigger(target, key, info)
  }
}

// 对state通过proxy 进行包装,返回一个被包装过的proxy对象
function reactive(state) {
  const proxyState = new Proxy(state, handler)
  return proxyState
}

// 副作用函数，在state更新后，执行
// options 配置项
function useEffect(fn, options = {}) {
  const e = creatReactiveEffect(fn, options)
  // 默认懒执行
  if (!options.lazy) {
    e()
  }
  return e
}
// 调用执行器，同时把effect存储到effectStack中，
function creatReactiveEffect(fn, options) {
  // effect 扩展配置
  // 高阶函数
  const effect = function effect(...args) {
    return run(effect, fn, args)
  }
  // 双向缓存
  effect.deps = []
  effect.computed = options.computed
  effect.lazy = options.lazy
  return effect
}
// 计算属性，state更新后，更新属性
// 实际上是effect的包装，
function computed(fn) {
  // 实际通过useEffct 包装
  const runner = useEffect(fn, { computed: true, lazy: true })
  return {
    effect: runner,
    // 最后的 值所在地方
    get value() {
      return runner()
    }
  }
}
// 执行器
// 实际上就是高阶函数，在回调函数之前做一系列的操作
function run(effect, fn, args) {
  // effect 缓存中是否有该effect,不存在时
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect)
      return fn(...args)
    } finally {
      // 依赖收集完成 ，清空缓存
      effectStack.pop()
    }
  }
}

```
