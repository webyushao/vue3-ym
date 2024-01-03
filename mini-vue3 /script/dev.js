const args = require('minimist')(process.argv.slice(2))
const { build } = require('esbuild')
const { resolve } = require('path')
// minimist 是解析命令行参数的 target 为模块是哪个 format为打包格式
const target = args._[0] || 'reactivity'
const format = args.f || 'global'


// 开发工具只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))
// iife 立即执行函数 (function(){}())
// cjs node的模块 module.exports
// esm 浏览器中的esModule模块 import
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)
// 天生就支持ts
build(
  {
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true, // 把所有的包都打包到一起
    sourcemap: true,
    format: outputFormat, // 输出的格式
    globalName: pkg.buildOptions?.name, // 打包的全局名字
    platform: format === 'cjs' ? 'node' : 'browser', // 平台
    watch: { // 监控文件的变化
      onRebuild(error) {
        if (!error) console.log(`rebuilt ~~`)
      }
    }
  }
).then(() => {
  console.log('watching ~~')
})