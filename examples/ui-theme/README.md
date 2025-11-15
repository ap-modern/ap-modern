# UI Theme Demo

这是一个演示项目，用于验证 Tailwind 主题生成器的功能。

## 功能

- 使用 `@aipt/tailwind` 包生成 Tailwind 配置
- 演示 Button、Input、Card 组件使用主题变量
- 验证生成的 className 是否正常工作

## 使用方法

1. 安装依赖：

```bash
pnpm install
```

2. 生成 Tailwind 配置：

```bash
pnpm generate-theme
```

3. 启动开发服务器：

```bash
pnpm dev
```

## 组件说明

### Button

- 支持多种变体：primary, secondary, danger, gray
- 支持多种尺寸：small, medium, large
- 使用主题颜色和间距变量

### Input

- 支持多种尺寸：small, medium, large
- 支持禁用状态
- 使用主题边框和文本颜色

### Card

- 使用主题边框、阴影和间距
- 展示文本颜色和字体大小变量

## 主题变量

主题变量定义在 `theme/variables.json` 中，包括：

- 颜色系统（brand, black, success, error, warning）
- 尺寸系统（box height, width, padding, margin）
- 文本系统（font size, weight, color）
- 边框和阴影

生成的 Tailwind 配置会将 these 变量转换为可用的 Tailwind classes。
