---
title: 节流防抖
createTime: 2025/09/08 13:15:15
permalink: /home/5riftwyq/
---
## 防抖函数

函数防抖是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。这可以使用在一些点击请求的事件上，避免因为用户的多次点击向后端发送多次请求。

```js
function debouce(fn, wait = 500) {
    let timer = null
    return function(...args) {
        if(timer) clear(timer)
        timer = setTimeOut(() => {
            return fn.apply(this, args)
        }, wait)
    }
}
```

## 节流函数

函数节流是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，如果在同一个单位时间内某事件被触发多次，只有一次能生效。节流可以使用在 scroll 函数的事件监听上，通过事件节流来降低事件调用的频率。

```js
function throttle(fn, wait) {
    let lastTime = null
    return fuction(...args) {
        const now = Data.now()
        if(lastTime === null || now - lastTime > wait) {
            lastTime = now
            return fn.apply(this, args)
        }
    }
}
```

