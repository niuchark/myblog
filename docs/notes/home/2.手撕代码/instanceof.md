---
title: 手写instanceof
createTime: 2025/09/08 14:48:49
permalink: /home/u0c914w6/
---
instanceof相比与typeof来说，instanceof方法要求开发者明确的确认对象为某特定类型。即instanceof用于判断引用类型属于哪个构造函数的方法。
另外，更重的一点是 instanceof 可以在继承关系中用来判断一个实例是否属于它的父类型。

```js
// 判断 f 是否是 Foo 类的实例 , 并且是否是其父类型的实例
function Aoo(){} 
function Foo(){} 
Foo.prototype = new Aoo();//JavaScript 原型继承

var f = new Foo(); 
console.log(foo instanceof Foo)//true 
console.log(foo instanceof Aoo)//true
```

f instanceof Foo 的判断逻辑是：

f 的 __proto__一层一层往上，是否对应到 Foo.prototype
再往上，看是否对应着Aoo.prototype
再试着判断 f instanceof Object
即instanceof可以用于判断多层继承关系。

```js
const instanceOf = (obj, pro) => {
  if (typeof obj !== 'object') return false
  if (typeof obj === null) return false

  let proto = Object.getPrototypeof(obj) // 获取obj的原型对象
  while(true) {
    if (proto === null) return false
    if (proto === pro.prototype) return true
    proto = Object.getPrototype(proto)
  }
}
```

