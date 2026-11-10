---
title: 监控
description: 健康检查、状态页、告警、指标、日志，以及可选的链路追踪与错误上报。
sidebar:
  order: 12
---

除非你主动配置，Kept 不会向任何地方发送自身信息：**没有任何类型的遥测**，连选择加入的安装计数都没有。

## 健康检查

| 路径 | 响应 |
|---|---|
| `/healthz` | 进程提供 HTTP 服务时返回 200。用于存活探针。 |
| `/readyz` | Web 的两条数据库连接都能响应时返回 200，否则 503。用于就绪检查，以及镜像自身的 `HEALTHCHECK`。 |
| `/version` | 版本、构建所用 commit、源码仓库，以及第三方声明文件位置（镜像中的 `/notices.txt`）。 |

只运行 worker 的容器（`KEPT_ROLE=worker`）不提供 HTTP。镜像的 `HEALTHCHECK` 会跟随 `KEPT_ROLE`：对 worker 而言，它检查任务循环是否在过去两分钟内轮询过数据库（过程中会触碰 `/tmp/kept-worker-alive`），因此拆分部署无需覆盖 healthcheck。

## 状态页与告警

**Admin → Status** 显示需要注意的内容：恢复套件、邮件、失败的后台任务、提醒扫描，以及备份：备份年龄、最近一次恢复演练、存储桶版本控制、磁盘空间、版本及其迁移、更新检查、HTTPS 与连接器。管理告警通过应用内、邮件与推送触达实例管理员；原因消除后每条告警会自动解决。

## 指标

设置 `KEPT_METRICS_TOKEN` 后，`/metrics` 会向以 bearer 令牌发送该值的请求（`Authorization: Bearer <token>`）提供 Prometheus 文本；没有该变量时路径不存在。Compose 会从 `.env` 透传该变量。

| 指标 | 含义 |
|---|---|
| `kept_build_info{version, revision}` | 恒为 1；当前运行的构建 |
| `kept_process_uptime_seconds` | 进程启动以来的秒数 |
| `kept_process_resident_memory_bytes` | 进程内存 |
| `kept_db_pool_connections{pool, state}` | 每个数据库连接池的连接数：total、idle、waiting |
| `kept_backup_last_success_timestamp_seconds` | 最近一次正常备份完成时间（首次之前为 0） |
| `kept_backup_last_run_status{status}` | 最近一次完成运行的状态为 1，其余状态为 0 |
| `kept_disk_used_ratio{volume}` | 数据磁盘与目录备份目标的使用率 |
| `kept_update_available` | 更新检查发现新版本时为 1 |

任何标签都不会包含路径或备份目标。数据库无法响应时，备份、磁盘与更新相关指标会被省略；抓取本身仍会成功。

## 日志

标准输出上的 JSON 行（`KEPT_LOG_FORMAT=json`，默认），或用 `pretty` 方便肉眼阅读 `docker compose logs`；`KEPT_LOG_LEVEL` 设置级别。每个请求都有 id，并通过 `x-request-id` 响应头返回，以便把报告与对应日志行关联。URL 中的令牌会在日志中脱敏，机密与密码从不写入日志。

## 链路追踪与错误上报

两者均可选，默认关闭。

- **链路追踪：** 设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 后，Kept 会把其 HTTP 请求与数据库查询的 OpenTelemetry 追踪发送到你的收集器。未设置时，追踪代码甚至不会加载，收集器宕机也绝不会拖慢请求。
- **错误上报：** 在 `KEPT_ERROR_DSN` 中配置兼容 Sentry 的 DSN 后，未处理错误会连同请求 id 与路由一并上报，绝不包含请求体、请求头、查询串、姓名或位置中的任何存储内容。
