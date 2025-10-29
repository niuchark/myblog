---
title: 实现sleep
createTime: 2025/10/19 13:43:28
permalink: /home/nrr2i7ws/
---
```js
function timeout(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
};
```