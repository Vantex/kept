---
title: Prometheus 与 Grafana
description: "用 Prometheus 抓取 Kept 的 /metrics，在 Grafana 中绘图，并对备份、磁盘与重启告警。"
---

一份用 Prometheus 与 Grafana 监控 Kept 的操作指南。指标本身、健康检查、日志与链路追踪见[监控](/zh/admin/observability/)。

## 1. 开启 `/metrics`

在 shell 中生成令牌：

```sh
openssl rand -hex 32
```

并把值粘贴到与 `compose.yaml` 同级的 `.env` 中：

```sh
KEPT_METRICS_TOKEN=<the value>
```

`.env` 按原样读取，因此其中的 `$(openssl …)` 会被当作字面量。然后应用配置：

```sh
docker compose up -d
```

Compose 会把该变量传给 Kept。没有它，`/metrics` 不存在。验证是否有响应：

```sh
curl -H "Authorization: Bearer <the value>" http://localhost:8080/metrics
```

在 Kubernetes 上，把 `KEPT_METRICS_TOKEN` 放入 Secret，并在 chart 的 `metrics.tokenSecret` 中指定（[Kubernetes](/zh/install/kubernetes/)）。

## 2. 抓取指标

把令牌保存为 Prometheus 可读的文件，例如 `/etc/prometheus/kept-token`，并添加一个 job：

```yaml
scrape_configs:
  - job_name: kept
    metrics_path: /metrics
    authorization:
      type: Bearer
      credentials_file: /etc/prometheus/kept-token
    static_configs:
      - targets: ['kept:8080']
```

`kept:8080` 是 Compose 网络上 Kept 的服务；从其他位置则使用 Prometheus 实际访问 Kept 的地址与端口。重载 Prometheus：其 targets 页面应显示 `kept` 为 up。

## 3. 需要关注什么

| 指标 | 关注点 |
|---|---|
| `kept_process_uptime_seconds` | 进程重启后回落到一个较小的值 |
| `kept_process_resident_memory_bytes` | 是否向容器内存上限增长 |
| `kept_db_pool_connections{state="waiting"}` | 超过 0 持续一分钟以上：有请求在等待数据库 |
| `kept_backup_last_success_timestamp_seconds` | 超过 36 小时（0 表示尚无正常备份） |
| `kept_backup_last_run_status{status="failed"}` | 1：最近一次备份失败 |
| `kept_disk_used_ratio{volume="data"}` | 超过 0.85 |
| `kept_update_available` | 1：有新版本。除非开启更新检查，否则保持 0（[升级](/zh/admin/upgrades/)） |

备份与磁盘数据来自每小时一次的检查，因此最多可能有一小时延迟。

## 4. Grafana

每行一个面板的仪表盘：

- **Stat**：`kept_build_info`，按其 `version` 标签。
- **Time series**：`kept_process_uptime_seconds` 与 `kept_process_resident_memory_bytes`。
- **Time series**：`kept_db_pool_connections`，按 `pool` 与 `state`。
- **Stat**：`time() - kept_backup_last_success_timestamp_seconds`，备份年龄（秒）。
- **Stat**：`kept_backup_last_run_status`，按 `status`。
- **Gauge**：`kept_disk_used_ratio{volume="data"}`，范围 0 到 1。

## 5. 告警

```yaml
groups:
  - name: kept
    rules:
      - alert: KeptDown
        expr: up{job="kept"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: Kept is down

      - alert: KeptBackupStale
        expr: >-
          kept_backup_last_success_timestamp_seconds > 0
          and time() - kept_backup_last_success_timestamp_seconds > 36 * 3600
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Kept's last good backup is more than 36 hours old

      - alert: KeptBackupFailed
        expr: kept_backup_last_run_status{status="failed"} == 1
        labels:
          severity: critical
        annotations:
          summary: Kept's last backup failed

      - alert: KeptDiskFilling
        expr: kept_disk_used_ratio{volume="data"} > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Kept's data disk is over 85% full

      - alert: KeptUpdateAvailable
        expr: kept_update_available == 1
        for: 1h
        labels:
          severity: info
        annotations:
          summary: A new Kept release is available
```

36 小时与 85% 与 Kept 自身的管理告警一致（[监控备份](/zh/admin/backups/#watching-it)）。`> 0` 用于让尚未完成首次备份的 Kept 上的过期备份规则保持安静：在此之前该指标为 0。

## 相关内容

- [监控](/zh/admin/observability/)：健康检查、指标、日志、链路追踪与错误上报。
- [备份](/zh/admin/backups/)：如何启用备份。
- [故障排查](/zh/admin/troubleshooting/)：告警触发时怎么办。
