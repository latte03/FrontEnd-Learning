const STATUS = {
	PENDING: 'PENDING',
	FULFILLED: 'FULFILLED',
	REJECTED: 'REJECTED'
}

class myPromise {
	constructor(executor) {
		// promise 的初始状态
		this.status = STATUS.PENDING
		this.value = null
		this.reason = null

		// 异步的时候 存放需要执行函数 的数组
		this.onResolvedCallback = []
		this.onRejectedCallback = []
		// 只能从pending -> resolve/reject
		// 只有在resolve 或者 reject 里改变状态
		const resolve = val => {
			if (this.status === STATUS.PENDING) {
				this.status = STATUS.FULFILLED
				this.value = val

				// pending -> fulfilled 成功执行存下着的方法
				this.onResolvedCallback.forEach(fn => fn())
			}
		}
		const reject = err => {
			if (this.status === STATUS.PENDING) {
				this.status = STATUS.REJECTED
				this.reason = err
				// pending-> fulfilled 失败执行失败的方法
				this.onRejectedCallback.forEach(fn => fn())
			}
		}

		try {
			executor(resolve, reject)
		} catch (error) {
			// 失败直接 reject
			reject(error)
		}
	}
	// then 方法
	then(onFulfilled, onRejected) {
		// onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
		onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
		// onRejected如果不是函数，就忽略onRejected，扔出错误
		onRejected =
			typeof onRejected === 'function'
				? onRejected
				: err => {
						throw err
				  }
		const promise2 = new myPromise((resolve, reject) => {
			// 成功的时候调用
			if (this.status === STATUS.FULFILLED) {
				// 异步解决：
				// onRejected返回一个普通的值，失败时如果直接等于 value => value，
				// 则会跑到下一个then中的onFulfilled中，
				setTimeout(() => {
					try {
						let x = onFulfilled(this.value)
						resolvePromise(promise2, x, resolve, reject)
					} catch (e) {
						reject(e)
					}
				}, 0)
			}
			// 失败的时候调用
			if (this.status === STATUS.REJECTED) {
				setTimeout(() => {
					try {
						let x = onRejected(this.reason)
						resolvePromise(promise2, x, resolve, reject)
					} catch (e) {
						reject(e)
					}
				}, 0)
			}

			// 异步 状态还是pending， 将需要执行的函数缓存起来，状态改变的是去执行
			if (this.status === STATUS.PENDING) {
				this.onResolvedCallback.push(() => {
					setTimeout(() => {
						try {
							let x = onFulfilled(this.value)
							resolvePromise(promise2, x, resolve, reject)
						} catch (e) {
							reject(e)
						}
					}, 0)
				})
				this.onRejectedCallback.push(() => {
					setTimeout(() => {
						try {
							let x = onRejected(this.reason)
							resolvePromise(promise2, x, resolve, reject)
						} catch (e) {
							reject(e)
						}
					}, 0)
				})
			}
		})
		// then 的链式调用，then函数返回值为另一个Promise实例
		return promise2
	}
	catch(fn) {
		return this.then(null, fn)
	}

	static resolve(value) {
		return new myPromise((resolve, reject) => {
			resolve(value)
		})
	}

	static reject(value) {
		return new myPromise((resolve, reject) => {
			reject(value)
		})
	}
	// 返回一个promise =[1 || promise]， 其中一个失败就全部失败
	// Promise.all可以将多个Promise实例包装成一个新的Promise实例。
	// 同时，成功和失败的返回值是不同的，成功的时候返回的是一个结果数组，而失败的时候则返回最先被reject失败状态的值。
	static all(promises) {
		return new Promise((resolve, reject) => {
			let index = 0
			let result = []
			if (promises.length === 0) {
				resolve(result)
				return
			}
			for (let i = 0; i < promises.length; i++) {
				// promises[i] 可以是个普通值，直接返回该值
				if (isPromise(promises[i])) {
					promises[i].then(res => processData(res, i), reject)
				} else {
					processData(promises[i], i)
				}
			}

			function processData(value, i) {
				result[i] = value
				if (++index === promises.length) {
					resolve(result)
				}
			}
		})
	}
	// Promise.race([p1, p2, p3])里面哪个结果获得的快，就返回那个结果，不管结果本身是成功状态还是失败状态 。

	static race(promises) {
		return new Promise((resolve, reject) => promises.forEach(pro => pro.then(resolve, reject)))
	}
}
myPromise.prototype.finally = function (callback) {
	return this.then(
		async data => {
			await myPromise.resolve(callback())
			return data
		},
		async error => {
			await myPromise.resolve(callback())
			return error
		}
	)
}

function isPromise(value) {
	return value && typeof value.then === 'function'
}

function resolvePromise(promise2, x, resolve, reject) {
	// 防止循环引用，等待自己完成
	if (x === promise2) {
		// 直接reject
		return reject(new TypeError('Chaining cycle detected for promise'))
	}
	// 防止多次调用
	let called
	// x不是null 且x是对象或者函数
	if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
		try {
			// A+规定，声明then = x的then方法
			let then = x.then
			// 如果then是函数，就默认是promise了
			if (typeof then === 'function') {
				// 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
				then.call(
					x,
					y => {
						// 成功和失败只能调用一个
						if (called) return
						called = true
						// resolve的结果依旧是promise 那就继续解析
						resolvePromise(promise2, y, resolve, reject)
					},
					err => {
						// 成功和失败只能调用一个
						if (called) return
						called = true
						reject(err)
					}
				)
			} else {
				// 直接成功即可 不是函数说明结束了
				resolve(x)
			}
		} catch (error) {
			if (called) return
			called = true
			// 取then出错了那就不要在继续执行了
			reject(error)
		}
	} else {
		resolve(x)
	}
}

module.exports = myPromise
