---
title: 手写promise.retry
createTime: 2025/09/08 17:56:25
permalink: /home/crshv892/
---
```js
const promiseRetry = (promiseFn, maxAttempts, delay) => {
    return new Promise((resolve, reject) => {
        const retry = (attempts) => {
            promiseFn.then(resolve).catch(err => {
                if(attempts < maxAttempts) {
                    setTimeout(() => retry(attempts + 1), delay)
                } else {
                    reject(err)
                }
            })
        }

        retry(1)
    })
}
```