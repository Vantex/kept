---
title: 使用 Helm 在 Kubernetes 上安装
description: 面向 k3s 及其他 Kubernetes 集群的 Kept Helm chart。
sidebar:
  order: 4
---

:::caution[尚未在真实集群上测试]
该 chart（仓库中的 `charts/kept/`）能渲染并通过校验（每次检查都运行 `helm lint`、`helm template` 和 `kubeconform`），每个发布会随镜像一起推送，但尚未在真实集群上安装过。请把首次安装当作一次测试。其 README 包含配置值、要创建的 secrets 和命令；本页说明它做什么。
:::

该 chart 运行与 Compose 相同的镜像，使用相同的[环境变量](/zh/reference/configuration/)。

- **先创建 secrets。** chart 从不写入 secret：你在安装前创建数据库登录的 secret（以及内置 Postgres 时其超级用户的），并在 values 中按名称引用可选项（密钥、S3、备份凭据、SMTP、指标令牌）。
- **Postgres：** 内置 StatefulSet 使用与 Compose 相同的固定 pgvector 镜像以便快速启动，或使用你自己的 PostgreSQL 18。有数据库超级用户（或提供商管理员）的 secret 时，Job 会创建 Kept 的角色和扩展；没有时，请自行运行 [managed-Postgres SQL](/zh/install/managed-postgres/#the-sql)。
- **迁移**在带 owner 登录的 hook Job 中运行，因此新版本绝不会在其迁移应用之前对外服务。配置了备份目标时，该 Job 先做一次[升级前快照](/zh/admin/upgrades/)。使用内置 Postgres 时，首次安装的 Job 在安装之后运行，因此那次 `helm install` 不要传 `--wait`。
- **本地存储的文件**位于 ReadWriteOnce 卷上，因此 Deployment 使用 `Recreate` 策略：升级会先停旧 pod 再启新 pod。只有在 S3 文件存储且密钥在 secret 中时才有滚动更新。
- **备份在 worker 中运行**，绝不在 CronJob 中：与 Compose 中相同的每夜任务，在 Admin → Backups 中配置，或由 chart 的 values 锁定。
- **Web 与 worker 分离**的 Deployment 是可选项；worker 为单副本。
- `helm uninstall` 时**卷会保留**；要删除数据请自行删除 claims。
- `helm test` 会向运行中的 Kept 请求 `/readyz` 和 `/version`。

chart 的版本就是 Kept 的版本：发布 1.0.1 会推送 chart 1.0.1。每个发布会把它作为签名 OCI 制品随镜像一起发布；见[验证发布](/zh/admin/verify-release/)。
