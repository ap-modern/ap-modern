# Tailwind 主题生成器文档

## 概述

`@aipt/tailwind` 是一个从 `variables.json` 生成 Tailwind CSS 配置的工具库。它参考了 `mc-theme` 和 `mc-style` 的实现思路，提供了完整的主题变量系统。

## 项目结构

```
packages/tailwind/
├── src/
│   ├── colorPalette.ts      # 颜色计算函数（colorPalette, fadeOut, lighten）
│   ├── variableResolver.ts   # 变量解析和计算引擎
│   ├── tailwindGenerator.ts  # Tailwind 配置生成器
│   ├── types.ts             # TypeScript 类型定义
│   └── index.ts             # 导出入口
├── bin/
│   └── tailwind-theme.cjs   # 命令行工具
├── theme/
│   └── variables.json       # 默认变量定义
├── docs/
│   ├── README.md           # 本文档
│   └── COMPONENTS.md       # 组件变量文档
└── package.json
```

## 核心功能

### 1. 变量解析引擎

`variableResolver.ts` 实现了变量解析和计算功能：

- **变量引用解析**：支持变量之间的引用，如 `"primary": "brand-6"`
- **函数调用解析**：支持 `.colorPalette({brand}, 1)` 等函数调用
- **嵌套结构支持**：支持多层嵌套的变量结构
- **递归计算**：自动解析所有依赖关系

### 2. 颜色计算

`colorPalette.ts` 实现了颜色计算功能：

- **colorPalette**：根据基础颜色生成色板（1-10 级）
- **fadeOut**：调整颜色透明度
- **lighten**：使颜色变亮

### 3. Tailwind 配置生成

`tailwindGenerator.ts` 将变量转换为 Tailwind 配置：

- **颜色系统**：生成 colors 配置
- **尺寸系统**：生成 spacing, fontSize, fontWeight 等
- **边框和阴影**：生成 borderRadius, borderWidth, boxShadow
- **组件变量**：支持组件特定的变量集合

## 变量格式规范

### 基础变量

```json
{
  "global": {
    "brand": "#3395FF"
  }
}
```

### 颜色色板

```json
{
  "brand": {
    "6": "brand",
    "7": ".colorPalette({brand}, 7)"
  }
}
```

### 尺寸变量

使用 `!size:px` 或 `!vsize:px` 标记尺寸：

```json
{
  "box": {
    "height": {
      "!size:px": {
        "sm": 28,
        "md": 32
      }
    }
  }
}
```

### 颜色变量

使用 `!color` 标记颜色：

```json
{
  "text": {
    "!color": {
      "primary": "black-9"
    }
  }
}
```

## 使用方法

### 命令行

```bash
# 使用默认路径
tailwind-theme

# 自定义路径
tailwind-theme -i ./custom-variables.json -o ./tailwind.config.js
```

### 编程方式

```typescript
import { generateTailwindConfig } from '@aipt/tailwind';

const config = generateTailwindConfig(variables, componentVariables);
```

## 生成的配置结构

生成的 Tailwind 配置包含以下扩展：

- `theme.extend.colors` - 所有颜色变量
- `theme.extend.fontSize` - 字体大小
- `theme.extend.fontWeight` - 字体粗细
- `theme.extend.spacing` - 间距（padding, margin, height, width）
- `theme.extend.borderRadius` - 圆角
- `theme.extend.boxShadow` - 阴影
- `theme.extend.borderWidth` - 边框宽度
- `theme.extend.lineHeight` - 行高
- `theme.extend.components` - 组件变量（如果提供）

## 组件变量

组件变量定义在 `docs/COMPONENTS.md` 中，列出了 31 个组件的所有变量。这些变量可以在组件开发时直接使用，例如：

- `Button.primary.bgColor` → `bg-button-primary-bgColor`
- `Input.height.small` → `h-input-height-small`

## 示例项目

`examples/ui-theme` 是一个完整的演示项目，展示了如何使用生成的 Tailwind 配置：

- Button 组件使用主题颜色和尺寸
- Input 组件使用主题边框和文本颜色
- Card 组件使用主题阴影和间距

## 开发指南

### 添加新的颜色计算函数

1. 在 `colorPalette.ts` 中添加函数实现
2. 在 `variableResolver.ts` 的 `resolveFunction` 中添加处理逻辑

### 扩展 Tailwind 配置生成

在 `tailwindGenerator.ts` 的 `generateTailwindConfig` 函数中添加新的配置项处理逻辑。

## 注意事项

1. 变量名使用 kebab-case，生成的 Tailwind class 也会使用 kebab-case
2. 函数调用必须使用 `.functionName()` 格式
3. 变量引用会自动解析，但要注意循环引用
4. 尺寸值会自动添加 `px` 单位（如果是数字）

## 参考

- [mc-theme](../mc-theme) - 主题引擎实现
- [mc-style](../mc-style) - 样式变量定义
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
