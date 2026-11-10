---
title: 硬件需求
description: Kept 在什么环境上测试过、占用了多少内存，以及什么会让它需要更多资源。
sidebar:
  order: 6
---

**测试环境：1 GB 内存，1 或 2 个 CPU 核心**，配合外部 AI 提供商或不使用 AI。所有测试均通过，包括照片上传期间的备份。2 GB 则宽裕得多。

## 测试了什么

- **版本：** Kept 1.14.3 的变更（发布前的构建），按发布状态的 `compose.yaml`（Kept、带 pgvector 的 Postgres 18）。1.14.2 的备份需要 2 GB。
- **机器：** 在 arm64 Mac 上以 Docker 模拟。Docker、Kept 和 Postgres 共享同一内存与 CPU 预算，如同小型 VM，为操作系统预留 128 MB。无 swap。
- **数据：** 一个家庭，外加一个含 3,000 件物品、206 个位置和 200 个容器的位置，以及 300 张真实照片。
- **工作：** 20 张 1200 万像素照片、两个 PDF、120 次该位置地图与关系图加载、120 次列表与搜索读取、照片上传期间的 `kept admin backup`、计划备份，然后闲置 10 分钟。

| 机器 | 照片、地图、搜索、PDF | 上传期间备份 | 计划备份 | 峰值 |
|---|---|---|---|---|
| 1 GB，2 核（3 次运行） | 通过 | 通过 | 通过 | 730–745 MB |
| 1 GB，1 核 | 通过 | 通过 | 通过 | 740 MB |
| 768 MB，1 核 | 通过，直到备份内存耗尽；Kept 重启期间 9 次上传和两个 PDF 失败 | 内存耗尽 | 单独运行通过（1 次） | — |

峰值是无法归还的内存（不含页缓存），针对整机，含 Docker。内存耗尽时，系统杀掉 Kept 进程，Docker 重启它。

- **空闲：** 启动后，Kept 约 160 MB，Postgres 约 30–70 MB。照片缩放完成后，Kept 稳定在约 300 MB。
- **真实数据：** 在 amd64 家庭服务器上，Kept 206 MB，Postgres 119 MB（一次读数）。
- **速度**（中位数）：列表页 30–40 ms，搜索 50–70 ms，照片上传 0.3–0.4 s，3,000 件物品位置的地图 0.4–0.5 s。
- **尚未测试：** 真实 VM、此规模下的 amd64、512 MB、本地 AI。性能测试持续进行：[#379](https://github.com/keptinventory/kept/issues/379)。

## 这意味着什么

- **1 GB，1 或 2 核：** 已测试，每次运行均通过，峰值时约剩 150 MB。
- **2 GB：** 宽裕，可在 Kept 旁运行其他服务。
- **768 MB：** Kept 能跑，**Run now**（计划备份路径）也能；照片上传期间的 `kept admin backup` 内存耗尽。不推荐。

## 树莓派

未在树莓派上测试。这些测试使用的是 arm64 镜像，因此 1 GB 或以上的 Pi 可能与 1 GB 行相近；预期会更慢。没有任何发布在 Pi 上测试过。

## 什么比较吃资源

- **备份。** `kept admin backup` 运行期间额外增加约 300–400 MB，计划备份约 150 MB；其中 restic 本身约 100 MB。不在 [Home Assistant 应用](/zh/install/home-assistant/)中：那里改由 Home Assistant 的备份运行。
- **照片缩放。** 每次上传到达时缩放。内存低于 3 GB，或容器限制低于 3 GB 时，Kept 一次缩放一张，否则两张（`KEPT_IMAGE_CONCURRENCY` 可覆盖）。前几张照片后内存上升约 150 MB 并保持。
- **超大位置的地图与关系图。** 服务器每次加载都读取整个位置：3,000 件物品约 670 KB。
- **不在服务器上：** 地图、关系图和 Grid 由你的浏览器绘制，空闲时不增加服务器内存；地图和关系图仅在打开时下载。
- **Ollama 本地 AI。** 同机上的模型与 Kept 共享内存，且远比 Kept 需要得多；见 [Ollama](/zh/admin/ollama/)。
- **磁盘。** 数据库很小；文件才是增长的部分。为备份留出另一块磁盘的空间；磁盘使用超过 85% 时 Admin → Status 会警告，并通知管理员。

## Postgres

Kept 需要带 pgvector 的 PostgreSQL 18。Compose 运行按 digest 固定的 `pgvector/pgvector` 镜像；若用提供商的数据库，见[托管 Postgres](/zh/install/managed-postgres/)。
