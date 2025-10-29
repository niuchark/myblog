---
title: 常用的字符串和数组的操作函数
createTime: 2025/10/17 14:41:55
permalink: /home/mtoqnrex/
---
## 字符串转数组的方法

### 1. `split()` - 最常用的方法

**功能描述**：使用指定的分隔符将字符串分割成字符串数组

**语法**：

```javascript
str.split([separator[, limit]])
```

**参数**：

- `separator`：指定表示每个拆分点的字符串，如果省略，则返回包含整个字符串的数组
- `limit`：可选，限制返回的数组片段数量

**示例**：

```javascript
const str = "apple,banana,orange";
const arr = str.split(","); 
// 结果: ["apple", "banana", "orange"]

const str2 = "hello";
const arr2 = str2.split(""); 
// 结果: ["h", "e", "l", "l", "o"]

const str3 = "apple,banana,orange,grape";
const arr3 = str3.split(",", 2); 
// 结果: ["apple", "banana"]
```

### 2. `Array.from()` - 从类数组对象创建

**功能描述**：从类数组或可迭代对象创建一个新的数组实例

**语法**：

```javascript
Array.from(arrayLike[, mapFn[, thisArg]])
```

**参数**：

- `arrayLike`：要转换为数组的类数组或可迭代对象
- `mapFn`：可选，映射函数，用于对每个元素进行处理
- `thisArg`：可选，执行映射函数时的this值

**示例**：

```javascript
const str = "hello";
const arr = Array.from(str); 
// 结果: ["h", "e", "l", "l", "o"]

const str2 = "123";
const arr2 = Array.from(str2, Number); 
// 结果: [1, 2, 3]

const str3 = "hello";
const arr3 = Array.from(str3, char => char.toUpperCase()); 
// 结果: ["H", "E", "L", "L", "O"]
```

### 3. 扩展运算符 `...`

**功能描述**：将字符串展开为字符数组，适用于Unicode字符

**语法**：

```javascript
[...string]
```

**示例**：

```javascript
const str = "hello";
const arr = [...str]; 
// 结果: ["h", "e", "l", "l", "o"]

const str2 = "👍😊";
const arr2 = [...str2]; 
// 结果: ["👍", "😊"]

const str3 = "hello world";
const arr3 = [...new Set([...str3])]; 
// 结果: ["h", "e", "l", "o", " ", "w", "r", "d"] (去重)
```

### 4. `Object.assign()` - 较少使用

**功能描述**：将字符串作为数组-like对象，将其属性分配给新数组

**语法**：

```javascript
Object.assign(target, source)
```

**示例**：

```javascript
const str = "hello";
const arr = Object.assign([], str); 
// 结果: ["h", "e", "l", "l", "o"]
```

## 数组转字符串的方法

### 1. `join()` - 最常用的方法

**功能描述**：将数组的所有元素连接成一个字符串，可指定分隔符

**语法**：

```javascript
arr.join([separator])
```

**参数**：

- `separator`：可选，指定分隔符，默认为逗号

**示例**：

```javascript
const arr = ["apple", "banana", "orange"];
const str = arr.join(", "); 
// 结果: "apple, banana, orange"

const arr2 = [1, 2, 3];
const str2 = arr2.join("-"); 
// 结果: "1-2-3"

const arr3 = ["apple", "banana", "orange"];
const str3 = arr3.join(""); 
// 结果: "applebananaorange"

const arr4 = ["apple", "banana", "orange"];
const str4 = arr4.join(); 
// 结果: "apple,banana,orange" (默认逗号分隔)
```

### 2. `toString()` - 默认逗号分隔

**功能描述**：返回由数组元素组成的字符串，默认用逗号分隔

**语法**：

```javascript
arr.toString()
```

**示例**：

```javascript
const arr = ["apple", "banana", "orange"];
const str = arr.toString(); 
// 结果: "apple,banana,orange"

const arr2 = [1, 2, 3];
const str2 = arr2.toString(); 
// 结果: "1,2,3"

const arr3 = [1, [2, 3], [4, [5, 6]]];
const str3 = arr3.toString(); 
// 结果: "1,2,3,4,5,6" (会展开嵌套数组)
```

