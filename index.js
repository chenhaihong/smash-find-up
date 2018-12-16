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
        let returnValue = { error: null, targetPath: '' };
        if (target === '' || typeof target !== 'string') {
            returnValue.error = new Error(ERROR_MESSAGE.TARGET_MUST_BE_A_STRING);
        } else if (this.isDir(dir)) {
            dir = path.resolve(dir); // 转换为绝对路径
            returnValue = this.searchSync(target, [dir], { dirSrc: dir, max: depth });
        } else {
            returnValue.error = new Error(ERROR_MESSAGE.PARAM_DIR_MUST_BE_DIR_PATH);
        }
        return returnValue;
    }

    /**
     * 每次加深1个层次的方式进行查找，在指定的文件夹里面查找目标内容
     * @param {String} target 想要查找的文件或文件夹的名称
     * @param {Array} dirs 候选的文件夹路径列表，将会在这堆文件夹里面查找
     * @param {Object} depthOption 限制查找深度的参数对象
     */
    static searchSync(target, dirs, depthOption) {
        let returnValue = { error: null, targetPath: '' };

        // （1）遍历当前层次的目录，将在这层的目录里面查找target和下一轮等待查询的目录nextDirs
        const { error, targetPath, nextDirs } = this.getTargetPathAndNextDirs(target, dirs);
        if (error) {
            returnValue.error = error;
        }
        // （2.1）查找到了targetPath，返回targetPath
        else if (targetPath) {
            returnValue.targetPath = targetPath;
        }
        // （2.2）下一层深度有目录，则在下一层深度的目录里查找目标
        else if (nextDirs.length) {
            // （2.2.1）不限制深度||还没达到深度限制，进入下一层深度的查找
            if (this.isDepthOk(nextDirs[0], depthOption)) {
                returnValue = this.searchSync(target, nextDirs, depthOption);
            }
            // （2.2.2）已经达到深度限制，抛出深度限制的错误
            else {
                returnValue.error = new Error(ERROR_MESSAGE.SEARCH_DEPTH_LIMIT);
            }
        }
        // （2.3）查找完了所有的目录，抛出找不到目标的错误
        else {
            returnValue.error = new Error(ERROR_MESSAGE.TARGET_NOT_FOUND);
        }

        return returnValue;
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
     * 返回查找到目标内容的绝对路径，同时，包含下一轮要查询的目录。
     * 如果发生了错误，会将错误返回。
     * Tip：这里要拿到正确的下一轮等待查询的目录，必须使用nextDirs一个数组单独存放
     * @param {String} target 目标内容的名称
     * @param {String} dirs 一个目录
     */
    static getTargetPathAndNextDirs(target, dirs) {
        let error = null, targetPath = '', nextDirs = []; // nextDirs 存放下一轮等待查找的目录

        // （1）遍历dirs，对每个dir分别执行逻辑
        for (const dir of dirs) {
            // 如果已经找到路径，或者遇到目录权限的问题，退出dirs循环
            if (error || targetPath) break;

            // （1.1）读取dir这个目录内容的名称，遍历他们查找targetPath，和更新nextDirs
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = `${dir}/${file}`; // 这个内容的路径
                // （1.2.1）当前的内容名称与目标内容的名称一致，设置路径，跳出files循环，结束后面的逻辑
                if (file === target) {
                    targetPath = path.normalize(filePath); // 统一返回的路径分割符的格式
                    break;
                }
                // （1.2.2）当前内容不是要查找的目标内容，但是它是一个目录，则放入下一轮的查询
                else {
                    /**
                     * 目录没有权限，报的错误信息，如下所示：
                     * EPERM: operation not permitted, stat 'C:\Windows/CSC/v2.0.6'
                     * 解决方法：使用管理员权限运行。
                     */
                    try {
                        fs.statSync(filePath).isDirectory() && nextDirs.push(filePath);
                    } catch (err) {
                        error = err;
                        break;
                    }
                }
            }
        }

        return { error, targetPath, nextDirs };
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