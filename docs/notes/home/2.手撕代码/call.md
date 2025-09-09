---
title: 手写call函数
createTime: 2025/08/06 17:37:39
permalink: /home/ggege2um/
---
手写 call 函数 

call 函数的实现步骤：

1.判断调用对象是否为函数，即使我们是定义在函数的原型上的，但是可能出现使用 call 等方式调用的情况。

2.判断传入上下文对象是否存在，如果不存在，则设置为 window 。

3.处理传入的参数，截取第一个参数后的所有参数。

4.将函数作为上下文对象的一个属性。

5.使用上下文对象来调用这个方法，并保存返回结果。

6.删除刚才新增的属性。

7.返回结果。

```js
// call函数实现
// context： this要指向的目标
Function.prototype.myCall = function(context) {

  // 判断 context 是否传入，如果未传入则设置为全局对象；其他情况Object()转为普通对象即可

  context = context ===null || context === undefined ? globalThis : Object(context);

  let result = null;

  // 将调用者函数，放到目标的属性当中去
  context.fn = this;

  // 就能调用调用者函数了，并且因为是目标调用的该函数，（谁调用，this就指向谁），所以this就成功指向了目标
  result = context.fn(...args);

  // 将属性删除
  delete context.fn;

  return result;
};
```