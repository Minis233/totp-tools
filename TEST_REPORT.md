# UI v4 重构与测试记录

日期：2026-07-14

## 回滚点

- 重构前 Git commit：`7a78c465a104d567529d1fdbf78a9fc7d5718075`
- 完整 Git bundle：`/var/minis/shared/totp-tools-backups/totp-tools-pre-refactor-20260714.bundle`
- 重构前源码压缩包：`/var/minis/shared/totp-tools-backups/totp-tools-pre-refactor-20260714.tar.gz`

恢复完整仓库：

```sh
git clone totp-tools-pre-refactor-20260714.bundle totp-tools-restored
```

## UI 重构

- 新增 `public/assets/css/ui-v4.css`，在原样式上提供非破坏式视觉覆盖。
- 重做色彩、间距、按钮、输入框、侧栏、账号卡片、移动端导航和深色主题。
- 增加 `prefers-reduced-motion` 支持。
- 修复 820px 以下布局断裂及横向溢出。

## 已修复问题

1. `/2fa/<KEY>` 深层路由使用相对资源路径，导致 CSS/JS 404。
2. 深层路由侧栏相对链接错误，SPA 导航不可用。
3. 汇率互换或更改来源币种时未真正更换基准数据，计算可能错误。
4. 汇率 API 非 2xx 响应未检测。
5. 搜索空结果直接拼接用户输入，存在 DOM 注入风险。
6. SPA 离开 2FA 页面后摄像头流可能继续运行。
7. 图片反复处理及切页时未释放旧 Blob URL。
8. 损坏的 `totp.accounts` 本地数据可能导致页面运行异常。
9. otpauth 二维码的算法、位数与周期参数缺少边界校验。
10. 超范围时间戳会触发 `toISOString()` 异常。
11. 自定义进制转换会接受 `102` 这类不合法二进制并部分解析。

## 回归测试

已在桌面及 390px 手机视口验证：

- 5 个页面均可加载并通过 SPA 导航切换。
- 深层 `/2fa/JBSWY3DPEHPK3PXP` 路由正确加载资源并预填密钥。
- 手机端无横向溢出。
- TOTP 账号可添加、保存并生成验证码。
- 搜索恶意 HTML 不执行、不创建图片节点。
- 文本去重输出正确。
- 非法时间戳显示错误提示且无脚本异常。
- 非法进制输入被拒绝。
- 汇率 API 加载成功，CNY/USD 互换后基准切换为 CNY。
- 图片工具及公共组件正常加载。
- `git diff --check` 通过。

摄像头真实扫码、文件下载和系统剪贴板受运行环境权限限制，已检查代码路径及资源清理逻辑，但仍建议上线后使用真实手机做一次权限验收。

## 汇率功能恢复补充

发现线上部署包含未提交到仓库 `main` 的新版汇率实现。现已恢复并纳入源码：

- Frankfurter / ECB：约 30 种主要法币，日更。
- open.er-api：全球约 166 种法币。
- Wise mid-market：通过 Cloudflare Pages Function `/api/wise-rates` 获取中间价，支持分批加载与缓存。
- 汇率来源切换、自动刷新、刷新倒计时、币种搜索、完整 A–Z 汇率表。
- “卡外币损耗”双模式：
  - 输入消费金额与银行实扣金额，计算损耗金额和比例。
  - 输入应付金额与损耗百分比，反算实际支付金额。
  - 支持消费币种与扣款币种不同，并可独立切换三种汇率来源。

验证结果：

- open.er-api 成功加载 166 种货币。
- 100 CNY、实扣 14.8 USD：中间价应扣 14.7493 USD，损耗 0.05065 USD，约 0.3434%。
- 100 CNY、损耗 1.5%、USD 支付：中间价 14.7493 USD，损耗 0.22124 USD，实付 14.9706 USD。
- 本地 Wise Function 测试成功返回 USD/CNY/EUR 汇率。
- 390px 手机视口无横向溢出。
