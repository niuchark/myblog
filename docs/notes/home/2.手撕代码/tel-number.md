---
title: 手机号脱敏
createTime: 2025/10/19 13:40:13
permalink: /home/d4sevsl1/
---
```js
const format = (phone) => {
    if (phone.length !== 11 || !/^\d{11}$/.test(phone)) {
        console.warn('无效的手机号');
        return phone;
    }
    return `${phone.slice(0, 3)}XXXX${phone.slice(7)}`;
}

```