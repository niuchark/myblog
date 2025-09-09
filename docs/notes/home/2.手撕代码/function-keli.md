---
title: 函数柯里化
createTime: 2025/09/08 13:16:47
permalink: /home/q37l5u71/
---
### 函数柯里化的实现

 函数柯里化指的是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

```js
const myCurry = fuction(func) {
    // 得到从下标为1开始的参数
    let args = Array.prototype.slice.call(arguments, 1)
    // 保存一下当前函数的this
    let that = this
    return funtion() {
        let curArgs = Array.from(arguments) // 当前调用的参数
        let totalArgs = args.concat(curArgs)
        if (totalArgs.length >= func.length) { // 参数数量够了
            return func.apply(null, totalArgs) 
        }
        else { // 参数数量任然不够
            totalArgs.unshift(func)
            return that.curry,apply(that, totalArgs)
        }
    }
}
```

函数.length 表示函数接收几个形参



ES6实现

```js
// es6 实现
function curry(fn, ...args) {
  return fn.length => args.length ? fn(...args) : curry.bind(null, fn, ...args);
}
```

