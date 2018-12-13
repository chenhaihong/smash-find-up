# smash-find-up

smash-cli工具使用的查找文件（夹）的方法。

# 安装

执行 `npm i --save smash-find-up` 或 `yarn add smash-find-up` 安装。

# node使用

使用 `Finder.findSync` 方法来查找文件（夹）。这个方法接受3个参数，见下面例子：

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

如果需要全局使用，需要执行 `npm i -g smash-find-up ` 或 `yarn global add smash-find-up` 在全局安装。

使用例子如下：

```bash
# !!!!!!!! 如果提示没有操作权限，请使用管理员权限运行。
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