# Vendure 快速启动指南 (macOS ARM)

## 环境要求

- Node.js >= 18
- pnpm
- PostgreSQL (本地已安装)

## 启动步骤

### 1. 安装依赖
```bash
pnpm install
```

### 2. 构建项目
```bash
pnpm build
```

### 3. 配置数据库
确保本地 PostgreSQL 服务已启动，并创建数据库：
```bash
createdb vendure-dev
```

### 4. 填充测试数据
```bash
cd packages/dev-server
DB=postgres pnpm populate
```

### 5. 启动开发服务器
```bash
DB=postgres pnpm dev
```

## 访问地址

- Admin UI: http://localhost:3000/admin
- Shop API: http://localhost:3000/shop-api
- Admin API: http://localhost:3000/admin-api

**默认管理员账号:**
- 用户名: `superadmin`
- 密码: `superadmin`
