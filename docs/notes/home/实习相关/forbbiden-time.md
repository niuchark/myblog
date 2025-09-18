---
title: 实现禁呼时间的浏览器缓存
createTime: 2025/08/29 14:43:45
permalink: /home/ne3wk3ow/
---
# 禁呼时间存储逻辑详解

## 1. 数据结构分析

### 1.1 禁呼时间的数据结构

```javascript
// forbidDateRange 是一个数组，每个元素都是一个对象
forbidDateRange: [
    { time: [开始时间, 结束时间] },  // 第一个禁呼时间段
    { time: [开始时间, 结束时间] },  // 第二个禁呼时间段
    // ... 更多时间段
]
```

### 1.2 模板中的绑定

```html
<div v-for="i, index in forbidDateRange" :key="index" class="forbit-time">
    <a-range-picker
        v-model="i.time"  <!-- 这里的 i 是什么？ -->
        @change="onForbidTimeChange"
    />
</div>
```

## 2. Vue 响应式系统为什么深层变化检测不到？

```javascript
// 原始数据
forbidDateRange: [
    { time: ['2024-01-01 09:00', '2024-01-01 12:00'] }
]

// 用户修改时间
forbidDateRange[0].time = ['2024-01-01 10:00', '2024-01-01 13:00']
```

**问题所在：**

1. Vue 在初始化时，只对 `forbidDateRange` 数组本身建立了响应式监听
2. 对于数组内部的 `{time: []}` 对象，Vue 没有建立深层监听
3. 当用户修改 `i.time` 时，Vue 无法感知到这个变化

## 3. 解决方案详解

### 3.1 方案一：深度监听 (Deep Watcher)

```javascript
'forbidDateRange': {
    handler() {
        this.saveConfigToStorage()
    },
    deep: true  // 关键：深度监听
}
```

**原理：**

- `deep: true` 告诉 Vue 不仅要监听 `forbidDateRange` 数组本身
- 还要监听数组内部每个对象的每个属性
- 当 `forbidDateRange[0].time` 发生变化时，也能触发监听器

### 3.2 方案二：手动触发存储

```javascript
// 添加禁呼时间段
addTime(index) {
    this.forbidDateRange.push({time: []})
    this.saveConfigToStorage()  // 手动触发存储
},

// 删除禁呼时间段
delTime(index) {
    this.forbidDateRange.splice(index, 1)
    this.saveConfigToStorage()  // 手动触发存储
}
```

**原理：**

- 当用户点击添加/删除按钮时，我们知道数据发生了变化
- 直接调用 `saveConfigToStorage()` 保存数据
- 不依赖 Vue 的自动检测

### 3.3 方案三：事件监听

```html
<a-range-picker
    v-model="i.time"
    @change="onForbidTimeChange"  <!-- 监听时间选择器的变化事件 -->
/>
```

```javascript
onForbidTimeChange() {
    this.saveConfigToStorage()  // 时间变化时立即保存
}
```

**原理：**

- `@change` 是 Ant Design Vue 组件的事件
- 当用户选择时间时，组件会触发 `change` 事件
- 我们在事件处理函数中手动保存数据

**详细步骤：**

1. **用户选择禁呼时间**

   ```html
   <a-range-picker v-model="i.time" @change="onForbidTimeChange" />
   ```

2. **时间选择器触发 change 事件**

   ```javascript
   onForbidTimeChange() {
       this.saveConfigToStorage()  // 立即保存
   }
   ```

3. **Vue 深度监听器也触发**

   ```javascript
   'forbidDateRange': {
       handler() {
           this.saveConfigToStorage()  // 也会保存
       },
       deep: true
   }
   ```

4. **防抖处理**

   ```javascript
   saveConfigToStorage() {
       if (this.saveConfigTimer) {
           clearTimeout(this.saveConfigTimer)  // 清除之前的定时器
       }
       
       this.saveConfigTimer = setTimeout(() => {
           // 实际保存逻辑
           localStorage.setItem(storageKey, JSON.stringify(config))
       }, 500)  // 500ms 后执行
   }
   ```

5. **保存到浏览器**

   ```javascript
   const config = {
       forbidDateRange: this.forbidDateRange,  // 保存禁呼时间数据
       // ... 其他配置
   }
   localStorage.setItem(storageKey, JSON.stringify(config))
   ```

### 4.2 数据恢复流程

```
页面加载 → 读取浏览器存储 → 验证数据 → 恢复配置
```

**详细步骤：**

1. **页面初始化时读取存储**

   ```javascript
   loadConfigFromStorage() {
       const storedConfig = localStorage.getItem(storageKey)
       if (storedConfig) {
           const config = JSON.parse(storedConfig)
           // 恢复数据
       }
   }
   ```

2. **恢复禁呼时间数据**

   ```javascript
   this.forbidDateRange = config.forbidDateRange || [{time: []}]
   
   // 确保数据完整性
   if (!this.forbidDateRange.length) {
       this.forbidDateRange = [{time: []}]
   }
   ```

3. **验证数据格式**

   ```javascript
   // 确保每个元素都有正确的结构
   this.forbidDateRange = this.forbidDateRange.map(item => {
       if (!item || typeof item !== 'object') {
           return {time: []}
       }
       if (!Array.isArray(item.time)) {
           return {time: []}
       }
       return item
   })
   ```


### 5 自己加的拓展（为什么要验证数据？）

- 这段代码是在验证和修复禁呼时间数据的结构，确保从浏览器存储中恢复的数据格式正确。

```js
if (!this.forbidDateRange.length) {
    this.forbidDateRange = [{time: []}]
} else {
    // 验证每个禁呼时间项的结构
    this.forbidDateRange = this.forbidDateRange.map(item => {
        if (!item || typeof item !== 'object') {
            return {time: []}
        }
        if (!Array.isArray(item.time)) {
            return {time: []}
        }
        return item
    })
}
```

这段代码的作用：
- 如果禁呼时间数组为空，创建一个默认的空时间项
- 验证每个禁呼时间项是否是对象，且包含 time 数组
- 如果数据格式不正确，重置为默认格式