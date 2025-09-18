---
title: 字母异位词分组
createTime: 2025/09/11 17:35:36
permalink: /home/kzqg0911/
---

## 官方结题思路的详细分析：

初始化一个空的 HashMap map。
遍历字符串数组 strs。对第一个字符串 "eat"执行:
将 "eat" 转换为字符数组 ['e', 'a', 't']
对字符数组进行排序,得到 ['a', 'e', 't']
使用排序后的字符数组创建 key "aet"
从 map 中获取 key 为 "aet" 的值,由于不存在,因此创建一个新的空列表 list = []
将 "eat" 添加到 list 中,现在 list = ["eat"]
将 key 为 "aet",value 为 ["eat"] 的键值对存入 map
对第二个字符串 "tea" 执行类似操作:
字符数组为 ['t', 'e', 'a'],排序后为 ['a', 'e', 't'],key 为 "aet"
从 map 中获取 key 为 "aet" 的值,存在,为 ["eat"]
将 "tea" 添加到列表中,现在列表为 ["eat", "tea"]
将更新后的列表存入 map,key 为 "aet"
对其余字符串 "tan", "ate", "nat", "bat" 执行类似操作,最终 map 为:
key 为 "aet",value 为 ["eat", "tea", "ate"]
key 为 "ant",value 为 ["tan", "nat"]
key 为 "abt",value 为 ["bat"]
从 map 中获取所有 value,构造结果列表,即 [ ["eat", "tea", "ate"], ["tan", "nat"], ["bat"] ]
可以看到,通过将每个字符串排序作为 key,并存储字母异位词的字符串列表作为 value,算法成功将字母异位词分组了。这样的分组过程更加高效,避免了对每个字符串都进行两两比较的低效操作。

```js
var groupAnagrams = function(strs) {
    const map = new Map();
    for (let str of strs) {
        let array = Array.from(str);
        array.sort();
        let key = array.toString();
        let list = map.get(key) ? map.get(key) : new Array();
        list.push(str);
        map.set(key, list);
    }
    return Array.from(map.values());
};
```

