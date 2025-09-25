---
title: 组件库
createTime: 2025/09/25 23:16:31
permalink: /home/s87sb6if/
---
### 一、pnpm 和 npm 以及 yarn 的区别

主要区别有两点：

1. pnpm 支持全局共享存储，将依赖包安装到全局磁盘当中，使用的时候通过硬链接到达各个项目中去，允许不同项目共享相同的依赖，即使某一个依赖的版本不同，也只是去下载有 diff 的文件，不会全量下载。而 npm 和 yarn 在创建每个项目时，都会将所有项目的依赖放在当前目录下的 node_modules，造成存储空间的浪费
2. pnpm 解决了 npm 和 yarn 中存在幽灵依赖的问题。幽灵依赖指的是在软件项目中存在但并未在`package.json`中声明的依赖项。产生原因：使用 npm、yarn 下载某些依赖时会下载上依赖的其他依赖项，但这些间接依赖项并未在`package.json`中显示声明 
3. pnpm 怎么解决的呢：pnpm 通过非扁平化的 node_modules 来解决的，也就是 node_modules 目录下只有`.pnpm`和直接依赖项，没有其他次级依赖包

### 二、那直接依赖项的依赖怎么办呢，同时怎么在下载的时候超过 npm 和 yarn 的速度呢

这个问题的答案就涉及到 pnpm 的三层寻址机制了，在 pnpm 中，每个包的寻找都要经过三层结构：

```
node_modules/package-a` > 软链接`node_modules/.pnpm/package-a@1.0.0/` > 硬链接 `~/.pnpm-store/v3/files/
```

也就是说，每个项目 node_modules 下安装的包以软链接方式将内容指向 node_modules/.pnpm 中的包；`.pnpm`目录以扁平化结构管理每个版本包的源码内容，以硬链接方式指向 pnpm-store 中的文件地址

### 三、pnpm 软链接和硬链接

#### 概念

在计算机中我们文件夹中的文件实际上是一个指针，但这个指针并不是直接指向我们在磁盘中存储文件的位置，而是指向一个 inode 块，inode 中存储着文件在磁盘中的各种信息，一般我们的文件都是指向对应文件的 inode，我们把这类链接成为硬链接，但是还有一种链接，它存储的并不是实际的值，而是另一个硬链接的地址，我们把这类链接成为软链接。

