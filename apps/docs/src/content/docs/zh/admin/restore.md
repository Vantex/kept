---
title: 恢复与演练
description: 把备份恢复到全新的空数据库，验证其一致，再替换上线——并且每月排练一次。
sidebar:
  order: 2
---

Kept **只恢复到新的空数据库**，检查它，并把替换留给你。它会拒绝任何已有内容的数据库，因此不可能误指向生产库。

## 恢复

1. **列出快照：**

   ```sh
   docker compose run --rm --no-deps --entrypoint kept kept admin backup --list
   ```

   这会在一次性 `kept` 容器中运行 CLI，该容器拥有数据卷、密钥、来自 `compose.override.yaml` 的所有者登录，以及备份设置（`.env` 中的，或保存在 Admin → Backups 中的；见[备份](/zh/admin/backups/#turning-it-on)）。

2. **在生产库旁创建一个空数据库**，以数据库超级用户身份：

   ```sh
   docker compose exec db psql -U postgres -c "CREATE DATABASE kept_restored OWNER kept_owner"
   docker compose exec db psql -U postgres -d kept_restored -c \
     "CREATE EXTENSION pg_trgm; CREATE EXTENSION unaccent; CREATE EXTENSION vector; ALTER SCHEMA public OWNER TO kept_owner;"
   ```

   使用托管 Postgres 时，请改为在新数据库上执行[提供商 SQL](/zh/install/managed-postgres/#the-sql) 中的扩展与属主语句。

3. **恢复到其中**，先把 `.env` 加载进 shell（`set -a; . ./.env; set +a`）：

   ```sh
   docker compose run --rm --no-deps --entrypoint kept \
     -e KEPT_OWNER_DATABASE_URL="postgres://kept_owner:${KEPT_DB_OWNER_PASSWORD}@db:5432/kept_restored" \
     kept admin restore <snapshot>
   ```

   Kept 会从快照中取出数据库与文件，用清单校验转储，检查 `pg_restore` 与服务器主版本匹配且扩展存在，在单个事务中恢复，然后把**每张表的行数与数据摘要**与清单比对：任何表的数据不同（即使行数相同）都会导致恢复失败。文件会写回 `KEPT_STORAGE` 指定的存储，并逐一校验 SHA-256。最后打印替换命令。

4. **替换**，先停止 Kept，以超级用户身份：

   ```sh
   docker compose stop kept
   docker compose exec db psql -U postgres -c "ALTER DATABASE kept RENAME TO kept_before_restore"
   docker compose exec db psql -U postgres -c "ALTER DATABASE kept_restored RENAME TO kept"
   docker compose up -d
   ```

   在你确认无误之前保留 `kept_before_restore`，然后再删除。

重命名数据库需要超级用户，而 Kept 的任何登录都不是：这就是 Kept 打印这些命令而不代为执行的原因。

## 服务器丢失之后

在新机器上：按 [Install with Docker Compose](/zh/install/compose/) 安装 Kept，并在首次启动前把**恢复套件中的密钥**放入 `.env`（`KEPT_SECRET_KEY`、`KEPT_AUTH_SECRET`，若套件列出还有 `KEPT_SECRET_KEY_VERSION` 与 `KEPT_SECRET_KEYS_RETIRED`），并把备份目标及其密码放入 `compose.override.yaml`。然后：

```sh
docker compose up -d db
docker compose run --rm --no-deps --entrypoint kept kept admin backup --list
docker compose run --rm --no-deps --entrypoint kept kept admin restore <snapshot>
docker compose up -d
```

新安装的 `kept` 数据库仍是空的（`migrate` 服务尚未运行），因此可直接接受恢复；无需替换。
没有密钥时，除机密值与 AI 密钥（将永远无法读取）外，其余都会恢复。

## 每月演练

没人恢复过的备份只是愿望，不是备份。每月一次，把最新快照恢复到临时数据库并让 Kept 比对（加载 `.env`，同上）：

```sh
docker compose exec db psql -U postgres -c "CREATE DATABASE kept_drill OWNER kept_owner"
docker compose exec db psql -U postgres -d kept_drill -c \
  "CREATE EXTENSION pg_trgm; CREATE EXTENSION unaccent; CREATE EXTENSION vector; ALTER SCHEMA public OWNER TO kept_owner;"
docker compose run --rm --no-deps --entrypoint kept kept admin backup drill \
  --into "postgres://kept_owner:${KEPT_DB_OWNER_PASSWORD}@db:5432/kept_drill"
docker compose exec db psql -U postgres -c "DROP DATABASE kept_drill"
```

演练会恢复最新正常快照、比对计数与摘要、校验 50 个文件的 SHA-256（`--all-files` 检查全部），并把演练记录写入**生产**数据库，从而清除 Admin → Status 上的 “restore drill due” 告警。它绝不会触碰生产数据。

## 检查仓库

worker 每周检查仓库（`restic check`）。若要立即检查，或同时读回部分数据：

```sh
docker compose run --rm --no-deps --entrypoint kept kept admin backup verify --read-data 5%
```

使用 S3 文件存储时，verify 还会把清单中的每个文件与存储桶比对。若崩溃在仓库上留下了过期锁，`kept admin backup unlock` 可清除；备份运行中会拒绝。
