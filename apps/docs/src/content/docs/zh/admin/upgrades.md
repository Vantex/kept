---
title: 升级与回退
description: 升级 Kept、升级前的快照、回退一个版本，以及 Postgres 主版本升级。
sidebar:
  order: 5
---

## 升级

使用 Compose 时，把 `.env` 中的 `KEPT_IMAGE` 指向新版本，然后：

```sh
docker compose pull
docker compose up -d
```

若是基于检出的自建镜像：`git pull`、`docker build -t kept:local .`，再在 `KEPT_IMAGE=kept:local` 下 `docker compose up -d`。

发行版也可能修改 `compose.yaml`；其发行说明会写明。把该版本的文件下载覆盖到你本地（`curl -fsSLO https://raw.githubusercontent.com/keptinventory/kept/v<version>/compose.yaml`，若运行的是完整版则用 `compose.full.yaml`）；`.env` 保持不变。

### 需要新 compose.yaml 的设置

`compose.yaml` 只把其中点名的设置交给 Kept，不多不少。只改 `KEPT_IMAGE` 升到 1.14.5 会保留 1.14.4 的文件，它不传递 `KEPT_HTTP_SIGN_IN_DAYS` 或 `KEPT_EXTRA_ADDRESSES`，并自行设置 `KEPT_TRUSTED_PROXIES`。在你下载 1.14.5 的 `compose.yaml`（或 `compose.full.yaml`）并运行 `docker compose up -d` 之前，`.env` 中的那些行不起作用。

### Caddy 与 Ollama 移到了 compose.full.yaml

自 1.14.5 起，`compose.yaml` 只运行 Kept 及其数据库。Caddy（`https` profile）、Ollama（`ollama` profile）以及注释掉的拆分部署示例在 `compose.full.yaml` 中：同一文件加上这些内容。**若你使用 Caddy 或 Ollama**，请改下载 `compose.full.yaml` 并在 `.env` 中设置 `COMPOSE_FILE=compose.full.yaml`：

```sh
curl -fsSLO https://raw.githubusercontent.com/keptinventory/kept/v<version>/compose.full.yaml
echo COMPOSE_FILE=compose.full.yaml >> .env
docker compose --profile https up -d   # the profiles you use: https, ollama or both
```

否则下次下载 `compose.yaml` 会丢掉 Caddy：Compose 会把它的容器称为孤儿，一旦它消失，Kept 就只剩纯 http。两个文件中 Kept 的服务、网络与卷（Caddy 证书在 `caddy-data`，模型在 `ollama`）相同，因此不会丢失任何东西。不用 Caddy 或 Ollama 则无任何变化。

