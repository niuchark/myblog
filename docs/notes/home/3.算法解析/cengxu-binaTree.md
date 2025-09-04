---
title: 二叉树层序遍历-力扣102
createTime: 2025/09/02 20:26:54
permalink: /home/lllx6sch/
---
### 思路：

准备一个队列存储每一层的节点，准备一个数组存储最终的答案（ret[ [ 1 ], [2, 3], [4, 5, 6] ]）

先在队列中加入根节点，在遍历队列的过程中，将根结点的值保存进二维的结果数组中，并且判断当前遍历的节点是否有左右子节点，有的话也加入队列

```js
// 定义层序遍历函数，参数root是二叉树的根节点
var levelOrder = function(root) {
    // 初始化结果数组，将存储每一层的节点值
    const ret = [];
    
    // 如果根节点为空，直接返回空数组
    if (!root) {
        return ret;
    }

    // 初始化队列，用于存储待访问的节点
    const q = [];
    
    // 将根节点加入队列，开始遍历
    q.push(root);
    
    // 当队列不为空时，继续遍历
    while (q.length !== 0) {
        // 记录当前层的节点数量
        const currentLevelSize = q.length;
        
        // 在结果数组中为当前层创建一个空数组
        ret.push([]);
        
        // 遍历当前层的所有节点
        for (let i = 1; i <= currentLevelSize; ++i) {
            // 从队列头部取出一个节点（先进先出）
            const node = q.shift();
            
            // 将当前节点的值添加到结果数组的最后一层中（即ret[[上一个循环的添加],[待添加]]）
            ret[ret.length - 1].push(node.val);
            
            // 如果当前节点有左子节点，将其加入队列
            if (node.left) q.push(node.left);
            
            // 如果当前节点有右子节点，将其加入队列
            if (node.right) q.push(node.right);
        }
    }
        
    // 返回层序遍历的结果
    return ret;
};
```

### 算法复杂度分析

- 时间复杂度：O(n)，每个节点恰好被访问一次
- 空间复杂度：O(n)，队列中最多存储约n/2个节点（最宽的一层）