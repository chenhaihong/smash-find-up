/**
 * 查找一个指定名称的文件或目录，如果存在，则返回它绝对路径。
 */

const fs = require('fs');
const path = require('path');
const ERROR_MESSAGE = require('./errorMessage.json');

const CWD = process.cwd(); // 工作目录

class Finder {
    /**
     * 在指定的一个目录里查找最近的一个内容
     * @param {String} target 要查找的内容
     * @param {String} dir 待搜索的文件夹路径
     * @param {Number} depth 查找深度，为0时不限制深度
     */
    static findSync(target, dir = CWD, depth = 0) {
        if (this.isDir(dir)) {
            return this.searchSync(target, [dir], { dirSrc: dir, max: depth });
        }
        return new Error(ERROR_MESSAGE.PARAM_DIR_MUST_BE_DIR_PATH);
    }

    /**
     * 每次加深1个层次的方式进行查找，在指定的文件夹里面查找目标内容
     * @param {String} target 想要查找的文件或文件夹的名称
     * @param {Array} dirs 候选的文件夹路径列表，将会在这堆文件夹里面查找
     * @param {Object} depthOption 限制查找深度的参数对象
     */
    static searchSync(target, dirs, depthOption) {
        // （1）遍历当前层次的目录，将在这层的目录里面查找target和下一轮等待查询的目录nextDirs
        const { targetPath, nextDirs } = this.getTargetPathAndNextDirs(target, dirs);
        // （2.1）查找到了targetPath，返回targetPath
        if (targetPath) {
            return targetPath;
        }
        // （2.2）下一层深度有目录，则在下一层深度的目录里查找目标
        else if (nextDirs.length) {
            // （2.2.1）不限制深度||还没达到深度限制，进入下一层深度的查找
            if (this.isDepthOk(nextDirs[0], depthOption)) {
                return this.searchSync(target, nextDirs, depthOption);
            }
            // （2.2.2）已经达到深度限制，抛出深度限制的错误
            else {
                return new Error(ERROR_MESSAGE.SEARCH_DEPTH_LIMIT);
            }
        }
        // （2.3）查找完了所有的目录，抛出找不到目标的错误
        else {
            return new Error(ERROR_MESSAGE.TARGET_NOT_FOUND);
        }
    }

    /**
     * 检查dir参数是否是一个目录
     * @param {String} dir 目录的路径
     * @returns {Boolean}
     */
    static isDir(dir) {
        try {
            return fs.statSync(dir).isDirectory();
        }
        // 目录不存在，所以它不是一个目录
        catch (error) {
            return false;
        }
    }

    /**
     * 返回查找到目标内容的绝对路径，同时，包含下一轮要查询的目录
     * Tip：这里要拿到正确的下一轮等待查询的目录，必须使用nextDirs一个数组单独存放
     * @param {String} target 目标内容
     * @param {String} dirs 一个目录
     */
    static getTargetPathAndNextDirs(target, dirs) {
        let targetPath = '';
        let nextDirs = []; // 存放下一轮等待查找的目录
        try { // 因为使用了forEach循环，所以使用trycatch和抛出异常的方式来终止循环

            // （1）遍历dirs，对每个dir分别执行逻辑
            dirs.forEach(dir => {
                // （1.1）读取dir这个目录的内容，遍历他们查找targetPath，和更新nextDirs
                const contents = fs.readdirSync(dir);
                for (const content of contents) {
                    const contentPath = `${dir}/${content}`; // 这个内容的路径
                    // （1.2.1）当前的内容名称与目标内容的名称一致，抛出路径，结束后面的逻辑
                    if (content === target) {
                        targetPath = contentPath;
                        throw targetPath;
                    }
                    // （1.2.2）当前内容不是要查找的目标内容，但是它是一个目录，则放入下一轮的查询
                    else {
                        fs.statSync(contentPath).isDirectory() && nextDirs.push(contentPath);
                    }
                }
            });

        } catch (throwValue) {
            if (throwValue instanceof Error) {
                throw throwValue;
            }
        } finally {
            return { targetPath, nextDirs };
        }
    }

    /**
     * 每次执行小于0.05ms
     * 深度未超过上限
     * @param {Array} dirChild dirSrc的子文件夹
     * @param {String} dirSrc 初始文件夹
     * @param {Number} max 深度上线
     */
    static isDepthOk(dirChild, { dirSrc, max = 0 }) {
        if (max === 0) {
            return true;
        }
        const arrSrc = path.normalize(path.resolve(dirSrc)).split(path.sep);
        const arrNow = path.normalize(path.resolve(dirChild)).split(path.sep);
        // arrSrc = [ 'F:', 'home', 'app' ]                      => depth = 1，默认初始文件夹深度为1
        // arrNow = [ 'F:', 'home', 'app', 'a', 'b', 'c', 'd' ]  => depth = 5
        return arrNow.length - arrSrc.length + 1 <= max;
    }
}

module.exports = Finder;