/*
 * @Author: Agan
 * @Date: 2020-09-28 09:50:18
 * @LastEditors: Agan
 * @LastEditTime: 2020-10-27 18:13:03
 * @Description: 发布订阅
 */
class eventBus {
	constructor() {
		this.listeners = Object.create(null)
	}
	//  注册订阅事件
	on(event, fn) {
		if (!event || !fn) {
			return
		}
		if (this.listeners[event]) {
			this.listeners[event].push(fn)
		} else {
			this.listeners[event] = [fn]
		}
	}
	// 只绑定一次，执行过后取消绑定
	// 包装订阅者
	once(event, fn) {
		function one() {
			console.log(arguments)
			fn.apply(this, arguments)
			this.off(event, one)
			console.table(this.listeners)
		}

		// wm.set(fn, one)
		this.on(event, one)
	}
	// 取消订阅
	off(event, fn) {
		// 事件不存在
		if (!this.isBinded(event)) {
			console.warn(`${event}  dont't exist`)
			return
		}
		// 删除该事件
		if (!fn) {
			delete this.clear()
			return
		}

		if (this.listeners[event].includes(fn)) {
			// 删除该事件下的 fn订阅者
			this.listeners[event] = this.listeners[event].filter((el) => el !== fn)
		}

		if (this.listeners[event].length === 0) {
			delete this.clear(event)
		}
	}
	// 发布事件
	trigger(event, ...args) {
		console.log('args:', args)
		if (!this.isBinded(event)) {
			console.warn(`this event：${event} is unregistered.`)
			return
		}
		//
		this.listeners[event].forEach((listener) => {
			listener.apply(this, args)
		})
	}
	// 是否绑定该事件
	isBinded(event) {
		return this.listeners[event] && true
	}
	// 清空监听
	clear(event) {
		if (!event) {
			this.listeners = []
		} else {
			delete this.listeners[event]
		}
	}
}

// 测试
const baseEvent = new eventBus()
function cb(...value) {
	console.log('cb ' + value)
}
function cbd(...value) {
	console.log('cbd ' + value)
}
baseEvent.once('click', cb)
baseEvent.once('click', cbd)
console.table(baseEvent.listeners)
// baseEvent.off("click")
baseEvent.trigger('click', '2020', '88', 'ss')
// hello 2020
console.table(baseEvent.listeners)