### 3. `JSON.stringify()` - 转换为JSON字符串

**功能描述**：将数组转换为JSON字符串格式

**语法**：

```javascript
JSON.stringify(value[, replacer[, space]])
```

**参数**：

- `value`：要转换为JSON字符串的值
- `replacer`：可选，转换结果的函数或数组
- `space`：可选，用于缩进的空格数或字符串

**示例**：

```javascript
const arr = ["apple", "banana", "orange"];
const str = JSON.stringify(arr); 
// 结果: '["apple","banana","orange"]'

const arr2 = [1, 2, 3];
const str2 = JSON.stringify(arr2); 
// 结果: "[1,2,3]"

const arr3 = [{name: "apple"}, {name: "banana"}];
const str3 = JSON.stringify(arr3, null, 2); 
/* 结果: 
[
  {
    "name": "apple"
  },
  {
    "name": "banana"
  }
]
*/
```

### 4. 模板字符串 + 扩展运算符

**功能描述**：使用模板字符串和扩展运算符连接数组元素

**语法**：

```javascript
`${[...array]}`
```

**示例**：

```javascript
const arr = ["apple", "banana", "orange"];
const str = `${[...arr]}`; 
// 结果: "apple,banana,orange"

const arr2 = [1, 2, 3];
const str2 = `${arr2}`; 
// 结果: "1,2,3"

const arr3 = ["apple", "banana", "orange"];
const str3 = `水果: ${arr3.join(" + ")}`; 
// 结果: "水果: apple + banana + orange"
```

## 综合应用示例

### 字符串反转（通过数组转换）

```javascript
const original = "hello";
const reversed = [...original].reverse().join(""); 
// 结果: "olleh"

const sentence = "Hello World";
const reversedWords = sentence.split(" ").map(word => [...word].reverse().join("")).join(" "); 
// 结果: "olleH dlroW"
```

### 数据清洗和格式化

```javascript
// 清理用户输入
const userInput = "  apple, banana , orange  ";
const cleanArray = userInput.split(",").map(item => item.trim()).filter(item => item !== "");
// 结果: ["apple", "banana", "orange"]

// 数字数组格式化
const numbers = [1, 2, 3, 4, 5];
const formatted = numbers.join(" - "); 
// 结果: "1 - 2 - 3 - 4 - 5"
```

### URL参数处理

```javascript
// URL参数转对象
const queryString = "name=John&age=30&city=NewYork";
const params = queryString.split("&").reduce((acc, pair) => {
  const [key, value] = pair.split("=");
  acc[key] = value;
  return acc;
}, {});
// 结果: {name: "John", age: "30", city: "NewYork"}

// 对象转URL参数
const paramsObj = {name: "John", age: 30, city: "New York"};
const query = Object.entries(paramsObj).map(([key, value]) => 
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
).join("&");
// 结果: "name=John&age=30&city=New%20York"
```

## 注意事项

1. **空字符串处理**：

   ```javascript
   "".split(",") // 返回 [""] 而不是 []
   ```

2. **特殊字符转义**：

   ```javascript
   // 正则特殊字符需要转义
   "a.b.c".split(".") // 正确
   "a.b.c".split(/\./) // 使用正则时需要转义
   ```

3. **性能考虑**：

   - 对于大数据量，`split()` 通常性能最佳
   - 扩展运算符在简单场景下性能良好

4. **Unicode字符处理**：

   ```javascript
   // 扩展运算符和Array.from()能正确处理Unicode
   "👍😊".split("") // 可能不正确
   [..."👍😊"] // 正确: ["👍", "😊"]
   Array.from("👍😊") // 正确: ["👍", "😊"]
   ```





# JavaScript 数组和字符串常用方法

## 数组常用方法

### 1. 添加/删除元素方法

#### push()

