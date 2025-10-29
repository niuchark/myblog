---
title: 图片懒加载
createTime: 2025/10/29 22:07:49
permalink: /home/rrnqnz4u/
---
```js
// 定义需要预加载的图片URL数组
const images = ["./src/imss.jpg", "./src/imss.jpg", "./src/imss.jpg"];

/**
 * 图片加载器函数
 * @param {string} url - 要加载的图片URL
 * @returns {Promise} 返回一个Promise对象，在图片加载完成或失败时resolve/reject
 */
const loader = (url) => {
  return new Promise((resolve, reject) => {
    // 创建新的Image对象
    const image = new Image();
    
    // 图片加载成功时的回调
    image.onload = () => {
      console.log("@success");
      resolve(); // 图片加载成功，解析Promise
    };
    
    // 图片加载失败时的回调
    image.onerror = () => {
      console.log("@failed");
      reject(); // 图片加载失败，拒绝Promise
    };
    
    // 设置图片源地址（开始加载图片）
    image.src = url;
  });
};

/**
 * 预加载函数 - 并行加载所有图片
 * @returns {Promise} 返回一个Promise，在所有图片加载完成（无论成功或失败）后resolve
 */
const preLoad = () => {
  const preLoaderArray = []; // 存储所有图片加载Promise的数组
  
  // 遍历所有图片URL，为每个图片创建加载任务
  images.forEach((url) => {
    preLoaderArray.push(loader(url)); // 将每个图片的加载Promise加入数组
  });
  
  // 使用Promise.allSettled等待所有图片加载完成（不关心单个成功或失败，只关心全部完成）
  return Promise.allSettled(preLoaderArray);
};
```