---
title: 备份
description: 每晚对数据库、文件与可读副本做一次加密 restic 快照，写入另一块磁盘、S3 存储桶或 SFTP 服务器。
sidebar:
  order: 1
---

每晚 Kept 会生成一份 **restic 快照**：用你选定的密码加密、去重（一晚没有新内容几乎不占空间），并发送到服务器自身磁盘之外的位置。

## 快照里有什么

- **数据库**：从同一一致时刻导出，并附带每张表的行数清单与数据摘要，这样恢复后可以证明内容与当时完全一致。
- **文件**（照片、收据、文档）：仅当它们存放在服务器磁盘上时才会包含。若使用 S3 文件存储则不包含，见[下文](#when-files-live-in-s3)。
- **每个位置的可读副本**：网页、表格、缩略图与收据，只需 restic 即可在浏览器中打开。参见[仅用 restic 阅读你的清单](/zh/admin/read-with-restic/)。

**密钥不在备份中。** 请把[恢复套件](/zh/admin/recovery-kit/)保存在别处。

## 可以备份到哪里

| 目标 | 设置方式 | restic 仓库位置 |
|---|---|---|
| 目录：另一块磁盘，或挂载到服务器的 NAS 共享 | `KEPT_BACKUP_DIR`（绝对路径，且在 `KEPT_DATA_DIR` 之外） | `<directory>/restic` |
| 兼容 S3 的存储桶：AWS 或其他提供商的 S3 端点 | `KEPT_BACKUP_S3_BUCKET` 及其他 `KEPT_BACKUP_S3_*` | `KEPT_BACKUP_S3_PREFIX` 下的 `restic/` |
| SFTP 服务器 | `KEPT_BACKUP_SFTP`（restic 的 `sftp:` 语法）、`KEPT_BACKUP_SFTP_KEY_FILE`、`KEPT_BACKUP_SFTP_KNOWN_HOSTS` | 你指定的位置 |

只设置一个目标。优先选择另一台机器或另一个站点：与 Kept 数据同一磁盘上的目录会被拒绝，状态页在目标与数据共用磁盘时也会警告。Backblaze B2 与 Cloudflare R2 的 S3 端点预计可用，但尚未测试。SFTP 会从 known-hosts 文件固定服务器的主机密钥，仅在匹配时才连接。

## 启用备份

实例管理员在 **Admin → Backups** 中通过 HTTPS 设置目标与密码，前提是先确认已保存恢复套件。“Test” 检查 Kept 能否打开（或创建）仓库；“Run now” 立即跑一次。环境变量优先于页面设置，并在页面上显示为已锁定，这样运维可以在部署中修正目标。

**密码**至少 12 个字符（`KEPT_BACKUP_PASSWORD`，或在页面上设置）。
**没有密码就没有备份：** Kept 从不写入未加密的备份。丢失密码后备份将无法读取，所以密码要放在恢复套件里。

备份在 worker 中以数据库所有者身份运行，因此 worker 也需要 `KEPT_OWNER_DATABASE_URL`。使用 Compose 时，`compose.yaml` 已将所有 `KEPT_BACKUP_*` 变量从 `.env` 传给 Kept 和 `migrate`（`migrate` 会在升级前做一次快照）；在它旁边的 `compose.override.yaml` 中补充所有者登录信息，若是目录目标还要给两边都挂载：

```yaml
services:
  kept:
    environment:
      KEPT_OWNER_DATABASE_URL: postgres://kept_owner:${KEPT_DB_OWNER_PASSWORD:-}@db:5432/kept
      KEPT_DB_OWNER_PASSWORD_FILE: /owner/kept_owner
    volumes:
      - kept-owner:/owner:ro
      - /mnt/backup/kept:/backups
  migrate:
    volumes:
      - /mnt/backup/kept:/backups
```

所有者的密码来自 `kept-owner` 卷（bootstrap 会把密码放在那里；若是在 1.13.0 之前安装、`.env` 中已有 `KEPT_DB_OWNER_PASSWORD`，则沿用该值，文件那一行不起作用）。

然后在页面上设置目标与密码，或在 `.env` 中锁定它们（`KEPT_BACKUP_DIR=/backups`、`KEPT_BACKUP_PASSWORD=…`）。

目录必须归 Kept 的用户所有：

```sh
sudo mkdir -p /mnt/backup/kept
sudo chown 10001:10001 /mnt/backup/kept
sudo chmod 700 /mnt/backup/kept
```

## 时间与保留

- **时间：** 每晚按 Admin → Backups 中设置的时间执行，`HH:MM` 为 UTC（默认 `02:30`）。改时间后从下一晚生效，无需重启；也可用 `KEPT_BACKUP_TIME` 固定。
- **Run now** 立即跑一次；若该次仍在等待或运行时再按，会被拒绝（“A backup is already running”），而不会排队两次。因重启或内存耗尽而中断的备份不会阻塞后续；下一次运行会把那次标为中断。
- **在小机器上**（小于 4 GB，或容器上限小于 4 GB），restic 最多在两个核上运行并带软内存限制；Kept 环境中的 `GOMAXPROCS` 与 `GOMEMLIMIT`（Compose 下用 `compose.override.yaml`）可覆盖这两项。
- **保留多久：** 最近 **7 天、4 周、6 个月** 各保留最新一份快照（`KEPT_BACKUP_KEEP_DAILY`、`_WEEKLY`、`_MONTHLY`）。alpha 版的 `KEPT_BACKUP_KEEP` 在一个版本周期内按每日份数解读。升级前拍摄的快照保留最近 3 份。
- **可疑的小备份**（转储不到上次正常备份的一半，或物品、位置、文件数量明显偏少）仍会拍摄，但当晚不会删除任何旧快照，并会向管理员告警，这样糟糕的一晚永远不会把好快照挤出去。

## 监控备份

Admin → Status 显示最近一次备份及其时间、快照数量、仓库大小、最近一次恢复演练以及磁盘。以下情况会通过邮件和推送向管理员告警：

| 告警 | 时机 |
|---|---|
| Backup failed | 某次运行失败 |
| Backup stale | 已设置目标，但 36 小时内没有正常备份 |
| Suspicious size | 某次运行远小于上次正常备份 |
| Disk space low | 数据磁盘或目录目标已用 85% |
| Bucket versioning off | 文件在 S3 中，且存储桶未保留旧版本 |
| Restore drill due | 30 天未做[恢复演练](/zh/admin/restore/#the-monthly-drill) |

`/metrics`（需 `KEPT_METRICS_TOKEN`）会补充上次正常备份的时间与磁盘使用率。参见[监控](/zh/admin/observability/)。

## 文件存放在 S3 时

restic 备份的是磁盘上的文件，而不是存储桶中的对象。使用 `KEPT_STORAGE=s3` 时，快照包含数据库、清单和可读副本，而**文件本身由存储桶自己保护**：请开启**存储桶版本控制**（若提供商支持，再开启跨区域复制）。Kept 每次运行都会检查版本控制，关闭时会告警。每周检查与恢复演练会把清单中每个文件的哈希与存储桶比对。

## alpha 版的备份

在 restic 之前由 alpha 版创建的备份（新 `restic/` 目录旁的 `runs/` 与 `blobs/`）不会再写入，并在一个版本周期内仍可用 `kept admin restore --legacy <id>` 恢复。等某份 restic 快照通过恢复演练后即可删除它们。
