---
title: 手写数组常用API
createTime: 2025/09/08 13:19:08
permalink: /home/lo0z53mi/
---
## 实现数组的flat方法

```js
function _flat(arr, depth) {
  if(!Array.isArray(arr) || depth <= 0) {
    return arr;
  }
  return arr.reduce((prev, cur) => {
    if (Array.isArray(cur)) {
      return prev.concat(_flat(cur, depth - 1))
    } else {
      return prev.concat(cur);
    }
  }, []);
}

// es6
function _myflat(arr, depth = 1) {
    if(!Array.isArray(arr) || depth <= 0) return arr
    return arr.reduce((prev, cur) => prev.concat(Array.isArray(cur) ? _myflat(cur, depth - 1) : cur), [])
}
```

## 实现数组的push方法

```js
let arr = [];
Array.prototype.push = function() {
	for( let i = 0 ; i < arguments.length ; i++){
		this[this.length] = arguments[i] ;
	}
	return this.length;
}
```

## 实现数组的filter方法

```js
Array.prototype._filter = function(fn) {
    if (typeof fn !== "function") {
        throw Error('参数必须是一个函数');
    }
    const res = [];
    for (let i = 0, len = this.length; i++) {
        fn(this[i]) && res.push(this[i]);
    }
    return res;
}
```

## 实现字符串的repeat方法
输入字符串s，以及其重复的次数，输出重复的结果，例如输入abc，2，输出abcabc。
```js
function repeat(s, n) {
    return (new Array(n + 1)).join(s);
}
```

## 手写indexof
```js
/** 
* 存在则返回元素所在下标，不存在则返回-1
**/
Array.prototype.indexOf_ = (item) =>{
  let array = this;
  let length = array.length;
  for (let i = 0; i < length; i++) {
    if (array[i] === item ) {
      return i;
    }
  }
  return -1;
}
```