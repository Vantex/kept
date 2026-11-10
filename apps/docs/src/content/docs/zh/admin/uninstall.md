---
title: 卸载
description: 移除 Kept 及其存储的一切——先取出你想保留的内容。
sidebar:
  order: 9
---

**先把数据取出来。** 卷一旦删除，除了备份，没有什么能把它们找回来。

1. 每位所有者导出自己的位置（**Settings → Export**），或把最新备份与[恢复套件](/zh/admin/recovery-kit/)保存在安全的地方：仅靠 restic，之后你仍能[阅读你的清单](/zh/admin/read-with-restic/)。
2. 在含 `.env` 的目录中停止并移除容器**及其卷**：

   ```sh
   docker compose --profile https --profile ollama down --volumes
   ```

   这会移除 `kept-db`（数据库）、`kept-data`（文件）、`kept-config`（生成的密钥与数据库密码）与 `kept-owner`（所有者登录的密码）；使用 `compose.full.yaml` 时还包括 Caddy 证书与 Ollama 模型。不加 `--volumes` 时，数据会留在机器上。
3. 移除镜像：`docker image rm ghcr.io/keptinventory/kept:<version>`（你运行的标签，或自建的 `kept:local`），以及 Compose 文件旁的 `.env`。
4. 在机器之外，移除你为 Kept 自行配置的内容：
   - **文件存储桶**（`KEPT_STORAGE=s3` 时），以及其旧版本（若开启了版本控制）；
   - **备份：** 备份磁盘上的 `restic` 目录、备份桶中的 `restic/` 前缀，或 SFTP 服务器上的仓库，以及旁边任何 alpha 版的 `runs/` 与 `blobs/`；
   - 数据库若来自提供商：`kept_*` 角色与数据库本身；
   - 你添加的 DNS 记录、代理路由与 Tailscale `serve`。
