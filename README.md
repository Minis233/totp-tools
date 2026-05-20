# totp-tools

开源的 2FA / TOTP 在线工具集，零成本部署到 **Cloudflare Pages**。

## ✨ 功能

- **2FA 多账号管理器** — 本地保存多组账号，每 30 秒自动刷新；支持手动添加 Base32 密钥、扫码导入、相册图片识别、JSON 导入/导出、备注随时编辑、卡片重排序、二维码反向输出
- **文本处理** — 去重、排序、大小写转换、字数统计、Base64 / URL 编解码、JSON 美化
- **图片处理** — 拖拽 / 粘贴上传，缩放、压缩、转换 JPG / PNG / WEBP，转 Base64
- **汇率换算** — 实时汇率（数据来自 [Frankfurter / ECB](https://frankfurter.dev) 公开 API，免 Key）
- **更多工具** — UUID v4、安全密码生成、时间戳互转、SHA 系列哈希、二维码生成

## 🔒 隐私

所有功能 **完全在浏览器本地运行**，密钥、图片、文本均不向服务端上传。汇率页会请求 frankfurter.dev 拉取最新汇率（仅币种代码，无任何用户数据）。

## 🗂️ 目录

```
public/
├── index.html       # 2FA 多账号管理器
├── note.html        # 文本处理
├── work.html        # 图片处理
├── money.html       # 汇率换算
├── more.html        # 更多工具
├── _redirects       # Cloudflare Pages 路由（/2fa/* → index.html）
└── assets/
    ├── css/style.css
    ├── img/favicon.svg
    └── js/
        ├── common.js
        ├── otpauth.umd.min.js   # MIT, hectorm/otpauth 9.3.4
        ├── qrcode.min.js        # MIT, davidshimjs/qrcodejs
        └── jsQR.js              # Apache-2.0, cozmo/jsQR
```

无构建步骤；任意静态托管都能跑。

## 🚀 部署到 Cloudflare Pages

### 方式一：Wrangler 一键发布（推荐）

```bash
npx wrangler login              # 一次性登录
npx wrangler pages deploy ./public --project-name totp-tools
```

首次会问要不要创建 project，回车确认即可。后续推 commit 重新执行此命令即可发布。

### 方式二：连接 Git 仓库

1. 将仓库 push 到 GitHub。
2. 进入 [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com) → Create → Pages → Connect to Git。
3. 选择仓库，构建命令留空，Output directory 填 `public`。

### 方式三：GitHub Actions 自动部署

仓库已附带 `.github/workflows/deploy.yml`，只需在 GitHub 仓库设置中配置两个 Secrets：

- `CLOUDFLARE_API_TOKEN` — 在 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) 用 *Edit Cloudflare Workers* 模板创建
- `CLOUDFLARE_ACCOUNT_ID` — 仪表盘右下角 Account ID

push 到 `main` 后会自动部署到 Pages。

## 🛠 本地预览

```bash
cd public && python3 -m http.server 8080
```

打开 http://127.0.0.1:8080 即可。

## 📜 许可证

[MIT](LICENSE)。第三方资源：

- [otpauth](https://github.com/hectorm/otpauth) by Héctor Molinero Fernández — MIT
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) by Sangmin Shim — MIT
- [jsQR](https://github.com/cozmo/jsQR) by Daniel Cohen Gindi — Apache 2.0
