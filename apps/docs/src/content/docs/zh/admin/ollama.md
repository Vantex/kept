---
title: 用 Ollama 运行本地 AI
description: 通过 compose.full.yaml 中的 Ollama profile 在自己的机器上运行 AI 模型，以及它对内存的占用。
sidebar:
  order: 10
---

Kept 的 AI 功能（根据照片与收据填写信息、助手、语义搜索）使用位置所有者在 **Settings → AI** 中连接的任意提供商。Ollama 在你自己的硬件上运行模型，数据不出本机；Kept 以 **OpenAI 兼容**提供商的方式与之通信。

:::caution[未经测试]
Ollama 尚未针对 Kept 做过测量。模型与 Kept 共享机器内存，因此请按高于 [Kept 测试所用的 1 GB](/zh/install/hardware/) 来规划，并预期小模型在读取收据时比托管模型更慢、更不准确。
:::

## 配置方法

1. Ollama 随 `compose.full.yaml` 提供，而非 `compose.yaml`：下载它并在 `.env` 中设置 `COMPOSE_FILE=compose.full.yaml`（[Caddy and Ollama](/zh/install/compose/#caddy-and-ollama)）。用 `ollama` profile 启动 Kept，再用 Ollama 自带命令拉取模型：

   ```sh
   docker compose --profile ollama up -d
   docker compose exec ollama ollama pull <model>
   ```

   模型保存在 `ollama` 卷中。主机上不发布任何端口：只有 Compose 网络上的 Kept 能访问 Ollama。在拉取任何模型之前，镜像约为 3.8 GB（amd64）或 2.8 GB（arm64）。

2. **允许私有地址。** `http://ollama:11434` 位于 Compose 自身网络上，属于私有地址，而 Kept 默认拒绝这类地址（[出站请求](/zh/admin/security-model/#outbound-requests-ssrf)）。请先由实例管理员开启 **Admin → Settings → Allow private addresses**；否则添加提供商会提示 “That address is on a private network”。家庭网络中其他位置的 Ollama（或 LM Studio）同理。

3. 在 **Settings → AI** 中添加 **OpenAI 兼容**提供商，base URL 为 `http://ollama:11434/v1`，并填写你拉取的模型。Ollama 会忽略 API key，因此任意值均可。