- **描述**: 向数组末尾添加一个或多个元素
- **语法**: `arr.push(element1, ..., elementN)`
- **返回值**: 数组的新长度
- **示例**:

```javascript
const arr = [1, 2, 3];
const length = arr.push(4, 5);
console.log(arr); // [1, 2, 3, 4, 5]
console.log(length); // 5
```

#### pop()

- **描述**: 删除并返回数组的最后一个元素
- **语法**: `arr.pop()`
- **返回值**: 被删除的元素
- **示例**:

```javascript
const arr = [1, 2, 3];
const last = arr.pop();
console.log(arr); // [1, 2]
console.log(last); // 3
```

#### unshift()

- **描述**: 向数组开头添加一个或多个元素
- **语法**: `arr.unshift(element1, ..., elementN)`
- **返回值**: 数组的新长度
- **示例**:

```javascript
const arr = [2, 3];
const length = arr.unshift(0, 1);
console.log(arr); // [0, 1, 2, 3]
console.log(length); // 4
```

#### shift()

- **描述**: 删除并返回数组的第一个元素
- **语法**: `arr.shift()`
- **返回值**: 被删除的元素
- **示例**:

```javascript
const arr = [1, 2, 3];
const first = arr.shift();
console.log(arr); // [2, 3]
console.log(first); // 1
```

#### splice()

- **描述**: 在指定位置添加/删除元素
- **语法**: `arr.splice(start, deleteCount, item1, ..., itemN)`
- **返回值**: 包含被删除元素的数组
- **示例**:

```javascript
const arr = [1, 2, 3, 4, 5];
const removed = arr.splice(2, 1, 'a', 'b');
console.log(arr); // [1, 2, 'a', 'b', 4, 5]
console.log(removed); // [3]
```

### 2. 查找和筛选方法

#### indexOf()

- **描述**: 返回指定元素在数组中第一次出现的索引
- **语法**: `arr.indexOf(searchElement[, fromIndex])`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const arr = [1, 2, 3, 2, 1];
console.log(arr.indexOf(2)); // 1
console.log(arr.indexOf(4)); // -1
```

#### lastIndexOf()

- **描述**: 返回指定元素在数组中最后一次出现的索引
- **语法**: `arr.lastIndexOf(searchElement[, fromIndex])`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const arr = [1, 2, 3, 2, 1];
console.log(arr.lastIndexOf(2)); // 3
```

#### includes()

- **描述**: 判断数组是否包含某个元素
- **语法**: `arr.includes(valueToFind[, fromIndex])`
- **返回值**: 布尔值
- **示例**:

```javascript
const arr = [1, 2, 3];
console.log(arr.includes(2)); // true
console.log(arr.includes(4)); // false
```

#### find()

- **描述**: 返回满足条件的第一个元素
- **语法**: `arr.find(callback(element[, index[, array]])[, thisArg])`
- **返回值**: 找到的元素，未找到返回undefined
- **示例**:

```javascript
const arr = [5, 12, 8, 130, 44];
const found = arr.find(element => element > 10);
console.log(found); // 12
```

#### findIndex()

