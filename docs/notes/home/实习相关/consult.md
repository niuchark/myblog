---
title: 在线问诊
createTime: 2025/09/25 23:15:45
permalink: /home/ycz2d362/
---
## 一、Pinia 和 Vuex 的区别是什么，为什么使用Pinia呢

1. Pinia 的模板编写更少
2. Pinia 更适合 TS，可以**自动推导类型**，无需额外模板代码（在开发过程选择替代的原因）
3. Pinia 使用组合式 API，更加贴合 Vue3 的编程范式

## 二、状态管理库的原理你知道是什么吗；状态管理库解决了什么问题呢，其好处是什么

Pinia原理：

1.组件访问 Pinia 状态：
组件通过 useStore() 函数获取 store 的实例，然后可以通过 store.state.xxx 访问 state 中的数据，通过 store.getters.xxx 访问 getters 计算得到的数据，通过 store.actions.xxx() 调用 actions 中的方法。
2.状态变更：
修改 state 中的数据可以直接通过 store 的实例进行，例如 store.state.xxx = newValue，也可以在 actions 中通过修改 state 来实现状态变更。
与 Vuex 不同的是，Pinia 允许直接修改 state，这使得状态变更更加简洁直观。
3.响应式原理：
Pinia 利用 Vue 的响应式系统来实现状态的自动更新。当 state 中的数据发生变化时，依赖这个数据的组件会自动更新。
Pinia 对 state 进行了包装，使其成为响应式对象，确保状态的变化能够被 Vue 正确地追踪和更新。

通用原理：订阅发布机制

其实任何状态管理库都有两个核心：一个是 state，一个是 action。

比如在写一个最基础的计数器，用户在点击按钮的时候，会触发事件（发布事件）；然后 count 就被更新了（事件更新），所有依赖于 count 的组件也会自动感知变化并刷新（订阅者被通知）

如果业务逻辑复杂，很多组件之间需要同时处理一些公共的数据，这个时候采用传统组件通信的方法可能不利于项目的维护。这个时候可以使用 状态管理库 ，状态管理库 的思想就是将这一些公共的数据抽离出来，将它作为一个全局的变量来管理，然后其他组件就可以对这个公共数据进行读写操作，这样达到了解耦的目的

## 三、那你知道订阅模式和观察者模式的区别吗

通常我们会这么回答：

1. 在观察者模式中，观察者是知道 Subject 的，Subject 一直保持对观察者进行记录。然而，在发布订阅模式中，发布者和订阅者不知道对方的存在。它们只有通过消息代理进行通信。
2. 在发布订阅模式中，组件是松散耦合的，正好和观察者模式相反。
3. 观察者模式大多数时候是同步的，比如当事件触发，Subject就会去调用观察者的方法。而发布-订阅模式大多数时候是异步的（使用消息队列）

但是这么回答显得干巴巴的，所以一般我们还会实际举一个例子来具体展示观察者模式和发布订阅模式到底不同在哪：

比如有一家报纸社每天发送报纸，有多个用户想订阅报纸。

- 观察者模式就是用户直接在报纸社等级姓名和地址，报纸社有一份用户列表（观察者列表），那么每当报纸出版的时候，报纸社都回去主动通知所有在名单上的用户，比如送上门或者打电话通知
- 发布订阅模式就是有一个类似于邮局的中间人，报纸社将报纸发给邮局，不关心是谁订阅了；用户也去邮局登记对哪份报纸感兴趣，等报社发布新报纸，邮局负责转发给所有订阅该报纸的用户

## 四、vue3和vue2的区别

- 使用 TS 重写

- 支持 Composition API：基于函数的API，更加灵活组织组件逻辑（vue2用的是options api）

- 响应式系统提升：Vue3中响应式数据原理改成proxy，可监听动态新增删除属性，以及数组变化

- 编译优化：vue2通过标记静态根节点优化diff，Vue3 标记和提升所有静态根节点，diff的时候只需要对比动态节点内容

- 打包体积优化：移除了一些不常用的api（inline-template、filter）

- 生命周期的变化：使用setup代替了之前的beforeCreate和created

- Vue3 的 template 模板支持多个根标签

- Vuex状态管理：创建实例的方式改变,Vue2为new Store , Vue3为createStore

- Route 获取页面实例与路由信息：vue2通过this获取router实例，vue3通过使用 getCurrentInstance/ userRoute和userRouter方法获取当前组件实例

- Props 的使用变化：vue2 通过 this 获取 props 里面的内容，vue3 直接通过 props

- 父子组件传值：vue3 在向父组件传回数据时，如使用的自定义名称，如 backData，则需要在 emits 中定义一下

## 四、Vue3组合式api和选项式api区别

### ⚙️ 1. 代码组织方式

- **选项式 API**：
  按功能类型（如 `data`、`methods`、`computed`）分割代码，同一功能的逻辑可能分散在不同选项中。例如：

  ```js
  export default {
    data() { return { count: 0 } },
    methods: { increment() { this.count++ } },
    mounted() { console.log(this.count) }
  }
  ```

  **缺点**：大型组件中逻辑碎片化，维护时需跨多个选项查找代码。

- **组合式 API**：
  按业务逻辑聚合代码，同一功能的数据、方法、生命周期集中在一个函数内：

  ```js
  import { ref, onMounted } from 'vue';
  export default {
    setup() {
      const count = ref(0);
      function increment() { count.value++ }
      onMounted(() => console.log(count.value));
      return { count, increment };
    }
  }
  ```

  **优点**：逻辑高内聚，便于抽象为可复用函数（如 `useCounter()`）。

------

### 🔁 2. 逻辑复用能力

- **选项式 API**：
  依赖 **Mixins**，易引发命名冲突，且混入来源不透明

- **组合式 API**：
  通过 **自定义 Hook 函数**（如 `useUser()`）复用逻辑，参数和返回值明确，无命名冲突风险：

  ```js
  // 复用逻辑示例
  function useCounter(initial) {
    const count = ref(initial);
    const increment = () => count.value++;
    return { count, increment };
  }
  ```

------

### 📡 3. 响应式数据管理

- **选项式 API**：
  在 `data()` 中返回对象，通过 `this` 访问响应式属性（如 `this.count`）。

- **组合式 API**：
  使用 `ref`（基本类型）或 `reactive`（对象类型）显式创建响应式数据，直接通过 `.value` 操作：

  ```js
  const count = ref(0); // 访问 count.value
  const state = reactive({ name: 'Vue' }); // 直接访问 state.name
  ```

------

### 🧪 4. TypeScript 支持

- **选项式 API**：
  `this` 上下文类型推导困难，需额外类型标注。

- **组合式 API**：
  基于变量和函数，类型推断更自然，减少类型声明成本：

  ```js
  const count = ref<number>(0); // 明确类型
  ```

------

### ⚡ 5. 生命周期钩子

- **选项式 API**：
  直接使用钩子选项（如 `mounted`）。

- **组合式 API**：
  通过函数形式调用（如 `onMounted()`），需在 `setup()` 内注册：

  ```js
  import { onMounted } from 'vue';
  setup() {
    onMounted(() => console.log('Mounted!'));
  }
  ```

------

### 🆚 两种 API 对比总结

| **维度**       | **选项式 API**                 | **组合式 API**               |
| :------------- | :----------------------------- | :--------------------------- |
| **代码组织**   | 按功能类型（data/methods）分割 | 按业务逻辑聚合               |
| **逻辑复用**   | Mixins（易冲突）               | 自定义 Hook（清晰安全）      |
| **TS 支持**    | 弱（依赖 `this` 类型）         | 强（函数式类型友好）         |
| **响应式操作** | 隐式（`data()` 声明）          | 显式（`ref()`/`reactive()`） |
| **适用场景**   | 简单组件、新手友好             | 复杂逻辑、大型项目、TS 项目  |

## 五、怎么实现权限控制的？

### 本项目路由代码解析

