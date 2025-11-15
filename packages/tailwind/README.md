# @aipt/tailwind

Tailwind CSS 主题生成器，从 `variables.json` 生成 Tailwind 配置。

## 功能特性

- ✅ 支持颜色计算函数（colorPalette, fadeOut, lighten）
- ✅ 支持变量引用和嵌套结构
- ✅ 自动生成 Tailwind 配置
- ✅ 支持组件变量集合
- ✅ 命令行工具支持自定义输入

## 安装

```bash
pnpm add @aipt/tailwind
```

## 使用方法

### 命令行工具

```bash
# 使用默认路径
tailwind-theme

# 指定输入和输出路径
tailwind-theme -i ./theme/variables.json -o ./tailwind.config.js

# 包含组件变量
tailwind-theme -i ./variables.json -c ./components.json -o ./tailwind.config.js
```

### 编程方式

```typescript
import { generateTailwindConfig } from '@aipt/tailwind';
import variables from './theme/variables.json';
import componentVariables from './theme/components.json';

const config = generateTailwindConfig(variables, componentVariables);
```

## 变量格式

### 基础变量

```json
{
  "global": {
    "brand": "#3395FF"
  },
  "brand": {
    "6": "brand",
    "7": ".colorPalette({brand}, 7)"
  }
}
```

### 颜色计算函数

- `.colorPalette({color}, index)` - 生成颜色色板
- `.fadeOut({color}, alpha)` - 调整透明度
- `.lighten({color}, amount)` - 变亮

### 尺寸变量

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

## 生成的配置

生成的 Tailwind 配置包含：

- `colors` - 颜色系统
- `fontSize` - 字体大小
- `fontWeight` - 字体粗细
- `spacing` - 间距（padding, margin, height, width）
- `borderRadius` - 圆角
- `boxShadow` - 阴影
- `borderWidth` - 边框宽度
- `lineHeight` - 行高

## 组件变量

组件变量定义在 `docs/COMPONENTS.md` 中，列出了所有支持的组件及其变量。

## 开发

```bash
# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```
