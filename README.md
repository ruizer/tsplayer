# tsplayer

> 感谢慕课网和上面的讲师，感谢制作这个教程[TypeScript 封装播放器组件](https://www.imooc.com/learn/1243 "简介：1、搭建TS开发环境 2、分析案例需求 3、了解什么是组件化 4、案例样式排版布局 5、功能模块组件化开发
")的讲师
>
> 这是个练习项目，防小米官网弹出式播放器，使用 ts 封装播放器组件
>
> [imooc 分支](https://github.com/ruizer/tsplayer/tree/imooc)代码是教程源码，master 做了些代码优化，以及功能扩展

# popup 组件

```ts
// 参数
interface Ipopup {
  width?: string;
  height?: string;
  title?: string;
  position?: string;
  mask?: boolean;
  content?: (content: HTMLElement) => void;
}
```

# video 组件

```ts
// 参数
interface IVideo {
  url: string;
  elem: string | HTMLElement;
  width?: string;
  height?: string;
  autoplay?: boolean;
  poster?: string;
  times?: number;
}
```

## 开发进度

- [x] 拖拽进度条/音量进度条
- [x] 点击进度条/音量进度条
- [x] 暂停功能
- [x] 全屏播放
- [x] loading 加载
- [x] 封面
- [x] 倍数播放
- ~~[ ] 截屏(canvas导出图片时会有跨域问题)~~

....
