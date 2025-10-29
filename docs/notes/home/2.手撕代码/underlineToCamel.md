---
title: 下划线改驼峰
createTime: 2025/10/29 22:09:58
permalink: /home/xcevz2vy/
---
```js
const toCase = (str) => {
    let strArr = str.split("")
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === '_') {
            strArr.splice(i, 1)
            strArr[i] = strArr[i].toUpperCase()
        }
    }
    return strArr.join('')
}
```