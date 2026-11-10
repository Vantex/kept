---
title: 安全模型
description: 运维需要了解的：Kept 如何隔离家庭、密封机密、处理登录，以及什么会离开服务器。
---

本页是运维视角下 Kept 威胁模型及其机制的摘要。开发者文档会更深入：[行级安全](/zh/developers/rls/)、[登录](/zh/developers/auth/) 与 [架构](/zh/developers/architecture/)。

## 由数据库隔离家庭

Kept 用四个登录连接 Postgres，每个只被允许完成自身职责所需的操作：

| 登录 | 使用者 | 允许的操作 |
|---|---|---|
| `kept_owner` | `kept migrate`、`kept admin`、夜间备份 | 拥有 schema；从不用于处理请求 |
| `kept_app` | 每个 Web 请求，含实例管理员路由 | 读写应用表，且始终受行级安全约束（`NOBYPASSRLS`，每张表 `FORCE` RLS） |
| `kept_auth` | 登录（Better Auth） | 仅其自身的 `auth` schema |
| `kept_system` | 跨家庭的后台任务（提醒扫描、保留策略）、设置码 | 仅显式的系统策略 |

每个请求都在指明已登录用户的事务中运行，每个策略都会询问一个函数：该用户属于哪些位置。未设置用户时，策略返回空，因此忘记作用域的代码路径会默认失败关闭。有一次覆盖 schema 的泄漏测试检查请求、认证与 worker 路径。深度见[行级安全](/zh/developers/rls/)。

