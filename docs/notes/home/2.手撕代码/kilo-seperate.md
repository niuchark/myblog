---
title: 将数字每千分位用逗号隔开
createTime: 2025/09/08 13:17:59
permalink: /home/44lsozzk/
---
### 将数字每千分位用逗号隔开

**数字有小数版本：**

```js
/**
 * 将数字转换为千分位格式（添加逗号分隔）
 * @param {number|string} num - 需要转换的数字
 * @returns {string} 转换后的千分位格式字符串
 */
toThousands(num) {
  // 将输入转换为字符串，如果num为假值（如0、null、undefined）则使用"0"
  num = (num || 0).toString();
  
  // 定义变量：
  let number = 0,      // 用于存储小数点位置
      floatNum = '',   // 存储小数部分
      intNum = '';     // 存储整数部分

  // 判断是否有小数位，有则截取小数点后的数字
  if (num.indexOf('.') > 0) {
    // 获取小数点出现的位置索引
    number = num.indexOf('.');
    // 从小数点位置开始截取到字符串末尾，获取小数部分
    // substr(from, length): 从指定位置开始截取指定长度的子字符串
    floatNum = num.substr(number);
    // 截取从开始到小数点前的位置，获取整数部分
    // substring(start, end): 截取从start到end-1的子字符串
    intNum = num.substring(0, number);
  } else {
    // 如果没有小数点，整个数字都是整数部分
    intNum = num;
  }

  // 定义结果数组和计数器
  let result = [],      // 存储转换后的字符数组
      counter = 0;      // 计数器，用于每3位数字插入逗号

  // 将整数部分字符串转换为字符数组，便于处理单个数字
  intNum = intNum.split('');

  // 从右向左遍历整数部分的每个数字字符
  // 使用倒序遍历便于从低位向高位处理
  for (let i = intNum.length - 1; i >= 0; i--) {
    // 计数器加1，记录当前处理的数字位置
    counter++;
    
    // 将当前数字字符添加到结果数组的开头
    // unshift()方法在数组开头添加新元素
    result.unshift(intNum[i]);

    // 判断是否到达3的倍数位置且不是最后一个数字（i != 0）
    if (!(counter % 3) && i != 0) { 
      // 在当前位置插入逗号分隔符
      result.unshift(','); 
    }
  }

  // 将结果数组转换为字符串，并与小数部分拼接
  // 如果result.join('') + floatNum的结果为假值（如空字符串），则返回空字符串
  return result.join('') + floatNum || '';
}
```

**无小数版本：**

```js
let format = n => {
    let num = n.toString() 
    let len = num.length
    if (len <= 3) {
        return num
    } else {
        let remainder = len % 3
        if (remainder > 0) { // 不是3的整数倍
            return num.slice(0, remainder) + ',' + num.slice(remainder, len).match(/\d{3}/g).join(',') 
        } else { // 是3的整数倍
            return num.slice(0, len).match(/\d{3}/g).join(',') 
        }
    }
}
format(1232323)  // '1,232,323'
```

