// 1. Promise存在三个状态：pending（等待态）、fulfilled（成功态）、rejected（失败态）
// 2. pending为初始态，并可以转化为fulfilled和rejected
// 3. 成功时，不可转为其他状态，且必须有一个不可改变的值（value）
// 4. 失败时，不可转为其他状态，且必须有一个不可改变的原因（reason）
// 5. new Promise(executor=(resolve,reject)=>{resolve(value)})，resolve(value)将状态置为 fulfilled
// 6. new Promise(executor=(resolve,reject)=>{reject(reson)})，reject(reson)将状态置为 rejected
// 7. 若是executor运行异常执行reject()
// 8.thenable：then(onFulfilled, onRejected)
//  onFulfilled：status为fulfilled，执行onFulfilled，传入value
//  onRejected：status为rejected，执行onRejected，传入reason

const myPromise = require('./promise')

const p = new myPromise((resolve, reject) => {
	// do something
	setTimeout(() => {
		reject('dd')
	}, 1000)
})

p.then(result => {
	console.log('success', result)
})
	.catch(err => {
		console.log('err:', err)
		return 1
	})
	.then(cath => console.log('cath' + cath))

myPromise.resolve('ee').then(res => {
	console.log(res)
})