对你的意义：除非你为备份提供所有者登录（[备份](/zh/admin/backups/#turning-it-on)），对外服务的容器从不持有它。实例管理员**在应用内无权**访问他人的位置；拥有数据库访问权的运维可以绕过这一点，因此数据库本身必须保持仅服务器可访问。

## 密钥与加密

- **`KEPT_SECRET_KEY`** 密封每个机密值：物品上的机密字段、AI 密钥、通知渠道设置、webhook 密钥、邮件收件箱密码、Paperless-ngx API 令牌、Web 推送私钥、备份密码。采用 AES-256-GCM，每行一个数据密钥，每个密文与其表、行、字段绑定，因此无法互相调换。
- **`KEPT_AUTH_SECRET`** 对会话与令牌签名。它与前者分离，以便各自独立轮换。
- **两者都未设置时在首次启动时生成**，写入配置卷（绝不写入数据卷），并用一行日志说明位置。可用 `kept admin gen-key` 自行设置；启动时拒绝短于 32 字节的密钥，也拒绝只设其一。
- **两者都不在数据库或备份中。** 请保存[恢复套件](/zh/admin/recovery-kit/)。没有密钥时，恢复会带回除机密值与 AI 密钥之外的一切。
- **轮换：** `kept admin rotate-key` 生成新密钥作为当前密钥并重新包装每个已密封的值；旧密钥作为退役版本保留，以便较旧的备份仍可打开。`--resume` 完成被中断的一次，`--drop <version>` 移除无人使用的退役密钥（[CLI](/zh/admin/cli/#commands)）。
- **邮箱密码只写不读：** 邮件收件箱的服务器、用户名与密码一起密封；页面只显示服务器与用户名，从不显示密码。
- **AI 密钥只写不读：** 保存后，Kept 只显示最后四个字符。
- **Paperless-ngx 令牌只写不读：** 位置的 Paperless 地址与令牌一起密封；页面只显示地址，从不显示令牌，浏览器也绝不会用它直接访问 Paperless。缩略图与下载经由 Kept，在 Kept 自身的访问检查之后提供。

## 登录

Kept 在自己的登录与 schema 上使用 Better Auth。账号可用的登录方式：

- **邮箱与密码。** 密码重置会让账号在所有位置退出登录；凭据变更时所有者会收到邮件。
- **通行密钥**，按 `KEPT_PUBLIC_URL` 的主机名注册。每个都必须验证用户（Face ID、指纹、PIN）且可被发现。
- **双因素**，使用身份验证器应用（TOTP）或已验证用户的通行密钥。邮件发送的一次性验证码绝不是第二因素。位置的所有者可以要求其中所有人启用双因素。没有密码的账号也可使用身份验证器应用。
- **Settings → Sign-in and security** 可添加、重命名、移除通行密钥，以及开启身份验证器应用、生成新的备用验证码、重新设置、关闭（[Sign-in and security](/zh/users/sign-in-security/)）。每次变更都需要密码，或无密码账号在最近十分钟内的登录（重命名除外），并会让其他所有设备退出登录（重命名除外）。服务器会拒绝移除最后一种登录方式，也会在位置要求双因素且账号没有通行密钥时拒绝关闭双因素。重新设置应用后，旧密钥仍有效，直到新密钥产出的验证码被验证。
- **魔术链接**仅对已有账号有效（不开放注册），有效期 15 分钟。邮件中的令牌放在链接的 `#fragment` 中，由页面发起 POST 消耗，因此打开链接的邮件扫描器无法用掉它们；只存储哈希。
- **用户名**，用于托管账号（没有邮箱地址的人）。
- **OIDC**，当设置了 `KEPT_OIDC_ISSUER` 与 `KEPT_OIDC_CLIENT_ID` 时（[配置](/zh/reference/configuration/)）。外部身份绝不会仅因邮箱匹配就关联到账号；新用户通过邀请，或通过允许的域名或组进入。身份提供方的令牌从不存储。
- **Google**，当设置了 `KEPT_GOOGLE_CLIENT_ID` 与 `KEPT_GOOGLE_CLIENT_SECRET` 时，使用 Admin → Status 显示的重定向 URI。规则与 OIDC 相同，但没有人能仅凭域名进入：只有已关联 Google 的现有账号，或被邀请的人。
- **关联与解除关联**外部登录在 Settings → Me → Sign-in methods 中进行。关联需要最近十分钟内的登录；解除关联需要密码（或无密码账号的那次近期登录）。账号至少保留一种登录方式。

**会话**在 HTTPS 下持续 30 天，每日使用延长一次，使用带 `Secure`、`__Secure-` 前缀的 cookie。纯 HTTP 下持续 12 小时且从不延长，Kept 会拒绝暴露或修改机密的操作（[HTTPS](/zh/install/https/)）。敏感操作会再次要求密码，或最近十分钟内的登录；续登不会重置那十分钟。

`KEPT_HTTP_SIGN_IN_DAYS`（1 到 30，默认未设置）允许运行服务器的人让纯 HTTP 下的登录持续指定天数，并随使用续期。它是唯一放宽此限制的设置，无法在应用内修改，且在 HTTPS 下不起作用。HTTP 下机密仍被拒绝，十分钟仍存在，“全部退出登录”仍会结束所有登录。代价是：纯 HTTP 下登录 cookie 可被任何能看到流量的人复制；开启该设置后，被复制的 cookie 会一直可用直到被使用过并到期，或该设备退出登录、或你的其他设备被退出登录（[Staying on your network](/zh/install/home-network/#staying-on-your-network)）。

**来自其他站点的请求**会被拒绝：携带 Kept cookie 的写请求必须来自 `KEPT_PUBLIC_URL` 的源，否则在读取会话之前就会得到 403。首次运行的初始化也一样（尚无 cookie），在其设置码被尝试之前。

`KEPT_EXTRA_ADDRESSES`（默认未设置）允许运行服务器的人列出其他与 Kept 等效的精确源。它们在启动时读取一次，并与浏览器的 `Origin` 整体比较；`Host` 与 `X-Forwarded-*` 不参与。通配符或混用 `http` 与 `https` 会阻止启动。拒绝信息会点名 `KEPT_PUBLIC_URL` 而绝不列出该列表。通行密钥、外部登录、OAuth 与所有链接都固定在 `KEPT_PUBLIC_URL`：无论请求如何声明，通行密钥都按该地址校验。代价是：在被列出地址上提供的页面可以代表该处已登录的人行事（[More than one address](/zh/install/home-network/#more-than-one-address)）。

页面以 `default-src 'self'` 内容安全策略提供，不可被 frame，且当公开 URL 为 HTTPS 时启用 HSTS，除非 `KEPT_HSTS=off`（[HSTS](/zh/install/reverse-proxy/#hsts)）。

## 速率限制

按当前实现：

| 对象 | 限制 |
|---|---|
| 登录尝试 | 每地址每分钟 5 次；按账号与地址每小时 20 次，第四次失败后延迟递增（最多 5 分钟），而非锁定 |
| 其他认证路由 | 每地址每路由每分钟 100 次 |
| API 与 MCP，按令牌 | 每分钟 120 次读、30 次写 |
| 密码重置与魔术链接 | 每账号每小时 3 次 |
| 分享链接页面 | 每链接每分钟 60 次浏览 |

限制保存在数据库中，因此副本共享它们。客户端地址来自 socket，或仅当连接来自 `KEPT_TRUSTED_PROXIES` 中的地址时才取自 `X-Forwarded-For`（[反向代理](/zh/install/reverse-proxy/#trust-the-proxy-and-only-the-proxy)）。

## 出站请求（SSRF）

Kept 只访问有人配置过的地址：AI 提供商的 base URL、webhook、推送、OIDC 签发方、OAuth 客户端元数据、用于导入的 Homebox 服务器、条码查询、更新检查、位置的邮件收件箱（IMAP）以及位置的 Paperless-ngx。每个都经过同一防护（[`apps/server/src/net/ssrf.ts`](https://github.com/keptinventory/kept/blob/main/apps/server/src/net/ssrf.ts)）：

- 地址在**建立连接时**检查（名称解析之后），因此在检查与请求之间改名的名称无法溜过去；
- 拒绝私有、回环、链路本地（含云元数据地址）、运营商级 NAT、组播与保留网段，IPv4 与 IPv6；
- 拒绝重定向，因此公网主机无法把请求弹回内网。

被拒绝的地址返回 `400 private_address`。在自托管服务器上，实例管理员可以允许私有地址（**Admin → Settings → Allow private addresses**），你网络上的提供商（如 [Ollama](/zh/admin/ollama/)）需要它。默认关闭。

## 恶意输入

导入与上传按敌对内容处理。默认值：

| 限制 | 默认 |
|---|---|
| 导入 ZIP | 解压后 5 GB，每条目压缩比 100:1，200,000 个条目，无符号链接 |
| 图片 | 解码最大 100 百万像素，在 3 GB 内存或低于 3 GB 的容器上限下一次一个 |
| PDF | 在子进程中解析，20 秒、256 MB |
| 上传 | `KEPT_MAX_FILE_MB`（默认 25 MB），在读取请求体之前拒绝 |

存储的文件通过路径上不读取会话的五分钟签名链接获取，带 `nosniff` 与 `default-src 'none'; sandbox` 策略，且除非是 Kept 自己重编码的 JPEG，一律作为下载处理。导出 CSV 中以公式样式开头的单元格会被中和。

## 什么会离开服务器

- **关于 Kept 自身的什么都不会。** 没有任何类型的遥测；登录库自身的遥测已关闭。链路追踪与错误上报只发送给你配置的收集器（[监控](/zh/admin/observability/#tracing-and-error-reporting)）。
- **更新检查默认关闭。** 开启后，每天向 GitHub 询问一次最新版本，除请求本身外不发送任何内容（[升级](/zh/admin/upgrades/#knowing-theres-a-new-version)）。
- **AI 提供商能看到什么**（当位置使用它时）：作为移除 EXIF 与 XMP 后的重编码副本的照片（Kept 会拒绝仍带这些元数据的图片）、用于提取的固定提示词与位置语言、助手场景下提问者角色允许的问题与工具结果，以及用于语义搜索的描述性字段。**绝不含机密值**，搜索也绝不含金额。Kept 对每次调用的自身记录只存令牌与成本，绝不存提示词、图片、回复或密钥。参见 [AI 提供商](/zh/users/ai-providers/)。
- **分享链接**（`/s/<token>`）是任何人都无需登录即可打开的唯一页面。令牌为 32 字节随机数，只显示一次并以其 SHA-256 存储；它绝不会进入日志行。页面通过一个数据库函数读取，该函数接收令牌哈希，只返回名称、类型、物品所在位置、数量、状况、备注与照片，对应共享的箱子、位置或该位置中的搜索。照片为移除 GPS 的预览，以五分钟签名 URL 提供，且仅针对那些物品。链接在被吊销或过期时停止，或在创建者不再管理该位置时停止；每次浏览都会检查。
- **备份**是 restic 快照，在离开前用至少 12 个字符的密码加密；没有密码就没有备份（[备份](/zh/admin/backups/)）。

## 报告漏洞

在仓库上使用 GitHub 的**私密漏洞报告**（**Security** 标签 → **Report a vulnerability**）；这是唯一渠道，没有安全邮箱。请不要开公开 issue。[SECURITY.md](https://github.com/keptinventory/kept/blob/main/SECURITY.md) 有细节与支持版本，自 1.0 起适用。若要确认镜像确为维护者构建的那一个，参见[验证发布](/zh/admin/verify-release/)。
