---
title: 树转对象
createTime: 2025/10/29 22:07:05
permalink: /home/xkta683i/
---
```js
function treeToObjectArray(tree) {
    const result = [];

    function traverse(node, parentId = null) {
        // 将当前节点转为对象
        const current = {
            id: node.id,
            name: node.name,
            parentId: parentId // 指明父节点的 ID
        };
        
        result.push(current);

        // 遍历子节点
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child, node.id));
        }
    }

    traverse(tree);
    return result;
}
```