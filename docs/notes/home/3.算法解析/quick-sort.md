---
title: 快速排序
createTime: 2025/09/20 13:36:42
permalink: /home/t1jrfw1s/
---
手写快速排序

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

