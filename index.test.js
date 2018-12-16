#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const Finder = require('.');
const ERROR_MESSAGE = require('./errorMessage.json');

const pkgDir = path.resolve(__dirname, './');

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
        assert.deepEqual(actuals, expecteds);
        console.log(`Finder.isDepthOk.${i}`);
    }
    console.timeEnd(timeName); // 40ms
}

// 测试同步方法
{
    let timeName = '测试Finder.findSync同步方法';
    console.time(timeName);
    let i = 0;
    while (++i <= 100) {
        const actuals = [
            Finder.findSync('index.js', pkgDir).targetPath,
            Finder.findSync('index.js', pkgDir, 1).targetPath,
            Finder.findSync('file.txt', pkgDir).targetPath,
            Finder.findSync('file.txt', pkgDir, 1).error.message, // 只查找一层目录，由于深度限制，无法找到文件
            Finder.findSync('hello.js', pkgDir).error.message,    // 找不到这个文件
        ];
        const expecteds = [
            path.normalize(`${pkgDir}/index.js`),
            path.normalize(`${pkgDir}/index.js`),
            path.normalize(`${pkgDir}/temp/file.txt`),
            ERROR_MESSAGE.SEARCH_DEPTH_LIMIT,
            ERROR_MESSAGE.TARGET_NOT_FOUND,
        ];
        assert.deepEqual(actuals, expecteds);
        console.log(`Finder.findSync.${i}`); // 4000ms
    }
    console.timeEnd(timeName);
}

