---
title: llm对话模块
createTime: 2025/09/25 23:19:03
permalink: /home/z4xn3mi7/
---
# 一、大文件上传

如果将大文件一次性上传，会发生什么？想必都遇到过在一个大文件上传、转等操作时，由于要上传大量的数据，导致整个上传过程耗时漫长。而且如果这时候中断上传，后续又得重新进行上传，所有优化大文件上传，乃是业务开发中的一个重点，所以接下来我们将会探究一系列解决方案。

## 切片上传

切片上传指的是将一个大文件，按照固定的切法划分为若干个小文件。首先我们需要了解，为什么需要切片上传？在实际使用场景下，ta 有如下几个好处：

- **避免大文件上传失败**：传统上传方式假如网络中断了，整个文件上传就失败了。而切片上传只需要上传失败的那一部分
- **支持多线程加速**：多个切片可以并行上传，提高速度
- **支持断点续传**：即使用户中断了，也可以从还未上传的部分继续上传

那接下来我们就来详细讲一讲切片上传的实现。

### 怎么切

首先就是切片，这里我们使用 File 对象自带的 slice 方法进行切片：

```typescript
// 将文件切片
const createFileChunks = (file: File, chunkSize = CHUNK_SIZE) => {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + chunkSize));
    cur += chunkSize;
  }
  return chunks;
};
```

但是文件的 slice 与数组的 slice 的差异还是挺大的。使用 File.prototype.slice 进行切片后，返回的是一个 blob 类型的数据，也就是说，这里 return 的 chunks，其类型是 `Blob[]`。可能有很多同学只见过 Blob，但是对这个数据类型的具体含义却很陌生，所以这里详细讲一讲：Blob 是 Javascript 中用于表示不可变的原始二进制数据的对象，简单理解的话就是一段二进制数据的容器，里面可以存储任意内容，比如文本、图片、PDF、Word 文件等。

还可以扩展继续讲一讲，一般支持文件上传的系统，都会有一个支持文件下载的功能，那么这个功能是怎么实现的呢，没错，也是利用的 Blob。当我们点击下载按钮时，后端给我们返回的，就是一段 Blob 数据，然后我们就可以创建 Blob URL 再去创建 a 标签从而去触发浏览器快速下载 Blob。

```js
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "test.txt";
link.click();
```

### 怎么传

在切完之后，我们就需要将文件依次上传了，代码如下，就是比较简单的上传过程，需要注意的是，在上传过程中需要上传索引，以便后端进行文件的合并：

```typescript
// 上传切片
const uploadChunk = (chunk: Blob, index: number, fileName: string) => {
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("index", index.toString());
  formData.append("fileName", fileName);

  return fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`切片 ${index} 上传失败`);
    }
    return response.json();
  });
};
```

但是又有个问题噢，如果说是一个十分巨大的文件，切片之后统计到文件共有两百份，那么这时你会选择使用 `Promise.all(AllFile)` 进行上传吗，这会带来什么问题呢？

1. 首先，浏览器在 Http1.x 版本中，每个请求都需要一个独立的 TCP 连接，但是浏览器最多同时支持六个 TCP 连接，也就是说，最多同时并发六个请求。

   那么，有同学可能又有疑惑——就算我使用 Promise.all 包裹所有的文件上传请求，但是浏览器不仍然同一时间只执行六个吗，这有什么关系呢，后续请求还是会排队进行请求呀。

   是的，浏览器网络层确实会限制请求并发数，但是 JS 引擎并不会去进行限制。

   举个简单的例子就是：比如你开了一个饭店（浏览器），门口一次只能让六个顾客进来（连接数），但是你让 1000 个人同时在门口排队登记填表抢椅子（创建请求对象、绑定事件、挂到事件循环），这时候哪怕饭店还没开始营业，但前厅就已经爆了。

   也就是说，即使请求不会发出去，但这些 Promise 依然已经开始运行了，它们会去占用 JS 内存、异步调度队列以及 File/Blob 等资源，从而造成浏览器主线程或内存压力过大而崩溃。

2. 也是一个比较主要的原因，Promise.all 包裹之后，当某一个上传出错之后，会直接返回错误的结果，而不会去等其他文件上传的结果，容错太低。

SO，这时候我们该怎么做呢？—— 使用并发池，也就是并发限制，我们会限制池子的最大上传数，当一个请求上传成功后，就会从池子外再扔一个请求到池子中，动态保持最大请求数的平衡。

talk is easy，show me code，并发池作为面试手撕经常被考到的一道题，还是很有必要看看是怎么实现的：

```javascript
const promiseAllLimit = (tasks, limit) => {
  return new Promise((resolve, reject) => {
    let currentIndex = 0;
    let activeCount = 0;
    const results = [];
    let completed = 0;

    const run = () => {
      if (completed === tasks.length) {
        resolve(results);
        return;
      }

      while (activeCount < limit && currentIndex < tasks.length) {
        const task = tasks[currentIndex];
        const index = currentIndex;
        currentIndex++;
        activeCount++;

        task()
          .then(result => {
            results[index] = result;
          })
          .catch(error => {
            results[index] = error;
          })
          .finally(() => {
            activeCount--;
            completed++;
            run();
          });
      }
    };

    run();
  });
};
```

如上，我们就简单实现了一个 PromiseAllLimit 外加失败重试机制。

### 传完之后呢

传完之后当然是通知后端可以开始合并了！！

在上传完毕后通过后端可以进行合并啦！

```javascript
// 通知后端合并切片
const mergeChunks = async (fileName, totalChunks) => {
  await axios.post('/merge', {
    fileName,
    totalChunks
  });
};
```



### 如何使用SparkMD5库计算哈希值，保证文件上传的完整性？

