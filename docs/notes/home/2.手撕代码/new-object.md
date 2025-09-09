---
title: 手写 new 操作符
createTime: 2025/09/08 13:21:12
permalink: /home/fgrkf1s2/
---
### 手写 new 操作符

在调用 `new` 的过程中会发生以上四件事情：

（1）首先创建了一个新的空对象

（2）设置原型，将对象的原型设置为函数的 prototype 对象。

（3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）

（4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象

```js
function _new(constructor, ...args) {
    // 1. 创建空对象，继承构造函数的prototype
    const obj = Object.create(constructor.prototype)
    // 2. 构造函数的this指向这个对象，执行，为这个新对象添加属性
    const result = constructor.apply(obj, args)
    
    return result instanceof Object ? result : obj
}
```

