---
title: 股票买卖的最佳时机-力扣121
createTime: 2025/09/20 13:37:16
permalink: /home/09hx6a89/
---
暴力解法 双层for循环，时间复杂度O(n2)超时

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    let res = 0
    for(let i = 0; i < prices.length - 1; i++) {
        const buyIn = prices[i]
        for(let j = i + 1; j < prices.length; j++) {
            res = Math.max(res, prices[j] - buyIn)            
        }
    }
    return res < 0 ? 0 : res
};
```

从左到右枚举卖出价格 prices[i]，那么要想获得最大利润，我们需要知道第 i 天之前，股票价格的最小值是什么，也就是从 prices[0] 到 prices[i−1] 的最小值，把它作为买入价格，这可以用一个变量 minPrice 维护。

请注意，minPrice 维护的是 prices[i] 左侧元素的最小值。

由于只能买卖一次，所以在遍历中，维护 prices[i]−minPrice 的最大值，就是答案。

```js
var maxProfit = function(prices) {
    let ans = 0;
    let minPrice = prices[0];
    for (const p of prices) {
        ans = Math.max(ans, p - minPrice);
        minPrice = Math.min(minPrice, p); // 如果遇到较小的值则买入
    }
    return ans;
};
```

关于` minPrice = Math.min(minPrice, p);`的疑问：[3,6,1,3]

遇到1时更新最小买入，因为在1之前的最高卖出6-3=3已经被存储在ans中了，所以不用担心丢失。如果不更新最小买入的话，无论1后面的最高卖出有多高，肯定都不如1买入的利润多。

如果1之后有大于3的利润，自然会被` ans = Math.max(ans, p - minPrice);`更新；如果没有，则取6-3=3