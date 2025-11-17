# Prisma ORM 阻塞问题解决指南

## 🔴 问题描述

在当前环境中，Prisma Client 生成失败，错误信息：

```
Error: Failed to fetch sha256 checksum at
https://binaries.prisma.sh/.../libquery_engine.so.node.gz.sha256 - 403 Forbidden
```

**根本原因**：网络限制导致无法访问 Prisma 的二进制文件服务器 (binaries.prisma.sh)。

---

## ✅ 解决方案（按推荐顺序）

### **方案 1：使用有网络访问的环境** ⭐ 最佳方案

这是最简单、最可靠的解决方案。

#### 步骤：

1. **在有网络访问的机器上**（本地开发环境或其他服务器）：

```bash
# Clone 代码库
git clone https://github.com/xi-guan/vendure.git
cd vendure
git checkout claude/prisma-migration-status-01Fda2wBNugN7XmT8nZhmtKa

# 安装依赖（会自动生成 Prisma Client）
npm install

# 或者手动生成
cd packages/core
npm run prisma:generate
```

2. **将生成的文件复制回受限环境**：

```bash
# 需要复制以下文件/目录：
# 1. node_modules/@prisma/client/
# 2. node_modules/.prisma/
# 3. packages/core/node_modules/@prisma/client/ (如果存在)
# 4. packages/core/node_modules/.prisma/ (如果存在)

# 打包命令示例
tar -czf prisma-generated.tar.gz \
  node_modules/@prisma \
  node_modules/.prisma \
  packages/core/node_modules/@prisma \
  packages/core/node_modules/.prisma
```

3. **在受限环境中解压**：

```bash
tar -xzf prisma-generated.tar.gz
```

**优点**：
- ✅ 100% 可靠
- ✅ 生成的文件可以正常使用
- ✅ 不需要修改代码

**缺点**：
- ⚠️ 需要访问另一个环境
- ⚠️ 每次更新 schema 都需要重新生成和复制

---

### **方案 2：临时禁用 postinstall 钩子** ⭐ 开发推荐

如果你在开发阶段不需要运行 Prisma 相关的代码，可以暂时禁用 Prisma Client 生成。

#### 步骤：

1. **修改 `packages/core/package.json`**：

```json
{
  "scripts": {
    // "postinstall": "npm run prisma:generate",  // 注释掉这一行
    "postinstall": "echo 'Prisma generate skipped due to network restrictions'",
    // ... 其他脚本保持不变
  }
}
```

2. **创建一个 Mock Prisma Client**（用于开发）：

```bash
mkdir -p packages/core/node_modules/.prisma/client
cat > packages/core/node_modules/.prisma/client/index.js << 'EOF'
// Mock Prisma Client for development without network access
module.exports = {
  PrismaClient: class PrismaClient {
    constructor() {
      console.warn('Using mock Prisma Client - network generation unavailable');
    }
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
  }
};
EOF

# 创建 TypeScript 类型定义
cat > packages/core/node_modules/.prisma/client/index.d.ts << 'EOF'
export class PrismaClient {
  constructor();
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}
EOF
```

3. **重新安装依赖**：

```bash
npm install
```

**优点**：
- ✅ 允许项目正常构建
- ✅ 可以继续开发 TypeORM 相关代码
- ✅ 不会因为 Prisma 生成失败而阻塞

**缺点**：
- ⚠️ 无法运行 Prisma 相关的测试
- ⚠️ 无法使用 Prisma 功能

---

### **方案 3：使用 Docker 容器生成** 🐳

如果有 Docker 访问权限，可以在容器中生成 Prisma Client。

#### 步骤：

1. **创建 Dockerfile**：

```dockerfile
# Dockerfile.prisma-generate
FROM node:18-alpine

WORKDIR /app

# 复制必要文件
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/core/prisma ./packages/core/prisma

# 安装依赖（会触发 prisma generate）
RUN npm install

# 保持容器运行以便复制文件
CMD ["sh"]
```

2. **构建并运行容器**：

```bash
# 构建镜像
docker build -f Dockerfile.prisma-generate -t vendure-prisma-gen .

# 运行容器
docker run -d --name prisma-gen vendure-prisma-gen

# 复制生成的文件
docker cp prisma-gen:/app/node_modules/@prisma ./node_modules/
docker cp prisma-gen:/app/node_modules/.prisma ./node_modules/

# 清理
docker stop prisma-gen
docker rm prisma-gen
```

**优点**：
- ✅ 隔离的环境
- ✅ 可重复的过程
- ✅ 不影响主机环境

**缺点**：
- ⚠️ 需要 Docker 访问权限
- ⚠️ Docker 也可能有网络限制

---

### **方案 4：使用 Prisma Data Proxy**（云方案）

如果可以访问云服务，可以使用 Prisma Data Proxy，这样不需要本地引擎。

#### 步骤：

1. **在 Prisma Cloud 创建 Data Proxy**：

访问 https://cloud.prisma.io（需要外网访问）

2. **修改 `packages/core/prisma/schema.prisma`**：

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["dataProxy"]  // 添加这一行
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // 使用 Data Proxy URL 而不是直接数据库连接
}
```

3. **设置环境变量**：

```bash
export DATABASE_URL="prisma://your-data-proxy-url"
```

**优点**：
- ✅ 不需要本地引擎文件
- ✅ 云端管理

**缺点**：
- ⚠️ 需要 Prisma Cloud 账户
- ⚠️ 可能有延迟
- ⚠️ 需要外网访问设置

---

### **方案 5：使用 NPM 镜像/代理**

如果有可用的 NPM 镜像或代理服务器。

#### 步骤：

1. **配置 NPM 代理**：

```bash
# 设置代理
npm config set proxy http://your-proxy-server:port
npm config set https-proxy http://your-proxy-server:port