- **描述**: 返回满足条件的第一个元素的索引
- **语法**: `arr.findIndex(callback(element[, index[, array]])[, thisArg])`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const arr = [5, 12, 8, 130, 44];
const index = arr.findIndex(element => element > 10);
console.log(index); // 1
```

#### filter()

- **描述**: 返回满足条件的所有元素组成的新数组
- **语法**: `arr.filter(callback(element[, index[, array]])[, thisArg])`
- **返回值**: 新数组
- **示例**:

```javascript
const arr = [1, 2, 3, 4, 5];
const evens = arr.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]
```

### 3. 遍历和转换方法

#### forEach()

- **描述**: 对每个元素执行函数
- **语法**: `arr.forEach(callback(currentValue[, index[, array]])[, thisArg])`
- **返回值**: undefined
- **示例**:

```javascript
const arr = [1, 2, 3];
arr.forEach((item, index) => {
  console.log(`索引${index}: ${item}`);
});
```

#### map()

- **描述**: 对每个元素执行函数并返回新数组
- **语法**: `arr.map(callback(currentValue[, index[, array]])[, thisArg])`
- **返回值**: 新数组
- **示例**:

```javascript
const arr = [1, 2, 3];
const doubled = arr.map(num => num * 2);
console.log(doubled); // [2, 4, 6]
```

#### reduce()

- **描述**: 将数组缩减为单个值
- **语法**: `arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])`
- **返回值**: 累积结果
- **示例**:

```javascript
const arr = [1, 2, 3, 4];
const sum = arr.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 10
```

#### reduceRight()

- **描述**: 从右向左将数组缩减为单个值
- **语法**: `arr.reduceRight(callback(accumulator, currentValue[, index[, array]])[, initialValue])`
- **返回值**: 累积结果
- **示例**:

```javascript
const arr = [1, 2, 3, 4];
const result = arr.reduceRight((acc, cur) => acc - cur);
console.log(result); // -2
```

### 4. 排序和重组方法

#### sort()

- **描述**: 对数组排序
- **语法**: `arr.sort([compareFunction])`
- **返回值**: 排序后的数组
- **示例**:

```javascript
const arr = [3, 1, 4, 1, 5];
arr.sort();
console.log(arr); // [1, 1, 3, 4, 5]

// 数字排序
const numbers = [40, 100, 1, 5, 25];
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 5, 25, 40, 100]
```

#### reverse()

- **描述**: 反转数组顺序
- **语法**: `arr.reverse()`
- **返回值**: 反转后的数组
- **示例**:

```javascript
const arr = [1, 2, 3];
arr.reverse();
console.log(arr); // [3, 2, 1]
```

#### slice()

- **描述**: 提取数组的一部分
- **语法**: `arr.slice([start[, end]])`
- **返回值**: 新数组
- **示例**:

```javascript
const arr = [1, 2, 3, 4, 5];
const part = arr.slice(1, 4);
console.log(part); // [2, 3, 4]
```

#### concat()

- **描述**: 合并两个或多个数组
- **语法**: `arr.concat(value1[, value2[, ...[, valueN]]])`
- **返回值**: 新数组
- **示例**:

```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = arr1.concat(arr2);
console.log(merged); // [1, 2, 3, 4]
```

### 5. 其他常用方法

#### join()

- **描述**: 将数组所有元素连接成字符串
- **语法**: `arr.join([separator])`
- **返回值**: 字符串
- **示例**:

```javascript
const arr = ['a', 'b', 'c'];
console.log(arr.join()); // "a,b,c"
console.log(arr.join('')); // "abc"
console.log(arr.join('-')); // "a-b-c"
```

#### toString()

- **描述**: 返回数组的字符串表示
- **语法**: `arr.toString()`
- **返回值**: 字符串
- **示例**:

```javascript
const arr = [1, 2, 'a', '1a'];
console.log(arr.toString()); // "1,2,a,1a"
```

#### every()

- **描述**: 检测是否所有元素都满足条件
- **语法**: `arr.every(callback(element[, index[, array]])[, thisArg])`
- **返回值**: 布尔值
- **示例**:

```javascript
const arr = [1, 2, 3, 4];
const allPositive = arr.every(num => num > 0);
console.log(allPositive); // true
```

#### some()

- **描述**: 检测是否有元素满足条件
- **语法**: `arr.some(callback(element[, index[, array]])[, thisArg])`
- **返回值**: 布尔值
- **示例**:

```javascript
const arr = [1, 2, 3, 4];
const hasEven = arr.some(num => num % 2 === 0);
console.log(hasEven); // true
```

#### isArray()

- **描述**: 判断是否为数组
- **语法**: `Array.isArray(value)`
- **返回值**: 布尔值
- **示例**:

```javascript
console.log(Array.isArray([1, 2, 3])); // true
console.log(Array.isArray({})); // false
```

## 字符串常用方法

### 1. 查找和提取方法

#### indexOf()

- **描述**: 返回指定值在字符串中第一次出现的索引
- **语法**: `str.indexOf(searchValue[, fromIndex])`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.indexOf('o')); // 4
console.log(str.indexOf('World')); // 6
```

