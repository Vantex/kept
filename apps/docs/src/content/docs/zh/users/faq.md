---
title: 常见问题
description: "人们在安装 Kept 前后常问的问题的简短回答，每条都附有详情页链接。"
---

## Kept 会把关于我或我服务器的任何信息发送到别处吗？

不会。没有任何形式的遥测，甚至没有可选加入的安装计数。更新检查默认关闭，管理员开启后也只发送获取最新版本的请求。条码查询和 AI 同样默认关闭，直到有人连接。参见[可观测性](/zh/admin/observability/)和[升级](/zh/admin/upgrades/)。

## 我的数据存在哪里？

在你的服务器上：数据库在 Postgres 中，文件（照片、收据、文档）在 Kept 的数据卷或你选择的 S3 存储桶中。手机会保留一份副本供离线使用，不含机密值。参见[文件存储](/zh/admin/storage/)和[手机应用](/zh/users/phone-app/)。

## 如何删除我的账户？

设置 → 我 → 删除我的账户，并输入密码。先把除 Personal 外你拥有的每个位置移交给别人，或删除它；实例的唯一管理员需先创建另一个管理员。之后账户等待 30 天：登录会显示日期和保留方式，其他功能都不再开放。之后连同你的 Personal 位置一起删除。你添加到他人位置的内容仍会保留。如需副本，请先[导出数据](/zh/users/import-export/#exporting)。

## 可以不用 AI 吗？

可以。除根据照片命名物品、读取收据、助手和语义搜索外，一切正常。没有提供商时，拍摄的物品在收件箱中等待命名，搜索使用关键词。参见[AI 提供商](/zh/users/ai-providers/)。

## 哪些 AI 提供商可用，谁付费？

Groq（推荐）、OpenAI、Anthropic、Google、OpenRouter，或任何 OpenAI 兼容服务器（如 Ollama）。你使用自己的密钥；位置内的工作由该位置所有者的密钥付费，你可以设置花费上限。参见[AI 提供商](/zh/users/ai-providers/)。

## 离线能用吗？

在已安装 Kept 的手机上，查找与拍摄可以离线：浏览、搜索、拍摄、移动物品、读数、箱检和扫描标签。编辑详情、报告、导入导出需要网络。离线所做操作会在恢复连接后同步。参见[手机上的 Kept](/zh/users/phone-app/#what-works-offline)。

## App Store 或 Google Play 有应用吗？

没有。Kept 是一个网页应用，可从浏览器添加到主屏幕。需要 Kept 运行在 HTTPS 上。参见[手机上的 Kept](/zh/users/phone-app/#install-it) 和 [HTTPS](/zh/install/https/)。

## 能在 arm64 或树莓派上运行吗？

镜像为 amd64 和 arm64 构建，因此 ARM 服务器和 Apple Silicon 上的 Docker 可以运行。1 GB 内存及以上的树莓派也许能用，但更慢；没有发行版在其上测试过。Kept 在 1 GB 内存和一两个 CPU 核心（arm64）上测试。参见[测试环境](/zh/install/hardware/)。

## 一个 Kept 能给多少人用？

Kept 按物品而非人数规划：目标是单个位置 10,000 件、实例 50,000 件；1 GB 测试中单个位置用了 3,000 件。人员通过邀请加入位置，每个位置还可容纳最多 20 个无邮箱人员的托管账户。参见[系统需求](/zh/install/hardware/)和[邀请人员](/zh/users/first-run/#5-invite-people)。

## 能保留多个家庭，或只共享部分物品吗？

可以。每个位置（住宅、车库、储物间、父母家）单独共享，有自己的成员和角色；共享车库不会共享其他东西。一个人可属于多个位置，每个人都有私密的 Personal 位置。参见[最初几分钟](/zh/users/first-run/#5-invite-people)。

## Kept 与 Homebox 有何不同？

两者都跟踪你拥有的东西及其位置。Kept 还有：

- **3D 地图**：楼层、房间、货架和箱子。
- **车辆**：读数、保养、燃油及其费用。
- **提醒**：保修、保养、借用与低库存。
- **离线使用**：手机上，配合你打印和扫描的标签。
- **AI（可选）**：从照片拍摄，以及供助手使用的 MCP 服务器。

它能导入 Homebox 备份，因此可以用你自己的物品试用。

## 能从 Homebox 迁移吗？

可以。从 Homebox v0.26.1 或更新版本（推荐 v0.27.0），在 Homebox 中创建备份（**Collection → Tools → Backup & Restore → Create Backup**，然后 **Download**），把该 ZIP 导入 Kept，检查将发生什么，然后导入。照片、收据、保修、维护和标签会一起过来，旧 Homebox 标签仍可扫描。只有 Homebox 有买家或价格时条目才以“已售”进入（仅有售出日期会留在备注中），归档条目以**已归档**进入，除非你选择**使用中**或**不包含**。先连接 [Paperless-ngx](/zh/users/paperless/)，Homebox 到其文档的链接会作为 Paperless 链接进入。参见[导入与导出](/zh/users/import-export/#a-homebox-export)；1.14.1 之前的导入可以[修复](/zh/users/import-export/#repairing-an-earlier-import)。更旧的 Homebox 没有 Kept 能读的备份：先更新其副本，或导入其表格。参见[来自更旧的 Homebox](/zh/users/import-export/#coming-from-an-older-homebox)。

## 如何备份？

服务器每晚对数据库、文件和每个位置的可读副本做一次加密 restic 快照，写到另一块磁盘、S3 存储桶或 SFTP 服务器。把恢复套件放在别处。要带走单个位置，请导出它。参见[备份](/zh/admin/backups/)、[恢复套件](/zh/admin/recovery-kit/)和[导入与导出](/zh/users/import-export/#exporting)。

## 如果服务器连同房子一起丢了怎么办？

备份中的可读副本可在任何浏览器中用 restic、备份密码和一台笔记本打开，无需 Kept。要在新机器上恢复 Kept 本身，还需要恢复套件。参见[仅用 restic 阅读清单](/zh/admin/read-with-restic/)和[恢复](/zh/admin/restore/)。

## 支持哪些语言？

阿拉伯语（从右到左排版）、英语、法语、德语、意大利语、西班牙语、乌克兰语和越南语，按设备选择。参见[语言与主题](/zh/users/first-run/#6-language-and-theme)。

## 采用什么许可证？

GNU Affero 通用公共许可证第 3 版（AGPL-3.0）。你可以运行、修改和分享；若通过网络向他人提供修改版，必须向其提供源代码。文本在仓库的 [LICENSE](https://github.com/keptinventory/kept/blob/main/LICENSE)。

## Kept 免费吗？以后会收费吗？

自托管的 Kept 免费且开源。移动端、桌面端应用和云版本正在开发中。

## 有发行版吗？

有：`1.0.0` 是第一个签名发行版，在 GHCR 上为 `ghcr.io/keptinventory/kept`，之后每个发行版都列在[发行页面](https://github.com/keptinventory/kept/releases)。升级会运行一次迁移，先对数据库做快照，且可回退一个版本。参见[使用 Docker Compose 安装](/zh/install/compose/)和[升级](/zh/admin/upgrades/)。