# 或者设置环境变量
export HTTP_PROXY=http://your-proxy-server:port
export HTTPS_PROXY=http://your-proxy-server:port
```

2. **尝试生成**：

```bash
cd packages/core
npm run prisma:generate
```

**优点**：
- ✅ 如果代理可用，这是最直接的方案

**缺点**：
- ⚠️ 需要配置代理服务器
- ⚠️ Prisma binaries 可能不走 npm 代理

---

### **方案 6：手动下载引擎文件**（高级）

在有网络的环境中手动下载 Prisma 引擎文件。

#### 步骤：

1. **确定需要的引擎版本**：

从错误消息中提取 commit hash：
```
2ba551f319ab1df4bc874a89965d8b3641056773
```

2. **在有网络的机器上下载**：

```bash
# 下载所需的引擎文件
ENGINE_VERSION="2ba551f319ab1df4bc874a89965d8b3641056773"
PLATFORM="debian-openssl-3.0.x"

# 需要下载的文件：
# 1. libquery_engine.so.node.gz
# 2. schema-engine.gz (或 prisma-fmt.gz)

wget https://binaries.prisma.sh/all_commits/$ENGINE_VERSION/$PLATFORM/libquery_engine.so.node.gz
wget https://binaries.prisma.sh/all_commits/$ENGINE_VERSION/$PLATFORM/schema-engine.gz

# 解压
gunzip libquery_engine.so.node.gz
gunzip schema-engine.gz
chmod +x schema-engine
```

3. **设置 Prisma 使用本地引擎**：

修改 `packages/core/prisma/schema.prisma`：

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../../../node_modules/.prisma/client"

  // 指定本地引擎路径
  engineType    = "binary"
  binaryTargets = ["native"]
}
```

4. **设置环境变量**：

```bash
# 指定引擎文件路径
export PRISMA_QUERY_ENGINE_BINARY="/path/to/libquery_engine.so.node"
export PRISMA_MIGRATION_ENGINE_BINARY="/path/to/schema-engine"
export PRISMA_INTROSPECTION_ENGINE_BINARY="/path/to/schema-engine"
export PRISMA_FMT_BINARY="/path/to/schema-engine"

# 跳过下载
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
```

5. **手动生成 Prisma Client**：

```bash
cd packages/core
npx prisma generate --schema=./prisma/schema.prisma
```

**优点**：
- ✅ 完全离线工作
- ✅ 可控性强

**缺点**：
- ⚠️ 复杂度高
- ⚠️ 需要精确匹配版本
- ⚠️ 维护成本高

---

## 🎯 推荐的实施路径

### 短期解决方案（立即可用）：

**方案 2**：禁用 postinstall，创建 Mock Prisma Client
- 允许项目继续构建
- 可以继续开发 TypeORM 相关代码
- 不阻塞其他工作

### 中期解决方案（本周内）：

**方案 1**：在有网络的环境中生成
- 最可靠的方案
- 可以正常运行测试
- 一次性生成，多次使用

### 长期解决方案（架构优化）：

考虑以下选项：
1. **双 ORM 策略**：保持 TypeORM 作为主要 ORM，Prisma 作为可选增强
2. **CI/CD 集成**：在 CI/CD 环境中生成 Prisma Client，作为构建产物
3. **容器化**：使用 Docker 确保一致的构建环境

---

## 📝 验证 Prisma Client 是否成功生成

运行以下命令验证：

```bash
# 检查 Prisma Client 是否存在
ls -la node_modules/.prisma/client/

# 检查生成的类型定义
ls -la node_modules/@prisma/client/

# 尝试导入（Node.js）
node -e "const { PrismaClient } = require('@prisma/client'); console.log('✅ Prisma Client loaded successfully');"

# 运行测试
cd packages/core
npm test -- customer-adapter.spec.ts
```

---

## 🔧 故障排查

### 问题：生成后仍然报错 "Cannot find module '@prisma/client'"

**解决方案**：

```bash
# 检查 schema.prisma 中的 output 路径
cat packages/core/prisma/schema.prisma | grep "output"

# 确保输出路径正确
# output = "../../../node_modules/.prisma/client"  ✅ 正确
# output = "./generated/client"                     ❌ 错误位置

# 重新生成到正确位置
cd packages/core
npx prisma generate --schema=./prisma/schema.prisma
```

### 问题：Platform mismatch 错误

**解决方案**：

```bash
# 检查系统架构
uname -m

# 在 schema.prisma 中添加正确的 binaryTargets
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
}
```

### 问题：版本不匹配

**解决方案**：

```bash
# 确保 Prisma CLI 和 Client 版本一致
npm list prisma @prisma/client

# 如果版本不一致，重新安装
npm install prisma@6.2.0 @prisma/client@6.2.0 --save-exact
```

---

## 📚 相关文档

- [PRISMA_MIGRATION_STATUS.md](./PRISMA_MIGRATION_STATUS.md) - 迁移进度
- [PHASE2_PRISMA_MIGRATION.md](./PHASE2_PRISMA_MIGRATION.md) - 迁移策略
- [packages/core/prisma/README.md](./packages/core/prisma/README.md) - Prisma 配置指南

---

## 🆘 需要帮助？

如果以上方案都无法解决问题，请提供以下信息：

1. 当前运行的环境（OS、Node 版本）
2. 网络限制的具体情况
3. 错误日志的完整输出
4. 是否可以访问其他环境

```bash
# 收集诊断信息
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "Prisma CLI: $(npx prisma --version)"
cd packages/core
npx prisma validate --schema=./prisma/schema.prisma
```

---

**最后更新**：2025-11-17
**状态**：网络限制导致 Prisma 生成阻塞，推荐使用方案 1 或方案 2
