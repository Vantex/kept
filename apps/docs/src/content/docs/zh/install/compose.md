---
title: 使用 Docker Compose 安装
description: 在你自己的服务器或 homelab 上用 Docker Compose 运行 Kept 和它的 Postgres，首次登录，并保管好密钥。
sidebar:
  order: 1
---

Docker Compose 是在一台机器上运行 Kept 的方式：Kept 本身，以及带 pgvector 的 Postgres 18。
用于 HTTPS 的 Caddy 和用于本地 AI 的 Ollama 由第二个文件提供（[Caddy 与 Ollama](#caddy-and-ollama)）。你需要带 Compose 插件的 Docker。已在 1 GB 内存、1 个 CPU 核心的机器上测试；Kept 及其数据库大约占用其中 200–400 MB（[测试详情](/zh/install/hardware/)）。

四步，无需克隆仓库，也无需设置密码：

```sh
mkdir kept && cd kept
curl -fsSLO https://raw.githubusercontent.com/keptinventory/kept/v1.14.6/compose.yaml
docker compose run --rm init
docker compose up -d
```

`compose.yaml` 可独立使用，因此也可粘贴到 Portainer、Dockge 等（见[无终端时](#without-a-terminal)）。

:::note[镜像]
发布推送到 `ghcr.io/keptinventory/kept`，标签为 `1`、`1.2` 和 `1.2.3`，从不使用 `latest`；`1.0.0` 是第一个签名版本。相同的镜像、用相同密钥签名，也以 `keptinventory/kept` 存在于 Docker Hub。除非 `.env` 中的 `KEPT_IMAGE` 指定了其他镜像，否则 `compose.yaml` 运行与之发布时对应的版本；`init` 会把它实际运行的版本写在那里。
如果你愿意，可以先[验证它](/zh/admin/verify-release/)。要在检出目录中运行自己的构建：`docker build -t kept:local .`，并设置 `KEPT_IMAGE=kept:local`。
:::

## 运行了什么

| 服务 | 运行内容 |
|---|---|
| `db` | Postgres，并持续运行 |
| `kept` | 8080 端口上的 Kept，并持续运行 |
| `bootstrap` | 每次启动各跑一次，然后退出：数据库登录和扩展 |
| `migrate` | 每次启动各跑一次，然后退出：数据库迁移 |
| `init` | 仅当你运行它时（`docker compose run --rm init`）：写入 `.env` |

## Caddy 与 Ollama

`compose.yaml` 只运行 Kept。`compose.full.yaml` 是同一文件，外加用于 HTTPS 的 Caddy（`https` profile）、用于本地 AI 的 Ollama（`ollama` profile），以及注释掉的 Web 与 worker 分离部署。它也可独立使用。若要改用它：

```sh
curl -fsSLO https://raw.githubusercontent.com/keptinventory/kept/v1.14.6/compose.full.yaml
docker compose -f compose.full.yaml run --rm init
echo COMPOSE_FILE=compose.full.yaml >> .env
docker compose up -d
```

`.env` 中有 `COMPOSE_FILE` 后，普通 `docker compose` 会读取 `compose.full.yaml`，因此本文档中的每条命令都按原样可用。两个文件中的 Kept 服务、网络和卷相同：安装可随时切换并保留数据。

## 1. 编写 `.env`

```sh
docker compose run --rm init
```

`init` 会询问**你将打开 Kept 的地址**，例如 `http://kept.home.arpa:8080` 或 `https://kept.example.org`。链接、印刷标签上的二维码以及同源检查都基于它构建，因此必须与浏览器显示的完全一致，且不应改变：**请用域名而非 IP 地址。** 家庭路由器某天可能给这台机器换一个地址，你印好的标签就会失效。在路由器 DNS 或每台设备的 hosts 文件中设置该名称。若你确认使用 IP 地址，它仍然可用。

然后它会在 `compose.yaml` 旁写入 `.env`，包含该地址（`KEPT_PUBLIC_URL`）、端口（`KEPT_HTTP_PORT`，来自 `http://` 地址）、镜像和一个设置代码（`KEPT_SETUP_CODE`），并显示该代码。`.env` 不含密码，且仅你可读。再次运行 `init` 可更改地址：它会更新那些行，并保留你添加的其他内容。无终端时，在命令行给出地址：`docker compose run --rm init --url http://kept.home.arpa:8080`。

其余均可选；`compose.env.example` 和[配置参考](/zh/reference/configuration/)说明了每个变量的作用。

## 2. 启动

```sh
docker compose up -d
```

Compose 启动数据库并等待其健康。然后：

- **`bootstrap`**（一次性，`kept bootstrap`）创建 Kept 的四个数据库登录，以及 `pg_trgm`、`unaccent` 和 `vector` 扩展。首次启动时，它把每个登录的密码生成到卷中；每次启动时，它把每个登录的密码设为该值，因此 Postgres 与 Kept 始终一致。
- **`migrate`**（一次性，`kept migrate`）在锁下应用一次数据库迁移。
- **Kept** 在 8080 端口启动（`KEPT_HTTP_PORT` 更改主机端口）。

## 3. 完成设置

打开地址，输入 `init` 显示的设置代码，并创建第一个账号：它将成为实例管理员。Kept 也会在首次启动时把代码打印到日志中：

```sh
docker compose logs kept | grep "KEPT SETUP CODE"
```

丢失的代码可用以下命令重新签发：

```sh
docker compose run --rm migrate admin setup-code
```

错误代码会按地址以及整个实例锁定一段时间。若 Kept 位于它不信任的代理之后，所有人都会共享代理的地址；见[反向代理](/zh/install/reverse-proxy/)。

## 4. 保管好密钥

首次启动且 `KEPT_SECRET_KEY` 与 `KEPT_AUTH_SECRET` 未设置时，Kept 会把两者生成到 `kept-config` 卷中，并打印一行说明位置。密钥密封每个机密值（AI 密钥、你在 Kept 中存储的密码）：**除非你同时拥有该密钥，否则备份会恢复除这些值之外的一切。**

打印密钥并保存在本服务器之外，例如密码管理器：

```sh
docker compose exec kept kept admin recovery-kit
```

Admin → Status 会要求你确认恢复套件，Kept 在第一个机密值、AI 密钥或备份设置之前会要求它。见[恢复套件](/zh/admin/recovery-kit/)。

## 5. 下一步

- [为 Kept 启用 HTTPS](/zh/install/https/)：摄像头、安装应用、推送通知和定位仅在 HTTPS 下可用。
- [配置备份](/zh/admin/backups/)。
- 邮件：设置 `KEPT_SMTP_URL`（`smtp://` 或 `smtps://`，含凭据）和 `KEPT_SMTP_FROM`，以通过邮件发送密码重置、邀请和提醒。没有它们时，提醒只在应用内送达，Admin → Status 会说邮件未配置。

## Compose 创建了什么

| 卷 | 内容 | 需要备份吗？ |
|---|---|---|
| `kept-db` | Postgres 数据库 | 通过 Kept 的备份；绝不在运行时复制该卷 |
| `kept-data` | 上传的文件（默认 `KEPT_STORAGE=local`） | 通过 Kept 的备份 |
| `kept-config` | 生成的 `KEPT_SECRET_KEY` 和 `KEPT_AUTH_SECRET`，以及 `kept_app`、`kept_auth` 和 `kept_system` 登录的密码 | 保管好恢复套件；密码丢失可重新生成 |
| `kept-owner` | `kept_owner` 登录的密码 | 否；丢失可重新生成 |
| `caddy-data`、`caddy-config` | Caddy 的证书（`compose.full.yaml` 的 `https` profile） | 否；Caddy 会获取新证书 |

数据库超级用户没有任何人都需要的密码：只能从数据库容器内部访问，即 `docker compose exec db psql -U postgres`，以及由共享该容器网络的 bootstrap 访问。通过网络时，每个登录都需要自己的密码。绝不要发布 `db` 服务的端口（不要给它加 `ports:`）：Kept 通过 compose 网络访问它。

Kept 的容器以非 root 用户（uid 10001）运行，根文件系统只读，丢弃所有 Linux 能力，并设置 `no-new-privileges`。`migrate` 服务持有数据库所有者的登录；对外服务的容器在你为每夜备份提供它之前（[备份](/zh/admin/backups/#turning-it-on)）从不见到它（`kept-owner` 卷未挂载在那里）。`init` 是非 root 规则的唯一例外：它以 root 运行，无网络，仅有在你文件夹中创建 `.env` 并交给你所需的能力，然后退出。

## 无终端时

Portainer、Dockge 及类似工具可原样接受 `compose.yaml`（或 `compose.full.yaml`）。它们不运行 `init`，因此请在其环境编辑器中设置两个变量：`KEPT_PUBLIC_URL`（地址，同上）和 `KEPT_SETUP_CODE`（0–9 和 A–Z 中不含 I、L、O、U 的六个字符，例如 `KPT-2X9`；或留空并从 Kept 日志中读取代码）。若工具不固定版本，请把 `KEPT_IMAGE` 钉到某个发布。

## 1.13.0 之前的安装

用仓库副本创建的安装，其 `.env` 中有五行 `KEPT_DB_*_PASSWORD`。在这个 `compose.yaml` 下，它们按给定值使用，不会生成任何内容：更新检出（或把新的 `compose.yaml` 下载到旧 `.env` 旁）并运行 `docker compose up -d`。之后删除那些行，或用 `init` 重新编写 `.env`，也是安全的：下次启动会生成新密码并写入 Postgres。空的 `KEPT_IMAGE` 过去会构建检出；现在它运行 `compose.yaml` 指定的发布，因此若你自行构建，请设置 `KEPT_IMAGE=kept:local`。

## Web 与 worker 分离

一个容器同时对外服务 Web 应用并运行后台任务（`KEPT_ROLE=all`，默认）。要分离它们，在 `KEPT_ROLE=web` 的服务旁再运行一个 `KEPT_ROLE=worker` 的 Kept 服务。worker 不对外提供 HTTP；镜像的 healthcheck 跟随 `KEPT_ROLE`，改为检查 worker 的任务循环，因此两者都不需要覆盖配置（`compose.full.yaml` 中这两个服务已注释掉）。worker 运行每夜备份，因此它是需要 owner 登录和目录目标挂载的那个。
