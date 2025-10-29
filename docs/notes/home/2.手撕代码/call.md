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
Function.prototype._call = function(context, ...args) {
    context = context ? Object(context) : globalThis
    context._fn = this
    let res = context._fn(...args)
    delete context._fn
    return res
}
```