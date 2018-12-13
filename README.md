# smash-find-up

smash-cli工具使用的查找文件（夹）的方法。

# 安装

执行 `npm install smash-find-up --save` 或 `yarn add smash-find-up` 安装。

# node使用

`Finder.findSync` 接受3个参数，见下面例子：

```javascript
const Finder = require('smash-find-up');

const target = 'index.js';                 // 要查找的文件（夹）的名称
const dir = path.resolve(__dirname, './'); // 在这个目录里面查找，如果不传入这个参数，则在工作目录里查找
const depth = 0;                           // 查找深度。（默认为0，不做限制）
const targetPath = Finder.findSync(target, dir, depth);
if(targetPath instanceof Error) {
    // TODO 错误提示
} else {
    // TODO 找到了目标路径
}
```

# 命令行使用

如果提示没有操作权限，请使用管理员权限运行。

```bash
# 在当前目录下查找 index.js 的路径
$ smf target=index.js
$ smash-find-up name=index.js
$ smf n=index.js

# 在当前目录下查找 index.js 的路径，同时，限制查找的目录深度不超过2层
$ smf target=index.js depth=2

# 在目录 ./WWW/ 下查找 index.js 的路径，同时，限制查找的目录深度不超过2层
$ smf target=index.js dir=./WWW/ depth=2
```

# 链接

- [smash-cli](https://github.com/chenhaihong/smash-cli)