---
title: 故障排查
description: Kept 服务器的真实故障模式、各自成因与修复方法。
---

每一条都是症状、成因与修复。命令假定使用 Docker Compose；在 Helm 下同样的检查适用于各 pod。

## 先看这些

- **Admin → Status** 本身就能点出大多数问题：邮件、失败的后台任务、提醒扫描、备份与恢复演练、磁盘、版本及其迁移、HTTPS。
- **日志：** `docker compose logs kept` 与 `docker compose logs migrate`。`KEPT_LOG_FORMAT=pretty` 使其便于肉眼阅读；`KEPT_LOG_LEVEL`（默认 `info`）设置级别。
- **请求 id：** 每个响应都带 `x-request-id`；在日志中搜索它即可找到对应报告的那一行。
- **探针：** `/healthz`（进程提供 HTTP）、`/readyz`（两条数据库连接均响应）、`/version`（版本、commit、源码）。参见[监控](/zh/admin/observability/)。
- **可自行运行的检查：** `kept admin backup verify`、`kept admin storage verify --store local`（或 `s3`）与 `kept admin config`（[CLI](/zh/admin/cli/)）。

## `docker compose up` 停在 `bootstrap` 服务

**成因：** 一次性的 `bootstrap`（`kept bootstrap`）无法设置数据库登录。其日志会说明原因：`docker compose logs bootstrap`。常见原因：镜像早于 1.13.0 且没有 `bootstrap` 命令（把 `KEPT_IMAGE` 设为 1.13.0 或更高）；或数据库的回环被配置为需要密码，而 `.env` 中的 `KEPT_DB_SUPERUSER_PASSWORD` 并不是它。

**修复：** 按该行指出的问题改正，再运行 `docker compose up -d`；bootstrap 可安全地运行任意多次。

## Kept 启动即退出，出现 `kept: invalid environment: …` 或其他 `kept:` 行

**成因：** 环境在任何东西启动前就会检查，第一个问题会以一行点名并终止进程。常见情况：