```ts
import { createRouter, createWebHistory } from 'vue-router'

// createRouter 创建路由实例，===> new VueRouter()
// history 是路由模式，hash模式，history模式
// createWebHistory() 是开启history模块   http://xxx/user
// createWebHashHistory() 是开启hash模式    http://xxx/#/user

// vite 的配置 import.meta.env.BASE_URL 是路由的基准地址，默认是 ’/‘
// https://vitejs.dev/guide/build.html#public-base-path
// 如果将来你部署的域名路径是：http://xxx/my-path/user
// vite.config.ts  添加配置  base: my-path，路由这就会加上 my-path 前缀了

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

export default router
```

- 如何创建实例的方式？
  - `createRouter()`
- 如何设置路由模式？
  - `createWebHistory()` 或者 `createWebHashHistory()`
- `import.meta.env.BASE_URL` 值来自哪里？
  - `vite.config.ts` 的 `base` 属性的值
- `base` 作用是什么?
  - 项目的基础路径前缀，默认是 `/`

### 路由守卫是怎么封装的呢，全流程简单讲一下吧

本项目因为只有普通用户登陆，所以 设置全局前置守卫：拦截路由跳转并进行权限判断即可。设置一个白名单，名单中不需要登陆即可访问的路由，如果没有登陆并且访问页面不在白名单中，则跳转到登陆页面；并且记录要访问的页面的路由，便于登陆后回调。

**对于有不同角色的项目：**

1. 第一步，需要在路由配置中添加权限相关信息；对于特定路由，需要表明可以访问此路由的角色。配置 meta: { requiresAuth: false } // 不需要权限的页面

   meta: { 

         requiresAuth: true,  // 需要权限
         roles: ['admin']     // 需要admin角色才能访问

   }

```js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false } // 不需要权限的页面
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 不需要权限的页面
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { 
      requiresAuth: true,  // 需要权限
      roles: ['admin']     // 需要admin角色才能访问
    }
  },
  {
    path: '/user',
    name: 'User',
    component: User,
    meta: { 
      requiresAuth: true,  // 需要权限
      roles: ['admin', 'user'] // admin和user角色都可以访问
    }
  }
]
```

2. 第二步，设置全局前置守卫：拦截路由跳转并进行权限判断；to中的权限表的数据通常由后端返回，也叫做菜单表

```js
router.beforeEach((to, from, next) => {
  // 判断该路由是否需要登录权限
  if (to.meta.requiresAuth) {
    // 获取用户信息，通常从Vuex或localStorage获取
    const userInfo = store.getters.userInfo ||         JSON.parse(localStorage.getItem('userInfo'))

    // 如果用户已登录
    if (userInfo && userInfo.token) {
      // 判断用户角色是否有权限访问
      if (to.meta.roles && to.meta.roles.length > 0) {
        // 判断用户角色是否在允许的角色列表中
        if (to.meta.roles.includes(userInfo.role)) {
          next() // 有权限，允许访问
        } else {
          next('/403') // 无权限，跳转到403页面
        }
      } else {
        next() // 该页面没有设置角色限制，允许访问
      }
    } else {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 将要访问的路径作为参数，以便登录后重定向
      })
    }
  } else {
    // 不需要登录权限的页面，直接访问
    next()
  }
})
```

3. 动态路由的实现：根据用户权限动态添加路由（如果后端返回角色信息和角色对应的权限列表的情况下）（大部分都需要实现动态路由，当然具体场景具体分析）

4. **怎么去动态注册路由呢?**

   在这种情况下，后端在登录后需要返回用户的角色以及可访问的路由数据

   如果使用的 Vuex：

   首先需要封装一个专门的 Vuex 模块来管理权限和路由，这个模块包含了生成路由的方法

   接下来在路由守卫中使用router.addRoute添加根据权限生成的路由即可

```js
import router from './router'
import store from './store'
import { getToken } from '@/utils/auth'

// 静态路由，所有用户都可以访问
const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    meta: { requiresAuth: false }
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    meta: { requiresAuth: false }
  }
]

// 动态路由，根据用户角色动态添加
const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    meta: { roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '仪表盘', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    meta: { roles: ['admin', 'user'] },
    children: [
      {
        path: 'profile',
        component: () => import('@/views/profile/index'),
        meta: { title: '个人信息', roles: ['admin', 'user'] }
      }
    ]
  }
]

// 白名单，不需要重定向到登录页的路由
const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, from, next) => {
  // 获取token
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 已登录，重定向到首页
      next({ path: '/' })
    } else {
      // 确定用户是否已获取角色信息
      const hasRoles = store.getters.roles && store.getters.roles.length > 0

      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          const { roles } = await store.dispatch('user/getInfo')

          // 根据角色生成可访问的路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // 确保addRoutes完成
          next({ ...to, replace: true })
        } catch (error) {
          // 移除token并跳转到登录页
          await store.dispatch('user/resetToken')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单中，直接进入
      next()
    } else {
      // 其他没有访问权限的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

### 简单讲一讲你是怎么控制用户与页面之间的权限关系的

两种方案：

1. 如果后端只返回角色信息

这个问题也比较简单，在路由配置中，我们在 meta 信息中会配置两个字段，分别是：

- requiresAuth: boolean；表明此路由页面是否需要权限
- roles: string[]：表明拥有此页面权限的角色有哪些

然后根据登录后用户的角色就可以控制该用户对于哪些页面才有权限了

2. 如果后端返回角色信息和角色对应的权限列表,就需要实现动态路由了，参考上面路由守卫的第三步

### 本项目怎么实现权限控制的

设置路由守卫router.beforeEach，将不需要登录的页面，设置白名单数组存储，如果没有登录（即仓库不存在用户token）且不在白名单内，去登录。

```js
// 访问权限控制
router.beforeEach((to) => {
  // 开启进度条
  NProgress.start()
  // 用户仓库
  const store = useUserStore()
  // 不需要登录的页面，白名单
  const wihteList = ['/login', 'login/callback']
  // 如果没有登录且不在白名单内，去登录
  if (!store.user?.token && !wihteList.includes(to.path)) return '/login'
  // 否则不做任何处理
})
```

### 实现路由懒加载的具体方法

**动态导入：**使用 ES 的 `import()` 语法实现代码分割（Webpack 和 Vite 均支持）：

```js
// router/index.js
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue') // 关键代码
  },
  {
    path: '/user/:id',
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserProfile.vue')
  }
]
```

## 六、CSS变量主题定制

> 实现：使用css变量定制项目主题，和修改vant主题

- 如果定义 css 变量使用 css 变量

```css
:root {
  --main: #999;
}
a {
  color: var(--main)
}
```

- 定义项目的颜色风格，覆盖vant的主题色 [官方文档](https://vant-contrib.gitee.io/vant/#/zh-CN/config-provider#ji-chu-bian-liang)

```
styles/main.scss
```

```css
:root {
  // 问诊患者：色板
  --cp-primary: #16C2A3;
  --cp-plain: #EAF8F6;
  --cp-orange: #FCA21C;
  --cp-text1: #121826;
  --cp-text2: #3C3E42;
  --cp-text3: #6F6F6F;
  --cp-tag: #848484;
  --cp-dark: #979797;
  --cp-tip: #C3C3C5;
  --cp-disable: #D9DBDE;
  --cp-line: #EDEDED;
  --cp-bg: #F6F7F9;
  --cp-price: #EB5757;
  // 覆盖vant主体色
  --van-primary-color: var(--cp-primary);
}
```

```vue
<script setup lang="ts"></script>

<template>
  <!-- 验证vant颜色被覆盖 -->
  <van-button type="primary">按钮</van-button>
  <a href="#">123</a>
</template>