**在自有代理之后**，`.env` 中的 `KEPT_TRUSTED_PROXIES` 自 1.14.5 起会到达 Kept。此前 `compose.yaml` 会自行设置其值，因此 `.env` 中的行被忽略，所有访客共享代理的登录限制。已存在于 `.env` 中的值在你下载 1.14.5 的 `compose.yaml` 后生效（[见上](#settings-that-need-the-new-composeyaml)）；位于 `compose.override.yaml` 中的值可以迁到 `.env`。使用 `compose.full.yaml` 的 Caddy 时，请留空或在列表中保留 `172.29.72.200`（[反向代理](/zh/install/reverse-proxy/#trust-the-proxy-and-only-the-proxy)）。

### 登录链接（1.14.0）

1.14.0 把 Kept 升到 better-auth 1.7.13，修复了一处 OAuth 登录 state 可被用作魔术链接冒充他人登录的公告（GHSA-965c-763c-88jm）。升级前已邮寄的魔术链接，或已发起的 Google/OIDC 登录，不再有效：请索取新链接，或重新登录。

### 免克隆安装（1.13.0）

自 1.13.0 起，`compose.yaml` 不再需要仓库副本，也不需要数据库密码：一次性的 `bootstrap` 服务在每次启动时创建登录。此前的安装可继续按原样工作：`.env` 中那五行 `KEPT_DB_*_PASSWORD` 按给定值使用（[an install from before 1.13.0](/zh/install/compose/#an-install-from-before-1130)）。有两点要知道：空的 `KEPT_IMAGE` 不再构建检出（而是运行 `compose.yaml` 点名的发行版），以及夜间备份的 `compose.override.yaml` 在 `.env` 不再持有所有者密码后，会从 `kept-owner` 卷读取它（[备份](/zh/admin/backups/#turning-it-on)）。

一次性的 `migrate` 服务会先运行 `kept migrate`：迁移**在数据库锁下应用一次**，然后新版本才开始处理请求。Kept 的迁移只做添加（列或表的删除或重命名跨越两个版本），因此上一版本仍可在新 schema 上运行，这也是可以回退的原因。

大版本（`1.x` 到 `2.0`）之前请阅读发行说明。

### 镜像已迁移（1.8.0）

自 1.8.0 起，镜像为 `ghcr.io/keptinventory/kept`，chart 为 `oci://ghcr.io/keptinventory/charts/kept`。1.7.1 及更早版本仍在 `ghcr.io/ibrahimroshdy/kept`，该地址不再有新版本。升级时改一次镜像名即可：

- Compose：`KEPT_IMAGE=ghcr.io/keptinventory/kept:1.8.0`。
- Helm：`image.repository: ghcr.io/keptinventory/kept`，或从新地址安装 chart。

签名密钥相同，因此 `cosign verify --key cosign.pub ghcr.io/keptinventory/kept:<version>` 与以前一样可用（[验证发布](/zh/admin/verify-release/)）。

### 知道有新版本

Kept 可以检查新版本，且**默认关闭**。开启后，每天向其镜像构建所来自的仓库询问一次最新版本，除请求本身外不发送任何内容（无版本号、无实例标识）。不会下载或安装任何东西。`KEPT_UPDATE_CHECK=true` 开启并锁定；`false` 锁定关闭。

开关位于 Admin → Sign-up 的 “New versions” 下。存在更新版本时 Admin → Status 会显示 “Kept X is available”，其 **Check now** 会立即询问。

## 每次升级前的快照

当 `kept migrate` 在已有数据的数据库上发现待应用的迁移，且配置了备份目标时，它会先拍摄仅含数据库、标签为 `pre_upgrade` 的 restic 快照。**若快照失败，什么都不会迁移**，命令以原因停止。保留最近 3 份升级前快照。

- 没有备份目标：Kept 仍会迁移，并大声记入日志，Admin → Status 会显示 “upgraded without a backup”，直到下一次正常备份。
- `KEPT_UPGRADE_SNAPSHOT=off`（或 `kept migrate --skip-snapshot`）可故意跳过。
- [Home Assistant 应用](/zh/install/home-assistant/)从不拍摄：更新前 Home Assistant 自己的备份就是回退手段。
- 全新的数据库从不拍摄。

要让这生效，`migrate` 服务除所有者登录外还需要密钥与备份设置。Compose 文件会提供全部三项；目录目标还需要在 `migrate` 上挂载（[备份](/zh/admin/backups/#turning-it-on)）。

## 回退一个版本

要回退，重新运行上一发行版的镜像：把 `KEPT_IMAGE` 改回旧标签，再 `docker compose up -d`。没有 down 迁移；上一版本可在更新的 schema 上运行。

Kept 在数据库中记录每个版本的迁移，并在启动时检查：

- 数据库比镜像**超前一个版本**：Kept 启动，Admin → Status 显示它从 X 回退而来；
- 超前**超过一个**版本，或超前于无任何已记录版本执行过的迁移：Kept 拒绝启动（`downgrade_refused`）并点出两个版本。此时应改为[恢复](/zh/admin/restore/)升级前快照。`KEPT_ALLOW_DOWNGRADE=1` 可强制启动，且强制会记入审计。

从 1.14.4 回退到 1.14.3：1.14.3 的地图有 1 m 最小值。边长小于 1 m 的房间会保持其尺寸，直到有人在 **Arrange** 中点 **Done**（会保存为 1 m，若与下一房间重叠则拒绝）。要保留这些尺寸，请在回到 1.14.4 之前不要排布地图。

## Postgres 主版本升级

Kept 的 Compose 文件按 digest 固定 Postgres 18，其依赖更新从不提议主版本升级。新的主版本是**转储并恢复**，绝不是在现有卷上改标签（一个主版本的数据文件无法在另一个中打开）：

1. 做一次备份并等它完成：`docker compose run --rm --no-deps --entrypoint kept kept admin backup`。
2. 停止 Kept：`docker compose stop kept`。
3. 把 `db` 镜像改到新主版本，使用**新**卷（在 `compose.yaml` 中重命名 `kept-db`，或把旧卷移到一边）；完成前保留旧卷。
4. `docker compose up -d db`：init 脚本会在空数据库中创建角色与扩展。
5. [恢复](/zh/admin/restore/#after-losing-the-server)备份到其中，然后 `docker compose up -d`。

Kept 的镜像带有其所支持 Postgres 主版本的客户端工具，恢复时会检查它们与服务器匹配。
