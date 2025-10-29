---
title: 一些拓展手撕
createTime: 2025/10/29 22:12:18
permalink: /home/y8oan1lt/
---
## 对字符串进行排序并去重

```js
const str = 'bhjiktghbahs'
const sortAndUnique = (str) => {
    let newArr = str.split("").sort()
    let map = new Map()
    let length = newArr.length
    for (let i = 0; i < length; i++) {
        if (map.has(newArr[i])) {
            newArr.splice(i, 1)
        } else {
            map.set(newArr[i], newArr[i])
        }
    }
    return newArr.join('')
}

console.log(sortAndUnique(str))
```

## 文字溢出的展示处理

```css
.single-line-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- `white-space: nowrap;` 强制文本在一行内显示，禁止自动换行。
- `overflow: hidden;` 隐藏超出容器边界的文本内容。
- `text-overflow: ellipsis;` 在文本溢出时显示省略号(…)

或者滚动条：

```css
.box-container {
  width: 300px;
  height: 200px;
  overflow-y: auto; /* 垂直方向自动显示滚动条 */
  border: 1px solid #000;
}
```

## 发布-订阅模式

```js
class EventCenter{
  // 1. 定义事件容器，用来装事件数组
	let handlers = {}

  // 2. 添加事件方法，参数：事件名 事件方法
  addEventListener(type, handler) {
    // 创建新数组容器
    if (!this.handlers[type]) {
      this.handlers[type] = []
    }
    // 存入事件
    this.handlers[type].push(handler)
  }

  // 3. 触发事件，参数：事件名 事件参数
  dispatchEvent(type, params) {
    // 若没有注册该事件则抛出错误
    if (!this.handlers[type]) {
      return new Error('该事件未注册')
    }
    // 触发事件
    this.handlers[type].forEach(handler => {
      handler(...params)
    })
  }

  // 4. 事件移除，参数：事件名 要删除事件，若无第二个参数则删除该事件的订阅和发布
  removeEventListener(type, handler) {
    if (!this.handlers[type]) {
      return new Error('事件无效')
    }
    if (!handler) {
      // 移除事件
      delete this.handlers[type]
    } else {
      const index = this.handlers[type].findIndex(el => el === handler)
      if (index === -1) {
        return new Error('无该绑定事件')
      }
      // 移除事件
      this.handlers[type].splice(index, 1)
      if (this.handlers[type].length === 0) {
        delete this.handlers[type]
      }
    }
  }
}
```

## 快速排序

```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArray = function(nums) {
    // 辅助函数：快速排序递归实现
    function quickSort(arr, left, right) {
        if (left >= right) return;
        
        // 获取分区点
        const pivotIndex = partition(arr, left, right);
        
        // 递归排序左右两部分
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }
    
    // 分区函数
    function partition(arr, left, right) {
        // 选择最右边的元素作为基准
        const pivot = arr[right];
        let i = left;
        
        for (let j = left; j < right; j++) {
            // 如果当前元素小于或等于基准
            if (arr[j] <= pivot) {
                // 交换元素
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
            }
        }
        
        // 将基准元素放到正确位置
        [arr[i], arr[right]] = [arr[right], arr[i]];
        return i;
    }
    
    // 创建数组的副本以避免修改原数组
    const sortedNums = [...nums];
    quickSort(sortedNums, 0, sortedNums.length - 1);
    return sortedNums;
};
```

## 手写实现setTimeout

```js
let setTimeout = (fn, timeout, ...args) => {
  // 初始当前时间
  const start = +new Date()
  let timer, now
  const loop = () => {
    timer = window.requestAnimationFrame(loop)
    // 再次运行时获取当前时间
    now = +new Date()
    // 当前运行时间 - 初始当前时间 >= 等待时间 ===>> 跳出
    if (now - start >= timeout) {
      fn.apply(this, args)
      window.cancelAnimationFrame(timer)
    }
  }
  window.requestAnimationFrame(loop)
}

function showName(){ 
    console.log("Hello")
}
let timerID = setTimeout(showName, 1000);
```

## 文件路径构造树

```js
const fileBuildTree = (filePaths) => {
    // 创建根节点，name为空字符串，children为空数组
    const root = { name: '', children: [] };
    
    for (const file of filePaths) {
        // 将文件路径按'/'分割成数组，并过滤掉空字符串（如开头的'/'会产生空字符串）
        const parts = file.split('/').filter(part => part !== '');

        let currentNode = root; // 从根节点开始处理当前路径
        
        for (const part of parts) {
            // 在当前节点的子节点中查找是否已存在同名节点
            let childNode = currentNode.children.find(child => child.name === part);

            // 如果不存在同名子节点，则创建新节点并添加到当前节点的子节点列表中
            if (!childNode) {
                childNode = { name: part, children: [] };
                currentNode.children.push(childNode);
            }

            // 将当前节点更新为找到或创建的子节点，继续处理下一级路径
            currentNode = childNode;
        }
    }
    
    // 如果根节点只有一个子节点，直接返回该子节点（避免多余的根层级）
    // 否则返回完整的根节点（包含多个顶级目录）
    return root.children.length === 1 ? root.children[0] : root;
}

const fileTree = fileBuildTree(filePaths);
console.log(fileTree);
```

