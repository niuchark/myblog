---
title: 手写红绿灯
createTime: 2025/09/08 13:22:23
permalink: /home/mamvca2a/
---
```js
const sleep = (delay) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

const checkout = async (delay, color) => {
    console.log(color)
    await sleep(delay)
}

async function main() {
    while(true) {
        await checkout('green', 2000)
    }
}
```
