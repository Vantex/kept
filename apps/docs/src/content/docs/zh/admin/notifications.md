---
title: 邮件、推送与日历订阅
description: 为 Kept 服务器配置外发邮件与 Web 推送，以及运维需要了解的私密日历链接相关事项。
---

Kept 通过 **邮件**、面向浏览器或已安装应用的 **Web 推送**、**ntfy**、**Telegram**、**Apprise**，以及用户日历应用订阅的**日历订阅源**触达应用外的用户。所有内容也会进入应用内通知中心，无需额外配置。用户在 **Settings → Notifications**（Reminders and alerts → **Open**）中选择希望接收的内容。本页是运维侧说明。所有变量都列在[配置参考](/zh/reference/configuration/)中。

## 邮件

| 变量 | 作用 |
|---|---|
| `KEPT_SMTP_URL` | SMTP 服务器，格式为 `smtp://` 或 `smtps://`，需要时附带凭据：`smtps://user:password@mail.example.org:465`。 |
| `KEPT_SMTP_FROM` | 每封邮件的发件人。默认：`Kept <no-reply@<你的 KEPT_PUBLIC_URL 主机>>`。大多数提供商只允许以其已验证的地址发信，请务必设置。 |

使用 Compose 时，把两者放入 `.env`；`compose.yaml` 会传给 `kept` 与 `migrate`。使用 Helm chart 时，`smtp.existingSecret` 指定持有 `KEPT_SMTP_URL` 的 Secret，`smtp.from` 设置发件人。Kept 每封邮件打开一个连接；nodemailer 自身的 URL 选项（如 `?pool=true`）可通过 URL 传入。

### 未设置 `KEPT_SMTP_URL` 时

邮件只会记录为“待发送”：每封邮件一条警告 `mail not sent: no mail transport is configured`，标明邮件类型，但从不包含地址、链接或令牌。**Admin → Status** 显示 **Mail: Not configured** 与提示 **Mail isn't configured**。没有邮件就没有登录链接、密码重置、邮件邀请、邮件告警或邮件报告。链接邀请与密码仍可用，提醒仍会通过推送和应用内触达用户。Print inventory 中的 **Email it to me** 与 **Send it again** 被锁定，所有者与管理员会得到指向本页的 **Set up email** 链接；API 会以 409 `mail_not_configured` 拒绝 `email: true` 与报告计划。

配置邮件后，地址未验证的账号在验证前无法添加通行密钥或身份验证器应用。

### Kept 会发送什么

每封邮件以文本与 HTML 发出，语言跟随收件人（Kept 不了解时用英语）。链接的令牌放在 `#` 之后，因此邮件扫描器或服务器日志中不会留下可用令牌。

