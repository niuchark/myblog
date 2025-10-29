---
title: 手写时间格式化
createTime: 2025/10/29 22:10:36
permalink: /home/tzdmc3xp/
---
```js
function formatDate(date) {
  let year = date.getFullYear();
  let month = ('0' + (date.getMonth() + 1)).slice(-2);
  let day = ('0' + date.getDate()).slice(-2);
  let hours = ('0' + date.getHours()).slice(-2);
  let minutes = ('0' + date.getMinutes()).slice(-2);
  let seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

var date = new Date();
var formattedDate = formatDate(date);

console.log(formattedDate); // 示例输出：2023-11-02 14:30:45
```