| 该行说 | 修复 |
|---|---|
| `kept: invalid environment: KEPT_PUBLIC_URL` | 设置地址：`docker compose run --rm init`（[安装](/zh/install/compose/#1-write-env)） |
| `KEPT_DATABASE_URL has no password, and KEPT_DB_APP_PASSWORD_FILE: … does not exist` | bootstrap 尚未运行：用 `docker compose up -d` 启动（它会先运行 bootstrap），不要只用 `docker compose up kept` |
| `KEPT_SECRET_KEY and KEPT_AUTH_SECRET are set together or not at all` | 两者都设，或都不设以使用配置卷中生成的密钥对 |
| `<path>/secrets.json exists but …; fix or restore it` | 生成的密钥文件损坏：从[恢复套件](/zh/admin/recovery-kit/)放回密钥 |
| `KEPT_BACKUP_DIR is inside KEPT_DATA_DIR …` | 把备份指向另一块磁盘 |
| `a backup target is set, and the nightly backup dumps the database as kept_owner …` | 给 worker 配置 `KEPT_OWNER_DATABASE_URL`（[备份](/zh/admin/backups/#turning-it-on)） |
| `set one backup target, not …` | 只保留 `KEPT_BACKUP_DIR`、`KEPT_BACKUP_S3_BUCKET`、`KEPT_BACKUP_SFTP` 之一 |
| `KEPT_STORAGE=s3 needs …` | 补上它点名的 S3 设置（[存储](/zh/admin/storage/)） |
| `KEPT_OIDC_ISSUER is set without KEPT_OIDC_CLIENT_ID` | 添加 client id，或取消设置 issuer |

所有变量都在[配置参考](/zh/reference/configuration/)中。

## 改了 `.env` 里的数据库密码，现在什么都连不上

**成因：** 使用 Kept 1.13.0 的 `compose.yaml` 时会自愈：每次 `docker compose up -d` 时 bootstrap 都会把每个登录的密码设为 `.env`（或其文件）中的值。较旧的 `compose.yaml` 只在首次创建 `kept-db` 卷时设置一次密码，就会出现此问题。

**修复：** 使用当前 `compose.yaml` 并运行 `docker compose up -d`。若仍是旧文件，请在 Postgres 中把角色密码改一致，然后重启：

```sh
docker compose exec db psql -U postgres -c "ALTER ROLE kept_app PASSWORD '<the new password>'"
```

（角色为 `kept_owner`、`kept_app`、`kept_auth` 或 `kept_system`，与变量对应。）

## `/readyz` 返回 503

**成因：** Web 的两条数据库连接之一（`app` 与 `system`，在响应体中显示为 `false`）无法执行查询。日志中有 `readiness check failed`。启动时，Kept 会等待仍在启动的数据库大约两分钟，然后才放弃。

**修复：** 检查 `docker compose ps db` 是否 healthy，以及名为 `false` 的登录密码是否正确（见上）。在托管 Postgres 上，检查四个登录是否存在（[managed Postgres](/zh/install/managed-postgres/#the-four-logins)）。

## “This Kept is set up for …” 或 “The request did not come from this site.”

- **应用：** “This Kept is set up for *address*. Open it there.”，出现在登录页，或保存被拒绝时应用上方的条带。
- **API：** 403，“The request did not come from this site.”

**成因：** 携带 Kept cookie 的写请求必须来自 `KEPT_PUBLIC_URL` 或 `KEPT_EXTRA_ADDRESSES` 之一的精确源：scheme、主机与端口。Kept 将其与浏览器的 `Origin` 头比较，即地址栏中的地址；中间的反向代理不会改变它。用另一个地址打开 Kept（用 IP 代替名称、`http` 代替 `https`、不同端口、代理的内部地址）会让每次写请求都变成 403。链接、二维码与邀请邮件基于同一值构建，通行密钥也按其主机名注册。

**修复：** 把 `KEPT_PUBLIC_URL` 设为浏览器地址栏显示的精确值，重启，并始终从那里访问 Kept。若你确实有两个真实地址（例如局域网名称与 Tailscale 名称），把其他地址列入 `KEPT_EXTRA_ADDRESSES`（[More than one address](/zh/install/home-network/#more-than-one-address)）。

## 升级后 Kept 不启动，且 `migrate` 以错误退出

**成因：** `kept` 服务仅在 `migrate` 成功后启动。在对已有数据的数据库迁移前，`kept migrate` 会在设置了备份目标时先做升级前快照；**若快照失败，什么都不会迁移**，并以原因退出（[升级](/zh/admin/upgrades/#the-snapshot-before-every-upgrade)）。

**修复：** 阅读 `docker compose logs migrate`，修复备份（目标、密码、`migrate` 上的挂载），再 `docker compose up -d`。若要故意跳过快照升级，可为该次运行设置 `KEPT_UPGRADE_SNAPSHOT=off`。

## Kept 以 `downgrade_refused` 拒绝启动

**成因：** 镜像比数据库旧超过一个版本（或数据库含有无任何已记录版本执行过的迁移）。允许回退一个版本；更多则不允许。

**修复：** 重新运行较新版本，或[恢复](/zh/admin/restore/)由较旧版本拍摄的升级前快照。`KEPT_ALLOW_DOWNGRADE=1` 可强制启动并记入审计；仅在某版本发行说明要求时使用（[going back one version](/zh/admin/upgrades/#going-back-one-version)）。

## 设置码丢失，或初始化被锁定

**成因：** 设置码只打印一次，由创建它的进程输出。错误的设置码会锁定发送它们的地址，多次错误会锁定整个实例。

**修复：** `docker compose run --rm migrate admin setup-code` 会签发新码并解除全局限制；按地址的限制会自行结束。若所有人同时被锁定，见下一条。

## 所有人撞上同一套登录限制

**成因：** 在反向代理后，除非代理在 `KEPT_TRUSTED_PROXIES` 中，Kept 对每个访客看到的都是代理地址，因此所有人共享同一套限制。

**修复：** 把 Kept 所见的代理地址列入 `KEPT_TRUSTED_PROXIES`（[反向代理](/zh/install/reverse-proxy/#trust-the-proxy-and-only-the-proxy)）。

## 上传失败，或大照片永远传不上去

**成因：** 超过 `KEPT_MAX_FILE_MB`（默认 25 MB）的文件会被 Kept 以 413 拒绝。前置代理往往有更小的自身请求体上限，会先失败。

**修复：** 把代理的限制提高到至少 `KEPT_MAX_FILE_MB`（[let uploads through](/zh/install/reverse-proxy/#let-uploads-through)）。

## 手机上相机、安装、推送或位置功能不可用

**成因：** 手机只允许在安全源上使用这些能力；纯 HTTP 的局域网地址不是。在 HTTP 下 Kept 还会拒绝显示机密值、导出、访问令牌、OAuth 连接、恢复套件下载与备份设置。

**修复：** [让 Kept 使用 HTTPS](/zh/install/https/)，并把 `KEPT_PUBLIC_URL` 设为 `https://` 地址。

## 保存 AI 提供商或 webhook 失败：“That address is on a private network.”

**成因：** 出站请求被拒绝访问私有、回环与保留地址（`private_address`）。你网络上的提供商，包括 Compose 的 `http://ollama:11434/v1`，都会解析到这类地址。

**修复：** 由实例管理员开启 **Admin → Settings → Allow private addresses**。参见[安全模型](/zh/admin/security-model/#outbound-requests-ssrf)。

## 没有邮件到达

**成因：** 没有 `KEPT_SMTP_URL` 与 `KEPT_SMTP_FROM` 时，邮件只记录为待发送，Admin → Status 会说邮件未配置。

**修复：** 设置两者并重启（[安装](/zh/install/compose/#5-next)）。

## 备份不运行，或 “Backup stale” 告警触发

**成因：** 通常是以下之一：没有目标或没有密码（不存在未加密备份）、worker 没有 `KEPT_OWNER_DATABASE_URL`、目录目标未挂载到容器，或目录不属于 Kept 的用户（uid 10001）。

**修复：** 按[备份](/zh/admin/backups/#turning-it-on)配置，然后手动跑一次并阅读其输出：

```sh
docker compose run --rm --no-deps --entrypoint kept kept admin backup
```

出现警告时以退出码 1 结束，并点名：

| 警告 | 含义，以及该怎么做 |
|---|---|
| `backup_suspicious_size` | 远小于上次正常备份；若缩水属实，`kept admin backup --accept-size` |
| `files_unreadable` | restic 无法读取某些文件；检查数据卷权限 |
| `blob_checksum_mismatch` | 某个已存文件与其 SHA-256 不再匹配；检查磁盘 |
| `readable_incomplete` | 某个位置的可读副本失败；日志会点名 |

崩溃后，过期的 restic 锁可能阻塞每次运行：`kept admin backup unlock` 可清除（备份运行中会拒绝）。

## 恢复拒绝启动

**成因：** Kept 只恢复到**空的**数据库，并检查 `pg_restore` 与服务器 Postgres 主版本匹配且扩展存在。

**修复：** 按[恢复](/zh/admin/restore/#restore)创建带扩展的新空数据库；绝不要把恢复指向生产库。

## 恢复后机密值与 AI 密钥无法读取

**成因：** 它们用 `KEPT_SECRET_KEY` 密封，而该密钥不在备份中。

**修复：** 把恢复套件中的密钥放入 `.env`（若套件列出，还包括 `KEPT_SECRET_KEY_VERSION` 与 `KEPT_SECRET_KEYS_RETIRED`）并重启。若套件列出了退役密钥，在 Kept 启动后运行 `kept admin rotate-key --resume`。没有密钥，那些值将永远丢失。

## `kept admin` 提示 `KEPT_OWNER_DATABASE_URL … is required`

**成因：** 大多数 admin 命令需要数据库所有者登录，而它只由 `migrate` 服务持有。

**修复：** 以 `docker compose run --rm migrate admin <command>` 运行；对 `rotate-key`、`backup`、`restore` 与 `export`，在 `compose.override.yaml` 中给 `kept` 服务配置所有者登录（[CLI](/zh/admin/cli/#running-it-under-compose)）。

## 仅 worker 的容器不健康

**成因：** 使用 `KEPT_ROLE=worker` 时，healthcheck 读取任务循环触碰的文件（`/tmp/kept-worker-alive`）；若循环两分钟未轮询数据库则失败。

**修复：** 检查 worker 日志与其数据库连接；与 `/readyz` 相同的数据库检查适用。

## 仍然卡住

开一个 issue，附上 `/version` 的版本、Kept 的运行方式，以及去除隐私内容后的相关日志行。安全问题请改走私密漏洞报告（[安全模型](/zh/admin/security-model/#reporting-a-vulnerability)）。
