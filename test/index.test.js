#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const Finder = require('../index');
const ERROR_MESSAGE = require('../errorMessage.json');

const pkgDir = path.resolve(__dirname, './../');

// 测试文件夹深度判断方法
{
    let timeName = '测试文件夹深度判断方法';
    console.time(timeName);
    let i = 0;
    while (++i <= 100) {
        const actuals = [
            Finder.isDepthOk('/home/app/', { dirSrc: '/home/app', max: 1 }),
            Finder.isDepthOk('/home/app/a/b/c/d/', { dirSrc: '/home/app', max: 0 }),
            Finder.isDepthOk('/home/app/a/b/c/d/', { dirSrc: '/home/app', max: 4 }),
            Finder.isDepthOk('/home/app/a/b/c/d/', { dirSrc: '/home/app', max: 5 }),
            Finder.isDepthOk('/home/app/a/b/c/d/e/f/h/i/g/', { dirSrc: '/home/app', max: 10 }),
        ];
        const expecteds = [
            true,
            true,
            false,
            true,
            true,
        ];
        actuals.forEach((item, i) => {
            assert.equal(actuals[i], expecteds[i]);
        });
        console.log(`测试同步方法完成.${i}`);
    }
    console.timeEnd(timeName);
}

// 测试同步方法
{
    let timeName = '测试同步方法';
    console.time(timeName);
    let i = 0;
    while (++i <= 100) {
        const actuals = [
            path.normalize(Finder.findSync('index.js', pkgDir)),
            path.normalize(Finder.findSync('index.js', pkgDir, 1)),
            path.normalize(Finder.findSync('index.test.js', pkgDir)),
            Finder.findSync('index.test.js', pkgDir, 1).message, // 只查找一层目录，由于深度限制，无法找到文件
            Finder.findSync('hello.js', pkgDir).message,         // 找不到这个文件
        ];
        const expecteds = [
            path.normalize(`${pkgDir}/index.js`),
            path.normalize(`${pkgDir}/index.js`),
            path.normalize(`${pkgDir}/test/index.test.js`),
            ERROR_MESSAGE.SEARCH_DEPTH_LIMIT,
            ERROR_MESSAGE.TARGET_NOT_FOUND,
        ];

        actuals.forEach((item, index) => {
            assert.equal(actuals[index], expecteds[index]);
        });
        console.log(`测试同步方法完成.${i}`);
    }
    console.timeEnd(timeName);
}

