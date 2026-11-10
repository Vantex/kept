---
title: Webhook
description: "物品变更时向你自己的服务器发送带签名的 POST：事件、负载、校验签名、投递与重试，以及密钥。"
---

**Webhook** 是 Kept 在位置中发生某事时向你选择的地址发 POST：物品被添加、移动或移入回收站，记录了读数，提醒到期。每个 POST 都带签名，因此你的服务器可以确认它来自 Kept。它携带 id 与被更改字段的名称，绝不携带字段值：要看物品本身，请你的服务器用其自己的令牌从 [API](/zh/api/) 获取。

所有者与管理员在**位置设置 → Webhook** 管理位置的 webhook：**添加 webhook**、地址，以及它接受的事件。**设置 → 连接**列出你在各位置管理的 webhook。

## 事件

| 事件 | 发送时机 |
|---|---|
| `thing.created` | 物品被添加 |
| `thing.updated` | 物品被更改 |
| `thing.moved` | 物品被移动 |
| `thing.trashed` | 物品进入回收站 |
| `thing.restored` | 物品从回收站恢复 |
| `thing.lifecycle_changed` | 物品状态变更，如丢失或售出 |
| `reading.logged` | 记录了仪表读数 |
| `reminder.due` | 提醒到期 |

每个负载字段相同：

```json
{
  "id": "evt_…",
  "event": "thing.updated",
  "occurred_at": "2026-10-03T09:12:44.000Z",
  "location_id": "…",
  "entity": { "type": "thing", "id": "…" },
  "changed_fields": ["…"],
  "actor": { "type": "user", "id": "…" }
}
```

`entity.type` 为 `thing`、`reading` 或 `reminder`（测试时为 `webhook`）；`changed_fields` 列出写入更改的字段，提醒时为空；`actor.type` 为 `user`、`token` 或 `system`。

**发送测试**会 POST 一个 `ping` 事件，只发一次、不重试，并显示你的服务器响应的状态：检查新地址最快的方式。

## 校验签名

每次投递都带 `Kept-Signature` 头：

```
Kept-Signature: t=1792700000,v1=<64 hex characters>
```

`t` 是签名时刻（Unix 秒）。`v1` 是以 webhook 密钥对 `<t>.<body>` 计算的 HMAC-SHA256：时间戳、一个点，然后是精确的请求体。你的服务器计算相同的 HMAC，与 `v1` 常数时间比较，并拒绝过旧的 `t`（例如超过五分钟）。密钥对话框中有现成的**校验投递（Node.js）**代码片段。

## 密钥

签名密钥在创建 webhook 时只显示一次：请立即复制。Kept 封装保存它用于签名，且从不再次显示。丢了？**新密钥**会再生成一个；当前密钥立即失效，因此在你的服务器拿到新密钥之前，投递会校验失败。

## 投递

每个 webhook 的**投递记录**列出最近 30 天，最新在前：每次投递一行，含其状态、你的服务器响应的状态（或无），以及尝试了几次。

- **等待发送：**已排队。
- **已投递：**你的服务器以 2xx 状态响应。
- **失败，重试中：**任何其他响应、10 秒内无响应，或重定向（Kept 不跟随重定向）。Kept 会再试。
- **已放弃：**约 24 小时内 10 次尝试全部失败。

每个位置每秒最多发出 10 次投递，因此突发更改不会淹没你的服务器。

当某次投递被放弃时，webhook 会标记为自该日期起 **持续失败**，实例管理员会收到警报。它仍会继续发送；下一次成功的投递会清除该标记。

当所有者或管理员关闭它、或创建者不再是该位置的管理员时，webhook 会切为**关闭**。删除是最终的：Kept 停止向其发送，其投递记录也会被遗忘。

## 你自己的提醒 webhook

与位置的 webhook 分开，**设置 → 我 → 通知**可以把 webhook 添加为你自己的通道之一，与邮箱、推送、ntfy、Telegram 与 Apprise 并列（[提醒](/zh/users/reminders/)）。它每个提醒收到一个 POST（`reminder.due`），含 id、提醒的类型、其来源类型与到期日期、相关的物品/位置/位置，以及返回 Kept 的链接：没有名称或值。签名方式相同，密钥只显示一次。

发送失败会在约 24 小时内重试最多 10 次；若都未成功，通道会标记为**持续失败**，Kept 会给你发一封邮件。**测试**会立即发送一条。最多可有五个。

## 自有网络上的地址

Kept 拒绝向私有地址（如 `192.168.x.x`）POST，因此 webhook 无法指向路由器或服务器网络上的其他服务。实例管理员可在**管理 → 注册**（**允许私有地址**）中允许它们，用于你自托管的接收端，如 Home Assistant。同一开关也允许 AI 提供商、Homebox 导入与 OIDC 登录访问该网络，因此开启前请知晓谁可以添加那些。参见[安全模型](/zh/admin/security-model/#outbound-requests-ssrf)。
