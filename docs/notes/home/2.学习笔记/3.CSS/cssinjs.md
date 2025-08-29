---
title: CSS和CSS in JS
createTime: 2025/08/08 20:51:00
permalink: /home/kksbh1ds/
---
# CSS 变量 和 CSS in JS：现代样式管理方案比较

## 核心区别概述

| 特性         | CSS 变量           | CSS-in-JS            |
| ------------ | ------------------ | -------------------- |
| **本质**     | 原生 CSS 特性      | JavaScript 库实现    |
| **作用域**   | 全局或元素级       | 组件级作用域         |
| **动态性**   | 通过 JS 修改变量值 | 基于 JS 逻辑生成样式 |
| **主题支持** | 通过修改变量实现   | 内置主题系统         |
| **性能**     | 浏览器原生支持     | 有运行时开销         |

## CSS 变量详解

### 基本概念

CSS 变量（自定义属性）是 CSS 的原生功能，允许开发者定义可复用的值：

```css
:root {
  --primary-color: #3498db;
  --spacing-unit: 8px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(2 * var(--spacing-unit));
}
```

```css
:root {
  --primary-color: #3498db;
  --spacing-unit: 8px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(2 * var(--spacing-unit));
}
```

### 主要特点

* 现代浏览器原生支持无需额外库
* 通过 JavaScript 修改变量值
* 遵循 CSS 级联规则
* 通过修改变量实现主题变更

### 使用场景

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --theme-primary: #3498db;
      --theme-background: #f5f5f5;
      --spacing: 12px;
    }
  
    .dark-theme {
      --theme-primary: #1abc9c;
      --theme-background: #2c3e50;
    }
  
    .panel {
      background: var(--theme-background);
      padding: var(--spacing);
      border-radius: 4px;
      transition: background 0.3s;
    }
  
    button {
      background: var(--theme-primary);
      color: white;
      border: none;
      padding: calc(var(--spacing) / 2) var(--spacing);
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h2>CSS 变量示例</h2>
    <button id="themeToggle">切换主题</button>
    <p>使用原生 CSS 变量实现主题切换</p>
  </div>

  <script>
    const toggleBtn = document.getElementById('themeToggle');
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
    });
  </script>
</body>
</html>
```


```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --theme-primary: #3498db;
      --theme-background: #f5f5f5;
      --spacing: 12px;
    }
  
    .dark-theme {
      --theme-primary: #1abc9c;
      --theme-background: #2c3e50;
    }
  
    .panel {
      background: var(--theme-background);
      padding: var(--spacing);
      border-radius: 4px;
      transition: background 0.3s;
    }
  
    button {
      background: var(--theme-primary);
      color: white;
      border: none;
      padding: calc(var(--spacing) / 2) var(--spacing);
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h2>CSS 变量示例</h2>
    <button id="themeToggle">切换主题</button>
    <p>使用原生 CSS 变量实现主题切换</p>
  </div>

  <script>
    const toggleBtn = document.getElementById('themeToggle');
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
    });
  </script>
</body>
</html>
```

## CSS-in-JS 详解

### 基本概念

CSS-in-JS 是将 CSS 样式直接写入 JavaScript 代码中的方法：

```js
// 使用 styled-components 示例
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.primary ? '#3498db' : '#e0e0e0'};
  padding: ${props => props.size === 'large' ? '16px 24px' : '8px 16px'};
  border-radius: 4px;
  border: none;
  color: ${props => props.primary ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// 使用
<Button primary size="large">点击我</Button>
```

```js
// 使用 styled-components 示例
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.primary ? '#3498db' : '#e0e0e0'};
  padding: ${props => props.size === 'large' ? '16px 24px' : '8px 16px'};
  border-radius: 4px;
  border: none;
  color: ${props => props.primary ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// 使用
<Button primary size="large">点击我</Button>
```

### 主要特点

* 样式仅应用于特定组件
* 基于 props 或 state 生成样式
* 内置主题提供机制
* 自动添加浏览器前缀
* 支持嵌套、变量等

### 主要实现库

1. **Styled Components**：最流行的 CSS-in-JS 库
2. **Emotion**：高性能且灵活
3. **JSS**：框架无关的解决方案
4. **Linaria**：零运行时的 CSS-in-JS

## 关键区别分析

### 1. 作用域机制

* **CSS 变量**：全局或局部作用域，遵循 CSS 级联规则
* **CSS-in-JS**：组件级作用域，自动生成唯一类名

### 2. 动态样式实现

```js
// CSS 变量方式：通过修改变量值
document.documentElement.style.setProperty('--primary-color', newColor);

// CSS-in-JS 方式：基于 props 动态生成样式
const DynamicButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: ${({ isActive }) => isActive ? 'white' : 'gray'};
`;
```

```js
// CSS 变量方式：通过修改变量值
document.documentElement.style.setProperty('--primary-color', newColor);

// CSS-in-JS 方式：基于 props 动态生成样式
const DynamicButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: ${({ isActive }) => isActive ? 'white' : 'gray'};
`;
```

### 3. 主题解决方案

* **CSS 变量**：通过修改变量实现主题切换
* **CSS-in-JS**：使用 ThemeProvider 提供主题上下文

### 4. 性能考量

* **CSS 变量**：浏览器原生支持，性能最佳
* **CSS-in-JS**：有运行时解析开销，但提供代码分割优势

## 最佳实践与选择建议

### 使用 CSS 变量当：

* 需要全局设计系统（主题、间距、颜色）
* 性能是关键考虑因素
* 项目需要轻量级解决方案
* 与 CSS 框架集成

### 使用 CSS-in-JS 当：

* 使用 React 等组件化框架
* 需要高度动态、基于状态的样式
* 需要自动作用域隔离
* 项目已经使用 JavaScript 工具链

### 混合使用方案

```js
// 在 CSS-in-JS 中使用 CSS 变量
const StyledComponent = styled.div`
  background: var(--background-color);
  padding: var(--spacing-large);
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    padding: var(--spacing-medium);
  }
`;

// 通过 JS 设置 CSS 变量
const setTheme = (theme) => {
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--background-color', theme.background);
};
```

```js
// 在 CSS-in-JS 中使用 CSS 变量
const StyledComponent = styled.div`
  background: var(--background-color);
  padding: var(--spacing-large);
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    padding: var(--spacing-medium);
  }
`;

// 通过 JS 设置 CSS 变量
const setTheme = (theme) => {
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--background-color', theme.background);
};
```

