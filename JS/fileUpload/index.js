const PREFIX = 'hccwp'
const COMPONENT_NAME = PREFIX + '-upload'

/**
 * @description: 文件上传
 * @param {*}
 * @return {*}
 */
class fileupload {
	constructor(options) {
		this.options = options

		this.root = document.querySelector(options.el || 'input[type="file"]')
		// 主要操作的dom对象
		this.input = null
		this.button = null
		this.list = null
		// 存储文件列表
		this.files = [...(options.files || [])]
		// 事件监听
		this.events = ['upload', 'remove', 'exceed']
		this.listeners = Object.create(null)
		// 组件挂载
		this._mounted()
	}
	// 组件初始化
	_mounted() {
		const { root, options } = this
		root.classList.add(`${COMPONENT_NAME}`)
		options.class && root.classList.add(options.class)
		;[this.input, this.button, this.list] = this._render()
		this._renderList(this.files, 'init')
		// 按钮点击事件
		this.button.onclick = () => {
			this._buttonClick()
		}
	}
	// 按钮点击事件
	_buttonClick() {
		const { limit } = this.options
		// input 点击
		this.input.click()
		// input 选择文件
		this.input.oninput = e => {
			// 超过个数
			const files = e.target.files
			if (limit && limit <= this.files.length) {
				this.listener('exceed', files[0], this.files)
				return
			}
			//  文件列表创建
			this._renderList(files)

			// 监听事件回调
			this.listener('upload', files[0], this.files)
		}
	}

	/**
	 * @description:remove 事件
	 * @param {*} e 事件
	 * @param {*} file 删除的文件
	 */
	_remove(e, file) {
		// 文件过滤
		this.files = this.files.filter(item => item.key === file.key)
		// dom 中删除为 key 的文件列表
		Array.from(this.list.children)
			.find(child => {
				return child.key === file.key
			})
			.remove()

		this.listener('remove', file, this.files)
	}
	_renderList(files, action) {
		// 是否是初始化的时候
		if (action === 'init') {
			this.files = []
		}

		const fragment = document.createDocumentFragment()
		Array.from(files).forEach(file => {
			// TODO: UUID 的 方法需要修改
			const uuid = new Date().getTime()
			const uuidFile = { file, key: uuid }
			const item = createElement('a', { className: `${COMPONENT_NAME}-list__item-name`, children: file.name })
			const icon = createElement('i', { className: `${COMPONENT_NAME}-list__item-icon` })
			const li = createElement('li', { className: `${COMPONENT_NAME}-list__item`, children: item })

			// 添加删除事件
			icon.onclick = e => this._remove(e, uuidFile)
			// 设置 dom 的key 属性，为了删除的时候方便查找 和删除项 一样的 key 的 dom
			li['key'] = uuid
			li.appendChild(icon)
			// 插入数据
			this.files.push(uuidFile)
			// 插入 dom
			fragment.appendChild(li)
		})
		this.list.appendChild(fragment)
	}
	// 主要渲染函数
	_render() {
		const { options } = this
		const fragment = document.createDocumentFragment()
		const button = createElement('div', { className: `${COMPONENT_NAME}-button`, children: '上传文件' })
		const input = createElement('input', {
			className: `${COMPONENT_NAME}__input`,
			attr: {
				type: 'file',
				name: 'file',
				accept: this.options.accept || '.pdf,.jpg',
				multiple: false
			}
		})
		const list = createElement('ul', { className: `${COMPONENT_NAME}-list` })
		let doms = []

		if (options.tips) {
			const tips = createElement('div', { className: `${COMPONENT_NAME}-tips`, children: options.tips })
			doms = [button, input, tips, list]
		} else {
			doms = [button, input, list]
		}

		appendChild(fragment, doms)
		this.root.appendChild(fragment)

		// 返回 上传 按钮 和文件列表的 dom 对象
		return [input, button, list]
	}
	listener(evnet, ...params) {
		this.options.on[evnet] && this.options.on[evnet](...params)
		this.listeners[evnet] && this.listeners[evnet].forEach(fn => fn(...params))
	}
	// 事件监听
	on(event, fn) {
		if (!event || !fn) {
			return
		}
		if (!this.events.includes(event)) {
			throw new Error(`所监听的事件必须是'${this.events.toString()}'中的一个`)
		}
		if (this.listeners[event]) {
			this.listeners[event].push(fn)
		} else {
			this.listeners[event] = [fn]
		}
	}
	// 取消订阅
	off(event, fn) {
		// 事件不存在
		if (!this._isBinded(event)) {
			console.warn(`${event}  dont't exist`)
			return
		}
		// 删除该事件
		if (!fn) {
			delete this._clear()
			return
		}

		if (this.listeners[event].includes(fn)) {
			// 删除该事件下的 fn订阅者
			this.listeners[event] = this.listeners[event].filter(el => el !== fn)
		}

		if (this.listeners[event].length === 0) {
			delete this._clear(event)
		}
	}
	// 是否绑定该事件
	_isBinded(event) {
		return this.listeners[event] && true
	}
	// 清空监听
	_clear(event) {
		if (!event) {
			this.listeners = []
		} else {
			delete this.listeners[event]
		}
	}
}
// 数据类型判断
function typeOf(obj, type) {
	return Object.prototype.toString.call(obj).includes(type)
}

function appendChild(element, childs) {
	if (typeOf(childs, 'Array')) {
		childs.forEach(child => {
			element.appendChild(child)
		})
	} else {
		element.appendChild(childs)
	}
}

/**
 * @description:创建element
 * @param {string} type
 * @param {string} className
 * @param {Object} attr
 * @param {string} children
 * @return {HTMLElement} HTMLElement
 */
function createElement(type = '', { className = '', attr = {}, children }) {
	const el = document.createElement(type)
	for (const key in attr) {
		attr[key] && el.setAttribute(key, attr[key])
	}
	className && (el.className = className)

	if (children) {
		if (typeof children === 'string') {
			el.innerText = children
		} else {
			el.appendChild(children)
		}
	}

	return el
}
