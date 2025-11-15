# 故障排除指南

## className 不生效的问题

如果生成的 Tailwind 配置中的 className 没有生效，请按以下步骤检查：

### 1. 重新生成配置

首先需要重新构建 `@aipt/tailwind` 包，然后重新生成配置：

```bash
# 在项目根目录
cd packages/tailwind
pnpm build

# 回到示例项目
cd ../../examples/ui-theme
pnpm generate-theme
```

### 2. 检查 tailwind.config.js

确保配置文件中包含：

- ✅ `content` 配置（用于扫描文件）
- ✅ 所有颜色值都是实际的颜色值（如 `#3395FF`），而不是变量引用（如 `"brand-6"`）
- ✅ `borderRadius` 包含 `box` 键（用于 `rounded-box`）

### 3. 检查组件中的 className

确保使用的 className 与生成的配置匹配：

- `bg-brand-6` → 需要 `colors.brand.6` 存在
- `text-text-primary` → 需要 `colors.textPrimary` 存在
- `rounded-box` → 需要 `borderRadius.box` 存在
- `h-box-height-md` → 需要 `spacing.box-height-md` 存在

### 4. 重启开发服务器

修改配置后，需要重启 Vite 开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

### 5. 清除缓存

如果问题仍然存在，尝试清除缓存：

```bash
# 删除 node_modules/.vite
rm -rf node_modules/.vite

# 重新启动
pnpm dev
```

## 常见问题

### 问题：颜色显示为变量名而不是实际颜色

**原因**：颜色引用没有正确解析（如 `"brand": "brand-6"` 应该是实际颜色值）

**解决**：确保 `resolveColorReference` 函数正确工作，重新生成配置。

### 问题：某些 className 完全不起作用

**原因**：可能是 Tailwind 没有扫描到这些文件

**解决**：检查 `content` 配置是否包含正确的文件路径。

### 问题：borderRadius 不生效

**原因**：`rounded-box` 需要 `borderRadius.box` 存在

**解决**：确保 `variables.json` 中的 `box.border.radius:px` 被正确解析。
