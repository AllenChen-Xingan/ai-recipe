# 部署指南

本文档提供了将禅意厨房部署到不同平台的完整指南。

## 目录
- [Vercel 部署](#vercel-部署)
- [GitHub Pages 部署](#github-pages-部署)
- [本地运行](#本地运行)

---

## Vercel 部署

### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 `ai-recipe`
4. 点击 "Import"

### 2. 配置环境变量（重要！）

在 Vercel 项目设置中添加环境变量：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：

```
Name: GEMINI_API_KEY
Value: 你的_Gemini_API_密钥
```

或者使用 `VITE_GEMINI_API_KEY`：

```
Name: VITE_GEMINI_API_KEY
Value: 你的_Gemini_API_密钥
```

### 3. 部署设置

Vercel 会自动检测到这是一个 Vite 项目。如果没有，手动配置：

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. 部署

点击 "Deploy"，Vercel 会自动构建和部署你的应用。

### 常见问题

#### 页面是空白的？

**原因**：通常是因为没有配置 API key。

**解决方案**：
1. 检查环境变量是否正确配置
2. 重新部署项目
3. 或者让用户在网页上输入自己的 API key（应用已支持此功能）

#### 如何获取 Gemini API Key？

访问 [Google AI Studio](https://aistudio.google.com/apikey) 免费获取。

---

## GitHub Pages 部署

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 Settings → Pages
3. Source 选择 "GitHub Actions"

### 2. 添加 API Key Secret（可选）

如果你想让所有访客都能使用你的 API key：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加：
   - Name: `GEMINI_API_KEY`
   - Secret: 你的 Gemini API 密钥

**注意**：如果不添加 secret，用户需要在网页上输入自己的 API key。

### 3. 触发部署

推送代码到 `main` 分支，GitHub Actions 会自动构建和部署：

```bash
git push origin main
```

### 4. 访问你的网站

部署完成后，访问：
```
https://你的用户名.github.io/ai-recipe/
```

### 更新 base 路径（如果需要）

如果你的仓库名不是 `ai-recipe`，需要更新 `vite.config.ts`：

```typescript
base: '/你的仓库名/'
```

---

## 本地运行

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/ai-recipe.git
cd ai-recipe
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，添加你的 API key：

```
GEMINI_API_KEY=你的_API_密钥
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm run preview
```

---

## 让其他人使用你的应用

### 方案 1：使用 GitHub Pages（推荐）

部署到 GitHub Pages 后，分享你的 GitHub Pages URL 给其他人：

```
https://你的用户名.github.io/ai-recipe/
```

**优点**：
- 完全免费
- 自动 HTTPS
- 自动从 GitHub 更新
- 用户可以输入自己的 API key

**缺点**：
- 如果不配置 API key secret，每个用户需要自己的 API key

### 方案 2：使用 Vercel

部署到 Vercel 后，分享 Vercel 提供的 URL：

```
https://你的项目名.vercel.app
```

**优点**：
- 自动从 GitHub 部署
- 更快的全球 CDN
- 更好的构建缓存

**缺点**：
- 免费版有使用限制（但个人使用足够）

### 方案 3：让用户自己部署

用户可以 Fork 你的仓库，然后部署自己的版本：

1. Fork https://github.com/你的用户名/ai-recipe
2. 添加自己的 API key
3. 部署到 GitHub Pages 或 Vercel

---

## 安全建议

### 不要在代码中硬编码 API Key

❌ **错误做法**：
```javascript
const apiKey = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX";
```

✅ **正确做法**：
```javascript
const apiKey = process.env.GEMINI_API_KEY;
```

### API Key 的存储位置

- **服务器端**（Vercel/GitHub Actions）：环境变量
- **客户端**（用户浏览器）：localStorage（由用户输入）

### 限制 API Key 使用

在 Google AI Studio 中，可以限制你的 API key：

1. 添加 HTTP referrer 限制（只允许你的域名使用）
2. 设置使用配额
3. 定期轮换 API key

---

## 故障排除

### 构建失败

检查：
1. `package.json` 中的依赖版本
2. Node.js 版本（推荐 v20+）
3. 构建日志中的错误信息

### 运行时错误

检查浏览器控制台（F12）：
1. 是否有 API key 错误？
2. 是否有 CORS 错误？
3. 是否有网络请求失败？

### GitHub Actions 失败

检查：
1. Workflow 文件语法是否正确
2. Secrets 是否正确配置
3. Pages 权限是否启用

---

## 支持

如果遇到问题：

1. 查看 [Issues](https://github.com/你的用户名/ai-recipe/issues)
2. 创建新 Issue 描述你的问题
3. 包含错误日志和截图

Happy cooking! 🍳
