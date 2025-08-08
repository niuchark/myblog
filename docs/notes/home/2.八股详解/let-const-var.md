---
title: let/const/var的区别
createTime: 2025/08/06 17:37:08
permalink: /home/tdwhqdaz/
---
在JavaScript中，`var`, `let`, 和 `const` 是三种不同的关键字，用于声明变量，但它们之间有一些关键的区别和用法上的差异。

### 1. `var`

- **函数作用域或全局作用域**：使用 `var` 声明的变量具有函数作用域或全局作用域，这意味着如果变量在函数内部使用 `var` 声明，它将仅在该函数内部可用。如果在函数外部使用 `var`，则变量将成为全局变量。
- **可以重复声明**：在同一作用域内，可以使用 `var` 多次声明同一个变量名，后面的声明会覆盖之前的值。
- **没有块级作用域**：`var` 声明的变量不具备块级作用域（例如在 `if` 语句或 `for` 循环中的大括号内），这意味着在块级作用域内部声明的变量在外部也是可见的。

**示例**：

```javascript
function example() {
    if (true) {
        var x = 5;
    }
    console.log(x); // 输出: 5
}
example();
```

### 2. `let`

- **块级作用域**：使用 `let` 声明的变量具有块级作用域，这意味着它们仅在声明它们的块、语句，或者子块（如 `if` 语句或 `for` 循环）内部可用。
- **不允许重复声明**：在同一作用域内，不能使用 `let` 多次声明同一个变量名。如果尝试这样做，将会抛出语法错误。
- **暂时性死区（Temporal Dead Zone, TDZ）**：在 `let` 声明之前访问变量会导致引用错误（ReferenceError）。

**示例**：

```javascript
function example() {
    if (true) {
        let x = 5;
    }
    console.log(x); // ReferenceError: x is not defined
}
example();
```

### 3. `const`

- **块级作用域**：与 `let` 一样，`const` 也具有块级作用域。
- **必须初始化**：使用 `const` 声明变量时必须初始化，即必须有一个初始值。
- **值不可变**：一旦为 `const` 声明的变量赋值后，其值就不能改变（注意，对于对象或数组，这指的是不能再将变量指向另一个对象或数组，但对象的属性或数组的元素仍然可以被修改）。
- **不允许重复声明**：在同一作用域内，不能使用 `const` 多次声明同一个变量名。

**示例**：

```javascript
function example() {
    if (true) {
        const x = 5;
    }
    console.log(x); // ReferenceError: x is not defined
}
example();
```

### 总结

- 使用 `var` 可以声明具有函数作用域或全局作用域的变量，且可以重复声明。
- 使用 `let` 可以声明具有块级作用域的变量，且不允许重复声明。
- 使用 `const` 可以声明只读的、具有块级作用域的常量，必须在声明时初始化，且一旦赋值后其值不可改变（除非是对象或数组的内容变化）。

推荐尽可能使用 `let` 和 `const` 来代替 `var`，因为它们提供了更清晰的作用域控制和更少的潜在错误。在现代JavaScript开发中，通常避免使用 `var`。