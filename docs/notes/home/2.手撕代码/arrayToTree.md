---
title: 对象数组转树
createTime: 2025/09/08 13:15:59
permalink: /home/g6jt3udd/
---
## 对象数组转树

```js
// list: 数组对象
// id: 每条数据的id
// pid: 每条数据的父节点对应字段
// pid:null 没有父节点的数据

const list = [
    { id: 04, pid: 03 },
    { id: 01, pid: null },
    { id: 02, pid: null },
    { id: 03, pid: 01 },
    { id: 05, pid: 01 },
    { id: 06, pid: 03 },
    { id: 07, pid: 02 },
    { id: 09, pid: 02 },
    { id: 10, pid: 07 }
];

const listToTree = (list, parentId) => {  // 定义递归函数，接受数组list和父节点id parentId
    let result = [];                     // 初始化结果数组，用于存储当前父节点下的子节点
    for (let item of list) {             // 遍历数组中的每个元素
        if (item.pid === parentId) {     // 检查当前元素的pid是否等于传入的parentId
            let res = listToTree(list, item.id) // 递归调用，寻找当前元素的子节点
            if (res.length > 0) {        // 如果递归返回的数组不为空（有子节点）
                item.children = res      // 将子节点数组赋值给当前元素的children属性
            }
            result.push(item)            // 将当前元素推入结果数组
        }
    }
    return result                        // 返回结果数组
}
console.log(listToTree(list, parentId = null)) // 调用函数，从根节点（pid为null）开始，并打印结果
```