- **登录与账号**：登录链接、密码重置、确认与验证新邮箱地址以及给旧地址的通知、有人尝试用已有账号的地址注册时的通知，以及凭据变更提醒：密码、添加或移除通行密钥、解除外部登录关联、开启/重新设置/关闭双因素、新的备用验证码，以及用备用验证码登录（含时间、设备与剩余验证码）。
- **人员与位置**：邮件邀请；给位置的所有者发送每位新成员或托管账号、以及每项成员关系到期的通知。
- **透明性**：实例管理员（或 `kept admin`）对某人账号采取操作时；以及实例的 OIDC 登录、外发邮件或默认 AI 提供商变更时，通知每位活跃用户。
- **提醒**：逾期项立即提醒、每日摘要、渠道测试，以及某人的 webhook 持续失败时的通知。
- **AI**：月度上限达到 80% 或 100% 时，以及可选的每月 AI 摘要。
- **给实例管理员**：管理告警，每种告警每天最多一次（[状态页与告警](/zh/admin/observability/#the-status-page-and-alerts)）。

### 更换邮件服务器

Kept 每次启动时会把 SMTP 主机与发件人与上次所见进行比较，从不比较密码。若任一发生变化，变更会被审计，并通过新途径通知每位活跃用户。首次配置邮件后的启动只记录配置，不告警。

## Web 推送

推送**不需要你提供任何密钥**。首次启动时 Kept 会生成一对 VAPID 密钥并保存在数据库中，私钥用 `KEPT_SECRET_KEY` 密封。若要自带密钥对，需同时设置：

| 变量 | 作用 |
|---|---|
| `KEPT_VAPID_PUBLIC_KEY` | 公钥：65 字节的无填充 base64url，与 web-push 的 `generateVAPIDKeys()` 输出格式一致。 |
| `KEPT_VAPID_PRIVATE_KEY` | 对应私钥（32 字节，相同编码）。从不写入日志。只设其一而缺其二会导致 Kept 启动失败。 |
| `KEPT_VAPID_SUBJECT` | 推送服务可联系的对象：`https:` URL 或 `mailto:` 地址。默认：当 `KEPT_PUBLIC_URL` 为 `https` 时为其本身，否则为 `mailto:` 加 `KEPT_SMTP_FROM` 地址。 |

以下情况下推送**不可用**：

- `KEPT_PUBLIC_URL` 在非 localhost 上为纯 `http`：浏览器只在安全页面上订阅。用户会看到 “Push needs HTTPS.”（[HTTPS](/zh/install/https/)）
- 没有 subject：既无 `KEPT_VAPID_SUBJECT`，也无 `https` 公开 URL，也无 `KEPT_SMTP_FROM`。用户会看到 “Push isn't set up on this server.”

无论哪种情况，邮件与通知中心仍然可用。

用户在浏览器询问后，在每台设备上通过 **How Kept reaches you** 下的 **Enable** 开启推送。**在 iPhone 与 iPad 上，通知仅来自已安装的应用**：Kept 会说明并提供 **How to install**（[手机应用](/zh/users/phone-app/)）。

离开服务器的内容：Kept 通过 HTTPS 把每次推送给浏览器订阅的推送服务，因此需要出站互联网访问；私有与本地地址会被拒绝。推送包含标题、一行文字和一个链接，小于 3 KB，绝不含金额或联系方式。设备离线时推送服务最多保留一天。推送服务报告已失效的订阅会被删除。

:::caution[丢失密钥]
若存储的私钥无法打开（密封它的密钥已丢失），Kept 会生成新的密钥对并丢弃所有推送订阅。其他内容不会丢失：用户在每台设备上重新开启推送即可。保存好[恢复套件](/zh/admin/recovery-kit/)，恢复或[迁移](/zh/admin/move-server/)时就不会发生这种情况。
:::

## ntfy 与 Telegram

用户在 Settings → Me → Notifications 中自行添加；服务器上无需配置。Kept 会向 ntfy 服务器的 JSON 端点和 Telegram Bot API（`api.telegram.org`）发布，两者同时进行，并与 webhook 相同的防护：私有地址上的 ntfy 服务器仅在 **Allow private addresses** 开启（Admin → Settings）时可用，且拒绝重定向。它们的设置（ntfy 主题与令牌、Telegram 机器人令牌）像 webhook 密钥一样加密，并受[密钥轮换](/zh/admin/recovery-kit/)保护。发送失败会随提醒重试，并把渠道标为 “Failing since”；下次发送成功后清除。管理告警不会发到它们。

## Apprise

[Apprise](https://github.com/caronc/apprise) 可触达 Discord、Slack、Matrix、Signal、Pushover 等 100 多种服务。Kept 与你在其旁边运行的 **Apprise API** 服务器通信，且仅当 `KEPT_APPRISE_URL` 指向它时才向用户提供 **Add Apprise**：

```yaml
# compose.yaml, beside the kept service
  apprise:
    image: caronc/apprise:2.0.0
    restart: unless-stopped

# and in the kept service's environment
KEPT_APPRISE_URL: http://apprise:8000
```

- 每个人添加自己的 **Apprise URLs**（一个或多个，如 `discord://…` 或 `mailto://…`）。它们像 webhook 密钥一样加密，不再显示，并受[密钥轮换](/zh/admin/recovery-kit/)保护。
- Kept 使用 Apprise API 的无状态 `POST /notify/`，并在每条消息中发送 URL，因此 Apprise 服务器不保留任何内容。它有意在你的私有网络上可达，并拒绝重定向。
- Apprise 的通用 `json://`、`xml://` 与 `form://` URL（及其 `s` 形式）可指向任何主机，包括你网络中的机器，因此除非 **Allow private addresses** 开启（Admin → Settings），Kept 会拒绝它们。
- 发送失败（服务拒绝时 Apprise 返回 424）会随提醒重试，并把渠道标为 “Failing since”。管理告警不会发到 Apprise。

## 日历订阅源

每个人可以在 **Settings → Notifications → Calendar feed → Create a link** 中生成一条私密的 iCal 链接，包含到期事项与即将过期事项。服务器上无需配置。

- **包含内容**：从一个月前到未来 13 个月的全天事件，跨该用户的所有位置：标题、位置路径、位置名称以及进入 Kept 的链接。绝不含金额、机密、备注或任何人的联系方式。只包含该用户在某些渠道上会收到的类型，且不含位置已关闭的 Kept 模块内容。要求双因素的位置会被排除。
- **链接**：`https://kept.example.org/cal/<token>.ics`，只显示一次。Kept 只存储令牌的 SHA-256，并在请求日志中做脱敏。链接在创建时基于 `KEPT_PUBLIC_URL` 构建，因此地址变更前创建的链接仍指向旧地址。
- **谁可读取**：任何持有链接的人，无需登录。未知或已吊销的链接、或属于已禁用账号的链接，一律返回 404 且不说明原因。每个链接每分钟最多可被请求 60 次。
- **吊销**：链接上的 **Revoke** 会永久终止；已订阅的日历将停止更新。列表会保留被吊销的行，并显示每个有效链接最近一次被拉取的时间。每人最多可持有 3 个有效链接。

Google Calendar 从 Google 的服务器拉取该链接，因此只有在互联网能访问 Kept 时它才可用。
