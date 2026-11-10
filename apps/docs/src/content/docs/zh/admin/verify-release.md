---
title: 验证发布
description: 检查 Kept 镜像是否确为维护者构建并签名的那一个。
sidebar:
  order: 11
---

每个发行版镜像都用维护者持有的密钥通过 **cosign** 签名，并附带 SBOM（内部清单）与第三方声明文件。发行版镜像带有 `X.Y.Z`、`X.Y` 与 `X` 三个标签，全部指向同一个已验证的 digest；绝不会有 `latest`。

在运行前检查镜像：安装 cosign，并用仓库中的 `cosign.pub` 验证：

```sh
cosign verify --key cosign.pub <image>:<version>
```

签名记录在公开的透明日志中，每个版本的发行说明都给出确切命令。有效签名会打印已验证的 claims 并以 0 退出；其他结果都意味着不要运行它。把它打印的 digest 固定到 `KEPT_IMAGE`（`<image>@sha256:…`），以确保运行的正是该镜像。

Helm chart 作为 OCI 构件与镜像并列发布，签名方式相同。运行中的 Kept 在 `/version` 报告其版本、构建所用 commit 与源码仓库，并在 `/notices.txt` 提供镜像的第三方声明（应用版本行中有链接）。