![img](https://cdn.nlark.com/yuque/0/2025/jpeg/29733541/1741070014369-90f3aa39-88f1-4dcb-a396-8a0e56c551c2.jpeg)

#### 特性

#### 硬链接

- 具有相同inode节点号的多个文件互为硬链接文件；
- 删除硬链接文件或者删除源文件任意之一，文件实体并未被删除；
- 只有删除了源文件和所有对应的硬链接文件，文件实体才会被删除；
- 硬链接文件是文件的另一个入口；
- 可以通过给文件设置硬链接文件来防止重要文件被误删；
- 创建硬链接命令 ln 源文件 硬链接文件；
- 硬链接文件是普通文件，可以用rm删除；
- 对于静态文件（没有进程正在调用），当硬链接数为0时文件就被删除。注意：如果有进程正在调用，则无法删除或者即使文件名被删除但空间不会释放。 到对应的 .pnpm/[package_name]@version/node_modules/[package_name] 中。

------

pnpm 有个根目录，一般都是保存在 user/.pnpm-store 下，pnpm 通过硬链接的方式保证了相同的包不会被重复下载，比如说我们已经在 repoA 中下载过一次 [express@4.17.1](mailto:express@4.17.1) 版本，那我们后续在 repoB 中安装 [express@4.17.1](mailto:express@4.17.1) 的时候是会被复用的，具体就是 repoA 中的 express 中的文件和 repoB 中的 express 中的文件指向的是同一个 inode

```plain
硬连接测试
创建两个相同的项目 `npm-yarn-pnpm`、`npm-yarn-pnpm-hardLink`
分别用pnpm 安装依赖 `pnpm install`
同时到其中一个包， 例如 `react-router`
`cd node_modules/react-router`
`ls -li` 查看文件id
```

![img](https://cdn.nlark.com/yuque/0/2025/png/29733541/1741070015286-ad4762aa-6f6a-4820-ae49-7366eeef654d.png)

#### 软链接

- 软链接类似windows系统的快捷方式；
- 软链接里面存放的是源文件的路径，指向源文件；
- 删除源文件，软链接依然存在，但无法访问源文件内容；
- 软链接失效时一般是白字红底闪烁；
- 创建软链接命令 ln -s 源文件 软链接文件；
- 软链接和源文件是不同的文件，文件类型也不同，inode号也不同；
- 软链接的文件类型是“l”，可以用rm删除。

------

例如, 用`pnpm` 安装 `express`, 在 `node_modules` 目录中 输入 `l` 查看 ![img](https://cdn.nlark.com/yuque/0/2025/png/29733541/1741070014737-ebef4b54-f74a-4082-b25a-17f2113839cd.png) 所以说 pnpm 的软链接就是将 node_modules 里的文件软链接到`.pnpm/` 下的具体包 

#### 总结

pnpm 的出现对于 npm 和 yarn 来说是一个比较彻底的改变. 保留有原来 `node_modules` 的一些基本约定的同时, 又用软连接的方式对一些npm/yarn 存在的问题给予解决. pnpm 目前对于日常使用完全没问题，目前很多的类库还有框架都已经默认将 pnpm 作为安装工具，目前看来 pnpm 完全可以取代 npm。 或许pnpm 还有一些需要完善的问题, 例如软连接导致的一些包需升级才能使用pnpm等, 但 pnpm 的出现并不是另一个包管理器的竞品, 而是一个最佳解决方案的探索.

### 四、npm 和 yarn 的区别

为什么会说到这个问题呢，这也是展示一个知识广度的点，在前面，我们精讲了 pnpm，但是对于 npm 和 yarn 的区别却没有详细展开来讲，这一点也是被很多同学所忽略的：即 npm 和 yarn 的不同之处到底在哪呢？这个问题其实有挺多可以详细说的点的，让我们详细来看看

##### npm v2

在最早期的`npm`版本(npm v2)，`npm`的设计可以说是非常的简单,在安装依赖的时候会将依赖放到`node_modules`文件中; 随着项目的不断增大，依赖逐渐变成一个巨大的依赖树，不同依赖之间重复的依赖包也会重复安装，既占用我们电脑内存，也在安装/删除的过程中变得极为缓慢， 形成`嵌套地狱`

比如你安装一个 express，那么你会在 node_modules 下面只找到一个 express 的文件夹。而 express 依赖的项目都放在其文件夹下。

```javascript
- app/
  - package.json
  - node_modules/
    - express/
      - index.js
      - package.json
      - node_modules/
        - connect/
        - path-to-regexp/
          - index.js
          - package.json
          - node_modules/
            - ...
        - ...
```

这个带来的问题或许 windows 用户深谙其痛，因为在这种安装环境下，会导致目录的层级特别高，而对于 windows 来说，最大的路径长度限制在 248 个字符，再加上 node_modules 这个单词又特别长，

##### npm v3

为了解决这些问题，(npm v3)重新考虑了 node_modules 结构并提出了扁平化。可以说很好的解决了嵌套层级过深以及实例不共享的问题。 所有的依赖都被拍平到`node_modules`目录下，不再有很深层次的嵌套关系。这样在安装新的包时，根据 node require 机制，会不停往上级的`node_modules`当中去找，如果找到相同版本的包就不会重新安装，解决了大量包重复安装的问题，而且依赖层级也不会太深。

```javascript
- app/
- node_modules/
  - express/
  - connect/
  - path-to-regexp/
  - ...
```

如果出现了不同版本的依赖，比如说 package-a 依赖 [`package-c@0.x.x](mailto:`package-c@0.x.x)的版本，而package-b依赖[package-c@1.x.x](mailto:package-c@1.x.x)` 版本，那么解决方案还是像之前的那种嵌套模式一样

```javascript
- app/
- node_modules/
  - package-a/
  - package-c/
    - // 0.x.x
  - package-b/
    - node_modules/
      - package-c/
        - // 1.x.x
```

但是， 扁平化的方式依然存在诸多问题...

##### yarn v1

随着 node 社区壮大, 为了解决 npm 的几个问题

- 无法保证两次安装的版本是完全相同的。(主要是没有锁版本文件, 默认安装为了处理一些小问题, 会默认使用`^` 方式安装, 安装最新的小版本, 比如 2.XXX)
- 安装速度慢。
- npm 是不支持离线模式,导致内网使用比较困难

所以，此时 yarn 诞生了，为的就是解决上面几个问题。

- 引入 `yarn.lock` 文件来管理依赖版本问题，保证每次安装都是一致的。
- 缓存加并行下载保证了安装速度

##### npm v5

可能是受`yarn`的影响, npm v5 引入了 `package-lock.json` 来锁定版本, 且自动添加并且提升了安装速度, 但依然没有 yarn 快

##### npm v6

加入了缓存, 进一步提升了速度

##### yarn v2

2020 年发布的 yarn v2 可谓是 yarn 的一个巨大的改变 增加[Plug'n'Play](https://next.yarnpkg.com/features/pnp)能力，作为重头戏，现在已经直接内置在 2.0 版本里面了。官方说可以用 node-modules 插件切换，但看起来并不能……

在使用 yarn 2.x 安装以后，node_modules 不会再出现，代替它的是.yarn 目录，里面有 cache 和 unplugged 两个目录，以及外面一个.pnp.js

- .yarn/cache 里面放所有需要的依赖的压缩包，zip 格式
- .yarn/unplugged 是你需要手动去修改的依赖，使用 yarn unplugin lodash 可以把 lodash 解压到这个目录下，之后想修改什么的随意
- `.pnp.js`是 PNP 功能的核心，所有的依赖定位都需要通过它来 

##### 为什么会有`package-lock.json`、`yarn.lock` 的出现

在`package.json`中, 我们新增一个包都是使用 `^` 或者 `~` 的方式来安装依赖.：

1. 如果在不同的时间安装这些软件包，则可能会导致下载这些软件包的不同版本。
2. 在删除了 `node_modules` 文件夹后, 不实用 `lock` 文件安装的情况下, 每次安装的依赖都不一样 
3. 在项目的依赖中, 某个依赖由于使用 `^` 方式, 将会安装最新的小版本, 这将可能影响到项目, 比如 [`element-ui@2.12.0](mailto:`element-ui@2.12.0)`与之后的版本的`Transfer 穿梭框` 组件样式就完全不一样等

因此，有`package-lock.json`、`yarn.lock` 的出现,将项目依赖每次新增以及修改的过程中, 将关系记录固定，就解决了这些问题。 但是, 千万不要混用 `npm` 和 `yarn`, 这将导致安装依赖修改的          `lock` 文件会记录在不同的地方, 相当于各自记录一半. 建议您提交而不删除这些文件，除非您打算根据 package.json 规范更新软件包，并且准备进行彻底的测试或快速修复生产中发现的所有错误

##### `node_modules` 的扁平化结构问题

**模块可以访问它们不依赖的包(幽灵依赖)：** 对于一个安装包内 `package.json` 中未申明的包，npm/yarn 由于扁平化的原因， 可以借助其安装的包内使用的依赖直接使用，这对于维护来说极度不安全， 当其依赖去除或升级， 将不可控。 例如，一个加载的包中使用的 `moment.js`, 随着后面可能的升级， 假如将其替换为`day.js`,将导致代码报错 

##### 总结

1. 在 npm v3 版本之前，npm 采用的是树状结构管理依赖，容易造成重复依赖下载以及安装/卸载极为缓慢的问题
2. 从 npm v3 版本开始，开始采用扁平化结构存储依赖，解决了上述的一些问题
3. yarn v1 版本发布，一方面引入 `yarn.lock` 文件来管理依赖版本问题，保证每次安装都是一致的；另一方面采用缓存加并行下载保证了安装速度
4. npm v5 版本发布，也开始引入`package-locak.json`文件来管理依赖版本问题，但是安装速度依旧没有 yarn 快
5. yarn v2 版本发布，使用`.yarn` 目录来代替`node_modules`目录，里面有 `cache `和 

```
unplugged `两个目录，以及外面一个`.pnp.js
```

1. 除此之外，yarn 还有 yarn workspace，可以用来管理 monerepo 项目，但是 npm 并不可以

所以在回答 npm 和 yarn 的区别的时候，是一个可以展示你知识广度的一个很好的方式，因为没有限定 npm 和 yarn 的版本，所以你可以讲的具体再具体一点

### 五、ESM 和 UMD 模块的区别是什么，怎么去支持多种模块的导出的呢

在用户角度来说，ESM 就是可以形如`import Button from 'antd'`的形式来导出一个组件，可以实现 TreeShaking，进行按需引用；而 UMD 就是通过 `<script src = 'xxxx'></script>` 进行全局引用，不能够实现按需引用

### 六、TreeShaking 是什么，它的原理又是什么呢

简单总结下：

1. tree shaking 是一种死代码剔除技术
2. tree shaking 是根据模块间的信息来完成死代码的剔除的

**原理：**

Tree shaking 利用的是模块间的信息，进行的死代码删除。死代码的删除有很多方式，比如代码压缩时候的 compress，但它不是 tree shaking，只是简单的消除冗余、简化表达式

Tree shaking 的原理在于需要利用 ESM 之间的引用信息，即它需要先去构建出代码的依赖关系图谱，然后去标记出未被使用的代码并确定模块之间的依赖关系，最后再消除未使用过的代码。

### 七、ESM 和 CJS 的区别（模块化方案有哪些）

1. **用法不同：**

- ES module 是原生支持的 Javascript 模块系统，使用 import/export 关键字实现模块的导入和导出。
- 而 CommonJs 是 Node 最早引入的模块化方案，采用 require 和 module.exports 实现模块的导入和导出

1. **加载方式不同：**

- 编译时加载: ES6 模块不是对象，而是通过 export 命令显式指定输出的代码，import时采用静态命令的形式。即在import时可以指定加载某个输出值，而不是加载整个模块，这种加载称为“编译时加载”。
- 运行时加载: CommonJS 模块就是对象；即在输入时是先加载整个模块，生成一个对象，然后再从这个对象上面读取方法，这种加载称为“运行时加载”。

1. **导入和导出特性不同：**

- ES module支持异步导入，动态导入和命名导入等特性，可以根据需要动态导入导出，模块里面的变量绑定其所在的模块。
- 而 CommonJs 只支持同步导入导出。

1. **循环依赖处理方式不同：**

- ES module 采用在编译阶段解决并处理：ES Module 通过使用一张模块间的依赖地图来解决死循环问题，标记进入过的模块为“获取中”，所以循环引用时不会再次进入
- 而 cjs 则通过在第一次被`require`时就会执行并缓存其`exports`对象。这样在循环引用中，CommonJS **就会提供一个“部分导出对象”（partial exports）**，从而打破无限循环，如下，若 a 文件中引用了 b，b 文件中引用了 a：

```
main.js  └──> a.js         └──> b.js                   └──> a.js (cached partial exports) 
```

1. **兼容性不同**

- ESmodule 需要在支持 ES6 的浏览器或者 Nodejs 的版本才能使用，
- 而CommonJS 的兼容性会更好

1. **CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用**。

- CommonJS 模块输出的是值的**拷贝**(**浅拷贝**)，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
- ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。原始值变了，import加载的值也会跟着变。**因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。**

### 八、Vitest 和 Jest 选型对比

1. vitest 对比 jest 一个显著的优势是 vitest 原生支持 TypeScript、ESM，而 jest v29 版本现在对于 ESM 的支持还是实验性，此外如果要支持 TypeScript 还需要配置 babel，通过 babel 来转译支持 TypeScript。而 vitest 这些特性都是开箱即用的
2. vitest 的 HMR（热更新）特性比 Jest 快

下面是一个详细的对比，大家在回答时可以挑几个重点的点来回答：

| 特性           | Jest | vitest |
| -------------- | ---- | ------ |
| 模块支持       | ✅    | ✅      |
| 浏览器 UI      | ❌    | ✅      |
| TS 类型测试    | ❌    | ✅      |
| benchmark      | ❌    | ✅      |
| 源码内测试     | ❌    | ✅      |
| 浏览器模式     | ❌    | ✅      |
| 多浏览器支持   | ❌    | ✅      |
| 增强的错误匹配 | ❌    | ✅      |
| 项目级配置     | ✅    | ✅      |
| 快照测试       | ✅    | ✅      |
| 交互式快照测试 | ✅    | ✅      |
| 代码覆盖率     | ✅    | ✅      |
| 并发测试       | ✅    | ✅      |
| 分片支持       | ✅    | ✅      |
| Mocking        | ✅    | ✅      |

综上，vitest 有更多的现代特性，所以如果是一个使用现代特性的新项目，那么 vitest 肯定是首选！！

### 九、组件库中的样式覆盖怎么做的呢

className 透传

```html
<Button className="bg-red-500 hover:bg-red-600" />
```

○优点：最灵活，特别适合 tailwind

○注意：需要注意 className 后应用，避免被覆盖

style 透传

```html
<Button style={{ backgroundColor: 'orange' }} />
```

○缺点：优先级高，样式不可继承，支持有限

css 变量

组件内部：

```css
.button {

  background-color: var(--button-bg, blue);

  color: var(--button-text, white);

}
```

使用者：

```css
/* 页面或容器局部覆盖 */

:root {

  --button-bg: green;

  --button-text: white;

}
```

### 十、说明一下Message组件的实现

先创建一个common函数rendervnode，

```js
// 从Vue中导入defineComponent函数，用于定义组件
import { defineComponent } from 'vue'

// 使用defineComponent方法创建一个组件
const RenderVnode = defineComponent({
  // 组件的props定义
  props: {
    // 定义一个名为vNode的prop
    vNode: {
      // 允许接收两种类型：String（字符串）或Object（VNode对象）
      type: [String, Object],
      // 设置为必需属性，使用时必须传入
      required: true
    }
  },

  // setup函数是组件的逻辑核心
  setup(props) {
    // 返回一个渲染函数
    return () => props.vNode  // 直接返回props中的vNode作为渲染内容
  }
})

// 导出该组件
export default RenderVnode
```

因为Message是函数式组件，所以创建method.ts，导出createMessage方法，方法中：设置id，每个消息实例对象设置一个唯一id标识。const container = document.createElement('div') 创建DOM容器。创建一个虚拟vnode并且挂载到dom节点上

```js
 const vnode = h(MessageConstructor, messageProps)

 render(vnode, container)

 // 加!为非空断言操作符，表示一个变量不为空或者null

 document.body.appendChild(container.firstElementChild!)
```

再声明一个instance对象实例，将组件的属性定义在对象中（包括id、vnode、props，将手动删除的方法添加到instance上，再将实例返回，app.vue就可以调用这个方法来手动删除组件），最后将该实例返回

为什么函数式调用？：

 **“用函数调用来使用组件”的模式，它是 Vue 组件使用的一种程序式调用方式（Programmatic usage）**。

它不依赖于 `<template>` 中的标签，也不会在 `.vue` 文件里声明组件引用，而是：

- 通过 `createVNode()` 创建组件实例
- 用 `render()` 手动挂载到 DOM
- 控制生命周期、传参、展示与销毁

适用于全局唯一、轻量弹出、无需响应父子通信的组件，比如：

- Message 消息提示
- Notification 通知弹窗
- Modal 弹窗确认框
- Toast 提示气泡

## 虚拟DOM和真实DOM

```

```

## h和render

```

```

## template和render的区别

```

```

## 组件通信

```
defineProps defineModel defineEmit provide/inject    
```

## nextTick