但是，你真的确保文件完整地被传输过去了吗？如果在传输过程中 TCP 断开连接或者数据包丢失或者被人为篡改，即使后端返回一切正常，但是并不能确保文件数据被完整无误地传输了过去。那我们应该怎么做呢，还记得在 [详谈 HTTPS](https://www.yuque.com/u29297079/51-644/qscv3e511980ay91) 这篇文章我们怎么确保传输的内容不受篡改吗 —— 我们需要对每个文件切片做完整性校验，使用 md5 计算每个切片文件的哈希并传给后端，后端接受到哈希值和文件之后，也会对文件进行哈希，如果相等，则说明内容完整。同时，将整个文件的哈希值传给后端，也是为了实现秒传功能：上传服务器已有的文件时，可以做到一秒上传。

**当然，如果你使用的 md5 且切片文件巨大，那么由于 md5 是同步对内容进行哈希处理，耗时时间长，又因为 JS 为单线程，所以就会引起程序阻塞。**

那又该怎么处理呢，解决方法就是将 md5 的哈希计算放在 worker 线程中 —— 我们可以将一些耗时的同步操作放在 worker 线程中，以避免引起浏览器主线程的阻塞。同时将 worker 中的返回结果**通过 PostMessage** 传给主线程。

### 断点续传

断点续传相对来说就简单很多了，只需要在重新上传时检查有哪些已经被上传过了文件切片就行啦：

```javascript
// 检查已上传的切片
const checkUploadedChunks = async (fileName, totalChunks) => {
  const response = await axios.get(`/uploaded-chunks?fileName=${fileName}`);
  return response.data.uploadedChunks; // 返回已上传的切片索引数组
};
```

然后跳过已上传的文件切片，从未上传的切片开始上传就好了。

## 二、SSE

详情可以看我写的这篇文章：[SSE详解](https://www.yuque.com/u29297079/51-644/whne2qocay03gi97?singleDoc#)

### SSE 是什么，和 Websocket、HTTP 的区别是什么呢

SSE 是一种基于 HTTP 的技术标准，用于实现服务器向客户端的单向实时通信。

下面我们分点详细解释：

#### 什么是 SSE？

SSE 的全称是 **Server-Sent Events**（服务器发送事件）。

目的：它的主要目的是允**许服务器在任何时候主动向客户端（通常是浏览器）推送数据**。

特性：它是一种**单向通信通道**。数据流只能从服务器流向客户端。客户端无法通过这个连接向服务器发送数据（除了最初的连接请求）。

协议：它**是一个Web API，在浏览器端通过 JavaScript 的 EventSource 接口来实现**。同时，它也是一种简单的、基于文本的数据格式协议。

本质：SSE 本质上是对 HTTP 协议的一种创新使用，它没有创造一个新的协议，而是充分**利用了 HTTP 的长连接和流式传输特性。**



#### SSE 和 HTTP 的关系

SSE 与 HTTP 的关系可以概括为：SSE 构建于标准 HTTP 之上，是 HTTP 的一种特定用法。

具体体现在以下几个方面：

**a. 基于 HTTP 协议**
SSE 连接是**通过发起一个普通的 HTTP GET 请求来建立的**。客户端（浏览器）使用 EventSource API 向服务器的一个特定 URL 发送请求。这个请求看起来和任何其他网页、图片或 API 请求没有任何区别。

**b. 使用标准的 HTTP 头**
为了启动一个 SSE 连接，服务器在**响应中必须设置一个特殊的 HTTP 头**：
Content-Type: text/event-stream
这个头信息告诉客户端：“接下来的响应体不是一个一次性返回的完整文档，而是一个遵循 SSE 格式的事件流。” 一旦设置了这个头，连接就会保持打开状态。

**c. 长连接（Long-Lived Connection）**
**与传统 HTTP 的“请求-响应-断开”模式不同，SSE 要求服务器保持这个 HTTP 连接处于打开状态**。这样，服务器就可以通过这个持久的连接，连续地、多次地发送数据片段，而不是在发送一次响应后立即关闭连接。

**d. 数据格式是纯文本流**
通过这个保持打开的 HTTP 连接，服务器发送的数据遵循一个简单的文本格式。**每条消息由几个字段组成，最常见的是 data 和 event**。

示例：

服务器发送的数据可能看起来像这样：

```js
event: message
data: 这是一条普通消息

data: 这是一条多行的
data: 消息内容

event: update
data: {"userId": 123, "status": "online"}
```

客户端上的 EventSource 会解析这个流，并根据 event 字段触发相应的事件处理函数。



#### 与WebSocket的对比

为了更好地理解 SSE，通常会把它和 WebSocket 进行比较：

| 特性       | Server-Sent Events (SSE)             | WebSocket                                            |
| ---------- | ------------------------------------ | ---------------------------------------------------- |
| 通信方向   | 单向（服务器 -> 客户端）             | 双向（全双工通信）                                   |
| 协议       | 基于 HTTP                            | 独立的协议（ws:// 或 wss://）                        |
| 协议开销   | 非常轻量，使用纯文本格式             | 有独立的帧结构，比 SSE 略复杂                        |
| 自动重连   | 内置支持，客户端自动处理             | 需要手动实现                                         |
| 适用场景   | 实时通知、新闻推送、状态更新、仪表盘 | 聊天应用、在线游戏、协同编辑等需要高频双向通信的场景 |
| 浏览器支持 | 良好（除 IE 外）                     | 非常好（包括现代 IE）                                |

**总结**
关系：SSE 不是一个独立于 HTTP 的协议，而是 HTTP 协议的一种高级应用形式。它利用一个长时间保持打开的 HTTP 连接，来实现服务器到客户端的单向数据流。

核心：SSE 的核心在于 Content-Type: text/event-stream 这个 HTTP 响应头和特定的文本数据格式。

优势：它非常简单易用，尤其适用于那些只需要服务器向客户端推送数据的场景（如实时新闻feed、股票价格更新、服务器任务进度通知等），并且享受 HTTP 的所有好处，如身份验证、安全性（HTTPS）和兼容现有的基础设施。

#### SSE 如何实现服务器推送

SSE 只使用 HTTP GET 方法建立连接，之后的所有数据推送都是通过保持这个GET连接开放来实现的，不需要使用POST或其他HTTP方法。



### SSE 的原理是什么呢

先简单的一句话概括： 客户端会建立一个持久的 HTTP 连接，服务器通过该连接持续不断地向客户端发送"事件流"数据。

这个连接是长连接，但不是 Websocket，而是标准 HTTP 长连接（HTTP1.1 的 keep-alive）。

#### 通信流程

1. 首先，客户端会使用内置的 EventSource 发起一个 HTTP 请求
2. 服务端响应时设置 `Content-type: text/event-stream`，保持连接不断开
3. 服务端不断向客户端推送文本格式的数据流（流式响应 ）
4. 客户端实时处理这些数据，触发事件监听器

#### 数据格式

在 SSE 中，其标准的数据格式如下：

```
event: message
id: 12345
data: This is a message
data: that has two lines.
```

含义如下：

| 字段   | 含义                              |
| ------ | --------------------------------- |
| data:  | 消息数据（支持多行）              |
| event: | 自定义事件类型（默认是 message）  |
| id:    | 每个消息的唯一 ID（断线重连时用） |
| retry: | 指定客户端重连间隔（毫秒）        |

#### 断线重连

客户端内置了自动重连机制，如果网络断线了，客户端会自动重试：

- 如果服务端发送了 `id：` 字段，那么客户端会记录最后一个事件 id

- 重新连接时会带上 `Last-Event-ID` 请求头，服务端可以使用这个 ID 恢复推送

### **技术调研与方案对比**

#### **2.1 流式输出技术的比较**

在实现流式输出时，主要有几种技术方案可以选择，包括 **WebSocket**、**HTTP/2** 和 **SSE（Server-Sent Events）**。以下是对这三种技术的对比：

| 技术          | 优势                                                         | 劣势                                                         | 适用场景                                                 |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| **SSE**       | 1. 简单易用，基于 HTTP 协议 2. 支持文本数据流，方便处理 3. 默认在浏览器中支持，兼容性较好 4. 单向数据流适合推送型场景 | 1. 仅支持单向数据流，无法接收客户端消息 2. 对高并发支持有限，需考虑后端负载 | **适合实时推送**，如：新闻推送、AI 对话流式输出等        |
| **WebSocket** | 1. 双向通信，可以实现实时互动 2. 支持大规模并发，适用于复杂对话 | 1. 需要额外的库或协议支持（如 WebSocket 服务器） 2. 对浏览器兼容性有一定要求 | **适合双向实时交互**，如：游戏、实时协作、视频聊天       |
| **HTTP/2**    | 1. 多路复用，支持并发请求 2. 可以在一个连接上发送多个请求和响应 3. 更高效的带宽利用 | 1. 配置和实现相对复杂 2. 需要服务器和客户端都支持 HTTP/2     | **适合需要双向传输的高并发场景**，如：音视频流、聊天应用 |

------

#### **2.2 为什么选择 SSE 而非其他方案**

- **简便性与低延迟**：SSE 是基于标准的 HTTP 协议，易于实现。相对于 WebSocket，SSE 更加简洁，适合单向流式数据传输，不需要建立复杂的双向连接。
- **客户端支持**：大多数现代浏览器都原生支持 SSE，且与前端框架（如 React、Vue）集成非常方便。相比 WebSocket，需要在服务器端和客户端都进行额外的处理。
- **适用场景**：AI 对话是一个典型的单向推送场景。前端不需要与服务器交互，只需要接收服务器逐步生成的回答内容，SSE 完美契合这一需求。

### **为什么选择 SSE 而不是 WebSocket 或 HTTP/2**

- **WebSocket**：WebSocket 更适合双向通信，需要额外的复杂实现（如状态管理、消息队列等）。AI 对话是一个典型的 **单向推送场景**，不需要频繁的双向交互，因此 SSE 更符合需求。
- **HTTP/2**：虽然 HTTP/2 支持多路复用，可以实现并发请求，但相对 SSE 更为复杂，且需要支持 HTTP/2 的客户端和服务器。SSE 则更简单，易于实现且效果优秀，适用于流式数据场景。



### Websocket 和 HTTP 的主要区别是什么呢

专题：[Websocket和HTTP的区别](https://www.yuque.com/u29297079/51-644/st25g3d8sm57wz8g?singleDoc#)

## 三、打字机效果的实现有哪些方案

- 通过 sse 方案，不间断接收并渲染后端返回的流式数据，自动实现打字机效果

  它逐字节读取服务器推送的数据，解析SSE格式，并实时更新UI：

  ```js
  // src/utils/messageHandler.js - 流式响应处理的核心
  async handleStreamResponse(response, updateCallback) {
    // ReadableStreamDefaultReader 是 Streams API 的一部分
    // 它允许我们逐块读取响应体，而不是一次性加载全部内容
    const reader = response.body.getReader()
  
    // TextDecoder 将字节流（Uint8Array）转换为字符串
    // 默认使用UTF-8编码
    const decoder = new TextDecoder()
  
    // 累积变量：存储完整的消息内容
    let accumulatedContent = ''  // 主要回复内容
    let accumulatedReasoning = ''  // AI的思考过程
    let startTime = Date.now()  // 用于计算生成速度
  
    // 无限循环读取数据流
    while (true) {
      // reader.read() 返回一个Promise，解析为 {done, value}
      // done: boolean - 表示流是否结束
      // value: Uint8Array - 包含数据的字节数组
      const { done, value } = await reader.read()
      if (done) break  // 流结束，退出循环
  
      // 将字节数组解码为utf-8字符串
      const chunk = decoder.decode(value)
  
      // SSE格式的数据是按行传输的，每行都是一个完整的数据包
      // 示例数据格式：
      // data: {"choices":[{"delta":{"content":"你好"}}]}
      // data: {"choices":[{"delta":{"content":"，"}}]}
      // data: [DONE]
      const lines = chunk.split('\n').filter((line) => line.trim() !== '')
  
      // 处理每一行数据
      for (const line of lines) {
        // [DONE] 是OpenAI API的结束标记
        if (line === 'data: [DONE]') continue
  
        // SSE格式：每行数据以 "data: " 开头
        if (line.startsWith('data: ')) {
          // 提取JSON部分（去掉 "data: " 前缀）
          const jsonStr = line.slice(5)
          const data = JSON.parse(jsonStr)
  
          // 从响应中提取增量内容
          // delta 包含本次推送的新内容片段
          const content = data.choices[0].delta.content || ''
          const reasoning = data.choices[0].delta.reasoning_content || ''
  
          // 累积内容：将新片段添加到已有内容后面
          accumulatedContent += content
          accumulatedReasoning += reasoning
  
          // 计算实时生成速度（tokens/秒）无需在意！！
          const elapsedSeconds = (Date.now() - startTime) / 1000
          const tokensGenerated = data.usage?.completion_tokens || 0
          const speed = elapsedSeconds > 0 ? tokensGenerated / elapsedSeconds : 0
  
          // 调用回调函数更新UI
          // 这个回调会触发 chatStore.updateLastMessage
          updateCallback(
            accumulatedContent,  // 完整的回复内容
            accumulatedReasoning,  // 完整的推理过程
            tokensGenerated,  // 已生成的token数
            speed.toFixed(2),  // 生成速度，保留2位小数
          )
        }
      }
    }
  }
  ```

  

- 通过 setTimeout 方案，按照固定时间将数据渲染到页面上

### SSE 请求的流程可以详细讲一下吗

在客户端中，发起 SSE 请求之前还需要先发送一个 PostMessage 请求，这个请求的作用如下：

- 提交用户发送的消息 
- 服务端收到消息通过大模型生成流式回复后，通过 SSE 将回复响应式推送给客户端

发送 PostMessage 之后，就可以建立 SSE 请求并监听流式信息的返回了，其代码如下，需要注意的是，在每一次发送新的消息时，都需要手动关闭前一条信息建立的 SSE 响应，不然后续的请求会再次接收到之前信息的响应结果。

```javascript
const eventSource = new EventSourcePolyfill('/api/chat/sse', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 处理流式数据
};

eventSource.onerror = (error) => {
  // 处理错误
};
```

在上述 API 代码中，有一点也需要注意，为什么创建 SSE 请求的时候使用的是 `EventSourcePolyfill` 而不是 `EventSource` 呢？

在真实的业务场景中，用户发起对话之时是会判断用户此时的登录状态的，如果尚未登录或者 token 时效过期，那么就需要重新登录之后才能发起对话。但是客户端内置的 EventSource 是不支持带上 `request.header` 的，那我们应该怎么解决呢：

1. 使用外部库：`EventSourcePolyfill` 是一个支持 SSE 请求同时也支持带上请求头的解决方案，使用便捷，操作简单  ✅ （最佳方案）

2. 将 token 存放在 cookie 中，因为发送请求时 cookie 会自动被带到服务端。

   配置 `HttpOnly` 后，JavaScript 无法读取 Cookie，从而抵御 **XSS 攻击**

3. 将 token 放在 url 中以请求参数的形式发送给服务端，但是安全性差，容易导致 token 泄露。

   虽然感觉 token 泄露了也没什么大事，毕竟放在 LocalStorage 中 token 也会被获取到

   存在localstorage的缺点：

   - **容易被 XSS 窃取**：如果应用存在 XSS 漏洞，攻击者就能直接读取 LocalStorage 里的 Token。
   - 不支持自动携带：每次请求必须手动在 Header 中加 `Authorization`。

**接下来：**

**1.调用api，得到response响应**

```js
const response = await createChatCompletion(messages)
```

数据结构（此时还未被reader读取，还不长这样）：

```json
data: {"step":"generating_personality","content":"","finished":false}

data: {"step":"searching","content":[],"finished":false}

data: {"step":"search_result","content":[{"site_name":"百度百科","icon":"https://xxx.png","title":"人工智能介绍","url":"https://baike.baidu.com/xxx"}],"finished":true}

data: {"step":"think_content","content":"我需要根据用户的需求生成一个专业的电话销售人员画像...","finished":false}

data: {"step":"content","content":"```json\n{\n  \"name\": \"小张\",\n  \"identity\": \"xx科技集团\",\n  \"age\": 28\n}\n```","finished":true}

data: {"step":"completed","content":"","finished":true}
```

**2.处理响应**

```js
await messageHandler.handleResponse(
      response,
      settingStore.settings.stream,  // 是否开启流式响应
      // 回调函数：每次收到数据片段时都会调用
      (content, reasoning_content, tokens, speed) => {
        // 更新最后一条消息的内容
        // 这个函数会被多次调用（流式）或调用一次（非流式）
        chatStore.updateLastMessage(content, reasoning_content, tokens, speed)
      },
)
```

handelresponse根据是否开启流式响应来调用handleStreamResponse还是handleNormalResponse流式响应时，使用ReadableStream读取器逐块读取数据。ReadableStreamDefaultReader 是 Streams API 的一部分，允许我们逐块读取响应体，而不是一次性加载全部内容

```js
const reader = response.body.getReader()
```

开始无限循环读取数据流。调用reader的read方法，返回一个Promise，解析为 {done, value} 

reader.read() 方法返回一个 Promise，这个 Promise resolve 时会产生一个具有特定结构的对象：

```js
// reader.read() 返回的 Promise 解析后的对象结构
{
    done: boolean,    // 表示流是否已经读取完毕
    value: Uint8Array // 读取到的数据块（字节数组）
}
```

这里的执行流程是：

1. reader.read() 返回 Promise
2. await 等待 Promise resolve
3. Promise resolve 的值是 { done: boolean, value: Uint8Array }
4. 立即解构赋值得到 done 和 value 变量
5. 检查 done 判断是否读取完毕
6. 使用 decoder.decode(value) 将字节数组转换为字符串
7. // SSE格式的数据是按行传输的，每行都是一个完整的数据包
   const lines = chunk.split('\n').filter((line) => line.trim() !== '')
8. for of处理每一行数据
9. 如果line === 'data: [DONE]' 则结束读取
10. line.startsWith('data: ')如果以data开头，提取JSON部分（去掉 "data: " 前缀），从响应中提取增量内容。将新片段添加到已有内容后面
11. 调用回调函数更新UI，这个回调会触发 chatStore.updateLastMessage

```js
  while (true) {
    // done: boolean - 表示流是否结束
    // value: Uint8Array - 包含数据的字节数组
    const { done, value } = await reader.read()
    if (done) break  // 流结束，退出循环

    // 将字节数组解码为utf-8字符串
    const chunk = decoder.decode(value)

    // 此时chunk变为如下形式的字符串：
    // data: {"step":"searching","content":[]}\n\ndata: {"step":"search_result","content":[...]}\n\n

    // SSE格式的数据是按行传输的，每行都是一个完整的数据包
    const lines = chunk.split('\n').filter((line) => line.trim() !== '')

    // 处理每一行数据
    for (const line of lines) {
      // [DONE] 是OpenAI API的结束标记
      if (line === 'data: [DONE]') continue

      // SSE格式：每行数据以 "data: " 开头
      if (line.startsWith('data: ')) {
        // 提取JSON部分（去掉 "data: " 前缀）
        const jsonStr = line.slice(5)
        const data = JSON.parse(jsonStr)

        // 从响应中提取增量内容
        // delta 包含本次推送的新内容片段
        const content = data.choices[0].delta.content || ''
        const reasoning = data.choices[0].delta.reasoning_content || ''

        // 累积内容：将新片段添加到已有内容后面
        accumulatedContent += content
        accumulatedReasoning += reasoning

        // 调用回调函数更新UI
        // 这个回调会触发 chatStore.updateLastMessage
        updateCallback(
          accumulatedContent,  // 完整的回复内容
          accumulatedReasoning,  // 完整的推理过程
        )
      }
    }
  }
```

经过上方：const data = JSON.parse(jsonStr) 后，得到的data数据结构如下：



## 四、高性能聊天功能设计

### 为什么选择虚拟列表？

虚拟列表（Virtual Scrolling）通过**只渲染可视区域的 DOM 元素，并动态复用节点**，显著减少浏览器渲染压力。其核心思路：

1. **计算容器总高度**，保证滚动条正常。
2. **只渲染可视区域的数据**，并根据滚动位置动态更新。
3. **通过 transform 或 padding 占位**，使渲染内容位置正确。

#### **优势**

- 大幅降低 DOM 节点数量，避免长列表性能瓶颈。
- 与 UI 体验兼容，用户感觉完整列表存在。

#### **挑战**

- **动态高度**：列表项高度不固定时，需要额外处理。
- **复杂交互**：展开、收起、拖拽等操作需要额外逻辑。

#### 方案设计与实现

假如纯自研：你要能说优缺点

优点比如说，项目兼容性强，不依赖第三方库，更容易和现有框架/组件兼容，可以针对业务场景定制，比如特殊滚动逻辑、组件嵌套、动态高度等。

比较轻量化，只实现了自己需要的功能，没有额外依赖，包体积小。缺点就是功能，边界，等等

#### **技术选型**

由于项目使用 Vue3，我选择 `vue-virtual-scroller` 组件库，原因是：

- 支持动态高度。
- 社区成熟度高。
- 易于与现有组件库集成。

### 🌟核心实现思路

以 AI 对话历史记录为例，渲染逻辑如下：

```js
<template>
  <RecycleScroller
    :items="messages"
    :item-size="50"
    key-field="id"
    class="chat-list"
  >
    <template #default="{ item }">
      <div class="message-item">{{ item.content }}</div>
    </template>
  </RecycleScroller>
</template>
<script setup>
import { RecycleScroller } from 'vue-virtual-scroller';
const messages = ref([]);
</script>
```

- `RecycleScroller` 组件只渲染**当前可视区域的消息项**，其他 DOM 会被销毁。
- `item-size` 用于固定高度，若消息高度不一致，可开启 `dynamic-size` 模式并结合 `ResizeObserver`。



这次使用的组件就是DynamicScroller和DynamicScrollerItem，因为第一个组件RecycleScroller官网也说了，只能用于固定高度的情况下。这一块的话，其实最主要的就是替换了组件。删除了传入固定高度的代码。

```html
<template>
  <div>
    <!-- 
      DynamicScroller 虚拟滚动组件：
      - :items：绑定数据项数组
      - :min-item-size：最小项目高度（px），用于估算滚动条尺寸
      - class：自定义样式类
      - :emitUpdate：是否触发update事件（当可见项变化时）
      - @update：可见项变化时的回调
      - @resize：容器尺寸变化时的回调
      - @visible：项目变为可见时的回调
      - @hidden：项目被隐藏时的回调
      - @scroll：滚动时的回调
      - v-if：确保数据加载后再渲染组件，避免空数据报错
    -->
    <DynamicScroller
      :items="items"
      :min-item-size="54"
      class="scroller"
      :emitUpdate="true"
      @update="update"
      @resize="resize"
      @visible="visible"
      @hidden="hidden"
      @scroll="scroll"
      v-if="items.length"
    >
      <!-- 
        作用域插槽：为每个可见项提供渲染模板
        - item：当前数据项
        - index：项目索引
        - active：标记项目是否处于可见区域
      -->
      <template v-slot="{ item, index, active }">
        <!-- 
          DynamicScrollerItem 虚拟滚动项组件：
          - :item：当前数据项
          - :active：控制是否渲染实际内容（非可见区域项目可能被延迟渲染）
          - :size-dependencies：尺寸依赖项（当这些值变化时重新计算项目尺寸）
          - :data-index：添加data属性便于调试
        -->
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :data-index="index"
        >
          <!-- 实际渲染的列表项结构 -->
          <li class="single-item" :key="item.id">
            <div class="left-pic">
              <!-- 显示项目图片 -->
              <img :src="item.img" alt="" />
            </div>
            <div class="right-info">
              <!-- 显示项目详细信息 -->
              <span>标题：{{ item.title }}</span>
              <span>项目数量：{{ item.id }}</span>
              <span>项目时间:{{ item.time }}</span>
              <span>项目描述:{{ item.des }}</span>
            </div>
          </li>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
export default {
  name: 'test', // 组件名称
  data() {
    return {
      // 列表数据数组，初始为空
      items: []
    }
  },
  created() {
    // 组件实例创建后立即获取数据
    this.getData()
  },
  mounted() {
    // 组件挂载后执行（当前为空）
  },
  methods: {
    // 获取初始数据的方法
    getData() {
      // 使用axios发起GET请求
      this.$axios('/home/swiper').then(res => {
        console.log(res) // 打印响应结果（调试用）
        // 将获取的数据赋值给items
        this.items = res.data.data.list
      })
    },
    // 滚动事件处理函数
    scroll() {
      console.log(111) // 简单日志（实际应用中应实现具体逻辑）
    },
    // 可见项变化处理函数（用于实现无限滚动）
    update(start, end) {
      // 当滚动到底部（最后一个项目可见）时触发加载更多
      if (end === this.items.length) {
        console.log(1111) // 调试日志
        let temp = [] // 临时数组用于合并数据
        
        // 请求更多数据
        this.$axios('/home/add').then(res => {
          // 将原有数据与新数据合并
          temp = [...this.items, ...res.data.data.list]
          // 更新items数组（会触发虚拟滚动重新渲染）
          this.items = temp
        })
      }
    },
    // 容器尺寸变化处理函数
    resize() {
      console.log('resize') // 可在此处处理响应式布局调整
    },
    // 项目变为可见时的处理函数
    visible() {
      console.log('visible') // 可在此处处理懒加载等逻辑
    },
    // 项目被隐藏时的处理函数
    hidden() {
      console.log('hidden') // 可在此处清理资源等
    }
  }
}
</script>
```





#### 关键点处理

1. **保持滚动位置** 在用户加载新数据时，需要**保持当前滚动位置不跳动**，通过手动设置 `scrollTop` 实现。
2. **骨架屏优化** 在首次渲染时添加骨架屏，避免用户看到白屏。
3. **落地效果**

**优化前：**

- DOM 节点数量：约 1000+
- 首屏渲染时间：2.8s
- 滚动 FPS：< 30，明显卡顿

**优化后：**

- DOM 节点数量：约 20 个（固定）
- 首屏渲染时间：0.8s
- 滚动 FPS：> 55，流畅滚动

业务方反馈体验显著提升，导师认可该优化方案，并让我将其写入**性能优化最佳实践文档**。

**总结与延伸**

虚拟列表在**中后台长列表、聊天记录、订单记录**等场景非常适用，但也有局限：

- 实现复杂度高，尤其是动态高度和交互。
- 不适用于**需要全 DOM 操作**的功能（如 Ctrl+F 全文搜索）。

#### **延伸优化思路**

- **懒加载 + 虚拟列表**：结合后端分页接口，进一步减轻内存压力。
- **分片渲染**：适用于初始化加载时，避免一次性渲染阻塞主线程。
- **Skeleton 骨架屏**：优化加载体验。

#### **核心 takeaway**

1. 性能优化不是盲目使用某个方案，而是结合业务场景和限制做出权衡。
2. 在产品要求“不可分页”的情况下，虚拟列表是最优解。
3. 技术方案落地需要兼顾**用户体验、工程可维护性和实现成本**。

#### **虚拟列表库对比**

在前端生态中，虚拟列表的核心思想类似，但在 React 和 Vue 中有不同实现。以下是常用库的对比：

| 库名称               | 框架  | 优点                                         | 缺点                         |
| -------------------- | ----- | -------------------------------------------- | ---------------------------- |
| react-window         | React | 轻量、API 简单，性能极佳，适用于固定高度场景 | 不支持动态高度               |
| react-virtualized    | React | 功能强大，支持动态高度、表格、无限滚动等     | 体积大，学习曲线陡           |
| vue-virtual-scroller | Vue3  | 支持动态高度，API 友好，社区活跃             | 依赖第三方库，无法精简到极致 |

**选择建议：**

- 如果你使用 React，且列表高度固定，**react-window** 是首选。
- 如果你使用 React，且需要动态高度或复杂功能，**react-virtualized** 更合适。
- 如果你使用 Vue，**vue-virtual-scroller** 是目前最成熟的方案。

#### 手写虚拟列表核心逻辑（简化版）

下面是一个核心逻辑示例，演示虚拟列表的基本实现思路：

```XML
<div id="app">
  <div class="container" @scroll="onScroll" ref="container">
    <div class="spacer" :style="{ height: totalHeight + 'px' }"></div>
    <div
      class="list"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div v-for="item in visibleItems" :key="item.id" class="item">
        {{ item.text }}
      </div>
    </div>
  </div>
</div>
```



```js
const app = Vue.createApp({
  data() {
    return {
      items: Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` })),
      itemHeight: 50,
      containerHeight: 500,
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      offsetY: 0
    }
  },
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight;
    },
    visibleItems() {
      return this.items.slice(this.startIndex, this.endIndex);
    }
  },
  mounted() {
    this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + 2;
    this.endIndex = this.visibleCount;
  },
  methods: {
    onScroll() {
      const scrollTop = this.$refs.container.scrollTop;
      this.startIndex = Math.floor(scrollTop / this.itemHeight);
      this.endIndex = this.startIndex + this.visibleCount;
      this.offsetY = this.startIndex * this.itemHeight;
    }
  }
});
app.mount('#app');
```

**核心逻辑拆解**

1. **计算容器总高度**：`totalHeight = items.length * itemHeight`，用于撑起滚动条。
2. **只渲染可视区数据**：通过 `startIndex` 和 `endIndex` 截取。
3. **偏移定位**：通过 `transform: translateY(offsetY)` 实现滚动同步。

**这个例子是固定高度版本**，如果要支持动态高度，需要额外维护一个高度缓存，并根据累计高度计算偏移。



### 虚拟滚动是怎么实现的，你这是不定高的吧，能详细讲讲不定高虚拟列表的实现方案吗

#### listItem 定高

**原理：**

虚拟列表主要依赖两个核心进行计算：

- 当前滚动位置
- 列表项的高度

通过滚动的位置+每一项的高度，我们就可以推断出当前应该渲染的列表项的起始 Index，并将容器下方和容器上方顶起来，这样就形成了一个简单的虚拟列表，示意图如下：

┌────────────────────────────────────┐
│  [ 顶部占位高度 (paddingTop) ]     │
│  [ 可视区域：只渲染可见的几项 ]     │
│  [ 底部占位高度 (paddingBottom) ]  │
└────────────────────────────────────┘

#### listItem 不定高

为了防止面试官深入挖下去，所以准备一下不定高的虚拟列表的实现方案也是很有必要的。比如对于某些商品长列表，图片稍微大点或者介绍信息稍微长点就会形成这种不定高的列表项。

那么，不定高的虚拟列表的难点在哪里呢，简单来说，其难点有两个：

1. 首先外部容器的总长不确定
2. 其次无法通过 scrollTop / 元素高度获得初识索引值

对应的解决措施可以归纳为：

- 针对难点 1，可以初始假定一个足够元素长度，因为精确地计算出容器总高度的意义不是很大，之后在每次滚动时，累加计算已经滚动过的元素高度，加上剩余元素的假定高度，实时更新容器的最终高度，但是 pc 端会出现拖拽滑轮滚动比不一致情况
- 针对难点 2，根据视口高度累加展示的元素高度和，如果滑动到的高度高于已经累加过的元素高度和，则再进行累加，直到满足高度。但是需要一个 map 用来存储已经滑动过的元素高度信息，包括元素自身的高度和它之前的总高度 => 双链表+哈希



### 经典场景题之给你一万个列表，你该怎么渲染到页面上

这道题算是一道比较常见的经典题目了，其常见解决措施有如下几种：

- setTimeout
- Schduler.yield
- requestanimation

这里具体措施先按下不表，如果想要了解的话可以看看这篇文章：[优化耗时较长的任务](https://web.dev/articles/optimize-long-tasks?utm_source=devtools&hl=zh-cn)；这里细致讲一下这三种方法的关系，做到融汇贯通才是最重要的。

首先 setTimeout 和 Schduler.yield 的作用都是相同的：让程序可以跳出主线程，在下次页面渲染时再来执行，以便浏览器可以执行一些更重要的任务。

但是他两有一个细微区别：

- 当使用 setTimeout 将代码推迟到后续任务执行时，该任务会添加到任务队列的末尾。如果有其他任务正在等待，它们将在延迟执行的代码之前运行，就跟事件循环机制描述的相同。
- 在代码中插入 `scheduler.yield()`，该函数将在此时暂停执行并让出主线程。函数其余部分的执行（称为函数的接续）将安排在新的事件循环任务中运行。当该任务开始时，系统会解析所等待的 promise，然后函数会从上次停止的位置继续执行。

requestAnimation 一般会用来跟 setTimeout 做比较：

- requestAnimation 需要传入一个回调函数作为参数，该回调函数会在下一次浏览器渲染之前执行，也就是说，其跟浏览器的刷新频率是同步的
- 而 setTimeout 的执行时间则较为依赖当前主线程是否空闲，也不会和浏览器渲染同步

所以，非 UI、偏逻辑、不需要和帧同步的任务，还是使用 setTimeout 较好。因为在下一帧之前即使你切到后台，代码依旧会照常运行。但如果你使用了 raf，并在里面放置逻辑代码，在下一帧之前切到后台去之后，raf 里面的代码就不会执行了。 

### 图片懒加载是怎么做的呢

大致有三种方案：

1. 给图片加上 lazy 属性，但是这种方式属于是浏览器新特性，不一定全部的浏览器都可以支持
2. 使用 JS 判断图片是否到达可视区域，当图片出现在可视区域时，用图片的 `data-src` 属性给图片的 `src` 属性赋值
3. vue的图片懒加载插件，v-lazy属性即可

所以难点就是怎么判断图片有没有到达可视区域。

#### 怎么判断元素有没有到达可视区域

方法也是有两种的：

1. 使用 `IntersectionObserver`
2. 使用 `scrollTop` 进行高度判断：这个方法需要我们确认以下三个指标：
   - `window.innerHeight`：浏览器可视区域的高度
   - `document.body.scrollTop`：浏览器滚动了的距离，即浏览器可视区域顶部到文档顶部的距离
   - `imgs.offsetTop`：元素至文档顶部的距离

在知晓了上述三个指标的值之后，如果 `imgs.offetTop < window.innerHeight + document.body.scrollTop` 即在可视区域内。这里的指标跟无限加载利用滚动高度判断是否触底的场景的指标有些细微不同的，需要注意一下。

### 防抖节流的场景

这个比较简单。

- **防抖**：每次操作延迟n秒后执行，一定时间内多次操作只执行最后一次
- **节流**：一定时间内只执行一次操作

### 还有什么其他性能优化的方案吗

直接看这篇文章：[一些很那么常见的性能优化手段](https://www.yuque.com/u29297079/51-644/blq9gwexxgqgwni8?singleDoc#)

### 增量更新是怎么做的

增量更新是指不重新创建整个数据结构，而是在现有数据基础上进行局部修改和追加。

避免了为每个文本片段创建新的消息对象，而是将后端返回的流式数据拼接在最后一条消息中并进行渲染，其核心代码如下：

```javascript
// 增量更新消息
const updateMessageIncrementally = (messageId, newContent) => {
  setMessages(prevMessages => 
    prevMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + newContent } 
        : msg
    )
  );
};
```

## 五、Hash 路由和 History 路由的区别是什么呢

- **url结构**：Hash 是 URL 中以 # 符号开始的部分，例如 example.com/#section1。而 history 则是使用 HTML5 的 History API 来修改 URL 的路径，例如 example.com/section1。
- **对服务器的请求**：Hash 部分的变化不会触发浏览器向服务器发送请求，因为 hash 部分的变化只会触发页面内的锚点跳转。而 history 的变化可能会触发浏览器向服务器发送请求，因为它可以修改 URL 的路径
- **浏览器历史记录**：使用 history API 修改 URL 的路径时，浏览器会添加一条新的历史记录，因此用户可以通过浏览器的后退和前进按钮来导航页面。而修改 URL 的 hash 部分不会添加新的历史记录，只会修改当前的 URL
- **前端路由**：基于 hash 的 URL 可以用于实现前端路由，因为 hash 的变化可以被浏览器检测到，并触发相应的路由处理逻辑，例如单页应用中的路由切换。而基于 history API 的 URL 可以更加自然地模拟传统的 URL 结构，但需要服务器端的支持

**如何在 JavaScript 捕获错误异常** 

当涉及到捕获JavaScript中的异常时，方法相当简单。我们可以使用 try/catch 语句，就能捕获这个错误并做一些事情来降低它的影响。

当然，它同样适用于异步函数。

针对于 Promise，我们有特别的 catch 方法。

这些概念大同小异，只是实现略有不同，因此在本文的其余部分，将使用try/catch 语法来处理所有错误。



## 六、你一般在项目中怎么践行前端工程化

首先我们需要明确一下前端工程化的目的，总结一下，其目标是提升开发效率、代码质量、协作能力与可维护性。所以我们可以拆解一下整个项目的开发流程，从以下几个方面去回答：

1. **开发阶段**

   - 使用 TypeScript 提高代码质量和开发体验
   - 使用 ESLint + Prettier 统一代码风格
   - 使用 Husky + lint-staged 实现 Git 提交前检查
   - 使用 Commitizen 规范提交信息
   - 使用 Mock.js 或 JSON Server 模拟后端接口

2. **构建阶段**
   - 使用 Webpack/Vite 进行模块打包和构建优化
   - 配置代码分割、Tree Shaking 等优化手段
   - 使用环境变量区分不同环境配置
   - 配置 CI/CD 自动化部署流程

3. **部署阶段**
   - 使用 Docker 容器化部署
   - 配置 Nginx 反向代理和负载均衡
   - 使用 CDN 加速静态资源访问
   - 配置监控和日志系统

4. **团队协作**
   - 制定代码规范和开发流程
   - 使用 Git Flow 或 GitHub Flow 进行分支管理
   - 编写详细的文档和注释
   - 定期进行代码审查和技术分享

通过以上措施，可以在项目中有效践行前端工程化，提升项目的整体质量和开发效率。

## 七、可视化生成过程，JSON 回复内容转换为 markdown，并回填至自定义表单是怎么实现的？

第一阶段：AI生成的原始数据格式

当AI模型处理用户的人格生成请求时，它会在对话中返回包含JSON格式的人格数据。这些数据通常以以下格式出现：

```json
{
  "name": "小张",
  "identity": "xx科技集团销售代表", 
  "age": 28,
  "sex": 1,
  "hometown": ["beijing"],
  "characteristic": ["high_emotional_intelligence", "non_structured_output"],
  "occupation": ["sales"],
  "tone_style": ["enthusiastic", "colloquial", "humanization"],
  "personality_type": "ENTJ",
  "skill": "1.擅长销售AI外呼产品，深度了解产品优势和技术特点\n2.具备优秀的沟通技巧，能够快速建立客户信任",
  "custom_identity": ["customer"],
  "business_target": ["introduce", "wechat", "establish_relations"]
}
```

第二步，提取json字符串

```js
// GenerateProfileChat.vue - 全新的简化JSON提取方法
extractJsonSimplified(content) {

    // 初始化返回值：前缀文本、JSON对象、后缀文本
    let prev = '', jsonObj = null, post = ''

    try {
        // 方法1：使用正则表达式匹配```json代码块格式
        // 正则说明：/```json\s*([\s\S]*?)\s*```/i
        // - ```json: 匹配字面量"```json"
        // - \s*: 匹配零个或多个空白字符（空格、换行、制表符等）
        // - ([\s\S]*?): 捕获组，匹配任意字符（包括换行），*?表示非贪婪匹配
        // - \s*: 再次匹配零个或多个空白字符
        // - ```: 匹配结束标记"```"
        // - i: 忽略大小写标志
        const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/i)

        if (jsonBlockMatch) {
            console.log('找到```json格式的JSON块')

            // indexOf方法返回子字符串首次出现的位置，没找到返回-1
            const matchStart = content.indexOf(jsonBlockMatch[0])
            const matchEnd = matchStart + jsonBlockMatch[0].length

            // substring方法提取指定位置间的字符串，trim方法去除首尾空白
            prev = content.substring(0, matchStart).trim()        // 提取JSON块之前的文本
            post = content.substring(matchEnd).trim()             // 提取JSON块之后的文本

            // jsonBlockMatch[1]是正则捕获组的内容，即```json和```之间的JSON字符串
            // JSON.parse方法将JSON字符串解析为JavaScript对象
            jsonObj = JSON.parse(jsonBlockMatch[1].trim())

            console.log('成功解析```json格式，JSON键数量:', Object.keys(jsonObj).length)
            return { prev, jsonObj, post }                        // 返回三段式结果
        }

        // 方法2：如果没有找到```json标记，查找独立的JSON对象
        // 正则说明：/\{[\s\S]*\}/
        // - \{: 匹配字面量左花括号"{"（需要转义）
        // - [\s\S]*: 匹配任意字符（包括换行），*表示零个或多个
        // - \}: 匹配字面量右花括号"}"（需要转义）
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/)

        if (jsonObjectMatch) {
            console.log('找到独立的JSON对象')

            // 计算JSON对象在原文本中的位置
            const jsonStart = content.indexOf(jsonObjectMatch[0])
            const jsonEnd = jsonStart + jsonObjectMatch[0].length

            // 分割文本为三部分
            prev = content.substring(0, jsonStart).trim()         // JSON前的文本
            post = content.substring(jsonEnd).trim()              // JSON后的文本

            // 尝试解析JSON字符串
            jsonObj = JSON.parse(jsonObjectMatch[0])

            console.log('成功解析独立JSON对象，JSON键数量:', Object.keys(jsonObj).length)
            return { prev, jsonObj, post }
        }

        // 如果两种方法都没找到JSON，记录警告并返回原内容
        console.warn('未在内容中找到有效的JSON格式数据')
        return { prev: content, jsonObj: null, post: '' }

    } catch (error) {
        // 捕获任何解析过程中的错误（如JSON格式不正确）
        console.error('JSON解析失败:', error.message)
        console.log('失败的内容片段:', content.substring(0, 200) + '...')

        // 返回解析失败的结果
        return { prev: content, jsonObj: null, post: '' }
    }
}
```

第三步，转化json为md格式

JSON转换显示的处理方法：

```javascript
// GenerateProfileChat.vue 第835-841行
getProfileJsonText(jsonObj) {
    // 先处理JSON对象，进行扁平化等操作
    const obj = this.processJsonObjectForDisplay(jsonObj)

    // 将JSON对象转换为用户友好的文本格式
    const text = Object.entries(obj).map(([key, value]) => {
        return `#${key}：${Array.isArray(value) ? value.join(' | ') : value}`
    }).join('\n')

    return text
}
```



**原始JSON格式：**

```json
{
    "名称": "乌萨奇",
    "年龄": 25, 
    "性别": "女",
    "身份": "XX智能公司",
    "职业": "前台接待"
}
```

**转换后的显示格式：**

```
#名称：乌萨奇
#年龄：25
#性别：女
#身份：XX智能公司
#职业：前台接待
```



### aliasList 是什么？

`aliasList` 是**字段别名列表**，用于处理AI可能生成的各种不同表达方式的字段名。

为什么需要 aliasList？

AI在生成JSON时，可能使用不同的表达方式来描述同一个概念：

```javascript
// 同一个"姓名"概念，AI可能生成的不同键名：
{
    "姓名": "张三",     // 标准表达
    "名称": "张三",     // 简化表达  ← aliasList 处理这种情况
    "你的姓名": "张三", // 完整表达
    "name": "张三"      // 英文表达
}
```

aliasList 的匹配机制

```javascript
// glm_auto_gen_meta_mixin.js 第119-130行
{
    pid: 1,
    title: '你的姓名',           // 完整的字段标题
    aliasList: ['名称'],        // 可能的别名列表
    desc: '',
    key: 'name',               // 内部标准键名
    type: 'input',
    // ... 其他配置
}
```

匹配逻辑详解

```javascript
// GenerateProfileChat.vue 第826-828行
checkPresetKey(key) {
    // 在预设字段配置中查找匹配项
    return this.metaForm.find(item => 
        // 方式1：检查完整标题是否包含键名
        // 例如：item.title = "你的姓名", key = "姓名" → "你的姓名".includes("姓名") = true
        item.title?.includes(key) || 

        // 方式2：检查别名列表是否包含键名
        // 例如：item.aliasList = ['名称'], key = "名称"
        // reduce函数遍历别名数组，检查是否有别名包含该键名
        item.aliasList?.reduce((acc, curr) => 
            acc ||                    // 保持之前的匹配结果
            curr.includes(key),       // 检查当前别名是否包含键名
        false)                        // 初始值为false
    )
}
```

glm_auto_gen_meta_mixin.js 文件的作用

这个文件是**表单元数据配置中心**，定义了整个智能体生成表单的完整结构：

```javascript
// 文件结构分析
export const glmAutoGenMetaMixin = {
    data() {
        // 1. 选项数据定义
        const SEX_OPTIONS = [...]        // 性别选项
        const HOME_OPTIONS = [...]       // 家乡选项  
        const FEATURES_OPTIONS = [...]   // 性格特征选项
        // ... 更多选项定义

        // 2. 默认内容定义
        const DEFAULT_SKILL_CONTENT = "..."     // 默认技能描述
        const DEFAULT_REFERENCE_DEMO = "..."    // 默认参考示例

        // 3. 表单字段配置列表
        const list = [
            // 人格设定分组 (pid: 1)
            {title: '你的姓名', aliasList: ['名称'], key: 'name', ...},
            {title: '你的身份', aliasList: ['身份'], key: 'identity', ...},
            // ... 更多字段

            // 任务设定分组 (pid: 2)  
            {title: '客户身份', key: 'custom_identity', ...},
            {title: '业务目标', key: 'business_target', ...},
            // ... 更多字段

            // 其他设定分组 (pid: 3)
            {title: '你的微信号', aliasList: ['微信号'], key: 'weixin', ...},
            // ... 更多字段
        ]

        return {
            metaForm: list,    // 暴露给组件使用
            // ... 其他数据
        }
    }
}
```



**1. 数据结构标准化**

```javascript
// 每个字段配置都有统一的结构：
{
    pid: 分组ID,                    // 1=人格设定, 2=任务设定, 3=其他设定
    title: '显示标题',              // 用户看到的字段名称
    aliasList: ['别名1', '别名2'],  // AI可能使用的不同表达方式
    key: 'internal_key',           // 内部标准键名
    type: '字段类型',              // input/textarea/select/multi/radio/number
    required: 是否必填,            // true/false
    placeholder: '占位符文本',      // 输入提示
    options: [...],               // 选择类型字段的选项列表
    value: '默认值',              // 字段默认值
    isHalf: 是否占半宽,           // 布局控制
    // ... 其他配置
}
```

**2. 选项数据管理**

```javascript
// 集中管理所有下拉框、单选框、多选框的选项
const SEX_OPTIONS = [
    {name: '女', value: 1, icon: 'women-line'},     // 显示名称、内部值、图标
    {name: '男', value: 2, icon: 'men-line'},
    {name: '中性', value: 3},
]

// 职业选项
const PROFESSION_OPTIONS = [
    {name: '电话销售', value: 'sales'},            // 中文显示名 → 英文内部值
    {name: '电话回访员', value: 'caller'},
    {name: '电话销冠', value: 'pin_crown'},
    // ...
]
```

## 八、 AI如何做到固定生成特定字段？

### 通过 Prompt Engineering（提示词工程）

虽然我们看不到具体的提示词，但可以推断AI系统是这样工作的：

**1. 结构化提示词**

```
系统提示词可能类似：
"请根据用户需求生成一个电话销售人员的完整画像，必须包含以下字段：
- 名称：人员姓名
- 年龄：年龄数值  
- 性别：女/男/中性
- 身份：工作单位或身份
- 职业：具体职业
- 技能：专业技能描述
- ...

请以JSON格式返回，使用中文字段名。"
```

**2. 示例驱动（Few-shot Learning）**

```
提示词中可能包含示例：
"示例输出：
{
  "名称": "小张",
  "年龄": 28,
  "性别": "女", 
  "身份": "xx科技集团销售代表",
  "职业": "电话销售"
}

现在请为以下需求生成类似的画像：..."
```

**3. 约束条件**

```
"注意事项：
1. 必须生成所有必需字段
2. 字段名使用中文
3. 数值字段使用数字类型
4. 性别只能是：女、男、中性
5. 职业必须从预设列表中选择
..."
```

### 字段匹配的智能化处理

**1. 多重匹配策略**

```javascript
// 系统支持多种匹配方式，确保AI生成的各种表达都能被识别：

// 完整标题匹配
"你的姓名" ← 匹配AI生成的 "姓名"

// 别名匹配  
aliasList: ['名称'] ← 匹配AI生成的 "名称"

// 包含匹配
"你的身份".includes("身份") ← 匹配AI生成的 "身份"
```

**2. 容错处理**

```javascript
// 即使AI生成了预期之外的字段，系统也能处理：

// 未匹配的字段会被归类到"额外设定"
if (!this.checkPresetKey(key)) {
    extra[key] = copy[key]    // 放入__extra__对象中
}

// 在表单中动态创建新的字段组
this.groups.splice(2, 0, {
    id: 4, 
    title: '额外设定', 
    className: 'extra-other-setting'
})
```

### 数据流转的完整链路

**1. 提示词约束** → **2. AI生成JSON** → **3. 字段匹配** → **4. 数据回填**

```javascript
// 完整的处理流程：

// Step 1: AI根据提示词生成JSON
AI生成: {
    "名称": "乌萨奇",
    "年龄": 25,
    "性别": "女",
    "身份": "XX智能公司", 
    "职业": "前台接待"
}

// Step 2: 系统进行字段匹配
"名称" → 通过aliasList匹配到 {key: 'name', type: 'input'}
"年龄" → 通过aliasList匹配到 {key: 'age', type: 'number'}  
"性别" → 通过aliasList匹配到 {key: 'sex', type: 'radio'}

// Step 3: 数据类型转换和验证
"女" → 在SEX_OPTIONS中查找 → {name: '女', value: 1}

// Step 4: 填入表单对应字段
name字段.value = "乌萨奇"
age字段.value = 25
sex字段.value = 1
```

1. **aliasList** 是字段别名系统，处理AI生成的不同表达方式
2. **glm_auto_gen_meta_mixin.js** 是表单元数据配置中心，定义了完整的字段结构和选项
3. **AI固定生成特定字段** 通过精心设计的提示词工程实现，包括结构约束、示例引导和字段要求
4. **整个系统** 通过多重匹配策略和容错处理，确保AI生成的各种格式都能被正确识别和处理



## 九、怎么实现生成过程可视化的？

1. 联网搜索卡片展示

当后端在流中发来 `step: 'search_result'` 时，前端转换为 `'searching'`：

```js
if (step === 'search_result') { // 后端返回搜索结果标记
  step = 'searching' // 统一为 searching 步骤
  isSearchResult = true // 记录此次更新是搜索结果
}
// ... // 省略其它分支
if (step === 'searching') { // 联网搜索过程
  if (isSearchResult) { // 本次为具体结果
    last.content = content // 写入站点列表数组
    last.expand = true // 默认展开卡片
    this.triggerContentHeightAnimation() // 触发高度过渡动画
  }
}
```

模板中：

- 使用 `groupSites(item.content)` 将同站点结果聚合；
- 按组展示站点 logo、站点名与结果条目，条目使用 `<a :href="item.url" target="_blank">` 可点击跳转；
- 卡片默认可折叠（`process` 类型消息 `expand` 切换）。

2. 实时展示大模型“思考过程”（Reasoning/Chain-of-Thought 片段）

联网搜索卡片展示

当后端在流中发来 `step: 'search_result'` 时，前端转换为 `'searching'`：

```js
if (step === 'search_result') { // 后端返回搜索结果标记
  step = 'searching' // 统一为 searching 步骤
  isSearchResult = true // 记录此次更新是搜索结果
}
// ... // 省略其它分支
if (step === 'searching') { // 联网搜索过程
  if (isSearchResult) { // 本次为具体结果
    last.content = content // 写入站点列表数组
    last.expand = true // 默认展开卡片
    this.triggerContentHeightAnimation() // 触发高度过渡动画
  }
}
```

模板中：

- 使用 `groupSites(item.content)` 将同站点结果聚合；
- 按组展示站点 logo、站点名与结果条目，条目使用 `<a :href="item.url" target="_blank">` 可点击跳转；
- 卡片默认可折叠（`process` 类型消息 `expand` 切换）。





## （拓展）ResizeObserver实现不定高

#### 动态高度的挑战与解决方案

动态高度虚拟列表的主要挑战在于：

1. 无法预先知道每个项目的确切高度
2. 内容变化（如图片加载、文本展开）会导致高度变化
3. 需要实时更新虚拟滚动器的内部计算

我们的解决方案是使用 `ResizeObserver` API 来监听每个消息项的尺寸变化，并及时通知虚拟滚动器更新其内部状态。

#### ResizeObserver 的工作机制

`ResizeObserver` 是现代浏览器提供的一个 API，用于监听元素尺寸的变化。与传统的 `window.resize` 事件不同，`ResizeObserver` 可以监听任意 DOM 元素的尺寸变化，包括由内容变化引起的尺寸调整。

在我们的实现中，每当一个消息项被渲染到 DOM 中时，我们就会使用 `ResizeObserver` 开始观察它。当消息项的高度发生变化时（比如图片加载完成、文本内容更新等），`ResizeObserver` 会触发回调函数，我们在回调中更新高度缓存并通知虚拟滚动器重新计算布局。

```html
<template>

<!-- 虚拟滚动容器，支持动态高度的消息列表 -->

<RecycleScroller

ref="scrollerRef"

:items="messages"

:item-size="estimatedItemSize"

key-field="id"

class="chat-list"

:buffer="200"

:emit-update="true"

@update="onScrollerUpdate"

@resize="onScrollerResize"

>

<!-- 消息项模板，每个消息项都会被包装在一个可观察的容器中 -->

<template #default="{ item, index }">

<!-- 使用 ResizeObserver 监听每个消息项的高度变化 -->

<div

:ref="(el) => setItemRef(el, index)"

class="message-item"

:class="[

item.type === 'user' ? 'message-user' : 'message-ai',

{ 'message-loading': item.loading }

]"

:data-index="index"

>

<!-- 消息头部信息 -->

<div class="message-header">

<!-- 发送者头像 -->

<div class="message-avatar">

<img

:src="item.type === 'user' ? userAvatar : aiAvatar"

:alt="item.type === 'user' ? '用户' : 'AI助手'"

/>

</div>

<!-- 发送者名称和时间戳 -->

<div class="message-meta">

<span class="message-sender">{{ item.type === 'user' ? '用户' : 'AI助手' }}</span>

<span class="message-time">{{ formatTime(item.timestamp) }}</span>

</div>

</div>

<!-- 消息内容区域，支持多种类型的内容 -->

<div class="message-content">

<!-- 文本消息 -->

<div v-if="item.contentType === 'text'" class="message-text">

{{ item.content }}

</div>

<!-- 图片消息 -->

<div v-else-if="item.contentType === 'image'" class="message-image">

<img

:src="item.content"

:alt="item.alt || '图片消息'"

@load="onImageLoad(index)"

@error="onImageError(index)"

/>

</div>

<!-- 代码块消息 -->

<div v-else-if="item.contentType === 'code'" class="message-code">

<pre><code>{{ item.content }}</code></pre>

</div>

<!-- Markdown 格式消息 -->

<div v-else-if="item.contentType === 'markdown'" class="message-markdown">

<div v-html="renderMarkdown(item.content)"></div>

</div>

<!-- 加载中状态 -->

<div v-if="item.loading" class="message-loading-indicator">

<div class="loading-dots">

<span></span>

<span></span>

<span></span>

</div>

</div>

</div>

<!-- 消息操作按钮 -->

<div class="message-actions" v-if="!item.loading">

<button @click="copyMessage(item)" class="action-btn copy-btn">

复制

</button>

<button @click="deleteMessage(item.id)" class="action-btn delete-btn">

删除

</button>

</div>

</div>

</template>

</RecycleScroller>

</template>



<script setup>

// 导入 Vue 3 的响应式 API 和生命周期钩子

import { ref, reactive, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'

// 导入虚拟滚动组件

import { RecycleScroller } from 'vue-virtual-scroller'

// 导入 Markdown 渲染器（假设项目中已安装）

import { marked } from 'marked'



// 定义组件的 props

const props = defineProps({

// 消息列表数据

messages: {

type: Array,

default: () => []

},

// 用户头像 URL

userAvatar: {

type: String,

default: '/default-user-avatar.png'

},

// AI 助手头像 URL

aiAvatar: {

type: String,

default: '/default-ai-avatar.png'

},

// 预估的消息项高度，用于初始化虚拟滚动

estimatedItemSize: {

type: Number,

default: 120

}

})



// 定义组件的事件

const emit = defineEmits(['message-copy', 'message-delete', 'scroll-update'])



// 虚拟滚动器的引用

const scrollerRef = ref(null)



// 存储每个消息项的 DOM 引用，用于 ResizeObserver 监听

const itemRefs = reactive(new Map())



// 存储每个消息项的实际高度

const itemHeights = reactive(new Map())



// ResizeObserver 实例，用于监听消息项高度变化

let resizeObserver = null



// 防抖定时器，用于优化 ResizeObserver 的回调频率

let resizeDebounceTimer = null



// 设置消息项的 DOM 引用

const setItemRef = (el, index) => {

if (el) {

// 将 DOM 元素存储到 Map 中，以索引为键

itemRefs.set(index, el)

// 如果 ResizeObserver 已初始化，开始观察这个元素

if (resizeObserver) {

resizeObserver.observe(el)

}

} else {

// 如果元素被销毁，从 Map 中移除引用

if (itemRefs.has(index)) {

const oldEl = itemRefs.get(index)

if (resizeObserver && oldEl) {

resizeObserver.unobserve(oldEl)

}

itemRefs.delete(index)

}

}

}



// 初始化 ResizeObserver

const initResizeObserver = () => {

// 创建 ResizeObserver 实例

resizeObserver = new ResizeObserver((entries) => {

// 清除之前的防抖定时器

if (resizeDebounceTimer) {

clearTimeout(resizeDebounceTimer)

}

// 使用防抖机制，避免频繁触发更新

resizeDebounceTimer = setTimeout(() => {

let hasHeightChanged = false

// 遍历所有发生尺寸变化的元素

entries.forEach((entry) => {

const element = entry.target

const index = parseInt(element.dataset.index)

// 获取元素的新高度（包含边距）

const newHeight = entry.borderBoxSize

? entry.borderBoxSize[0].blockSize

: element.offsetHeight

// 获取之前存储的高度

const oldHeight = itemHeights.get(index)

// 如果高度发生变化，更新存储的高度值

if (oldHeight !== newHeight) {

itemHeights.set(index, newHeight)

hasHeightChanged = true

// 输出调试信息

console.log(`消息项 ${index} 高度变化: ${oldHeight} -> ${newHeight}`)

}

})

// 如果有高度变化，通知虚拟滚动器更新

if (hasHeightChanged && scrollerRef.value) {

// 使用 nextTick 确保 DOM 更新完成后再刷新虚拟滚动器

nextTick(() => {

scrollerRef.value.updateVisibleItems(true)

})

}

}, 16) // 16ms 的防抖延迟，约等于一帧的时间

})

// 为已存在的消息项元素添加观察

itemRefs.forEach((el) => {

if (el) {

resizeObserver.observe(el)

}

})

}



// 销毁 ResizeObserver

const destroyResizeObserver = () => {

if (resizeObserver) {

// 停止观察所有元素

resizeObserver.disconnect()

resizeObserver = null

}

// 清除防抖定时器

if (resizeDebounceTimer) {

clearTimeout(resizeDebounceTimer)

resizeDebounceTimer = null

}

}



// 虚拟滚动器更新事件处理

const onScrollerUpdate = (startIndex, endIndex) => {

// 向父组件发送滚动更新事件

emit('scroll-update', { startIndex, endIndex })

// 输出调试信息

console.log(`虚拟滚动更新: 显示消息 ${startIndex} 到 ${endIndex}`)

}



// 虚拟滚动器尺寸变化事件处理

const onScrollerResize = () => {

// 当滚动容器尺寸变化时，重新计算可见项

if (scrollerRef.value) {

nextTick(() => {

scrollerRef.value.updateVisibleItems(true)

})

}

}



// 图片加载完成事件处理

const onImageLoad = (index) => {

// 图片加载完成后，可能会改变消息项的高度

// 使用 nextTick 确保图片渲染完成后再触发高度重新计算

nextTick(() => {

const element = itemRefs.get(index)

if (element && resizeObserver) {

// 手动触发 ResizeObserver 检查

const newHeight = element.offsetHeight

const oldHeight = itemHeights.get(index)

if (oldHeight !== newHeight) {

itemHeights.set(index, newHeight)

scrollerRef.value?.updateVisibleItems(true)

}

}

})

}



// 图片加载错误事件处理

const onImageError = (index) => {

console.error(`消息项 ${index} 中的图片加载失败`)

// 图片加载失败也可能影响高度，触发重新计算

onImageLoad(index)

}



// 格式化时间戳

const formatTime = (timestamp) => {

const date = new Date(timestamp)

return date.toLocaleTimeString('zh-CN', {

hour: '2-digit',

minute: '2-digit'

})

}



// 渲染 Markdown 内容

const renderMarkdown = (content) => {

try {

return marked(content)

} catch (error) {

console.error('Markdown 渲染失败:', error)

return content

}

}



// 复制消息内容

const copyMessage = async (message) => {

try {

await navigator.clipboard.writeText(message.content)

// 向父组件发送复制事件

emit('message-copy', message)

console.log('消息已复制到剪贴板')

} catch (error) {

console.error('复制失败:', error)

}

}



// 删除消息

const deleteMessage = (messageId) => {

// 向父组件发送删除事件

emit('message-delete', messageId)

}



// 滚动到底部的方法

const scrollToBottom = () => {

if (scrollerRef.value) {

nextTick(() => {

const scroller = scrollerRef.value

// 滚动到最后一个消息

scroller.scrollToItem(props.messages.length - 1)

})

}

}



// 滚动到指定消息的方法

const scrollToMessage = (messageId) => {

const messageIndex = props.messages.findIndex(msg => msg.id === messageId)

if (messageIndex !== -1 && scrollerRef.value) {

scrollerRef.value.scrollToItem(messageIndex)

}

}



// 监听消息列表变化

watch(() => props.messages.length, (newLength, oldLength) => {

// 当有新消息添加时，自动滚动到底部

if (newLength > oldLength) {

nextTick(() => {

scrollToBottom()

})

}

})



// 组件挂载时的初始化

onMounted(() => {

// 初始化 ResizeObserver

initResizeObserver()

// 如果有消息，滚动到底部

if (props.messages.length > 0) {

nextTick(() => {

scrollToBottom()

})

}

})



// 组件卸载时的清理

onUnmounted(() => {

// 销毁 ResizeObserver

destroyResizeObserver()

// 清理所有引用

itemRefs.clear()

itemHeights.clear()

})



// 暴露给父组件的方法

defineExpose({

scrollToBottom,

scrollToMessage,

updateVisibleItems: () => {

if (scrollerRef.value) {

scrollerRef.value.updateVisibleItems(true)

}

}

})

</script>
```



组件使用了多个响应式状态来管理不同的数据：

`itemRefs` 是一个 `Map` 结构，用于存储每个消息项的 DOM 引用。这个设计的优势在于可以快速通过索引找到对应的 DOM 元素，同时在元素被销毁时能够及时清理引用，避免内存泄漏。

`itemHeights` 同样是一个 `Map` 结构，用于缓存每个消息项的实际高度。这个缓存机制可以避免重复的高度计算，提升性能。当 ResizeObserver 检测到高度变化时，会更新这个缓存。

`scrollerRef` 是对 `RecycleScroller` 组件的引用，通过它可以调用虚拟滚动器的方法，如 `updateVisibleItems`、`scrollToItem` 等。

#### Map 数据结构的优势是什么，为什么要选用 Map？

性能更好，常规读写时间复杂度均是常数级别更丰富的方法，提供了直观且便捷的 API相较于 Object，不受原型链的影响



**性能优化：**

由于 `ResizeObserver` 可能会频繁触发（特别是在动画或连续的内容变化期间），我们实现了防抖机制来优化性能。使用 16ms 的防抖延迟（约等于一帧的时间），可以将多次连续的尺寸变化合并为一次处理，减少不必要的重新计算。

防抖的实现使用了 `setTimeout` 和 `clearTimeout` 的组合。每当新的尺寸变化事件到来时，会清除之前的定时器并设置新的定时器。只有在 16ms 内没有新的变化时，才会执行实际的更新操作。



在 ResizeObserver 的回调函数中，我们不是立即处理每个尺寸变化，而是收集所有的变化，然后批量处理。这种策略可以避免频繁的 DOM 操作和重新计算，提升整体性能。

具体实现是通过一个 `hasHeightChanged` 标志来跟踪是否有任何高度变化，只有当确实有变化时才调用虚拟滚动器的更新方法。



使用 `nextTick` 来确保 DOM 更新完成后再进行虚拟滚动器的刷新。这种异步更新机制可以避免在 DOM 还未完全更新时就进行计算，确保获取到正确的元素尺寸。



可以根据实际使用场景调整性能参数：

```vue
<RecycleScroller

:buffer="200" <!-- 缓冲区大小，增加可减少滚动时的闪烁 -->

:emit-update="true" <!-- 是否发送更新事件 -->

:page-mode="false" <!-- 是否使用页面模式 -->

:prerender="10" <!-- 预渲染项目数量 -->

/>
```

**消息 ID 唯一性**：确保每条消息都有唯一的 ID，这对虚拟滚动的正确工作至关重要。