<style scoped lang="scss">
// 使用 css 变量
a {
  color: var(--cp-primary);
}
</style>
```

## 七、怎么对 axios 进行二次封装的，请求拦截器和响应拦截器分别做了什么

大概从以下几方面进行作答：

- 请求拦截器

- 对 Get、Post、Put、Delete 请求进行封装

- 请求头统一配置

- 如果登录方案使用 token，还需要将 token 放在请求头下面的 authorization 中

- 响应拦截器

- 对 http 错误码进行拦截，比如说`401  403  404`等

- 简化返回信息，什么意思呢，比如后端初始返回的结构如下：

```json
{  
    data: {    
        code: 200,    
        data: {

        }  
    } 
}
```

而我们只需要`if (data.code) === 200`，就直接将`data.data`进行`resolve`

使用 `axios.create()` 创建axios实例，设置 `baseURL` 统一管理 API 地址

```js
const instance = axios.create({
  // 1. 基础地址，超时时间
  baseURL,
  timeout: 10000
})
```

添加请求拦截器，在请求头中携带用户token

```js
// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 2. 携带token
    const store = useUserStore()
    if (store.user?.token && config.headers) {
      // ts提示config.headers可能是undefined，所以需要加个判断
      config.headers.Authorization = `Bearer ${store.user.token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)
```

添加响应拦截器，处理业务失败场景，发出showToast轻提示，并返回错误的promise；处理401错误，清除本地用户信息，跳转到登陆页面，网址栏还要携带当前页面的地址（包含各个参数），便于登陆后回跳

```js
// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // 3. 处理业务失败
    if (res.data.code !== 10000) {
      // 错误提示
      showToast(res.data.message || '业务失败')
      // 返回错误的promise
      return Promise.reject(res.data)
      // 传入code 将来catch的时候可以直接拿到使用
    }
    // 4. 摘取核心响应数据
    return res.data
  },
  (err: AxiosError) => {
    // 5. 处理401错误
    if (err.response?.status === 401) {
      // 清除本地用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转到登陆页面，网址栏还要携带当前页面的地址（包含各个参数）
      router.push({
        path: '/login',
        query: { returnUrl: router.currentRoute.value.fullPath }
      })
      return Promise.reject(err)
    }
  }
)
```

## 八、为什么选择使用 Vite 构建工具，对比Webpack 的优势?（说一说Vite分包策略）

#### 构建方式

Vite使用了一种新的构建方式，称为「原生ESM」构建。它利用浏览器原生支持ES模块的能力，通过将每个模块作为一个单独的文件进行构建，而不是像webpack那样将所有模块打包成一个文件。Vite 会基于代码中的动态导入语句，自动进行分包。例如，使用以下代码时，Vite 会自动将 `lodash` 库单独打包

**手动配置** Rollup 的 `manualChunks`

对于更精细的分包需求，Vite 支持手动配置 `manualChunks`。通过 `manualChunks`，开发者可以指定哪些模块应当被打包到单独的 chunk 中。例如，可以将第三方库与业务代码分开打包

**动态导入与懒加载**

动态导入是 Vite 实现分包的核心机制之一。在需要时才加载某些模块，可以显著减少初始加载的文件大小。例如，对于一个大型的管理后台系统，可以按页面模块进行分包，每次用户访问页面时，才加载对应的模块。

webpack则是使用传统的「Bundler」构建方式，它将所有模块打包成一个或多个bundle文件，并使用代码分割和懒加载等技术来优化加载性能。

#### 分包策略应用场景

对于后台管理系统，通常有大量的模块和功能。通过分包策略，可以将每个模块的代码独立打包，在用户需要时按需加载。例如，将用户管理模块、商品管理模块分别打包成独立的 chunk

#### 构建速度

由于Vite利用了浏览器原生支持ES模块的能力，并采用了「原生ESM」构建方式，所以它在冷启动和热更新时的速度比webpack更快。

webpack在构建大型应用时可能会比较慢，因为它需要分析和处理大量的模块依赖关系，并生成相应的bundle文件。

#### 服务启动方式和更简化的配置

webpack是先打包再启动开发服务器，**vite是直接启动开发服务器，然后按需编译依赖文件。**

vite只是暴露了极少数的配置项和pluging接口，**不会像Webpack一样需要了解庞大的loader、plugin生态**，灵活适中、复杂度适中。

## 九、如何通过 socket.io 实现聊天消息的滚动加载的， websocket的重连有做么

### 发送消息滚动到最新一条

通过 `socket.on` 的 `receiveChatMsg` 接收发送成功或者医生发来的消息

```ts
 // 接收消息 在onMounted注册
  socket.on('receiveChatMsg', async (event) => {
    list.value.push(event)
    await nextTick()
    window.scrollTo(0, document.body.scrollHeight)
  })
```

用window.scrollTo(0, document.body.scrollHeight)将聊天消息加载滚动到最新一条

- document.body.scrollHeight 获取对象的滚动高度
- window.scrollTo(x,y) 方法可把内容滚动到指定的坐标。

### 下拉刷新消息

- 记录每段消息的开始时间，作为下一次请求的开始时间
- 触发刷新，发送获取聊天记录消息
- van-pull-refresh是Vant组件库提供的下拉刷新功能组件，需配合van-list实现完整的列表刷新与加载功能。‌ 其核心原理通过绑定加载状态变量和事件触发机制完成数据更新，适用于移动端列表页面的交互场景。‌‌
- 在接收聊天记录事件中
  - 关闭刷新中效果
  - 判断是否有数据？没有提示 `没有聊天记录了`
  - 如果是初始化获取的聊天，需要滚动到最底部
  - 如果是第二，三...次获取消息,不需要滚动到底部
- 如果断开连接后再次连接，需要清空聊天记录

代码：

- 实现下拉刷新效果

```html
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list" />
    </van-pull-refresh>
```

```ts
const loading = ref(false)
const onRefresh = () => {
  // 触发下拉
}
```

- 记录每段消息的开始时间，作为下一次请求的开始时间

```ts
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
```

```ts
    const arr: Message[] = []
    data.forEach((item, i) => {
      if (i === 0) time.value = item.createTime
      arr.push({
        msgType: MsgType.Notify,
        msg: { content: item.createTime },
        createTime: item.createTime,
        id: item.createTime
      })
      arr.push(...item.items)
    })
```

- 触发刷新，发送获取聊天记录消息

```ts
const onRefresh = () => {
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}
```

- 在接收聊天记录事件中
  - 关闭刷新中效果
  - 判断是否有数据？没有提示 `没有聊天记录了`
  - 如果是初始化获取的聊天，需要滚动到最底部

```ts
const initialMsg = ref(true)
```

```ts
socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    const arr: Message[] = []
    data.forEach((item, i) => {
      if (i === 0) time.value = item.createTime
      arr.push({
        msgType: MsgType.Notify,
        msg: { content: item.createTime },
        createTime: item.createTime,
        id: item.createTime
      })
      arr.push(...item.items)
    })
    list.value.unshift(...arr)
    loading.value = false
    if (!data.length) {
      return Toast('没有聊天记录了')
    }
    nextTick(() => {
      if (initialMsg.value) {
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
  })
```

### websocket重连

默认情况下，Socket.IO 客户端会在连接断开后尝试自动重连。你可以通过在客户端设置 `autoConnect` 选项来控制这一点。例如：

```javascript
const socket = io('http://localhost:3000', {
    autoConnect: true  // 默认值，可以不设置
});
```

如果断开连接后再次连接，需要清空聊天记录

```ts
  // 建立连接成功
  socket.on('connect', () => {
    list.value = []
  })
```

你可以配置重连尝试的间隔时间。Socket.IO 提供了 `reconnection`、`reconnectionAttempts` 和 `reconnectionDelay` 等选项来控制重连行为：

- `reconnection`: 设置为 `true` 以启用自动重连。
- `reconnectionAttempts`: 设置重连尝试的最大次数。
- `reconnectionDelay`: 设置重连前的延迟时间（毫秒）。
- `reconnectionDelayMax`: 设置重连延迟时间的最大值（毫秒）。

```javascript
const socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
});
```

**拓展：**

重连成功后会触发 `connect` 事件。当前代码在 `connect` 事件中也仅记录日志；在实际运行中，服务端通常会在新会话建立时重新推送必要的上下文（例如再次推送 `chatMsgList` 或持续推送 `receiveChatMsg`）。客户端保持了对消息通道的订阅，因此一旦连接恢复，消息就会继续抵达并 append 至 `list`。

- 若担心重连后历史与既读状态不一致，客户端提供了“下拉刷新”的兜底动作：用户可以手动触发 `onRefresh`，通过 `getChatMsgList` 拉取从游标向前的历史消息，确保视图与服务端最终一致。
- 若是鉴权问题导致连接失败（例如 token 过期），服务端可能会在 `error` 中反馈。

为便于理解，下面复述连接与断线事件订阅段落，并加上“重连语义”的注释：

```ts
socket.on('connect', () => { // 每次连接成功（包括初次连接与断线重连成功）都会触发
  console.log('connect') // 当前仅记录日志；如需在重连成功后主动拉历史，可在此调用 onRefresh 或 emit 特定事件
})

socket.on('error', () => { // 连接过程中或鉴权失败等异常
  console.log('error') // 当前仅记录日志；可扩展为 UI 提示或重试策略（如引导刷新 token）
})

socket.on('disconnect', () => { // 连接断开时触发（网络、中间件、服务端主动断开等）
  console.log('disconnect') // 记录断开；socket.io 会自动尝试重连，无需手写轮询；重连成功后再次触发 connect
})
```

## 九、怎么实现即时通讯的？

- 在挂载阶段建立与服务端的 socket.io 连接，并在连接参数中携带鉴权 token 与问诊订单号，以绑定会话语义。

  ```js
  // 建立链接，创建 socket.io 实例
    socket = io(baseURL, { // 使用统一的 baseURL 作为 socket.io 服务端端点
      auth: { // 使用 auth 字段携带鉴权信息
        token: `Bearer ${store.user?.token}` // 将用户 token 以 Bearer 格式传递，服务端据此校验权限与会话身份
      },
      query: {
        orderId: route.query.orderId // 传递当前问诊订单号，服务端据此将连接加入到对应房间或关联上下文
      }
    })
  ```

- 订阅多个事件通道，包括连接状态、错误、断开、历史消息列表、订单状态变更、即时消息接收等。

- 提供“发送文本消息”“发送图片消息”“下拉刷新拉取历史消息”等操作，并将消息追加到本地列表，保证渲染与滚动体验。

- 在卸载阶段主动关闭连接，避免资源泄漏。

- 在断线后依赖 socket.io 的自动重连机制恢复连接，并在重连成功后继续接收消息；必要时通过“下拉刷新”主动拉取历史消息以确保一致性。

---

### 连接建立与鉴权：携带 token 与订单号

连接建立与鉴权逻辑位于onMounted 钩子中。下面是完整片段，逐行注释说明每一行的作用：

```ts
<script setup lang="ts"> // 使用 <script setup> 简化组合式 API 写法
import { io } from 'socket.io-client' // 引入 socket.io 客户端工厂，用于创建连接实例
import { onMounted, onUnmounted, ref, nextTick, provide } from 'vue'
import { baseURL } from '@/utils/request' // 复用统一基础地址作为 socket.io 服务端端点
import { useRoute } from 'vue-router' // 路由钩子，读取当前页面参数（包含 orderId）
import { useUserStore } from '@/stores' // 用户仓库，读取 token 与用户信息

const store = useUserStore() // 读取用户信息（尤其是 token），用于连接鉴权
const route = useRoute() // 读取路由查询参数（orderId），用于绑定房间会话

let socket: Socket // 声明 socket 实例的引用，方便在不同函数中复用
onUnmounted(() => { // 组件卸载时触发
  socket.close() // 主动关闭连接，避免长连接残留导致资源泄漏或重复事件触发
})

// 消息列表储存每一个消息
const list = ref<Message[]>([]) // 响应式数组，承载聊天室的消息，用于渲染 UI
// 储存该问诊室订单详情信息
const consult = ref<ConsultOrderItem>() // 响应式对象，承载房间对应的问诊订单详情

// 提供问诊订单数据给后代组件
provide('consult', consult) // 将订单详情通过依赖注入提供给子组件，避免层层传 props

// 完成评价后修改评价组件为已完成
const completeEva = (score: number) => { // 定义评价完成的回调，更新消息中的评价态
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm) // 查找当前处于“评价表单”的消息卡片
  if (item) { // 若找到
    item.msg.evaluateDoc = { score } // 写入评分数据到消息体
    item.msgType = MsgType.CardEva // 将消息类型切换为“已评价卡片”，使 UI 表现为已完成
  }
}
provide('completeEva', completeEva) // 将评价完成能力注入给子组件（如评价卡片）

onMounted(async () => { // 组件挂载阶段：初始化数据与建立连接
  const res = await getConsultOrderDetail(route.query.orderId as string) // 先拉取订单详情，确保房间状态、医生信息可用
  consult.value = res.data // 写入响应式订单详情，供消息发送与 UI 控制使用

  🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
  // 建立链接，创建 socket.io 实例
  socket = io(baseURL, { // 使用统一的 baseURL 作为 socket.io 服务端端点
    auth: { // 使用 auth 字段携带鉴权信息
      token: `Bearer ${store.user?.token}` // 将用户 token 以 Bearer 格式传递，服务端据此校验权限与会话身份
    },
    query: { // 使用 query 字段绑定房间语义
      orderId: route.query.orderId // 传递当前问诊订单号，服务端据此将连接加入到对应房间或关联上下文
    }
  })

  socket.on('connect', () => { // 订阅连接成功事件
    // 建立连接成功
    console.log('connect') // 控制台日志：用于开发时观察连接状态；也可在此做“重连后拉取”的逻辑（当前仅记录日志）
  })

  socket.on('error', () => { // 订阅错误事件（包含连接异常、鉴权失败等）
    // 错误异常消息
    console.log('error') // 控制台日志：提示错误；如需增强可在此提示 UI 或做重试控制（当前仅记录日志）
  })

  socket.on('disconnect', () => { // 订阅断开事件（网络抖动、服务端关闭、心跳丢失等）
    // 已经断开连接
    console.log('disconnect') // 控制台日志：提示断开；socket.io 将自动尝试重连（默认行为，当前未自定义参数）
  })

  // 获取初始聊天记录
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => { // 订阅历史消息列表；服务端在首次连接或拉取时推送
    // 并将消息的创建时间createTime转化成一条消息，即Message类型，这样将二维数组转化为一维数组便于渲染
    const arr: Message[] = [] // 准备一个扁平化后的消息数组，用于一次性追加到列表
    data.forEach((item, i) => { // 遍历每一个时间分组
      if (i === 0) time.value = item.createTime // 记录最早一组的时间戳，作为下一次历史拉取的游标
      arr.push({ // 将时间分组转换成“时间提示消息”，让 UI 有时间轴提示
        msgType: MsgType.Notify, // 枚举类型，消息类型是通用提示消息
        msg: { content: item.createTime }, // 提示内容为该组的 createTime
        createTime: item.createTime, // 同步创建时间，用于排序与渲染
        id: item.createTime // 用 createTime 当作消息 id，保证唯一性
      })
      arr.push(...item.items) // 将该时间组内真实的消息条目解构追加，实现二维到一维的扁平化
    })
    // 追加到聊天消息列表
    list.value.unshift(...arr) // 将历史消息插入到列表头部，使最新消息在底部保持滚动逻辑
    loading.value = false // 结束下拉刷新状态
    if (!data.length) { // 若无更多历史
      return showToast('没有聊天记录了') // 轻提示告知用户
    }
    if (initialMsg.value) { // 若这是首次进入房间的历史加载场景
      socket.emit('updateMsgStatus', arr[arr.length - 1].id) // 上报最后一条消息为已读，服务端更新既读态
      // 第一次需要滚动到最新的消息
      nextTick(() => { // 在 DOM 更新后，再执行滚动，避免未渲染造成滚动位置错误
        window.scrollTo(0, document.body.scrollHeight) // 滚动至页面底部，露出最新消息
        initialMsg.value = false // 标记非首次，后续不再自动滚动
      })
    }
  })

  // 订单状态改变时重新获取问诊室订单详情信息来更新订单状态
  socket.on('statusChange', async () => { // 订阅订单状态变化事件（如医生接诊、结束问诊等）
    const res = await getConsultOrderDetail(route.query.orderId as string) // 重新请求订单详情，保证房间状态与操作栏及时更新
    consult.value = res.data // 更新响应式数据，驱动 UI 与交互能力（如是否允许继续发送消息）
  })

  // 接收聊天消息（包括自己发出后返回的消息）
  socket.on('receiveChatMsg', async (event) => { // 订阅即时消息事件；包括自己发送后由服务端回推的正式入库消息
    list.value.push(event) // 追加到消息列表尾部，保持时间顺序
    await nextTick() // 简单理解为DOM更新后触发，执行完nextTick()后也代表DOM更新完成了
    // 通过 nextTick 方法，我们可以确保在 DOM 更新完成后执行某些操作。
    socket.emit('updateMsgStatus', event.id) // 将刚收到的消息上报为已读，维持服务端既读态一致性
    window.scrollTo(0, document.body.scrollHeight) // 自动滚动到底部，露出最新消息，提高可读性
  })
})
```

除订阅事件外，聊天室还提供消息发送与历史拉取的动作，这些都通过 `socket.emit` 与服务端约定的事件通道完成。

```ts
const sendText = (text: string) => { // 发送文本消息的动作函数，供操作栏组件触发
  // 发送信息需要  发送人  收消息人  消息类型  消息内容
  socket.emit('sendChatMsg', { // 向服务端发送“发送消息”的事件
    from: store.user?.id, // 发送方用户 id（来自用户仓库）
    to: consult.value?.docInfo?.id, // 接收方医生 id（来自订单详情）
    msgType: MsgType.MsgText, // 消息类型设为文本
    msg: { content: text } // 文本消息体，携带字符串内容
  })
}

const sendImage = (img: Image) => { // 发送图片消息的动作函数
  socket.emit('sendChatMsg', { // 同样复用“发送消息”的事件通道
    from: store.user?.id, // 发送方用户 id
    to: consult.value?.docInfo?.id, // 接收方医生 id
    msgType: MsgType.MsgImage, // 消息类型设为图片
    msg: { picture: img } // 图片消息体，携带图片对象（包含 url、大小等）
  })
}

const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss')) // 初始化历史拉取的时间游标，默认当前时间
const loading = ref(false) // 下拉刷新加载态的响应式标记
const onRefresh = () => { // 下拉刷新时触发的动作
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId) // 请求服务端拉取历史消息：每次拉 20 条，从 time 游标向前，限定当前订单
}

// 是否是第一次获取聊天记录
const initialMsg = ref(true) // 首次加载标记，控制自动滚动与既读上报逻辑
```

这段体现了客户端与服务端的协议约定：

- `sendChatMsg` 通道用于发送消息（文本或图片），并由服务端统一回推正式入库后的消息至 `receiveChatMsg`，保证客户端最终一致。
- `getChatMsgList` 通道用于分页拉取历史消息，从时间游标向前拉取固定条数，一次性扁平化到 UI。

重连成功后会触发 `connect` 事件。当前代码在 `connect` 事件中也仅记录日志；在实际运行中，服务端通常会在新会话建立时重新推送必要的上下文（例如再次推送 `chatMsgList` 或持续推送 `receiveChatMsg`）。客户端保持了对消息通道的订阅，因此一旦连接恢复，消息就会继续抵达并 append 至 `list`。

- 若担心重连后历史与既读状态不一致，客户端提供了“下拉刷新”的兜底动作：用户可以手动触发 `onRefresh`，通过 `getChatMsgList` 拉取从游标向前的历史消息，确保视图与服务端最终一致。
- 若是鉴权问题导致连接失败（例如 token 过期），服务端可能会在 `error` 中反馈。

为便于理解，下面复述连接与断线事件订阅段落，并加上“重连语义”的注释：

```ts
socket.on('connect', () => { // 每次连接成功（包括初次连接与断线重连成功）都会触发
  console.log('connect') // 当前仅记录日志；如需在重连成功后主动拉历史，可在此调用 onRefresh 或 emit 特定事件
})

socket.on('error', () => { // 连接过程中或鉴权失败等异常
  console.log('error') // 当前仅记录日志；可扩展为 UI 提示或重试策略（如引导刷新 token）
})

socket.on('disconnect', () => { // 连接断开时触发（网络、中间件、服务端主动断开等）
  console.log('disconnect') // 记录断开；socket.io 会自动尝试重连，无需手写轮询；重连成功后再次触发 connect
})
```

### 增强重连后的状态修复（可选扩展）

当前项目已经具备稳定的即时通讯闭环与自动重连能力。如果你希望进一步增强“重连后的状态修复”，可以在不改变现有架构的前提下追加以下策略（扩展建议，不是必须）：

- 在 `connect` 回调中，自动执行一次 `getChatMsgList`（可带最新游标），确保短断线期间的消息也被补齐。
- 在 `connect` 回调中，根据本地列表的最后一条消息 id，主动上报 `updateMsgStatus`，减少既读态不一致的概率。
- 在 `error` 回调中，针对鉴权失败提供更明确的 UI 引导（例如提示“登录已过期，请重新登录”），与 HTTP 拦截器行为保持一致。
- 如对重连策略有更高要求（例如最大重连次数、重连间隔），可以在 `io(baseURL, { ... })` 中显式配置 socket.io-client 的重连选项（项目目前未使用此扩展）。

这些增强都可以无缝加入到现有事件订阅的结构中，保持最小化改动与最大化效果。

## 十、消息已读怎么实现的？

步骤：

- 接收到消息的时候，需要把消息状态设置为已读。socket.emit发送updateMsgStatus事件，携带消息id
- 默认加载的消息，需要把最后一条消息状态设置已读，之前所有消息即是已读

```ts
  socket.on('receiveChatMsg', async (event) => {
    list.value.push(event)
    await nextTick()
    socket.emit('updateMsgStatus', event.id)
    window.scrollTo(0, document.body.scrollHeight)
  })
```

```ts
    nextTick(() => {
      if (initialMsg.value) {
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
```

## 十一、你提到使用 VueUse 复用逻辑，能具体讲讲⼀个 composable 的封装例子吗？

> 利用组合API，实现关注医生业务逻辑复用

### usefollow

**简答版：**

1. 设置loading加载状态，禁用按钮，避免用户反复点击
2. 根据传入类型参数，区分关注医生和文章功能
3. 根据当前likeFlag类型，取反完成关注/取关
4. 无论成功或失败都loading为false
5. Try catch捕获错误

封装：

```
composable/index.ts
```

```ts
import { ref } from 'vue'
import { followOrUnfollow } from '@/services/consult'
import type { FollowType } from '@/types/consult'

// 封装逻辑，规范 useXxx，表示使用某功能
// 传入类型参数，区分关注医生和文章功能
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  // 返回属性和方法
  return { loading, follow }
}
```

使用：

```
DoctorCard.vue
```

```vue
<script lang="ts" setup>
import type { Doctor } from '@/types/consult'
import { useFollow } from '@/composable'

defineProps<{ item: Doctor }>()

// 关注逻辑
const { loading, follow } = useFollow()
</script>
<template>
  <div class="doctor-card">
    <van-image round :src="item.avatar" />
    <p class="name">{{ item.name }}</p>
    <p>{{ item.hospitalName }} {{ item.depName }}</p>
    <p>{{ item.positionalTitles }}</p>
    <van-button :loading="loading" @click="follow(item)" round size="small" type="primary">
      {{ item.likeFlag === 1 ? '已关注' : '+ 关注' }}
    </van-button>
  </div>
</template>
```

```
KnowledgeCard.vue
```

```ts
const { loading, follow } = useFollow('knowledge')
```

### useCancelOrder

**简答版：**

1. 设置loading加载状态，禁用按钮，避免用户反复点击
2. 携带参数发起请求来取消
3. 调用成功吐司提示，失败则调用失败吐司，附加错误信息便于定位
4. 无论成功或失败都loading为false
5. Try catch捕获错误

useCancelOrder 是一个专注于“取消问诊订单”的组合式逻辑单元，它将异步请求、加载状态、业务状态更新以及用户提示整合在一起，提供统一的可复用 API 给视图层调用。其设计体现了如下原则：

- 单一职责：仅负责“取消订单”的闭环流程，不与“删除订单”“查看处方”等耦合；
- 视图无感知请求细节：视图只拿到 cancelConsultOrder 与 loading，不需要了解接口地址、请求方法与错误结构；
- 乐观更新/就地更新：成功后直接修改传入的订单数据对象（ConsultOrderItem）的状态与显示文案，避免额外刷新；
- 轻量、可复用：可在多个页面或组件内重复调用，输出相同接口形态以保持一致。

#### 核心实现：逐行详解

```ts
// src/composables/index.ts（片段）
// 封装取消订单的逻辑
export const useCancelOrder = () => {                            // 定义组合式 Hook，返回取消订单能力
  const loading = ref(false)                                     // 声明加载状态：true 表示请求中，false 表示空闲

  const cancelConsultOrder = async (item: ConsultOrderItem) => { // 主动作：取消传入的订单项，参数为订单对象
    try {                                                        // try...catch...finally 结构保证异常与状态收敛
      loading.value = true                                       // 请求开始：置 loading 为 true，用于禁用按钮或展示 loading
      await cancelOrder(item.id)                                 // 调用服务层取消订单接口，入参为订单 ID
      item.status = OrderType.ConsultCancel                      // 成功后，直接修改订单状态字段为“已取消”
      item.statusValue = '已取消'                                 // 同步修改用于展示的状态文案
      showSuccessToast('取消成功')                                // 统一提示：调用成功吐司
    } catch (error) {                                            // 捕获异常：接口失败或网络错误等
      showFailToast('取消失败' + error)                           // 统一提示：调用失败吐司，附加错误信息便于定位
    } finally {
      loading.value = false                                      // 无论成功或失败，最后都收敛到空闲态，避免“永久 loading”
    }
  }

  return { loading, cancelConsultOrder }                         // 返回对象：供视图层解构出 loading 与 cancelConsultOrder
}
```

其中 cancelOrder 是服务层 API 方法，职责是对后端发起取消请求；其实现如下：

```ts
// src/services/consult.ts（片段）
export const cancelOrder = (id: string) =>                       // 取消订单服务函数，入参为订单 ID
  request(`/patient/order/cancel/${id}`, 'PUT')                  // 调用统一请求封装：PUT 请求到取消订单的 RESTful 路径
```

#### 应用场景与调用方式

useCancelOrder 被应用在至少两个典型场景：

1) 订单详情页：在用户查看某笔问诊订单的详情并处于“待支付”状态时，可点击按钮取消该订单。

