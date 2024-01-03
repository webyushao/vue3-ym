根目录的 package.json 主要是用来声明公共的操作脚本和公共的开发编译所需的
npm 模块；packages/* 目录用来管理多个子项目，每个子项目都有各自的 package.json 项目声明文件；pnpm-workspace.yaml 是 pnpm 管理项目的配置文件；
scripts/* 目录是用来存放项目通用编译脚本的；
tsconfig.json 是用来声明 TypeScript 的项目配置的。

打包的格式有几种？
node js commonjs CJS
浏览器 esm  esm-browser  esm-bundler import  from 
script 脚本 global iife

想要pnpm之间的包有关联，可以使用pnpm install @vue/shared@workspace --filter @vue/reactivity