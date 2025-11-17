# Sass @import 迁移指南

## 问题说明

您收到的 warnings 是因为 Sass 的 `@import` 规则已被弃用，将在 Dart Sass 3.0.0 中移除。需要迁移到新的模块系统（`@use` 和 `@forward`）。

## 快速解决方案（3 种方法）

### 方案 1：使用官方自动迁移工具 ⭐ 推荐

这是最安全、最完整的方法。

```bash
# 1. 安装 sass-migrator
npm install -g sass-migrator

# 2. 运行迁移（会自动修改文件）
cd packages/admin-ui
sass-migrator module --migrate-deps "src/**/*.scss"

# 3. 验证构建
npm run build

# 4. 提交更改
git add -A
git commit -m "refactor: Migrate Sass @import to @use"
```

**优点**：
- ✅ 官方工具，最可靠
- ✅ 自动处理所有边缘情况
- ✅ 处理命名空间冲突
- ✅ 迁移依赖文件

**缺点**：
- ⚠️ 需要网络访问安装工具
- ⚠️ 大量文件可能需要时间

---

### 方案 2：使用提供的迁移脚本

如果无法安装 sass-migrator，使用我创建的脚本：

```bash
# 运行 Shell 脚本
bash scripts/migrate-sass-imports.sh

# 或运行 Node.js 脚本
node scripts/migrate-sass-imports.js

# 测试构建
npm run build
```

**优点**：
- ✅ 不需要额外安装工具
- ✅ 可以 dry-run 预览更改
- ✅ 快速处理常见情况

**缺点**：
- ⚠️ 可能需要手动调整一些文件
- ⚠️ 不如官方工具全面

---

### 方案 3：手动迁移（理解原理）

如果只想修复特定文件或理解迁移原理：

#### 旧语法（deprecated）：
```scss
@import 'variables';
@import 'mixins';

.my-component {
    color: $primary-color;  // 来自 variables
    @include my-mixin();     // 来自 mixins
}
```

#### 新语法：
```scss
@use 'variables';
@use 'mixins';

.my-component {
    color: variables.$primary-color;  // 需要命名空间
    @include mixins.my-mixin();        // 需要命名空间
}
```

#### 或使用别名：
```scss
@use 'variables' as vars;
@use 'mixins' as mx;

.my-component {
    color: vars.$primary-color;
    @include mx.my-mixin();
}
```

#### 或使用 * 通配符（不推荐）：
```scss
@use 'variables' as *;
@use 'mixins' as *;

.my-component {
    color: $primary-color;      // 直接使用，无需命名空间
    @include my-mixin();
}
```

---

## 详细步骤：方案 1（官方工具）

### 第 1 步：安装 sass-migrator

```bash
npm install -g sass-migrator
```

如果遇到权限问题：
```bash
sudo npm install -g sass-migrator
```

### 第 2 步：备份（可选）

```bash
# 创建 Git 分支
git checkout -b sass-import-migration

# 或创建目录备份
cp -r packages/admin-ui packages/admin-ui.backup
```

### 第 3 步：运行迁移

```bash
cd packages/admin-ui

# 先预览更改（不修改文件）
sass-migrator module --dry-run --verbose "src/**/*.scss"

# 确认后执行实际迁移
sass-migrator module --migrate-deps "src/**/*.scss"
```

**参数说明**：
- `module`: 迁移到模块系统
- `--migrate-deps`: 同时迁移依赖的文件
- `--verbose`: 显示详细输出
- `--dry-run`: 预览模式，不修改文件

### 第 4 步：处理特殊情况

某些文件可能需要手动调整：

#### 1. 全局变量引用

**迁移前**：
```scss
@import 'variables';

.component {
    color: $primary-color;
}
```

**迁移后**（自动）：
```scss
@use 'variables';

.component {
    color: variables.$primary-color;
}
```

如果想保持原样（不推荐）：
```scss
@use 'variables' as *;

.component {
    color: $primary-color;  // 仍然可以直接使用
}
```

#### 2. Mixins 引用

**迁移前**：
```scss
@import 'mixins';

.component {
    @include my-mixin();
}
```

**迁移后**：
```scss
@use 'mixins';

.component {
    @include mixins.my-mixin();
}
```

#### 3. 多个 @import 合并

**迁移前**：
```scss
@import 'variables';
@import 'mixins';
@import 'functions';
```

**迁移后**：
```scss
@use 'variables';
@use 'mixins';
@use 'functions';
```

### 第 5 步：验证构建

```bash
# 返回项目根目录
cd ../..

# 构建 admin-ui
npm run build

# 如果有错误，查看具体文件
# 通常是命名空间引用问题
```

### 第 6 步：修复常见错误

#### 错误 1：未定义的变量

```
Error: Undefined variable: "$primary-color"
```

**解决**：添加命名空间
```scss
// 修改前
color: $primary-color;

// 修改后
color: variables.$primary-color;
```

#### 错误 2：未定义的 mixin

```
Error: Undefined mixin: "my-mixin"
```

**解决**：添加命名空间
```scss
// 修改前
@include my-mixin();

// 修改后
@include mixins.my-mixin();
```

#### 错误 3：循环依赖

```
Error: Module loop
```

**解决**：检查文件间的循环引用，重构为单向依赖。

### 第 7 步：提交更改

```bash
# 查看更改
git status
git diff

# 提交
git add -A
git commit -m "refactor: Migrate Sass @import to @use for Dart Sass 3.0 compatibility

- Migrated all @import statements to @use/@forward
- Updated variable and mixin references with namespaces
- Resolved circular dependencies
- Verified build passes successfully

This addresses deprecation warnings and prepares for Dart Sass 3.0.0"

# 推送
git push origin sass-import-migration
```

