---
title: webworker中消息的传递
createTime: 2025/10/17 14:45:32
permalink: /home/xb7wq29t/
---

```js
// main.js（主线程）
const myWorker = new Worker('/worker.js'); // 创建 worker

myWorker.addEventListener('message', e => {
    console.log(e.data);
});

myWorker.postMessage('Greeting from Main.js');

// worker.js（worker线程）

self.addEventListener('message', e => {

    postMessage('Greeting from Worker');
    
    self.close(); // 关闭 worker
    
    setTimeout(() => {
        console.log('setTimeout run');
        postMessage('Greeting from SetTimeout');
    });
    
    Promise.resolve().then(() => {
        console.log('Promise run');
        postMessage('Greeting from Promise');
    })
    
    for (let i = 0; i < 1001; i++) {
        if (i === 1000) {
            console.log('Loop run');
            postMessage('Greeting from Loop');
        }
    }
    
});
```
上面代码的运行结果是什么？为什么？`postMessage('Greeting from Loop');`是异步的吗？

## 运行结果

```
Greeting from Worker
Greeting from Loop
Greeting from Promise
// 注意：setTimeout 中的消息不会发送
```

## 执行流程分析

### 1. 同步代码执行

- `postMessage('Greeting from Worker')` - 立即发送消息
- `self.close()` - 标记 worker 为关闭状态
- `setTimeout` - 将回调加入**宏任务队列**
- `Promise.resolve().then()` - 将回调加入**微任务队列**
- `for` 循环 - 同步执行，`postMessage('Greeting from Loop')` 立即发送消息

### 2. 微任务执行

当前同步任务执行完成后，清空微任务队列：

- Promise 回调执行，`postMessage('Greeting from Promise')` 发送消息

### 3. 宏任务执行

由于已经调用了 `self.close()`，worker 线程会终止，setTimeout 的回调**不会执行**

## 关于 `postMessage('Greeting from Loop')`

**是同步的吗？** - 是的

**是宏任务还是微任务？** - 都不是

`postMessage()` 方法本身是**同步调用**，但消息的传递过程是异步的。具体来说：

- 调用 `postMessage()` 是同步的，它会立即将消息放入消息队列
- 消息的接收和处理在目标线程中是异步的
- 这类似于 `dispatchEvent` 或 `XMLHttpRequest.send()` 的行为

## 验证代码

```javascript
// 可以添加时间戳来验证执行顺序
self.addEventListener('message', e => {
    console.log('start:', Date.now());
    
    postMessage('Greeting from Worker');
    
    self.close();
    
    setTimeout(() => {
        console.log('setTimeout:', Date.now());
        postMessage('Greeting from SetTimeout');
    });
    
    Promise.resolve().then(() => {
        console.log('Promise:', Date.now());
        postMessage('Greeting from Promise');
    });
    
    for (let i = 0; i < 1001; i++) {
        if (i === 1000) {
            console.log('Loop:', Date.now());
            postMessage('Greeting from Loop');
        }
    }
    
    console.log('end:', Date.now());
});
```

这会显示所有同步代码（包括循环中的 postMessage）都在同一时间片内执行完成。