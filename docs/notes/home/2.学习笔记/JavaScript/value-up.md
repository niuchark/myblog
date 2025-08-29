---
title: JS中的变量提升
createTime: 2025/08/08 21:27:48
permalink: /home/0p9gmmv9/
---
## 变量提升

变量提升是 JavaScript 中比较“奇怪”的现象，它允许在变量声明之前即被访问，（仅存在于var声明变量）

```html
<script>
    // 1. 把所有var声明的变量提升到 当前作用域的最前面
    // 2. 只提升声明， 不提升赋值
    // 相当于：
    var num
    console.log(num + '件') //undefined
    num = 10
    console.log(num)//10

    function fn() {
      console.log(num)
      var num = 10
    }
    fn()//undefined
  </script>
```

总结：

1. 变量在未声明即被访问时会报语法错误
2. 变量在声明之前即被访问，变量的值为 `undefined`
3. `let` 声明的变量不存在变量提升，推荐使用 `let`
4. 变量提升出现在相同作用域当中
5. **实际开发中推荐先声明再访问变量**

**说明：**

JS初学者经常花很多时间才能习惯变量提升，还经常出现一些意想不到的bug，正因为如此，ES6 引入了块级作用域， 用let 或者 const声明变量，让代码写法更加规范和人性化。

注：关于变量提升的原理分析会涉及较为复杂的词法分析等知识，而开发中使用 `let` 可以轻松规避变量的提升，因此在此不做过多的探讨，有兴趣可[查阅资料](https://segmentfault.com/a/1190000013915935)。