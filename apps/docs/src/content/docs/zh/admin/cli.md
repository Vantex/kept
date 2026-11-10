---
title: 运维 CLI
description: kept migrate 与 kept admin——各命令的用途，以及在 Compose 下如何运行。
sidebar:
  order: 7
---

镜像内置 `kept` 命令，供运行服务器的人使用：迁移、无人能登录时的找回入口、密钥、备份。`kept admin --help` 列出全部命令；每个会改变状态的命令都会被审计，其影响到的账号会收到邮件通知。

## 在 Compose 下运行

大多数命令需要数据库**所有者**的登录信息（`KEPT_OWNER_DATABASE_URL`），它只由一次性的 `migrate` 服务持有；对外提供服务的容器从不持有。其入口点就是 `kept`，因此：

```sh
docker compose run --rm migrate admin <command>
```

有两类命令需要对外服务容器的卷：

- `recovery-kit` 从配置卷读取密钥，即使没有数据库也能打印：`docker compose exec kept kept admin recovery-kit`。若配置了 `KEPT_OWNER_DATABASE_URL`（见下文），还会包含备份仓库、其密码与凭据。
- `token create` 需要密钥与对外服务的登录信息，这些在 `kept` 容器中：`docker compose exec kept kept admin token create …`（[见下文](#a-token-from-the-server)）。
- `rotate-key`、`backup`、`restore` 与 `export` 除所有者登录外，还需要密钥或文件。在 `compose.override.yaml` 中给 `kept` 服务配置 `KEPT_OWNER_DATABASE_URL`（[与备份相同](/zh/admin/backups/#turning-it-on)），再在一次性容器中运行：`docker compose run --rm --no-deps --entrypoint kept kept admin <command>`。

## 命令一览

| 命令 | 作用 |
|---|---|
| `kept migrate` | 在数据库锁下应用尚未执行的迁移一次（`migrate` 服务每次启动都会运行它）。 |
| `kept admin setup-code` | 在初始化尚未完成时重新签发首次运行的设置码，并解除全局限制。 |
| `kept admin reset-password <login>` | 一次性密码重置码，有效期一小时；会让该账号在所有位置退出登录。 |
| `kept admin disable-user <login>` / `enable-user <login>` | 禁止某账号登录（并结束其会话），或重新允许。 |
| `kept admin transfer-ownership <locationId> <toUserId>` | 把一个位置交给另一位所有者；原所有者成为其管理员。 |
| `kept admin recovery-kit [--format text\|html] [--out <file>]` | 需保存在服务器之外的恢复套件：密钥、备份仓库及其凭据、恢复步骤。参见[恢复套件](/zh/admin/recovery-kit/)。 |
| `kept admin token create --user <login> --scope read\|write --name <name>` | 供 MCP 客户端与 Home Assistant 使用的个人令牌，只打印一次；`--expires <days>`、`--location <id or name>`（可重复）、`--confirm-cross-location`。自 1.13.0 起提供。参见[从服务器创建令牌](#a-token-from-the-server)。 |
| `kept admin gen-key` | 打印一把新密钥，便于自行设置 `KEPT_SECRET_KEY` 或 `KEPT_AUTH_SECRET`。 |
| `kept admin rotate-key` | 生成新的当前密钥并重新包装所有已存储的机密。`--resume` 完成被中断的一次；`--drop <version>` 移除已退役且无人使用的密钥。 |
| `kept admin backup` | 立即备份（生成一份 restic 快照）；`--list` 列出快照以及更早的 pre-restic 备份；`--accept-size` 接受明显偏小的备份作为新常态。参见[备份](/zh/admin/backups/)。 |
| `kept admin backup verify` | 检查备份仓库；`--read-data <percent>` 还会读取该比例的数据；使用 S3 文件存储时，会把文件与存储桶比对（`--all-files` 检查全部，而不是二十分之一）。 |
| `kept admin backup drill --into <database>` | 把最新备份恢复到**空的**临时数据库并检查：即[每月演练](/zh/admin/restore/#the-monthly-drill)。 |
| `kept admin backup unlock` | 崩溃后清除过期的 restic 锁；备份运行中会拒绝。 |
| `kept admin restore <snapshot>` | 把快照（或 `latest`）恢复到**空的**数据库并校验；`--legacy <id>` 恢复 pre-restic 备份，有效期一个版本。参见[恢复](/zh/admin/restore/)。 |
| `kept admin readable --out <dir>` | 把每个位置的[可读副本](/zh/admin/read-with-restic/)（HTML、CSV、文件）写入目录；`--location <id>` 只处理一个，`--no-pdf` 不生成清单 PDF。 |
| `kept admin storage copy --to s3\|local` | 把每个文件复制到另一存储，并校验各自的哈希；`--dry-run` 只统计。参见[切换文件存储](/zh/admin/storage/)。 |
| `kept admin storage verify --store s3\|local` | 检查数据库引用的每个文件都在该存储中且字节正确。 |
| `kept admin export --out <dir>` | 把每一行原始数据（机密仍密封）与每个文件导出到新目录：这是逃生舱，敏感程度与备份相当。 |
| `kept admin backfill-pdf-text` | 读取 Kept 支持读取 PDF 之前上传的 PDF 文本，以便搜索能找到它们。 |
| `kept admin config` | 打印此版本的[配置参考](/zh/reference/configuration/)。 |

`kept admin seed` 仅用于开发，在生产环境会拒绝运行。

## 从服务器创建令牌

应用只允许通过 HTTPS 创建个人令牌（Settings → Connections 在纯 `http` 下会拒绝）。家庭网络上通过 `http` 运行的 Kept 仍可连接 AI 应用或 [Home Assistant](/zh/users/home-assistant/)：由运行服务器的人在那里创建令牌。自 1.13.0 起：

```sh
docker compose exec kept kept admin token create \
  --user ibrahim@example.com --scope read --name "Home Assistant"
```

- `--user` 是令牌所代表的人：其邮箱地址，或托管账号的用户名。它能做到此人能做的一切，不多也不少。
- `--scope read` 只读；`--scope write` 还能修改。
- 不带 `--location` 时，它可访问此人所属的每个位置，但以下除外：要求双因素的位置（在此创建的令牌没有第二因素；请在 Settings → Connections 中通过 HTTPS 创建那种），以及对写令牌而言此人仅为查看者的位置。每个被排除的位置都会列出。`--location`（id 或名称，可重复）可改为指定它们。
- 跨成员不同的位置创建写令牌时会像应用内一样以警告停止；`--confirm-cross-location` 则仍会创建。
- `--expires <days>` 在指定天数后失效；不设置则一直有效直到被吊销。

它会打印一次令牌（以 `KEPT TOKEN:` 开头的行）以及 MCP 服务器地址。Kept 只保存其指纹。该用户可在 **Settings → Connections** 中看到并吊销，同时会收到邮件通知。
