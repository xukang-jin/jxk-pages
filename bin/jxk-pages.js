#!/usr/bin/env node

process.argv.push('--cwd');//配置当前工作空间
process.argv.push(process.cwd());
process.argv.push('--gulpfile');
process.argv.push(require.resolve('..'))
//配置gulpfile.js的路径为package.json中指定的main字段

require('gulp/bin/gulp')