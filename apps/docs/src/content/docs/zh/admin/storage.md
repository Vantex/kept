---
title: 切换文件存储
description: 在服务器磁盘与 S3 存储桶之间迁移 Kept 的文件，并做一次经过校验的复制。
sidebar:
  order: 6
---

Kept 把文件（照片、收据、文档）存在数据卷（`KEPT_STORAGE=local`，默认）或兼容 S3 的存储桶（`KEPT_STORAGE=s3` 配合 `KEPT_S3_*` 变量）中。仅改 `KEPT_STORAGE` 不会移动任何东西：已存储的文件仍在原处，Kept 将找不到它们。移动它们是一次复制。

## 迁移

文件一旦存储就不会改变，因此在 Kept 运行时复制是安全的，且可以重复执行：目标处已有正确哈希的文件会被跳过。

1. 在现有设置旁添加目标设置（S3：`KEPT_S3_BUCKET`、`KEPT_S3_ACCESS_KEY_ID`、`KEPT_S3_SECRET_ACCESS_KEY`，以及需要时的 `KEPT_S3_ENDPOINT`、`KEPT_S3_REGION`、`KEPT_S3_FORCE_PATH_STYLE`），保持 `KEPT_STORAGE` 不变。
2. **在 Kept 运行时复制：** `kept admin storage copy --to s3`（或 `--to local`）。数据库引用的每个文件及其缩放版本都会被复制并校验 SHA-256。`--dry-run` 只统计。
3. **停止 Kept**，再复制一次：只会补上此时尚未到达的内容。
4. 把 `KEPT_STORAGE` 设为新存储，并启动 Kept。
5. **校验：** `kept admin storage verify --store s3` 检查数据库引用的每个文件。

旧文件会留在原处；确认无误后请自行删除。

## 选择 S3 之前

- 开启**存储桶版本控制**：使用 S3 存储时备份不包含文件本身，版本控制才是找回被删除或被覆盖文件的手段（[备份](/zh/admin/backups/#when-files-live-in-s3)）。
- 手机通过短期签名链接直接从存储桶获取文件。若服务器访问存储桶的地址是手机无法访问的（例如在 Compose 内部），请把 `KEPT_S3_PUBLIC_ENDPOINT` 设为手机可访问的那个。
- 用存储桶自己的主机名对外服务，绝不使用 Kept 的。
