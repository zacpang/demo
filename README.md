# WooshPay Demo Portal（Cursor 脚手架）

**适配 Cursor**：内置 ESLint/Prettier、Tailwind、React Router、Vercel SPA 配置。

## 使用步骤（Cursor）
1. Cursor 打开项目 → 右下角选择 Node 18+。
2. 打开内置终端：
   ```bash
   npm i
   npm run dev
   ```
3. 将你已有的页面粘贴到 `src/pages/*`。
4. 开发完成后：
   ```bash
   npm run build
   ```
   将 `dist/` 用于 Vercel 部署（或直接把仓库导入 Vercel）。

## 常用脚本
- `npm run dev`、`build`、`preview`、`typecheck`、`lint`、`format`

## Vercel
- 导入仓库 → Framework 自动识别 Vite → 构建 `vite build`，输出目录 `dist/`。
- 已包含 `vercel.json`，确保前端路由回退到 `/`（SPA）。

## 编辑体验
- `.vscode/settings.json` 已启用保存自动格式化与 ESLint 修复。
- `.vscode/extensions.json` 推荐的扩展与 Cursor 兼容。
- 主题：浅灰背景 + 蓝/绿强调色（与既定风格一致）。
