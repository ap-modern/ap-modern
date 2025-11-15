# @aipt/iconfont

Iconfont 工具库，支持 Tailwind CSS，提供动态加载和静态生成两种方式使用图标。

## 功能特性

- ✅ 基于 Tailwind CSS，无需额外的 CSS 文件
- ✅ 支持动态加载 iconfont 脚本（`createFromIconfontCN`）
- ✅ 支持生成静态 Icon 组件（`gen-icons` 命令）
- ✅ 支持多个 iconfont URL 合并
- ✅ 完全类型安全
- ✅ 去除 style 相关 props，使用 Tailwind CSS 类名

## 安装

```bash
pnpm add @aipt/iconfont
```

## 使用方法

### 方式一：动态加载（createFromIconfontCN）

```tsx
import { createFromIconfontCN } from '@aipt/iconfont';

const Iconfont = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
});

function App() {
  return (
    <div>
      <Iconfont type="gengduo" className="text-2xl text-blue-600" />
      <Iconfont type="jia" className="text-3xl text-red-500" />
    </div>
  );
}
```

### 方式二：生成静态组件（gen-icons）

```bash
# 生成 Icon 组件
gen-icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js

# 多个 iconfont URL
gen-icons https://at.alicdn.com/t/c/font_1.js https://at.alicdn.com/t/c/font_2.js

# 指定输出目录
gen-icons -o ./src/icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
```

使用生成的组件：

```tsx
import { GengduoIcon, JiaIcon } from './icons';

function App() {
  return (
    <div>
      <GengduoIcon className="text-2xl text-blue-600" />
      <JiaIcon className="text-3xl text-red-500" />
    </div>
  );
}
```

## API

### createFromIconfontCN

创建一个动态加载 iconfont 的组件。

```tsx
const Iconfont = createFromIconfontCN({
  scriptUrl: string | string[], // iconfont 脚本 URL
  extraCommonProps?: { [key: string]: any }, // 额外的通用 props
});
```

### Icon 组件 Props

```tsx
interface IconBaseProps {
  className?: string; // Tailwind CSS 类名
  type?: string; // 图标类型（用于 createFromIconfontCN）
  icon?: React.ReactNode; // 图标内容（用于生成的组件）
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  spin?: boolean; // 是否旋转（使用 animate-spin）
  rotate?: number; // 旋转角度
}
```

## 命令行工具

### gen-icons

生成静态 Icon 组件。

```bash
gen-icons [options] <iconfontUrl1> [iconfontUrl2] ...

Options:
  -o, --output <path>    Output directory (default: ./src/icons)
  -h, --help             Show help message
```

## 与原始实现的区别

1. **去除 SCSS 依赖**：所有样式使用 Tailwind CSS 类名实现
2. **去除 style props**：不再支持 `fontSize`、`margin` 等 style 相关的 props，使用 Tailwind CSS 类名替代
3. **Tailwind CSS 类名**：
   - `text-2xl` 替代 `fontSize`
   - `m-4` 替代 `margin`
   - `text-blue-600` 替代 `color`
   - `animate-spin` 用于旋转动画

## 开发

```bash
# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

## 示例项目

查看 `examples/icon-font` 获取完整的使用示例。
