# Iconfont Demo

这是一个演示项目，展示如何使用 `@aipt/iconfont` 工具库。

## 功能

- **在线 Demo**：输入 iconfont URL，动态加载和展示图标
- **生成组件**：使用脚本生成 Icon 组件，支持多个 iconfont URL

## 使用方法

### 1. 在线 Demo

直接在页面上输入 iconfont URL，点击 "Load Icons" 即可查看图标。

### 2. 生成 Icon 组件

运行以下命令生成 Icon 组件：

```bash
# 单个 iconfont URL
pnpm gen-icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js

# 多个 iconfont URL
pnpm gen-icons https://at.alicdn.com/t/c/font_1.js https://at.alicdn.com/t/c/font_2.js

# 指定输出目录
pnpm gen-icons -o ./src/custom-icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
```

生成的组件将保存在 `src/icons` 目录（或指定的输出目录）。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生成图标组件
pnpm gen-icons <iconfontUrl>
```

## 组件使用

### 使用 createFromIconfontCN

```tsx
import { createFromIconfontCN } from '@aipt/iconfont';

const Iconfont = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
});

function App() {
  return <Iconfont type="gengduo" className="text-2xl" />;
}
```

### 使用生成的组件

```tsx
import { GengduoIcon } from './icons';

function App() {
  return <GengduoIcon className="text-2xl text-blue-600" />;
}
```

## 特性

- ✅ 基于 Tailwind CSS，无需额外的 CSS 文件
- ✅ 支持动态加载 iconfont 脚本
- ✅ 支持生成静态 Icon 组件
- ✅ 支持多个 iconfont URL 合并
- ✅ 完全类型安全
