---
title: 深浅拷贝
createTime: 2025/09/08 13:18:41
permalink: /home/o0bmcvgu/
---
## 浅拷贝

```js
function shallowCopy(obj) {

    if(!obj || typeof obj !== "object") return
    // 根据 object 的类型判断是新建一个数组还是对象
    let newObj = Array.isArray(obj) ? [] : {}
    // 遍历 object，并且判断是 object 的属性才拷贝
    for (let k in obj) {
        // 指示属性是否为对象的自有属性（而不是继承而来的）。
        if (obj.hasOwnProperty(k)){
            newObj[k] = obj[k]
        }
    }
    return newObj
}
```

## 深拷贝

```js
function deepCopy(obj) {

    if(!obj || typeof obj !== "object") return
    // 根据 object 的类型判断是新建一个数组还是对象
    let newObj = Array.isArray(obj) ? [] : {}
    // 遍历 object，并且判断是 object 的属性才拷贝
    for (let k in obj) {
        if (obj.hasOwnProperty(k)){
             newObj[k] = typeof obj === "object" ? deepCopy(obj[k]) : obj[k]
        }
    }
    return newObj
}
```