---

## 方案 2 详细步骤（使用脚本）

### 使用 Shell 脚本

```bash
# 运行脚本
bash scripts/migrate-sass-imports.sh

# 脚本会提示：
# - 是否创建备份？(y/n)
# - 显示迁移进度
# - 报告结果
```

### 使用 Node.js 脚本

```bash
# 预览模式（不修改文件）
node scripts/migrate-sass-imports.js --dry-run

# 实际迁移
node scripts/migrate-sass-imports.js

# 指定目录
node scripts/migrate-sass-imports.js --path=packages/admin-ui
```

---

## 方案 3：手动迁移步骤

如果只有少量文件需要修复：

### 1. 找到所有使用 @import 的文件

```bash
# 搜索 @import 语句
grep -r "@import" packages/admin-ui/src --include="*.scss"

# 计数
grep -r "@import" packages/admin-ui/src --include="*.scss" | wc -l
```

### 2. 逐个文件修改

对于每个文件：

```scss
// 原始文件
@import 'variables';
@import 'mixins';

.my-button {
    background: $primary-color;
    @include button-base();
}
```

修改为：

```scss
// 方法 1: 使用命名空间（推荐）
@use 'variables' as vars;
@use 'mixins' as mx;

.my-button {
    background: vars.$primary-color;
    @include mx.button-base();
}

// 或方法 2: 使用通配符（简单但不推荐）
@use 'variables' as *;
@use 'mixins' as *;

.my-button {
    background: $primary-color;
    @include button-base();
}
```

### 3. 测试每个更改

```bash
npm run build
```

---

## 特殊情况处理

### 1. _variables.scss 和 _mixins.scss 文件

如果这些是被导入的文件，需要使用 `@forward`：

**_variables.scss**:
```scss
// 导出所有变量供其他文件使用
$primary-color: #007bff;
$secondary-color: #6c757d;
// ... 其他变量
```

**index.scss** (如果有聚合文件):
```scss
@forward 'variables';
@forward 'mixins';
@forward 'functions';
```

### 2. 第三方库导入

**chartist 等外部库**：
```scss
// 迁移前
@import 'chartist/dist/index.scss';

// 迁移后
@use 'chartist/dist/index.scss' as chartist;

// 如果不需要命名空间
@use 'chartist/dist/index.scss';
```

### 3. Clarity UI 导入

```scss
// 迁移前
@import "global/clarity";

// 迁移后
@use "global/clarity";
```

---

## 验证和测试

### 1. 构建测试

```bash
# 清理构建
npm run clean

# 重新构建
npm run build

# 查看是否还有警告
npm run build 2>&1 | grep "DEPRECATION WARNING"
```

### 2. 视觉回归测试

确保 UI 没有变化：

1. 启动开发服务器
2. 访问所有主要页面
3. 检查样式是否正确
4. 对比迁移前后的截图

---

## 常见问题

### Q1: 迁移后构建失败？

**A**: 检查错误消息，通常是命名空间问题。确保所有变量和 mixin 引用都包含命名空间。

### Q2: 某些变量找不到？

**A**: 检查 `@use` 语句的路径是否正确。Sass 模块系统对路径更加严格。

### Q3: 性能受影响？

**A**: `@use` 通常比 `@import` 更快，因为它避免了重复编译。

### Q4: 可以混用 @import 和 @use 吗？

**A**: 可以，但不推荐。最好一次性全部迁移。

### Q5: 迁移后文件变大了？

**A**: 这是正常的。`@use` 会添加命名空间，但这提高了代码的可维护性和避免了命名冲突。

---

## 回滚步骤

如果迁移出现问题：

```bash
# 如果使用了 Git 分支
git checkout main
git branch -D sass-import-migration

# 如果有备份
rm -rf packages/admin-ui
mv packages/admin-ui.backup packages/admin-ui

# 恢复 Git 更改
git reset --hard HEAD
```

---

## 推荐的迁移顺序

1. **第一批**：基础文件（_variables.scss, _mixins.scss）
2. **第二批**：共享组件（core/src/shared/）
3. **第三批**：功能模块（catalog, customer, order 等）
4. **第四批**：页面组件

每批迁移后都进行测试。

---

## 性能优化建议

迁移完成后，可以进一步优化：

### 1. 使用 @forward 创建索引文件

**styles/index.scss**:
```scss
@forward 'variables';
@forward 'mixins';
@forward 'functions';
```

**组件文件**:
```scss
// 只需一个 @use
@use '../../styles' as *;
```

### 2. 按需导入

```scss
// 只导入需要的部分
@use 'variables' as * with (
    $primary-color: #custom-color  // 覆盖默认值
);
```

---

## 总结

**最简单的方法**：
```bash
npm install -g sass-migrator
cd packages/admin-ui
sass-migrator module --migrate-deps "src/**/*.scss"
npm run build
```

**最安全的方法**：
1. 创建 Git 分支
2. 运行迁移工具
3. 逐个测试
4. 提交更改

**时间估计**：
- 自动迁移：10-30 分钟
- 测试验证：30-60 分钟
- 手动修复：视问题而定

---

## 参考资源

- [Sass 模块系统文档](https://sass-lang.com/documentation/at-rules/use)
- [sass-migrator 工具](https://sass-lang.com/documentation/cli/migrator)
- [迁移指南](https://sass-lang.com/documentation/breaking-changes/import)
- [在线迁移工具](https://sass-lang.com/d/import)

---

**创建日期**: 2025-11-17
**适用版本**: Dart Sass 1.x → 3.0 迁移
