# Sass Warnings 快速修复指南 ⚡

## 🎯 最快速的解决方案

### 立即执行（一键修复）：

```bash
# 方法 1: 使用官方工具（推荐）
npm install -g sass-migrator && \
cd packages/admin-ui && \
sass-migrator module --migrate-deps "src/**/*.scss" && \
cd ../.. && \
npm run build

# 方法 2: 如果方法 1 失败，使用提供的脚本
bash scripts/migrate-sass-imports.sh
```

---

## 🔧 分步执行

### 步骤 1: 安装迁移工具

```bash
npm install -g sass-migrator
```

### 步骤 2: 运行迁移

```bash
cd packages/admin-ui
sass-migrator module --migrate-deps "src/**/*.scss"
```

### 步骤 3: 验证

```bash
cd ../..
npm run build
```

---

## 📋 迁移示例

### 之前（有警告）：
```scss
@import 'variables';
@import 'mixins';

.my-component {
    color: $primary-color;
}
```

### 之后（无警告）：
```scss
@use 'variables';
@use 'mixins';

.my-component {
    color: variables.$primary-color;
}
```

---

## ⚠️ 如果遇到问题

### 问题 1: sass-migrator 安装失败

**解决方案 A**：使用 npx
```bash
cd packages/admin-ui
npx sass-migrator module --migrate-deps "src/**/*.scss"
```

**解决方案 B**：使用提供的脚本
```bash
node scripts/migrate-sass-imports.js
```

**解决方案 C**：手动安装特定版本
```bash
npm install -g sass-migrator@latest
```

### 问题 2: 权限错误

```bash
# Linux/Mac
sudo npm install -g sass-migrator

# Windows (以管理员身份运行 PowerShell)
npm install -g sass-migrator
```

### 问题 3: 迁移后构建失败

```bash
# 回滚更改
git checkout packages/admin-ui

# 使用 dry-run 预览
cd packages/admin-ui
sass-migrator module --dry-run "src/**/*.scss"
```

---

## 🚀 零停机迁移

如果不想立即迁移，可以暂时忽略警告：

### 方法 1: 禁用警告（临时）

在 `package.json` 中修改构建脚本：

```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--no-warnings ng-packagr ..."
  }
}
```

### 方法 2: 使用旧版 Dart Sass

```bash
npm install sass@1.32.0 --save-dev
```

**注意**：这只是临时方案，建议尽快迁移。

---

## ✅ 验证修复

运行构建，确认没有 DEPRECATION WARNING：

```bash
npm run build 2>&1 | grep -i "deprecation"
```

如果没有输出，说明修复成功！

---

## 📊 预期结果

- ✅ 构建无 warnings
- ✅ 样式保持不变
- ✅ 为 Dart Sass 3.0 做好准备
- ✅ 代码更易维护（命名空间）

---

## 🆘 需要帮助？

1. 查看详细指南：`SASS_IMPORT_MIGRATION_GUIDE.md`
2. 运行预览模式：`sass-migrator module --dry-run "src/**/*.scss"`
3. 使用 Git 分支测试：`git checkout -b sass-migration-test`

---

**时间估计**: 5-15 分钟
**难度**: ⭐⭐☆☆☆ (简单)
**风险**: 🟢 低 (可回滚)