```ts
// src/views/layout/User/ConsultDetail.vue（片段）
import { useCancelOrder } from '@/composables'                   // 引入取消订单的组合式 Hook
const { loading, cancelConsultOrder } = useCancelOrder()         // 解构出 loading 状态与取消动作

// ...（略，获取订单详情并赋值到 item）

// 下面是模板中的按钮绑定（核心调用）
<van-button
  type="default"                                                 // 设为默认样式按钮
  round                                                          // 圆角风格
  :loading="loading"                                             // 绑定 Hook 的 loading：请求中显示 loading
  @click="cancelConsultOrder(item!)"                             // 点击触发取消逻辑，传入该订单对象
>取消问诊</van-button>
```

在这个场景中，订单处于待支付状态（OrderType.ConsultPay），取消成功后会直接修改 item 的状态与文案，UI 随之更新为“已取消”，无需额外刷新页面。

2) 订单列表项组件：列表中每一项订单在不同状态下，可能需要显示“取消问诊”按钮。用户在列表中直接点击即可取消。

```ts
// src/views/layout/User/components/ConsultItem.vue（片段）
import { useCancelOrder } from '@/composables'                   // 引入 Hook
const { loading, cancelConsultOrder } = useCancelOrder()         // 解构出 loading 与取消动作

// 模板中针对不同订单状态显示不同操作区，以下是“待支付”状态的取消按钮：
<div class="foot" v-if="item.status === OrderType.ConsultPay">  // 当订单状态为待支付
  <van-button
    :loading="loading"                                           // 绑定加载态
    @click="cancelConsultOrder(item)"                            // 传入当前列表项订单对象执行取消
    class="gray"
    plain
    size="small"
    round
  >取消问诊</van-button>
  <van-button
    type="primary"
    plain
    size="small"
    round
    :to="`/user/consult/${item.id}`"                             // 跳转到支付页面（另一路径）
  >
    去支付
  </van-button>
</div>

// 同样，对于“待接诊”状态（OrderType.ConsultWait）也提供“取消问诊”按钮：
<div class="foot" v-if="item.status === OrderType.ConsultWait"> // 当订单未开始接诊
  <van-button
    :loading="loading"                                           // 绑定加载态
    @click="cancelConsultOrder(item)"                            // 当前项取消
    class="gray"
    plain
    size="small"
    round
  >取消问诊</van-button>
  <van-button
    type="primary"
    plain
    size="small"
    round
    :to="`/room?orderId=${item.id}`"                             // 或者继续沟通
  >
    继续沟通
  </van-button>
</div>
```

