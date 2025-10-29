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

## 答案
```js
const instanceOf = (obj, pro) => {
    if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false
    let proto = Object.getPrototypeOf(obj)
    const prototype = pro.prototype
    while (proto !== null) {
        if (proto === prototype) return true
        proto = Object.getPrototypeOf(proto)
    }
    return false
}
```

测试用例，写完自测：
```js
// Tests: compare custom instanceOf with native `instanceof` where possible.
const F = function() {}
function A() {}
function B() {}
B.prototype = Object.create(A.prototype)
B.prototype.constructor = B

const tests = [
    { desc: 'plain object instanceof Object', value: {}, ctor: Object },
    { desc: 'array instanceof Array', value: [], ctor: Array },
    { desc: 'array instanceof Object', value: [], ctor: Object },
    { desc: 'instance of custom constructor F', value: new F(), ctor: F },
    { desc: 'subclass instance instanceof B', value: new B(), ctor: B },
    { desc: 'subclass instance instanceof A', value: new B(), ctor: A },
    { desc: 'primitive number (3) instanceof Number', value: 3, ctor: Number },
    { desc: 'boxed Number instanceof Number', value: new Number(3), ctor: Number },
    { desc: 'function value instanceof Function', value: function() {}, ctor: Function },
    { desc: 'arrow function instanceof Function', value: () => {}, ctor: Function },
    { desc: 'null instanceof Object', value: null, ctor: Object },
    { desc: 'undefined instanceof Object', value: undefined, ctor: Object },
    { desc: 'non-function right operand ({}), compare behavior', value: {}, ctor: {} },
]

const nativeInstanceof = (val, C) => {
    try {
        return val instanceof C
    } catch (e) {
        return `THROW (${e.message})`
    }
}

for (const t of tests) {
    let mine
    try {
        mine = instanceOf(t.value, t.ctor)
    } catch (e) {
        mine = `THROW (${e.message})`
    }
    const nativeRes = nativeInstanceof(t.value, t.ctor)
    console.log(`${t.desc} -> mine:`, mine, '| native:', nativeRes)
}

// Quick note: your implementation treats functions as non-objects (typeof fn === 'function'),
// so `instanceOf(function(){}, Function)` will return false while native `instanceof` returns true.
```

