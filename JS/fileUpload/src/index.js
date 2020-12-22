const PREFIX = 'hccwp'
const COMPONENT_NAME = PREFIX + '-upload'

/**
 * @description: 文件上传
 * @param {*}
 * @return {*}
 */
class fileupload {
    constructor(options) {
        this.options = {
            el: '.hccwp-upload',
            showProgress: true,
            init: true,
            listType: 'picture',
            accept: '.pdf,.jpg',
            buttonText: '上传文件',
            size: 0
        }
        Object.assign(this.options, options)

        this.root = document.querySelector(options.el)
        // 主要操作的dom对象
        this.input = null
        this.button = null
        this.list = null
        this.Dialog = {}
        // 存储文件列表
        this.files = [...(options.files || [])]
        // 事件监听
        this.events = ['beforeUpload', 'verifyError', 'upload', 'remove', 'exceed', 'error']
        this.listeners = Object.create(null)
        // 组件挂载
        this.#mounted()
    }
    // 手动初始化
    init() {
        this.options.init = true
        this.#mounted()
    }
    // 组件初始化
    #mounted() {
        const { root, options } = this
        // 是否立即初始化
        if (!options.init) {
            return false
        }
        // 组件 class
        root.classList.add(`${COMPONENT_NAME}`)
        root.classList.add(`${COMPONENT_NAME}--${options.listType}`)
        // 添加自定义的 className
        options.class && root.classList.add(options.class)
        //  获取渲染后返回的 Dom 对象，挂载到 this 上
        ;[this.input, this.button, this.list] = this.#render()
        // 渲染已有的文件列表
        // TODO: 文件列表的类型需要考虑
        // 设置初次渲染，如果是内容回显
        this.renderList(this.files, 'init')
        // 按钮点击事件
        this.button.onclick = () => {
            this.#buttonClick()
        }
    }

    // 按钮点击事件
    #buttonClick() {
        const { limit, listType } = this.options
        // input 点击
        this.input.value = ''
        this.input.click()
        // input 选择文件
        this.input.oninput = e => {
            // 超过个数
            const files = e.target.files
            if (limit && limit <= this.files.length) {
                this.listener('exceed', files[0], this.files)
                return
            }
            if (!this.#beforeUpload({ file: files[0], fileList: this.files })) {
                return
            }
            //  文件列表创建
            // 创建单个的时候，进度条，状态，list，设置imgSrc
            const { progress, state, list, ...rest } = this.renderList(files)
            let params = {}
            // 列表类型判断
            if (listType === 'picture') {
                params = { progress, state, list, onUploaded: rest.setImageSrc }
            } else {
                params = { progress, state, list }
            }
            //

            // 上传服务器
            this.options.action && this.upload(files[0], params)
        }
    }

    // 创建 text list
    #createTextList({ uuidFile, action }) {
        let state, progress
        const item = createElement('a', {
            className: `${COMPONENT_NAME}-list__item-name`,
            children: uuidFile.file.name
        })
        const close = createElement('i', { className: `${COMPONENT_NAME}-list__item-close` })
        // 排除初次渲染的时候 不需要上传状态
        if (action !== 'init') {
            state = createElement('i', { className: `${COMPONENT_NAME}-list__item-state` })
        } else {
            state = false
        }

        const label = createElement('label', {
            className: `${COMPONENT_NAME}-list__item-label`,
            // 排除初次渲染的时候 不需要上传状态
            children: [state, close]
        })

        const li = createElement('li', {
            className: `${COMPONENT_NAME}-list__item`,
            children: [item, label]
        })

        // 添加删除事件
        close.onclick = e => this.remove(uuidFile, e)
        // 设置 dom 的key 属性，为了删除的时候方便查找 和删除项 一样的 key 的 dom
        li['key'] = uuidFile.key

        // 排除初次渲染，是否显示进度条
        if (action !== 'init' && this.options.showProgress) {
            const progressBar = this.#createProgressBar(COMPONENT_NAME)
            progress = progressBar.line
            appendChild(li, progressBar)
        }

        return { li, state, progress }
    }
    // 创建 picture list
    #createPictureList({ uuidFile, action }) {
        const ITEM_NAME = `${COMPONENT_NAME}-list__item`
        let state, progress

        const img = createElement('img', {
            className: `${ITEM_NAME}-thumbnail`
        })

        const controller = this.#createController()
        // 排除初次渲染的时候 不需要上传状态
        if (action !== 'init') {
            state = createElement('div', { className: `${COMPONENT_NAME}-list__item-state`, children: '上传中...' })
        } else {
            state = false
        }

        // 设置 dom 的key 属性，为了删除的时候方便查找 和删除项 一样的 key 的 dom
        const li = createElement('div', {
            className: `${COMPONENT_NAME}-list__item`,
            children: state
        })
        li['key'] = uuidFile.key
        const setImageSrc = () => {
            this.#setImageSrc({ file: uuidFile.file, img }).then(res => {
                controller.preview.onclick = e => this.preview({ ...uuidFile, uri: res }, e)
            })

            appendChild(li, [img, controller])
            state.remove()

            // 添加删除事件
            controller.delete.onclick = e => this.remove(uuidFile, e)
            // controller.preview.onclick = e => this.preview({...uuidFile,data.uri},, e)
            // controller.down.onclick = e => this.download(uuidFile, e)
        }
        // // 排除初次渲染，是否显示进度条
        if (action !== 'init' && this.options.showProgress) {
            const progressBar = this.#createProgressBar(COMPONENT_NAME)
            progress = progressBar.line
            appendChild(li, progressBar)
        }

        return { li, state, progress, img, setImageSrc }
    }

    #createController() {
        const ITEM_NAME = `${COMPONENT_NAME}-list__item`
        const controller = createElement('div', { className: `${ITEM_NAME}-actions` })
        ;['preview', 'delete'].forEach(el => {
            controller[el] = createElement('span', { className: `${ITEM_NAME}-${el}` })
            appendChild(controller, controller[el])
        })
        return controller
    }

    #createProgressBar(prefix) {
        const progressBar = createElement('span', {
            className: `${prefix}-preogress__bar`
        })

        const line = createElement('span', { className: `${prefix}-preogress` })
        appendChild(progressBar, line)
        progressBar.line = line
        return progressBar
    }

    #createDialog({ key, src } = {}) {
        if (this.Dialog[key]) {
            return this.Dialog[key]
        }
        const fragment = document.createDocumentFragment()
        const img = createElement('img', { className: `${PREFIX}-preivew-img`, attr: { src: src } })
        const close = createElement('i', { className: `${PREFIX}-dialog-close` })
        const dialogBody = createElement('div', { className: `${PREFIX}-dialog-body`, children: [img, close] })
        appendChild(fragment, dialogBody)
        const Dialog = createElement('div', { className: `${PREFIX}-dialog`, children: fragment })
        Dialog.open = () => {
            Dialog.classList.add('is-show')
        }
        Dialog.close = () => {
            Dialog.classList.remove('is-show')
        }
        close.onclick = () => {
            Dialog.close()
            Dialog.remove()
        }
        this.Dialog[key] = Dialog

        return Dialog
    }
    renderList(files, action) {
        // 是否是初始化的时候
        if (action === 'init') {
            this.files = []
        }
        // console.log('renderList', files)
        const fragment = document.createDocumentFragment()
        let progress = null,
            state = null,
            list
        // 文件上传的时候是单次，所以不会使 progress，state 覆盖问题
        Array.from(files).forEach(file => {
            // UUID 生成唯一的UUID
            const uuid = UUID()
            const uuidFile = { file, key: uuid }

            // list type 类型判断
            if (this.options.listType === 'text') {
                list = this.#createTextList({ uuidFile, action })
            } else {
                list = this.#createPictureList({ uuidFile, action })
            }
            progress = list.progress
            state = list.state
            // 插入数据
            this.files.push(uuidFile)
            // 插入 dom
            fragment.appendChild(list.li)
        })

        this.list.appendChild(fragment)
        // console.log(list)
        return { progress, state, list, setImageSrc: list ? list.setImageSrc : null }
    }
    // 主要渲染函数
    #render() {
        const { options } = this
        const fragment = document.createDocumentFragment()
        const isTextlistType = this.options.listType === 'text'
        const button = createElement('div', {
            className: `${COMPONENT_NAME}-button`,
            children: isTextlistType ? options.buttonText : [createElement('i', { className: `${COMPONENT_NAME}-plus` }), options.buttonText]
        })

        const input = createElement('input', {
            className: `${COMPONENT_NAME}__input`,
            attr: {
                type: 'file',
                name: 'file',
                accept: this.options.accept,
                multiple: false
            }
        })
        const list = createElement('ul', { className: `${COMPONENT_NAME}-list ${COMPONENT_NAME}-list--${this.options.listType}` })
        let doms = []
        //  是否插入 tips
        if (options.tips) {
            const tips = createElement('div', {
                className: `${COMPONENT_NAME}-tips`,
                children: options.tips
            })

            !isTextlistType && appendChild(button, tips)

            doms = [button, input, isTextlistType && tips, list]
        } else {
            doms = [button, input, list]
        }

        appendChild(fragment, doms)
        if (options.listType === 'picture') {
            appendChild(list, button)
        }
        this.root.appendChild(fragment)

        // 返回 [上传 按钮 文件列表] 的 dom 对象
        return [input, button, list]
    }

    #setImageSrc({ file, img }) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = function () {
                img.src = reader.result
                resolve(reader.result)
            }
            file ? reader.readAsDataURL(file) : (img.src = '')
        })
    }
    #computedSize(file) {
        // 默认单位是 kb
        const { size } = this.options
        if (!size) {
            return true
        }
        // 类型错误
        if (!(typeOf(size, 'String') || typeOf(size, 'Number'))) {
            throw new Error('类型不正确，是数字或者字符串，默认单位是kb')
        }

        const fileSize = file.size
        if (typeOf(size, 'Number')) {
            return fileSize < size * 1024
        }
        // 截取单位
        let unit = ''
        let optionSize = size.replace(/[A-Za-z]+/g, match => {
            unit = match
            return ''
        })
        // 转换成 number类型
        optionSize = parseFloat(optionSize)
        // 判断单位类型，计算成字节大小
        if (['kb', 'KB', 'kB', 'Kb'].includes(unit)) {
            optionSize = optionSize * 1024
        }
        if (['mb', 'MB'].includes(unit)) {
            optionSize = optionSize * 1024 * 1024
        }

        return fileSize < optionSize
    }
    #beforeUpload({ file, fileList }) {
        if (!this.#computedSize(file)) {
            console.error('size error')
            this.trigger('verifyError', file, fileList)
            return false
        }
        this.trigger('beforeUpload', file, fileList)
        return true
    }
    upload(file, { progress, state, list, ...rest } = {}) {
        const { files, options } = this
        const formData = new FormData()
        // 绑定this， 下面的请求的回调中 function this 指向已经改变
        const trigger = this.trigger.bind(this)
        formData.append('file', file)
        // 设置进度条和进度状态
        const updateProgeress = v => {
            if (!options.showProgress) {
                return
            }
            progress.style.transform = `translateX(-${100 - v * 100}%)`
            // 进度取整
            state && (state.innerText = Math.round(v * 100) + '%')
            // 当进度达到100%的时候 删除进度条 dom
            if (v === 1) {
                progress.parentNode.remove()
                if (options.listType === 'picture') {
                    rest.onUploaded && rest.onUploaded()
                }
                list.img && this.#setImageSrc({ file, img: list.img })
                state && state.classList.add('success')
                return
            }
        }
        //  发送请求
        ajax({
            type: 'post',
            // 请求地址
            url: options.action,
            data: formData,
            contentType: false,
            success: function (data) {
                // 发布 upload 事件
                trigger('upload', { file, fileList: files, data })
            },
            progress: function (v) {
                // 动画
                progress && requestAnimationFrame(() => updateProgeress(v))
            },
            error: function (error) {
                // 发布 error 事件
                trigger('error', { file, fileList: files, error })
            }
        })
    }

    /**
     * @description:remove 事件
     * @param {*} e 事件
     * @param {*} file 删除的文件
     */
    remove(file, e) {
        // 文件过滤
        this.files = this.files.filter(item => item.key === file.key)
        // dom 中删除为 key 的文件列表
        Array.from(this.list.children)
            .find(child => {
                return child.key === file.key
            })
            .remove()
        // 发布 删除操作的事件
        // TODO: 是否走接口
        this.trigger('remove', file, this.files)
    }
    preview(file, e) {
        // console.log(file, e)
        const Dialog = this.#createDialog({ key: file.key, src: file.uri })
        const body = document.querySelector('body')
        appendChild(body, Dialog)
        Dialog.open()
    }
    // download(file, e) {
    //     console.log(e)
    // }
    // 事件发布
    trigger(evnet, ...args) {
        this.options.on[evnet] && this.options.on[evnet](...args)
        this.listeners[evnet] && this.listeners[evnet].forEach(fn => fn(...args))
    }
    // 事件监听
    on(event, fn) {
        if (!event || !fn) {
            return
        }
        // 过滤不规范的事件
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

function appendChild(element, children) {
    if (!children) return
    if (typeOf(children, 'String')) {
        element.appendChild(document.createTextNode(children))
        return
    }
    if (typeOf(children, 'Array')) {
        children.forEach(child => {
            appendChild(element, child)
        })
    } else {
        element.appendChild(children)
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
function createElement(tageNanme = '', options = ({ className = '', attr = {}, children } = {})) {
    const { className, attr, children } = options
    const el = document.createElement(tageNanme)
    for (const key in attr) {
        attr[key] && el.setAttribute(key, attr[key])
    }
    className && (el.className = className)
    appendChild(el, children)

    return el
}

function UUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

function ajax(options) {
    // 存储的是默认值
    var defaults = {
        type: 'get',
        url: '',
        data: {},
        contentType: 'application/x-www-form-urlencoded',
        success: function () {},
        error: function () {},
        progress: function () {}
    }
    // 使用options对象中的属性覆盖defaults对象中的属性
    Object.assign(defaults, options)
    // 创建ajax对象
    var xhr = new XMLHttpRequest()
    // 拼接请求参数的变量
    var params = ''

    // 判断请求方式
    if (defaults.type == 'get') {
        // 循环用户传递进来的对象格式参数
        for (var attr in defaults.data) {
            // 将参数转换为字符串格式
            params += attr + '=' + defaults.data[attr] + '&'
        }
        // 将参数最后面的&截取掉
        // 将截取的结果重新赋值给params变量
        params = params.substr(0, params.length - 1)
        defaults.url = defaults.url + '?' + params
    }
    // 配置ajax对象
    xhr.open(defaults.type, defaults.url)

    //上传进度监测
    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            //加载值比总需加载值的百分比
            var bili = e.loaded / e.total
            defaults.progress(bili, xhr)
            // document.getElementById('percent').style.width = bili
            // document.getElementById('percent').innerText = bili
        } else {
            alert('文件不支持上传中的进度监测')
        }
    }

    // 如果请求方式为post
    if (defaults.type == 'post') {
        // 用户希望的向服务器端传递的请求参数的类型
        var contentType = defaults.contentType
        if (defaults.contentType) {
            // 设置请求参数格式的类型
            xhr.setRequestHeader('Content-Type', contentType)
        }

        params = defaults.data

        // 判断用户希望的请求参数格式的类型
        // 如果类型为json
        if (contentType == 'application/json') {
            // 向服务器端传递json数据格式的参数
            xhr.send(JSON.stringify(defaults.data))
        } else {
            // 向服务器端传递普通类型的请求参数
            xhr.send(params)
        }
    } else {
        // 发送请求
        xhr.send()
    }

    // 监听xhr对象下面的onload事件
    // 当xhr对象接收完响应数据后触发
    xhr.onload = function () {
        // xhr.getResponseHeader()
        // 获取响应头中的数据
        var contentType = xhr.getResponseHeader('Content-Type')
        // 服务器端返回的数据
        var responseText = xhr.responseText
        // 如果响应类型中包含applicaition/json
        if (contentType.includes('application/json')) {
            // 将json字符串转换为json对象
            responseText = JSON.parse(responseText)
        }
        // 当http状态码等于200的时候
        if (xhr.status == 200) {
            // 请求成功 调用处理成功情况的函数
            defaults.success(responseText, xhr)
        } else {
            // 请求失败 调用处理失败情况的函数
            defaults.error(responseText, xhr)
        }
    }
}
