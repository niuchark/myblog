---
title: 手写 Promise.all
createTime: 2025/09/08 13:19:45
permalink: /home/p8lw7peo/
---
### 手写 Promise.all

**1) 核心思路**

1. 接收一个 Promise 实例的数组或具有 Iterator 接口的对象作为参数
2. 这个方法返回一个新的 promise 对象，
3. 遍历传入的参数，用Promise.resolve()将参数"包一层"，使其变成一个promise对象
4. 参数所有回调成功才是成功，返回值数组与参数顺序一致
5. 参数数组其中一个失败，则触发失败状态，第一个触发失败的 Promise 错误信息作为 Promise.all 的错误信息。

**2）实现代码**

一般来说，Promise.all 用来处理多个并发请求，也是为了页面数据构造的方便，将一个页面所用到的在不同接口的数据一起请求过来，不过，如果其中一个接口失败了，多个请求也就失败了，页面可能啥也出不来，这就看当前页面的耦合程度了

```js
// 阿西摆渡版本
const myAll = (data) => {
  // 返回一个新的 Promise 对象
  return new Promise((resolve, reject) => {
    
    // 定义内部函数 addData，用于处理每个 Promise 完成后的结果
    const addData = (item, index) => {
      // 将结果按原始顺序存入数组
      result[index] = item;
      // 完成计数加 1
      count = count + 1;
      // 当所有 Promise 都完成时，解析最终结果
      if (count === data.length) {
        resolve(result)
      }
    }

    // 初始化结果数组，用于存储每个 Promise 的结果
    let result = []
    // 计数器，用于跟踪已完成的 Promise 数量
    let count = 0
    // 遍历输入的 Promise 数组或可迭代对象
    data.forEach((item, index) => {
      // 检查当前项是否为 Promise 实例
      if (item instanceof Promise) {
        // 如果是 Promise，则注册其 then 方法
        item.then(
          // 成功回调：将结果和索引传递给 addData
          (res) => {addData(res, index)},
          // 失败回调：直接拒绝整个 Promise
          (err) => {reject(err)}
        )
      } else {
        // 如果不是 Promise，直接将其作为结果处理
        addData(item, index)
      }
    })
  })
}
```