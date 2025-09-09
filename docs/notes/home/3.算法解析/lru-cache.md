---
title: LRU缓存机制-力扣146
createTime: 2025/09/05 19:55:52
permalink: /home/n4w90905/
---
## LRU缓存

```js
// 定义节点类，用于双向链表中的每个节点
class Node {
    constructor(key = 0, value = 0) {
        // 节点的键
        this.key = key;
        // 节点的值
        this.value = value;
        // 指向前一个节点的指针
        this.prev = null;
        // 指向后一个节点的指针
        this.next = null;
    }
}

// 定义LRU缓存类
class LRUCache {
    constructor(capacity) {
        // 缓存容量
        this.capacity = capacity;
        // 创建哨兵节点，简化链表操作（头尾操作）
        this.dummy = new Node();
        // 初始化哨兵节点，使其形成一个自环（prev和next都指向自己）
        this.dummy.prev = this.dummy;
        this.dummy.next = this.dummy;
        // 创建Map用于存储键到节点的映射，实现O(1)的查找
        this.keyToNode = new Map();
    }

    // 私有方法：获取key对应的节点，同时把该节点移到链表头部（表示最近使用）
    #getNode(key) {
        // 如果缓存中没有这个key，返回null
        if (!this.keyToNode.has(key)) {
            return null;
        }
        // 从Map中获取对应的节点
        const node = this.keyToNode.get(key);
        // 从链表中移除该节点
        this.#remove(node);
        // 将节点推到链表头部（表示最近使用）
        this.#pushFront(node);
        // 返回找到的节点
        return node;
    }

    // 公开方法：获取缓存值
    get(key) {
        // 获取节点，getNode方法会把对应节点移到链表头部
        const node = this.#getNode(key);
        // 如果节点存在返回节点值，否则返回-1
        return node ? node.value : -1;
    }

    // 公开方法：插入或更新缓存值
    put(key, value) {
        // 尝试获取已存在的节点（getNode会把对应节点移到链表头部）
        let node = this.#getNode(key);
        // 如果节点已存在
        if (node) {
            // 更新节点的值
            node.value = value;
            // 直接返回
            return;
        }
        // 创建新节点
        node = new Node(key, value);
        // 将键和节点的映射存入Map
        this.keyToNode.set(key, node);
        // 将新节点推到链表头部
        this.#pushFront(node);
        // 如果缓存已超过容量
        if (this.keyToNode.size > this.capacity) {
            // 获取链表尾部的节点（最近最少使用的节点）
            const backNode = this.dummy.prev;
            // 从Map中删除该节点的键
            this.keyToNode.delete(backNode.key);
            // 从链表中移除该节点
            this.#remove(backNode);
        }
    }

    // 私有方法：从链表中删除节点x
    #remove(x) {
        // 将x的前一个节点的next指针指向x的下一个节点
        x.prev.next = x.next;
        // 将x的下一个节点的prev指针指向x的前一个节点
        x.next.prev = x.prev;
    }

    // 私有方法：在链表头部添加节点x
    #pushFront(x) {
        // 设置x的prev指针指向哨兵节点
        x.prev = this.dummy;
        // 设置x的next指针指向原头节点
        x.next = this.dummy.next;
        // 将哨兵节点的next指针指向x
        x.prev.next = x;
        // 将原头节点的prev指针指向x
        x.next.prev = x;
    }
}
```