#### lastIndexOf()

- **描述**: 返回指定值在字符串中最后一次出现的索引
- **语法**: `str.lastIndexOf(searchValue[, fromIndex])`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.lastIndexOf('o')); // 7
```

#### includes()

- **描述**: 判断字符串是否包含指定子串
- **语法**: `str.includes(searchString[, position])`
- **返回值**: 布尔值
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.includes('World')); // true
console.log(str.includes('world')); // false
```

#### startsWith()

- **描述**: 判断字符串是否以指定子串开头
- **语法**: `str.startsWith(searchString[, position])`
- **返回值**: 布尔值
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.startsWith('Hello')); // true
console.log(str.startsWith('World')); // false
```

#### endsWith()

- **描述**: 判断字符串是否以指定子串结尾
- **语法**: `str.endsWith(searchString[, length])`
- **返回值**: 布尔值
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.endsWith('World')); // true
console.log(str.endsWith('Hello')); // false
```

#### charAt()

- **描述**: 返回指定位置的字符
- **语法**: `str.charAt(index)`
- **返回值**: 字符
- **示例**:

```javascript
const str = 'Hello';
console.log(str.charAt(1)); // 'e'
```

#### charCodeAt()

- **描述**: 返回指定位置字符的Unicode编码
- **语法**: `str.charCodeAt(index)`
- **返回值**: Unicode编码
- **示例**:

```javascript
const str = 'Hello';
console.log(str.charCodeAt(1)); // 101
```

### 2. 修改和转换方法

#### toUpperCase()

- **描述**: 将字符串转换为大写
- **语法**: `str.toUpperCase()`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello';
console.log(str.toUpperCase()); // 'HELLO'
```

#### toLowerCase()

- **描述**: 将字符串转换为小写
- **语法**: `str.toLowerCase()`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello';
console.log(str.toLowerCase()); // 'hello'
```

#### trim()

- **描述**: 移除字符串两端的空白字符
- **语法**: `str.trim()`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = '  Hello World  ';
console.log(str.trim()); // 'Hello World'
```

#### trimStart() / trimLeft()

- **描述**: 移除字符串开头的空白字符
- **语法**: `str.trimStart()` 或 `str.trimLeft()`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = '  Hello World  ';
console.log(str.trimStart()); // 'Hello World  '
```

#### trimEnd() / trimRight()

- **描述**: 移除字符串末尾的空白字符
- **语法**: `str.trimEnd()` 或 `str.trimRight()`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = '  Hello World  ';
console.log(str.trimEnd()); // '  Hello World'
```

#### replace()

- **描述**: 替换字符串中的子串
- **语法**: `str.replace(searchValue, replaceValue)`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.replace('World', 'JavaScript')); // 'Hello JavaScript'

// 使用正则表达式
console.log(str.replace(/o/g, '0')); // 'Hell0 W0rld'
```

#### replaceAll()

- **描述**: 替换字符串中所有匹配的子串
- **语法**: `str.replaceAll(searchValue, replaceValue)`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.replaceAll('l', 'L')); // 'HeLLo WorLd'
```

#### padStart()

- **描述**: 在字符串开头填充字符直到达到指定长度
- **语法**: `str.padStart(targetLength[, padString])`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = '5';
console.log(str.padStart(3, '0')); // '005'
```

#### padEnd()

- **描述**: 在字符串末尾填充字符直到达到指定长度
- **语法**: `str.padEnd(targetLength[, padString])`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = '5';
console.log(str.padEnd(3, '0')); // '500'
```

### 3. 分割和连接方法

#### split()

- **描述**: 将字符串分割为数组
- **语法**: `str.split([separator[, limit]])`
- **返回值**: 数组
- **示例**:

```javascript
const str = 'apple,banana,orange';
console.log(str.split(',')); // ['apple', 'banana', 'orange']

