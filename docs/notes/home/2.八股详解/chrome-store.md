---
title: 浏览器存储的两种方式
createTime: 2025/08/08 21:02:22
permalink: /home/ygu8k4za/
---


## HTML5 提供了两种在客户端存储数据的新方法：

- localStorage - 没有时间限制的数据存储
- sessionStorage - 针对一个 session 的数据存储

1. 基本概念

**1.1** **`localStorage`**

- 用于持久化存储数据，数据不会随浏览器关闭而清除。
- 存储容量较大（通常为 5MB 或更多）。
- 数据在所有同源窗口（同一域名、协议和端口）中共享。

**1.2** **`sessionStorage`**

- 用于临时存储数据，数据仅在当前会话期间有效（关闭浏览器标签页或窗口后清除）。
- 存储容量与 `localStorage` 相同（通常为 5MB 或更多）。
- 数据仅在当前窗口或标签页中有效，不同窗口或标签页之间不共享。

------

### 2. 使用方法

**2.1 设置数据**

- 使用 `setItem(key, value)` 方法存储数据。

```js
localStorage.setItem("name", "John"); 
sessionStorage.setItem("theme", "dark");
```

**2.2 获取数据**

- 使用 `getItem(key)` 方法获取数据。

```js
const name = localStorage.getItem("name"); // "John" 
const theme = sessionStorage.getItem("theme"); // "dark"
```

**2.3 删除数据**

- 使用 `removeItem(key)` 方法删除指定数据。

```js
localStorage.removeItem("name"); 
sessionStorage.removeItem("theme");
```

**2.4 清空数据**

- 使用 `clear()` 方法清空所有数据。

```js
localStorage.clear(); 
sessionStorage.clear();
```

**2.5 获取键名**

- 使用 `key(index)` 方法获取指定索引的键名。

```js
const firstKey = localStorage.key(0); // 获取第一个键名
```

**2.6 获取存储数量**

- 使用 `length` 属性获取存储的键值对数量。

```js
const count = localStorage.length; // 获取存储的键值对数量
```

------

### 3. 数据格式

- `localStorage` 和 `sessionStorage` 只能存储字符串类型的数据。
- 如果需要存储对象或数组，可以使用 `JSON.stringify()` 和 `JSON.parse()` 进行转换。

**示例：存储对象**

```js
const user = { name: "John", age: 30 }; 
localStorage.setItem("user", JSON.stringify(user)); // 存储对象 
const storedUser = JSON.parse(localStorage.getItem("user")); // 读取对象
```

------

### 4. 生命周期与作用域

**4.1** **`localStorage`**

- **生命周期**: 数据永久存储，除非手动清除（通过代码或浏览器设置）。
- **作用域**: 同一域名下的所有窗口和标签页共享数据。

**4.2** **`sessionStorage`**

- **生命周期**: 数据仅在当前会话期间有效（关闭标签页或窗口后清除）。
- **作用域**: 数据仅在当前窗口或标签页中有效，不同窗口或标签页之间不共享。

------

### 5. 适用场景

**5.1** **`localStorage`**

- 需要长期保存的数据，如用户偏好设置、登录状态等。
- 跨页面共享数据。

**5.2** **`sessionStorage`**

- 临时存储的数据，如表单数据、页面状态等。
- 单页面应用（SPA）中的临时状态管理。

------

### 6. 注意事项

- **存储容量限制**: 通常为 5MB 或更多，超出限制会抛出错误。
- **安全性**: 不要存储敏感信息（如密码、令牌等），因为数据可以被轻易访问。
- **同步操作**: `localStorage` 和 `sessionStorage` 是同步操作，可能会影响性能。
- **跨域限制**: 数据存储受同源策略限制，不同域名之间无法共享数据。