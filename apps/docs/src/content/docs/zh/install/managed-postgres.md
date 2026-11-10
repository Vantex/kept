---
title: 托管 Postgres
description: 在提供商的 PostgreSQL 18 上运行 Kept——哪些提供商可用，以及创建 Kept 角色和扩展的 SQL。
sidebar:
  order: 5
---

Kept 可以使用托管 PostgreSQL 替代内置的。它需要 **PostgreSQL 18** 以及 `public` schema 中的三个扩展：`pg_trgm`、`unaccent` 和 `vector`（pgvector）。

## 哪些提供商可用

根据各提供商文档于 2026-10-06 阅读；均尚未在 Kept 上实际运行过。

| 提供商 | PostgreSQL 18 | 说明 |
|---|---|---|
| AWS RDS for PostgreSQL | 是 | 主用户创建扩展。若管理员收窄了 `rds.allowed_extensions`，请列出全部三个。 |
| Google Cloud SQL | 是 | 默认 `postgres` 用户（`cloudsqlsuperuser` 成员）创建它们。 |
| Azure Database for PostgreSQL, flexible server | 是 | **先加白名单：** 把 `pg_trgm,unaccent,vector` 加入 `azure.extensions` 服务器参数，然后以服务器管理员身份运行 SQL。 |
| DigitalOcean Managed PostgreSQL | 是 | **仅 Standard Edition**，以 `doadmin` 运行。Advanced Edition 不能创建扩展，因此无法运行 Kept。 |
| Neon | 是 | 项目自己的角色（`neon_superuser` 成员）创建它们。 |
| Supabase | **否** | 不提供 PostgreSQL 18，且把扩展放在 `extensions` schema 而非 `public`。 |

## SQL

`pg_trgm` 和 `unaccent` 是可信扩展，但 pgvector 的 `vector` 不是，因此普通非超级用户无法创建它。请**以提供商的管理员用户**运行以下 SQL，连接到 Kept 将使用的数据库，用你自己的密码替换 `…`，用数据库名替换 `<database>`：

```sql
-- Azure: allow-list pg_trgm,unaccent,vector in azure.extensions first.
CREATE ROLE kept_owner  LOGIN PASSWORD '…' NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS;
CREATE ROLE kept_app    LOGIN PASSWORD '…' NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS;
CREATE ROLE kept_auth   LOGIN PASSWORD '…' NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS;
CREATE ROLE kept_system LOGIN PASSWORD '…' NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS;
-- A request can't run away or sit idle inside a transaction.
ALTER ROLE kept_app SET statement_timeout = '15s';
ALTER ROLE kept_app SET idle_in_transaction_session_timeout = '30s';
CREATE EXTENSION IF NOT EXISTS pg_trgm  WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS vector   WITH SCHEMA public;
-- A non-superuser admin may hand ownership to a role only while it is a member of that role.
GRANT kept_owner TO CURRENT_USER;
ALTER DATABASE <database> OWNER TO kept_owner;
ALTER SCHEMA public OWNER TO kept_owner;
REVOKE kept_owner FROM CURRENT_USER;
```

每条语句都已在本地 PostgreSQL 18.6 上以非超级用户运行过，其属性与 Azure 为其管理员文档所述一致；只有 `CREATE EXTENSION vector` 需要更多权限，而这正是提供商的管理员角色所提供的。

`kept_app` 上的两个超时很重要：Kept 自己的 Compose 设置同样如此，而其迁移做不到（owner 角色不能更改其他角色）。

## 四个登录

| 变量 | 登录 | 用途 |
|---|---|---|
| `KEPT_DATABASE_URL` | `kept_app` | 每个请求，在行级安全下 |
| `KEPT_AUTH_DATABASE_URL` | `kept_auth` | 登录 |
| `KEPT_SYSTEM_DATABASE_URL` | `kept_system` | 后台任务和首次运行设置 |
| `KEPT_OWNER_DATABASE_URL` | `kept_owner` | `kept migrate`、`kept admin`，以及备份的导出 |

**绝不要把它们中的任何一个指向提供商的管理员用户。** 多个提供商会给它 `BYPASSRLS`（DigitalOcean 的 `doadmin`、Neon 的 `neon_superuser`），这会关掉防止一个家庭数据与另一个家庭混淆的行级安全。Kept 的四个角色全部为 `NOBYPASSRLS`。

大多数提供商要求 TLS：把其文档给出的 `sslmode` 加到每个 URL。