在列表项组件中取消成功后，item 会被就地更新为“已取消”状态，列表项的 footer 区域也会自动切换为可执行“删除订单”之类的后续操作（由其它 Hook 与组件负责）。

#### 常见注意事项与扩展建议

- 传入的 item 应为响应式对象（例如 ref 或 props 绑定），否则状态更新不会反映到 UI；
- 在“取消”按钮上绑定 loading，避免用户在请求期间重复点击；
- 对于某些业务流程（例如存在取消倒计时/不可取消状态），可以在调用前额外校验 item.status 是否允许取消；
- 如果后续要求“取消后刷新列表”而不是就地更新，可以在 useCancelOrder 返回中增加回调或事件触发（例如 emit 或传递 cb），或在外层监听状态变化统一更新；
- 如果后端返回更丰富的取消结果（例如退款金额、消息文案），可以扩展成功路径中的 UI 文案与字段同步逻辑。

小结：

- 是组合API封装逻辑复用的函数，一般叫 hook 函数，是一种逻辑复用的思想
- 对象类型多的可以传递给少的，叫：类型兼容

## 十二、如何实现卡片滚动宽度适配

使用 useXxx 函数获取设备宽度，动态设置滚动距离

@vueuse/core 介绍：[文档](https://vueuse.org/functions.html)

- 是一个基于 组合API 封装的库
- 提供了一些网站开发常用的工具函数，切得到的是响应式数据

需求：

- 在 375 宽度设备，滚动宽度为 150
- 在其他设备需要等比例设置滚动的宽度
- scrollWidth = 150 / 375 * deviceWidth 就可以适配

原生手写：

原生的话需要window.innerWidth，并且在onMounted生命周期中监听resize事件，重写获取窗口宽度；onUnmounted还要移除监听

```ts
import { onMounted, onUnmounted, ref } from 'vue'

const width = ref(0)
const setWidth = () =>  width.value = window.innerWidth
onMounted(() => {
  setWidth()
  window.addEventListener('resize', setWidth)
})
onUnmounted(()=>{
  window.removeEventListener('resize', setWidth)
})
```

```html
<van-swipe :width="(150 / 375) * width" :show-indicators="false" :loop="false">
```

```bash
pnpm add @vueuse/core
```

使用库函数：

```ts
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize() // 等同于上方的代码
```

小结：

- 如果遇见一些常见的需求可以先看看 @vueuse/core 是否提供，这样可以提高开发效率。
  - 如果：窗口尺寸，滚动距离，是否进入可视区，倒计时，...等等。

## 十三、如何实现移动端适配的？

> 实现：使用 vw 完成移动端适配

[文档](https://vant-contrib.gitee.io/vant/#/zh-CN/advanced-usage#viewport-bu-ju)

安装：

```
npm install postcss-px-to-viewport -D
# or
yarn add -D postcss-px-to-viewport
# or
pnpm add -D postcss-px-to-viewport
```

配置： `postcss.config.js`

```js
// eslint-disable-next-line no-undef
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      // 设备宽度375计算vw的值
      viewportWidth: 375,
    },
  },
};
```

第一步是在 HTML 文档中设定 viewport，使浏览器以设备宽度作为布局参考

第二步是在构建阶段用 PostCSS 插件 postcss-px-to-viewport 自动把样式里的 px 单位按设计稿宽度换算为 vw 单位。前者保障了浏览器“以设备宽度工作”的前置条件，后者保障了“同一份样式在不同宽度设备上等比例缩放”。本项目把设计稿的基准宽度设置为 375（典型 iPhone 视口宽度），因此所有 px 值会在构建后被换算为 px/375*100 的 vw 值，进而在 iPhone、安卓等不同宽度设备上按比例展示。

## 十四、项⽬的⾸屏加载性能优化从哪些⽅⾯⼊⼿，如何将 FCP 从 3.2 秒优化到 1.6 秒？

路由懒加载、图片懒加载、CDN加速、图片转 WebP格式等性能优化

## 十五、聊天记录或订单详情这些⼤数据量的⻚⾯中，你做了哪些性能优化处理？

虚拟滚动。

## 十六、遇到⽀付流程中⽤户误操作或⻚⾯回退的情况，你是如何处理避免异常的？

整体思路是：在支付页和支付抽屉上对交互进行“可控关闭”和“阻止回退”的处理；在路由层对支付回调进行“结果校验与重定向”；在支付入口前进行“必要条件拦截”；在房间和订单详情处提供“继续支付/回流提示”的兜底路径。

### 支付页对“误操作关闭”和“页面回退”的拦截

问诊支付页会在生成订单后阻止用户直接回退（避免订单半生成半关闭的中间态），并在用户试图关闭支付抽屉时弹确认对话框，防止误触
用户点击“仍要关闭”（取消按钮）时，清空本地订单 ID 状态，避免误认为有进行中的订单，然后跳转到“问诊记录”页，让用户后续可继续支付或管理订单
有订单后使用onBeforeRouteLeave钩子 if (orderId.value) return false

```ts
// 关闭支付抽屉触发的回调函数（关键：拦截“误关闭”） 
const onClose = () => {                                      // 定义支付抽屉关闭前的钩子函数
  return showConfirmDialog({                                 // 使用 Vant 的确认对话框，返回 Promise 控制关闭行为
    title: '关闭支付',                                       // 对话框标题：明确是“关闭支付”
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',  // 直白描述后果，避免误操作
    cancelButtonText: '仍要关闭',                            // 取消按钮文案：明确是“仍要关闭”
    confirmButtonText: '继续支付'                            // 确认按钮文案：强调“继续支付”的正向引导
  })
    .then(() => {                                            // 用户点击“继续支付”（确认按钮）
      // 返回false阻止关闭                                 // 返回 false 告诉 action-sheet 不要关闭
      return false                                           // 维持抽屉打开，避免半途退出
    })
    .catch(() => {                                           // 用户点击“仍要关闭”（取消按钮）
      orderId.value = ''                                     // 清空本地订单 ID 状态，避免误认为有进行中的订单
      router.push('/user/consult')                           // 跳转到“问诊记录”页，让用户后续可继续支付或管理订单
      // 返回true关闭                                        // 返回 true 同意关闭抽屉
      return true
    })
}

// 有订单后阻止用户回退（关键：拦截“页面后退”）
onBeforeRouteLeave(() => {                                   // 注册路由离开前的钩子（Vue Router）
  if (orderId.value) return false                            // 如果已有订单 ID（说明已经进入支付流程），阻止当前页面被回退
})
```

此外，支付页在“生成订单”之前还有一层必要条件拦截，避免用户未勾选协议就进入支付过程：

```ts
const submit = async () => {                                 // 支付提交入口（生成订单）
  if (!agree.value) return showToast('请勾选我已同意支付协议') // 未勾选协议直接提示，不进入订单生成
  const res = await createConsultOrder(store.consult)        // 生成订单请求（后端返回订单 ID）
  loading.value = false                                      // 结束提交按钮加载态
  store.clear()                                              // 清空临时问诊数据（避免重复提交）
  orderId.value = res.data.id                                // 保存订单 ID，作为后续流程的凭据
  show.value = true                                          // 打开支付抽屉（选择支付方式）
}
```

这三点共同保障了“支付页不被误关闭、不被随意回退、且必须满足前置条件”：

- 必须勾选协议；
- 已生成订单时禁止页面回退；
- 关闭抽屉前会弹出确认对话，默认不关闭、引导继续支付，关闭后也会落回安全的“问诊记录”页。

### 路由守卫对“支付回调的失败态”进行拦截与回流

当第三方支付回调返回到应用时，路由层会基于 query 参数对进入“问诊室”的回路进行守卫。如果支付失败（或明确标注为 `payResult=false`），路由不允许进入问诊室，而是把用户重定向回“问诊记录”页，避免“未支付却进问诊室”的异常态。

```ts
{
  path: '/room',                                             // 支付成功后进入的问诊室页面
  component: () => import('@/views/Room/index.vue'),         // 动态加载问诊室组件
  meta: { title: '问诊室' },                                 // 页面标题元信息
  beforeEnter(to) {                                          // 路由独享守卫：仅在进入 /room 前触发
    if (to.query.payResult === 'false')                      // 关键判断：如果支付结果明确为 false（失败）
      return '/user/consult'                                 // 直接重定向到“问诊记录”页，避免进入问诊室异常态
  }
}
```

## 十八、如何配置开发/生产环境的？

- 环境变量文件位于项目根目录：

- .env.development：开发环境专用。示例内容：
  VITE_APP_CALLBACK= http://consult-patients.itheima.net  VITE_APP_TITLE=优医问诊dev

- .env.production：生产环境专用。示例内容：
  VITE_APP_CALLBACK= https://cp.itheima.net  VITE_APP_TITLE=优医问诊

- Vite 会根据运行命令自动加载对应环境文件：

- 执行 pnpm dev 或 vite（开发模式）时加载 .env.development

- 执行 pnpm build 或 vite build（生产构建）时加载 .env.production

- 只有以 VITE_ 前缀命名的变量会被暴露给客户端代码使用

- **在源码中通过 import.meta.env 读取环境变量**，并参与路由或业务逻辑

构建配置 vite.config.ts 中的说明：

- base: './' 固定了基础公共路径

## 十九（拓展）、消息本地缓存怎么做的

### 把“聊天消息”抽到 Pinia Store，并开启持久化

思路要点：

- 新增一个 Pinia Store（如 src/stores/modules/room.ts），专门以“orderId”为 key 维护每个问诊室的消息列表、历史游标、已读状态等。
- 配合 pinia-plugin-persistedstate（项目已启用），自动落到 localStorage（默认）并在刷新后恢复。
- 优点：与现有架构一致、集中管理、易于规格化（去重、容量、版本化等）。

示例：新增 Store（示例文件：src/stores/modules/room.ts），每行附注释

```ts
import { defineStore } from 'pinia' // 引入 Pinia 的 defineStore 方法，用于定义状态仓库
import { ref } from 'vue' // 引入 ref 创建响应式状态
import type { Message } from '@/types/room' // 引入项目内定义的消息类型，确保类型一致

// 定义每个房间（订单）的缓存单元数据结构
type RoomCacheUnit = { // RoomCacheUnit 表示单个房间的本地缓存结构
  messages: Message[] // 存放该房间的消息列表，按时间顺序排列
  cursor: string | null // 历史拉取的时间游标（如服务端以时间分页），用于分页下拉刷新
  lastReadId: string | null // 记录最后已读的消息 id，便于重连后补上既读上报
  version: number // 结构版本号，后续如结构升级可做兼容处理
}

// 整体状态：以 orderId 为 key 组织多个房间的缓存
type RoomState = Record<string, RoomCacheUnit> // 使用字典结构，以问诊订单号（orderId）作为键

export const useRoomStore = defineStore('cp-room', () => { // 定义名为 cp-room 的 Store
  const rooms = ref<RoomState>({}) // 定义 rooms 响应式对象，承载所有房间的本地缓存

  const getRoom = (orderId: string): RoomCacheUnit => { // 工具函数：安全获取某房间的缓存单元
    if (!rooms.value[orderId]) { // 若该房间尚未初始化
      rooms.value[orderId] = { messages: [], cursor: null, lastReadId: null, version: 1 } // 初始化默认结构（version 从 1 开始）
    }
    return rooms.value[orderId] // 返回该房间的缓存单元
  }

  const upsertMessages = (orderId: string, msgs: Message[]) => { // 追加或更新最新消息（去重）
    const room = getRoom(orderId) // 获取房间缓存单元
    const existIds = new Set(room.messages.map(m => m.id)) // 收集现有消息 id 集合用于去重
    const merged = room.messages.concat( // 合并现有消息与新消息
      msgs.filter(m => !existIds.has(m.id)) // 仅保留尚不存在的新消息，避免重复
    )
    merged.sort((a, b) => a.createTime.localeCompare(b.createTime)) // 以创建时间排序，确保顺序一致
    room.messages = merged // 回写到缓存
  }

  const prependHistory = (orderId: string, history: Message[], newCursor: string | null) => { // 向前追加历史（下拉刷新）
    const room = getRoom(orderId) // 获取房间缓存单元
    const existIds = new Set(room.messages.map(m => m.id)) // 构建去重集合
    const filtered = history.filter(m => !existIds.has(m.id)) // 过滤重复
    room.messages = filtered.concat(room.messages) // 将历史消息拼到现有消息的前面，保持时间从旧到新
    room.cursor = newCursor // 更新历史游标（由服务端返回）
  }

  const markRead = (orderId: string, lastId: string) => { // 标记某房间最后已读的消息 id
    const room = getRoom(orderId) // 获取房间缓存单元
    room.lastReadId = lastId // 记录最后已读 id，重连后可用来上报既读
  }

  const trim = (orderId: string, max = 500) => { // 防爆策略：限制单房间的最大消息条数
    const room = getRoom(orderId) // 获取房间缓存单元
    if (room.messages.length > max) { // 若超过上限
      room.messages = room.messages.slice(-max) // 保留最新的 max 条，丢弃过旧数据
    }
  }

  const clearOrder = (orderId: string) => { // 清空某个房间的本地缓存（如订单结束）
    delete rooms.value[orderId] // 从 rooms 中删除对应条目
  }

  return { rooms, getRoom, upsertMessages, prependHistory, markRead, trim, clearOrder } // 暴露状态与动作
}, {
  persist: { // 开启持久化（pinia-plugin-persistedstate 已在全局注册）
    key: 'cp-room', // 指定本地存储的 key，区分于其他模块
    paths: ['rooms'] // 仅持久化 rooms 字段，避免持久化不必要的临时数据
  }
})
```

将 Store 接入聊天室页面：用 Store 的数据代替或同步 list，并在各个 socket 事件中写入缓存，示例改造片段

```ts
import { useRoomStore } from '@/stores/modules/room' // 引入我们刚创建的房间消息 Store（路径按你的存放位置调整）
const roomStore = useRoomStore() // 实例化 Store，用于读写房间缓存
const orderId = route.query.orderId as string // 提前取出当前问诊订单号，复用多处逻辑
// 将本地 list 与 store 同步（两种方式：A 直接用 store 数据驱动渲染；B 双向同步）
const list = ref<Message[]>(roomStore.getRoom(orderId).messages) // 初始化 list 为 store 中的缓存，保证刷新后立即有数据
// 可选：通过 watcher 把 store 改动同步回 list（或直接用 computed 映射 store）
watch(() => roomStore.rooms[orderId]?.messages, (val) => { // 监听 store 中该房间的消息数组变化
  if (val) list.value = val // 同步到本地 list 以驱动渲染
}, { deep: true, immediate: true }) // 深度监听并立即触发一次，确保初次挂载即同步

// 订阅历史列表时，写入持久化缓存
socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => { // 历史数据的服务端推送
  const arr: Message[] = [] // 扁平化的消息数组（含 Notify 时间提示与 items）
  data.forEach((item, i) => { // 遍历每个时间分组
    if (i === 0) time.value = item.createTime // 更新本地时间游标（原逻辑保留）
    arr.push({ msgType: MsgType.Notify, msg: { content: item.createTime }, createTime: item.createTime, id: item.createTime }) // 构造时间提示消息
    arr.push(...item.items) // 追加该时间组内的真实消息
  })
  // 写入 store 的历史缓存并更新游标（假设服务端以最早一组时间作为新游标）
  roomStore.prependHistory(orderId, arr, data.length ? data[0].createTime : roomStore.getRoom(orderId).cursor) // 将历史拼到前面并更新游标
  roomStore.trim(orderId) // 做一次裁剪，避免无限增长
  loading.value = false // 结束 UI 的刷新状态
  if (!data.length) return showToast('没有聊天记录了') // 无更多历史时提示
  if (initialMsg.value) { // 首次进入房间场景
    socket.emit('updateMsgStatus', arr[arr.length - 1].id) // 上报最后一条为已读（原逻辑保留）
    roomStore.markRead(orderId, arr[arr.length - 1].id) // 将最后已读写入本地缓存，重连后可用于状态修复
    nextTick(() => { window.scrollTo(0, document.body.scrollHeight); initialMsg.value = false }) // 滚动到最新消息
  }
})

// 接收即时消息时，写入持久化缓存
socket.on('receiveChatMsg', async (event) => { // 实时消息到达（含自己发送后回推）
  roomStore.upsertMessages(orderId, [event]) // 以去重方式合并到本地缓存
  roomStore.trim(orderId) // 做一次裁剪，避免无限增长
  await nextTick() // 等待 DOM 更新结束
  socket.emit('updateMsgStatus', event.id) // 上报已读（原逻辑）
  roomStore.markRead(orderId, event.id) // 记录最后已读 id 到本地缓存
  window.scrollTo(0, document.body.scrollHeight) // 滚动到底部
})

// 可选：重连成功后做“状态修复”（拉差量历史 + 补既读）
socket.on('connect', () => { // 连接或重连成功
  const { lastReadId, cursor } = roomStore.getRoom(orderId) // 从本地缓存恢复上次游标与已读位点
  if (cursor) socket.emit('getChatMsgList', 20, cursor, orderId) // 若有游标，自动拉取一页历史，补齐断线期间遗漏
  if (lastReadId) socket.emit('updateMsgStatus', lastReadId) // 若有最后已读，立即上报以修复既读态
})

// 下拉刷新继续使用游标，从 store 中取而非组件内 time
const onRefresh = () => { // 用户触发下拉刷新
  const { cursor } = roomStore.getRoom(orderId) // 优先使用 store 中记录的游标
  socket.emit('getChatMsgList', 20, cursor ?? time.value, orderId) // 若还没记录到游标，退化使用原本的 time
}
```

注意事项：

- 去重基于消息 id（当前代码使用 createTime 作 id 的提示消息也会去重），真实消息应有唯一 id，若后端规范不同需调整。
- 容量控制 trim(orderId, max) 防止 localStorage 占用过大；可以按房间限额比如 500 条。
- 版本号 version 便于未来改变结构时迁移；可在 Store 初始化时检测旧版本并清洗。

#### 与“断线重连”的协同（两方案通用）

连接恢复后（connect 事件）从“本地缓存”读取 lastReadId、cursor：

- 若有 cursor，主动向后端拉一页历史（getChatMsgList），补齐断线期间可能遗漏的消息。
- 若有 lastReadId，立即向后端上报 updateMsgStatus，以修复既读态。

#### 去重、容量控制与版本化建议

- 去重：统一以消息 id 为基准（若后端某类“提示消息”用 createTime 作为 id，请确保唯一性；如有冲突需改造为业务唯一 id）。
- 容量：建议按“每房间最多 500 条”控制，或按本地存储空间大小评估；越大占用越多。
- 版本：缓存对象加 version 字段（示例中为 1），未来结构升级时可检测旧版本并清理或迁移，避免读取报错。

#### 隐私与安全

- 本地缓存会落到 localStorage（明文），请不要缓存敏感隐私字段（如身份证号、处方附件原始链接等），必要时只保留最小化的消息展示数据。
- 如对隐私要求更高，考虑使用 IndexedDB 并配合本地加密（成本更高），或在“退出登录/订单结束”时清理缓存。