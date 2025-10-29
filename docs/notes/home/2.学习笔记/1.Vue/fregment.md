---
title: fregment实现原理
createTime: 2025/10/17 15:34:00
permalink: /home/gxjtko2i/
---
### 什么是 Fragment？

在 Vue 2 中，每个组件**必须有且仅有一个根节点**。如果你在模板中写了多个平级的标签，编译器会报错。

**Vue 2 示例 (不合法):**

```html
<template>
  <div>Node A</div>
  <div>Node B</div> <!-- 报错：Component template should contain exactly one root element. -->
</template>
```

你必须将它们包裹在一个父元素内：

```html
<template>
  <div> <!-- 唯一的根节点 -->
    <div>Node A</div>
    <div>Node B</div>
  </div>
</template>
```

**Vue 3 示例 (合法):**

```html
<template>
  <div>Node A</div>
  <div>Node B</div> <!-- 完美运行 -->
</template>
```

这个能力的实现，就是 **Fragment**。你可以将它理解为一个**无形的、不渲染任何自身 DOM 元素的包装器**，它只负责包裹和管理其内部的多个子节点。

---

### 实现原理深度解析

“虚拟节点（VNode）的扁平化”和“Patch算法的优化”正是其核心。我们一步步来看。

#### 1. 虚拟节点（VNode）的扁平化

这是 **编译时** 发生的事情。

**过程如下：**

1.  **模板编译**：当 Vue 的编译器遇到一个有多根节点的模板时，它不会像 Vue 2 那样报错，而是会识别到这是一个“片段”（Fragment）。
2.  **生成渲染函数**：编译器会生成一个特殊的渲染函数。这个函数返回的不是一个单一的 VNode，而是一个**片段虚拟节点（Fragment VNode）**。
3.  **Fragment VNode 的结构**：这个特殊的 VNode 有一个特定的 `type`（或 `shapeFlag`），标识自己是一个 `FRAGMENT`。它的 `children` 属性包含了所有平级的根节点对应的 VNode。

**代码示例说明：**

假设我们有如下模板：

```html
<template>
  <div>Node A</div>
  <span>Node B</span>
  <p>{{ text }}</p>
</template>
```

经过编译后，生成的渲染函数大致类似于：

```javascript
import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, Fragment as _Fragment } from "vue"

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(),
    _createElementBlock(_Fragment, null, [ // <-- 关键：根节点是 _Fragment
      _createElementVNode("div", null, "Node A"),
      _createElementVNode("span", null, "Node B"),
      _createElementVNode("p", null, _toDisplayString(_ctx.text), 1 /* TEXT */)
    ], 64 /* STABLE_FRAGMENT */))
}
```

可以看到，最外层的块（Block）是一个 `_Fragment`，它的 `children` 是一个包含三个元素 VNode 的数组。

**“扁平化”的含义：**
在 Vue 2 的虚拟 DOM 树中，结构是严格的树形，每个组件一个根。而在 Vue 3 中，一个组件的虚拟 DOM “树” 的根部可以是一个 `Fragment`，这个 `Fragment` 的多个子节点在逻辑上是平级的，直接挂载到父组件中。这就打破了传统的“单根树”结构，变成了一种“多根森林”的结构，但这些“树”的根（即 Fragment 的子节点）在 DOM 中是扁平的、同级的。

#### 2. Patch 算法的优化

这是 **运行时** 发生的事情。

`patch` 是虚拟 DOM 的核心算法，负责比较新旧 VNode 并更新真实的 DOM。Vue 3 的 `patch` 函数必须能够识别和处理 `Fragment` 这种特殊的 VNode 类型。

**当 `patch` 遇到一个 `Fragment` VNode 时：**

1. **挂载（Mount）阶段：**

   - 它不会为 `Fragment` 本身创建任何 DOM 元素（比如不会创建一个 `<div>` 来包裹）。
   - 它会直接遍历 `Fragment` 的 `children` 数组，递归地调用 `patch` 过程，将每个子 VNode 挂载（创建 DOM 元素并追加）到父容器中。
   - 最终结果是，`Fragment` 的所有子节点都作为**父容器的直接子节点**被插入。

   ```javascript
   // 伪代码示意
   const processFragment = (n1, n2, container) => {
     if (n1 == null) {
       // 挂载：遍历所有子节点，逐个挂载到容器中
       n2.children.forEach(child => patch(null, child, container));
     } else {
       // 更新...
     }
   };
   ```

2. **更新（Update）阶段：**

   - **Diff 算法的增强**：这是关键优化点。当新旧 VNode 都是 `Fragment` 时，`patch` 算法需要对比它们各自的 `children` 数组。
   - Vue 3 的 Diff 算法（提到的 Patch 算法优化）非常高效。它能够识别出子节点数组的变化（增、删、移动、属性更新），并直接对**父容器的真实子 DOM 节点**进行最小化的操作。
   - 由于没有额外的包裹元素，Diff 过程是直接在父容器的子节点列表上进行的，这避免了因额外包装层带来的不必要的递归和比较，**性能反而可能更好**。

   ```javascript
   // 伪代码示意更新过程
   const processFragment = (n1, n2, container) => {
     if (n1 == null) {
       // ... 挂载
     } else {
       // 更新：调用 patchChildren 来对比新旧 Fragment 的子节点列表
       patchChildren(n1, n2, container);
     }
   };
   ```

3. **卸载（Unmount）阶段：**

   - 卸载一个 `Fragment` 时，需要遍历其所有子 VNode，并递归地调用它们的卸载逻辑，确保所有的子节点、自定义指令、生命周期钩子等都被正确清理。

---

### 总结与类比

| 特性              | Vue 2                   | Vue 3 (with Fragment)                          |
| :---------------- | :---------------------- | :--------------------------------------------- |
| **根节点限制**    | 必须单根                | 支持多根（自动 Fragment）                      |
| **虚拟 DOM 结构** | 严格的单根树            | 可以是多根森林（根部是 Fragment）              |
| **编译结果**      | 生成单根 VNode          | 生成 Fragment VNode，其 children 是平级节点    |
| **渲染结果**      | 有一个包装的根 DOM 元素 | 没有包装元素，子节点直接插入父容器             |
| **Patch 算法**    | 在单根树上进行 Diff     | 能识别 Fragment，直接在其子节点数组上进行 Diff |

### 带来的好处

1.  **更灵活的模板编写**：无需再添加无意义的包装 `div`，使 HTML 结构更清晰。
2.  **更符合 Web Components 标准**：某些 HTML 元素如 `<tr>`, `<td>` 必须存在于特定父元素内，Fragment 使得创建包装这些元素的组件变得更加自然。
3.  **潜在的轻微性能提升**：减少了一层不必要的 DOM 嵌套，有时可以减少 CSS 样式计算的范围。同时，优化的 Diff 算法确保了更新效率。