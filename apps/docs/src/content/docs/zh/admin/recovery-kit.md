---
title: 恢复套件
description: 能把备份变回可用 Kept 的密钥与备份凭据。请保存在服务器之外的任何地方。
sidebar:
  order: 4
---

Kept 用 `KEPT_SECRET_KEY` 密封它存储的每个机密值（AI 密钥，以及你存在物品上的机密，如路由器的 Wi-Fi 密码），并用 `KEPT_AUTH_SECRET` 对会话签名。两者都故意不在数据库或备份中：拿到你备份的人不应该连你的机密一起拿到。另一面是：**没有密钥时，恢复会带回除机密值与 AI 密钥之外的一切，而它们将永远无法读取。**

恢复套件是重建 Kept 所需的一切。请把它放在密码管理器或纸上，放在不会随服务器一起丢失的地方。

## 套件包含什么

- `KEPT_SECRET_KEY` 与 `KEPT_AUTH_SECRET`；
- 密钥轮换之后的密钥版本（`KEPT_SECRET_KEY_VERSION`）以及每个已退役密钥（`KEPT_SECRET_KEYS_RETIRED`），较旧的备份仍需要它们；
- 备份的 restic 仓库、**其密码与存储凭据**（S3 密钥与区域，或 SFTP 密钥及服务器固定的主机密钥形式的 `known_hosts` 行），或 “No backup configured”；
- 实例地址、Kept 版本与 revision、套件生成时间；
- 用平实语言写下的恢复步骤，以及[仅用 restic 阅读你的清单](/zh/admin/read-with-restic/)的命令（仓库地址已填好）。

内容为纯文本，或由相同行生成的可打印页面（无脚本，不从任何地方加载资源）。

## 如何获取

从服务器上，随时：

```sh
docker compose exec kept kept admin recovery-kit
```

输出到终端；不会写入任何地方。`--format html` 给出可打印页面，`--out <file>` 写入仅你可读的文件。即使数据库宕机也会打印密钥；备份那一半需要数据库所有者登录（`KEPT_OWNER_DATABASE_URL`，[备份](/zh/admin/backups/#turning-it-on)所用的 `compose.override.yaml` 会提供），没有时套件会说明缺失。有了该登录，这次打印会被计为一次下载（见下文）并记入审计。

从网页：**Admin → Status → Recovery kit → Download recovery kit**，需为实例管理员、仅通过 HTTPS，并再次输入密码（若账号没有密码，则在登录后十分钟内：通行密钥登录也算；否则 “Sign in again”）。可选文本文件或可打印页面。每次下载都会审计，套件内容不会保留在任何后续访问者可能打开的地方。

## Kept 何时会要求它

初始化不会等待套件，但在以下第一件事发生前，Kept 会要求你确认已保存它：存储机密值、添加 AI 密钥，或配置备份。在此之前 Admin → Status 会持续要求；一次下载即视为确认。当你下载的套件过期时，状态页会再次询问：备份设置变更或密钥轮换（`kept admin rotate-key`）之后。

## 如果你自己设置密钥

若 `KEPT_SECRET_KEY` 与 `KEPT_AUTH_SECRET` 在你自己的环境中（各自用 `kept admin gen-key` 生成），Kept 会按给定值使用，`kept-config` 卷保持为空。套件仍会打印它们；保存副本仍是你的责任。

## 轮换密钥

```sh
docker compose exec kept kept admin rotate-key
```

会生成新密钥作为当前密钥，并在它之下重新包装每个已存储的机密。它需要数据库所有者登录，因此 `kept` 服务必须有 `KEPT_OWNER_DATABASE_URL`（[备份](/zh/admin/backups/#turning-it-on)所用的 `compose.override.yaml` 会提供）。若你自行管理密钥，它会说明该设置什么。旧密钥移入退役列表，因此轮换前创建的备份仍可打开：之后请下载新的套件。
