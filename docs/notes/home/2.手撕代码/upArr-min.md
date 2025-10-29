---
title: 非严格递增数组找最小值
createTime: 2025/10/29 22:08:43
permalink: /home/z3moiaab/
---
```js
function findMin(arr) {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);

        // 比较中间元素和右侧元素
        if (arr[mid] > arr[mid + 1]) {
            return arr[mid + 1];
        }
        if (arr[mid] < arr[mid - 1]) {
            return arr[mid];
        }
        
        // 处理相等的情况
        if (arr[mid] === arr[left]) {
            left++;
        } else if (arr[mid] === arr[right]) {
            right--;
        } else if (arr[mid] < arr[right]) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return arr[left];
}

// 示例使用
const array = [3, 4, 5, 1, 2];
console.log(findMin(array));  // 输出 1
```