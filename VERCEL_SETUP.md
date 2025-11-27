# Vercel 连接 NeonDB 配置指南

## ✅ 推荐方案: 使用 API 路由（安全）

已创建 Vercel Serverless Functions API 路由，数据库连接字符串不会暴露给客户端。

### 步骤：

1. **在 Vercel 控制台设置环境变量**：
   - 进入你的 Vercel 项目：https://vercel.com/dashboard
   - 点击项目 → **Settings** → **Environment Variables**
   - 添加新变量：
     - **Name**: `DATABASE_URL`
     - **Value**: 你的 NeonDB 连接字符串
       ```
       postgresql://neondb_owner:npg_Ze0yU8GdlCxb@ep-long-heart-ab9b1fqo-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
       ```
     - 选择环境：**Production**, **Preview**, **Development**（全选）
     - 点击 **Save**

2. **重新部署**：
   - 在 Vercel 控制台点击 **Deployments**
   - 找到最新的部署，点击 **...** → **Redeploy**
   - 或者推送代码到 GitHub，Vercel 会自动部署

### API 路由：

- `GET /api/photos` - 获取所有照片
- `POST /api/photos` - 保存新照片
- `POST /api/photos/init` - 初始化数据库表

### 客户端使用：

代码已更新为使用 `utils/api.ts`，它会自动调用这些 API 路由。

---

## 方案 2: 客户端直接连接（不推荐）

如果需要客户端直接连接（不推荐，因为不安全）：

1. 在 Vercel 中设置环境变量 `VITE_DATABASE_URL`（注意 VITE_ 前缀）
2. 使用 `utils/db.ts` 中的函数（已配置但未使用）

⚠️ **警告**：这种方式会将数据库连接字符串暴露在客户端代码中！