const str2 = 'Hello';
console.log(str2.split('')); // ['H', 'e', 'l', 'l', 'o']
```

#### concat()

- **描述**: 连接两个或多个字符串
- **语法**: `str.concat(str2, ..., strN)`
- **返回值**: 新字符串
- **示例**:

```javascript
const str1 = 'Hello';
const str2 = 'World';
console.log(str1.concat(' ', str2)); // 'Hello World'
```

#### repeat()

- **描述**: 将字符串重复指定次数
- **语法**: `str.repeat(count)`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello';
console.log(str.repeat(3)); // 'HelloHelloHello'
```

### 4. 切片和子串方法

#### slice()

- **描述**: 提取字符串的一部分
- **语法**: `str.slice(beginIndex[, endIndex])`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.slice(0, 5)); // 'Hello'
console.log(str.slice(6)); // 'World'
console.log(str.slice(-5)); // 'World'
```

#### substring()

- **描述**: 提取两个指定索引之间的字符
- **语法**: `str.substring(indexStart[, indexEnd])`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.substring(0, 5)); // 'Hello'
console.log(str.substring(6)); // 'World'
```

#### substr()

- **描述**: 从指定位置提取指定长度的字符
- **语法**: `str.substr(start[, length])`
- **返回值**: 新字符串
- **示例**:

```javascript
const str = 'Hello World';
console.log(str.substr(0, 5)); // 'Hello'
console.log(str.substr(6, 5)); // 'World'
```

### 5. 其他常用方法

#### valueOf()

- **描述**: 返回字符串对象的原始值
- **语法**: `str.valueOf()`
- **返回值**: 字符串
- **示例**:

```javascript
const str = new String('Hello');
console.log(str.valueOf()); // 'Hello'
```

#### toString()

- **描述**: 返回字符串表示
- **语法**: `str.toString()`
- **返回值**: 字符串
- **示例**:

```javascript
const str = new String('Hello');
console.log(str.toString()); // 'Hello'
```

#### match()

- **描述**: 在字符串中查找匹配正则表达式的字符
- **语法**: `str.match(regexp)`
- **返回值**: 匹配结果数组或null
- **示例**:

```javascript
const str = 'The rain in SPAIN stays mainly in the plain';
console.log(str.match(/ain/g)); // ['ain', 'ain', 'ain']
```

#### search()

- **描述**: 搜索匹配正则表达式的字符的位置
- **语法**: `str.search(regexp)`
- **返回值**: 索引值，未找到返回-1
- **示例**:

```javascript
const str = 'The rain in SPAIN stays mainly in the plain';
console.log(str.search(/ain/)); // 5
```

#### localeCompare()

- **描述**: 比较两个字符串在本地语言环境中的顺序
- **语法**: `str.localeCompare(compareString[, locales[, options]])`
- **返回值**: 数字（负数、零或正数）
- **示例**:

```javascript
console.log('a'.localeCompare('b')); // -1
console.log('b'.localeCompare('a')); // 1
console.log('a'.localeCompare('a')); // 0
```

## 总结

### 数组方法特点

- **改变原数组**: push, pop, unshift, shift, splice, sort, reverse
- **不改变原数组**: slice, concat, map, filter, reduce, join, toString
- **返回新数组**: slice, concat, map, filter
- **返回单个值**: reduce, reduceRight, find, findIndex, indexOf, lastIndexOf

### 字符串方法特点

- **所有字符串方法都不改变原字符串**，因为字符串是不可变的
- **返回新字符串**: toUpperCase, toLowerCase, trim, replace, slice, substring
- **返回数组**: split
- **返回布尔值**: includes, startsWith, endsWith

### 常用场景

1. **数据处理**: map, filter, reduce
2. **元素操作**: push, pop, splice
3. **字符串处理**: split, join, replace
4. **查找判断**: includes, indexOf, find
5. **格式转换**: toString, toUpperCase, toLowerCase

这份文档涵盖了JavaScript中数组和字符串最常用的方法，掌握这些方法将大大提高你的JavaScript编程效率。