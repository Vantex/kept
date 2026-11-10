---
title: 仅用 restic 阅读你的清单
description: 服务器没了。只要有 restic、备份密码和一台电脑，就能打开你拥有一切的可读副本——无需 Kept，无需网络。
sidebar:
  order: 3
---

每份夜间快照都包含每个位置的**可读副本**：可在浏览器中打开的 `index.html`、物品的表格（CSV）、缩略图，以及页面链接到的收据与文档。它就是为 Kept 无法运行的那一天准备的：服务器烧毁、磁盘报废，或 Kept 早已不复存在。你只需要：

- **restic**（备份程序），装在任意电脑上（Windows、macOS 或 Linux）。其文档为各平台列出了安装包或下载。请使用 0.19.1（Kept 使用的版本）或更新版本。
- **仓库及其密码**，来自[恢复套件](/zh/admin/recovery-kit/)；若是 S3 存储桶或 SFTP 服务器，还需要套件中一并列出的凭据。
- 备份本身：它被发送到的磁盘、存储桶或 SFTP 服务器。

## 1. 把 restic 指向备份

恢复套件的备份部分给出仓库位置与密码，S3 还会给出两个密钥。在终端中：

```sh
export RESTIC_REPOSITORY='<the repository line from the kit>'
export RESTIC_PASSWORD='<the backup password from the kit>'
# S3 only:
export AWS_ACCESS_KEY_ID='<from the kit>'
export AWS_SECRET_ACCESS_KEY='<from the kit>'
```

Windows PowerShell 下使用 `$env:RESTIC_REPOSITORY = '…'` 等形式。若把目录备份拷到笔记本电脑上，路径就是备份目录中的 `restic` 文件夹。

## 2. 选择快照

```sh
restic snapshots
```

会列出每个快照及其时间与标签。选取最新的带 `nightly`（或 `manual`）标签的快照；`pre_upgrade` 快照只含数据库，不含可读副本。记下其 ID。

## 3. 恢复可读副本

```sh
restic restore <snapshot ID> --target ./kept-readable --include /backup/readable
```

这只会把可读副本（而非数据库转储或全尺寸文件）恢复到新文件夹 `kept-readable`。

## 4. 打开它

在浏览器中打开 `kept-readable/backup/readable/index.html`。它列出每个位置及其所有者与副本生成时间；每个位置自己的 `index.html` 会列出其地点与物品，以及照片、购买详情与文档。旁边的 `README.txt` 内容相同。

这些页面无需网络，也不会从任何其他地方加载资源。每个位置的 CSV 可在电子表格软件中打开。

每个位置的副本内容相当于其**所有者**在 Kept 中能看到的一切：金额按所有者所见呈现，机密值（你存在路由器上的 Wi-Fi 密码）绝不会出现。当晚副本生成失败的位置会标为 “not included tonight”；可改选它之前的快照。

## 不恢复也能浏览

在 Linux 上，以及装有 macFUSE 的 macOS 上，`restic mount ./mnt` 会把每个快照显示为可直接打开的文件夹。它需要 FUSE，Windows 没有；`restore` 则处处可用。
