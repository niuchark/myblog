---
title: JSON.stringify的弊端
createTime: 2025/09/08 15:16:32
permalink: /home/8b2ehx1s/
---
### 1. 无法处理循环引用

循环引用是指对象属性之间相互引用，形成一个闭环。例如，对象A有一个属性指向对象B，而对象B又有一个属性指回对象A。

```javascript
let objA = { name: "A" };
let objB = { name: "B", partner: objA };
objA.partner = objB; // 现在 objA.partner 指向 objB，而 objB.partner 又指向 objA，形成循环
```

当 `JSON.stringify` 尝试序列化这样一个对象时，它会不断地递归遍历对象的属性。一旦遇到循环引用，它就会陷入无限循环。为了避免这种情况，`JSON.stringify` 的实现中内置了检测机制，当它发现一个对象已经被序列化过并且再次出现时，会直接抛出一个错误。

**错误示例：**
```javascript
const circularReference = {};
circularReference.myself = circularReference;

JSON.stringify(circularReference);
// 抛出错误： TypeError: Converting circular structure to JSON
```

**解决方法：**
需要手动处理循环引用。可以使用第三方库（如 `cycle.js` 的 `decycle` 方法），或者自己编写一个函数，在序列化之前检测并打破循环引用（例如，将循环引用的属性替换为 `null` 或一个路径标识符）。

---

### 2. 不支持特定的数据类型

JSON 格式本身只支持有限的数据类型，这与 JavaScript 丰富的内置数据类型相比有较大差距。`JSON.stringify` 在遇到不支持的数据类型时，会将其处理为 `null` 或直接忽略，导致信息丢失。

以下是一些不被支持的数据类型及其处理方式：

*   **`undefined`**： 如果它是一个单独的值，会被转换为 `null`。如果它是对象的一个属性，则该**整个属性会被忽略**。
    ```javascript
    JSON.stringify(undefined); // 'null'
    JSON.stringify({ a: undefined, b: 1 }); // '{"b":1}'，属性a消失了
    ```
*   **`Function`（函数）**： 函数不是有效的 JSON 值。如果它是对象属性，则**整个属性会被忽略**。如果直接序列化一个函数，返回 `undefined`。
    ```javascript
    JSON.stringify({ func: () => {} }); // '{}'
    JSON.stringify(() => {}); // undefined
    ```
*   **`Symbol`**： 作为属性名或值都会**被忽略**。
    ```javascript
    JSON.stringify({ [Symbol('id')]: 123 }); // '{}'
    JSON.stringify(Symbol('foo')); // undefined
    ```
*   **`Map` 和 `Set`**： 它们会被序列化为空对象 `{}`，因为其键值对/元素结构无法直接映射到 JSON 对象和数组。
    ```javascript
    JSON.stringify(new Map([['a', 1]])); // '{}'
    JSON.stringify(new Set([1, 2, 3])); // '{}'
    ```
*   **`Date` 对象**： 日期对象会被转换为 ISO 格式的字符串（得益于其内部的 `toJSON` 方法），但这意味着反序列化后得到的是字符串，而不是 Date 对象。
    ```javascript
    JSON.stringify(new Date('2023-10-27'));
    // '"2023-10-27T00:00:00.000Z"'
    ```
*   **`NaN` 和 `Infinity`**： 会被转换为 `null`。
    ```javascript
    JSON.stringify(NaN); // 'null'
    JSON.stringify(Infinity); // 'null'
    ```

**解决方法：**
可以使用 `JSON.stringify` 的第二个参数——**替换函数（replacer）** 来自定义序列化过程。你可以在这个函数中检测到特殊类型，并决定如何将它们转换为 JSON 支持的类型（如字符串或普通对象）。

---

### 3. 丢失对象的原型链和方法

JSON 是一种纯数据格式，它只关心对象的**属性名和值**，而不关心对象的行为（方法）或它继承自哪个类（原型链）。

当你序列化一个类的实例时，`JSON.stringify` 只会序列化实例自身的可枚举属性，而所有的方法和通过原型链继承的属性都会被丢弃。

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

const alice = new Person('Alice');
const jsonStr = JSON.stringify(alice); // '{"name":"Alice"}'
const obj = JSON.parse(jsonStr);

obj.greet(); // TypeError: obj.greet is not a function
// obj 现在只是一个普通的 JavaScript 对象，不再是 Person 的实例。
```

从例子中可以看到，反序列化后得到的 `obj` 是一个普通的对象，它只有 `name` 属性，完全丢失了原来 `alice` 对象的 `greet` 方法和 `Person` 的原型链。

**解决方法：**
如果你需要重建对象的实例，必须在反序列化后手动完成。例如，在 `JSON.parse` 之后，你可以将解析出的数据作为参数传给一个构造函数或使用 `Object.assign()` 来部分恢复对象的功能。

---

### 4. 性能问题

**详细说明：**
`JSON.stringify` 需要递归地遍历整个对象/数组结构，这个过程在遇到**大规模、深度嵌套的数据**时，可能会：

1.  **消耗大量 CPU 时间**： 递归遍历和字符串拼接是计算密集型操作。
2.  **消耗大量内存**： 在序列化过程中，需要构建一个巨大的中间字符串。由于字符串在 JavaScript 中是不可变的，每次拼接都可能创建新的字符串，导致旧字符串被垃圾回收，这在处理超大对象时会给内存和 GC（垃圾回收）带来很大压力。

**性能瓶颈通常出现在：**
*   处理从服务器返回的大型 JSON 数据集时。
*   处理复杂的、深度嵌套的状态对象（如在 Redux 中）。
*   在高频函数中（如滚动事件处理器）进行序列化操作。
