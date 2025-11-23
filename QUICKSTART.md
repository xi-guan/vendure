# Vendure 快速启动指南 (macOS ARM)

## 环境要求

- Node.js >= 18
- npm
- Docker Desktop for Mac

## 启动步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 启动数据库
```bash
docker-compose up -d mariadb
```

### 4. 填充测试数据
```bash
cd packages/dev-server
npm run populate
```

### 5. 启动开发服务器
```bash
npm run dev
```

## 访问地址

- Admin UI: http://localhost:3000/admin
- Shop API: http://localhost:3000/shop-api
- Admin API: http://localhost:3000/admin-api

**默认管理员账号:**
- 用户名: `superadmin`
- 密码: `superadmin`

## 其他数据库选项

### PostgreSQL
```bash
docker-compose up -d postgres_16
cd packages/dev-server
DB=postgres npm run populate
DB=postgres npm run dev
```

### MySQL
```bash
docker-compose up -d mysql_8
cd packages/dev-server
npm run populate
npm run dev
```
