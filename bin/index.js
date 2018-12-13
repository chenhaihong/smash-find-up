#!/usr/bin/env node

const path = require('path');
const Finder = require('../index');

const args = process.argv.slice(2);

let target = '';
let dir = path.normalize(process.cwd());
let depth = 0;

args.forEach(arg => {
    const [k, v] = arg.split('=');
    switch (k) {
        case 'target':
        case 'name':
        case 'n':
            target = v;
            break;
        case 'dir':
            dir = v;
            break;
        case 'depth':
            depth = parseInt(v);
            break;
    }
});

function prettty(pathStr) {
    return pathStr.split(path.sep).join('/');
}

const targetPath = Finder.findSync(target, dir, depth);
if (targetPath instanceof Error) {
    console.error(targetPath.message);
} else {
    console.table([prettty(targetPath)]);
}