---
title: setTimeout模拟setInterval
createTime: 2025/10/29 22:11:18
permalink: /home/nd4wrcn5/
---
```js
function fakeSetInterval(callback, delay) {
    function monitor() {
        callback()
        setTimeout(monitor, delay)
    }
    setTimeout(monitor, delay)
}

function sayHello() {
    console.log('hello')
}

fakeSetInterval(sayHello, 2000)
```