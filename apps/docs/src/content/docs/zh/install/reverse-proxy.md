---
title: 在反向代理之后
description: Kept 位于 nginx、Traefik、Caddy 或其他代理之后时的重要设置——受信地址、上传大小、使用哪个主机名、地址错误和 HSTS。
sidebar:
  order: 3
---

Kept 监听 8080 端口并讲普通 HTTP；前面的代理终止 TLS。把代理指向 8080 端口，将 `KEPT_PUBLIC_URL` 设为人们打开的地址，并检查以下事项。Compose 自己的 [Caddy profile](/zh/install/https/#composes-caddy-profile) 已完成前三项。

## 信任代理，且只信任代理

Kept 按**客户端地址**对登录、设置代码和其他敏感请求限流。在代理之后，客户端地址出现在 `X-Forwarded-For` 中，而任何人都可以写它。Kept 只从 `KEPT_TRUSTED_PROXIES` 中的地址相信它：

```sh
KEPT_TRUSTED_PROXIES=10.0.0.5            # one proxy
KEPT_TRUSTED_PROXIES=10.0.0.5,10.0.1.0/24  # several, or a range
```

Kept 从右往左遍历 `X-Forwarded-For`，停在第一个不信任的地址：那就是客户端。为空（默认）时，socket 地址即客户端。请按 Kept 看到的方式列出代理的地址（在 Docker 网络上是代理容器的地址，不是主机的），且不要列出陌生人可用来发请求的地址。

使用 Compose 时，把它写在 `compose.yaml` 旁的 `.env` 中。1.14.5 之前，`compose.yaml` 会设置自己的值，`.env` 中的行从未到达 Kept；在那些版本上请在 `compose.override.yaml` 中为 `kept` 服务设置。使用 `compose.full.yaml` 的 Caddy 时，留空（Caddy 的地址是默认值）或在列表中保留 `172.29.72.200`。

### 设置锁定

错误的设置代码会暂时锁定发送它们的地址，多次错误会锁定整个实例。若代理不在 `KEPT_TRUSTED_PROXIES` 中，每个访客都共享代理的地址，因此一个人的猜测会锁住所有人。`kept admin setup-code` 会签发新代码并解除实例级锁定，但不解除按地址的锁定：后者会自行结束。

## 放行上传

代理必须接受至少与 Kept 一样大的请求体，并且不应缓冲它不需要的上传：

| 上传 | Kept 的限制 |
|---|---|
| 照片、收据或文档 | `KEPT_MAX_FILE_MB`，默认 25 MB；流式处理，过大时在读取前以 413 拒绝 |
| CSV 导入 | 8 MB |

多数代理的默认值更小（例如 nginx 的 `client_max_body_size`）；请至少提高到 `KEPT_MAX_FILE_MB`。超时应允许在慢速手机连接上完成大文件上传。

## 给 Kept 独立的主机名

在父域下没有你不控制的站点的主机名上对外提供 Kept，或使用它自己的域名。HTTPS 下 Kept 的会话 cookie 带 `__Secure-` 前缀，但这仍允许**兄弟**子域上的页面（例如 `kept.example.org` 旁的 `other.example.org`）为 `example.org` 设置 cookie，而浏览器也会把它发给 Kept。由他人运行的兄弟子域可能用它固定会话。你自己的其他兄弟子域服务没问题。

## "This Kept is set up for …"

当应用在不同于 `KEPT_PUBLIC_URL` 的地址打开时，会提示 "This Kept is set up for *address*. Open it there."。

- **原因：** Kept 只接受来自 `KEPT_PUBLIC_URL` 地址的写入，依据浏览器的 `Origin`：协议、主机和端口，精确匹配。代理不起作用；它自己的地址和 `X-Forwarded-*` 头不会改变它。
- **修复：** 把 `KEPT_PUBLIC_URL` 设为人们恰好打开的地址（`https://kept.example.org`，而不是代理上游的 `http://kept:8080`），并重启 Kept。
- **多个地址：** `KEPT_EXTRA_ADDRESSES` 列出其他地址，且每个都必须也能通过你的代理到达 Kept（[多个地址](/zh/install/home-network/#more-than-one-address)）。

更多见[故障排查](/zh/admin/troubleshooting/#this-kept-is-set-up-for--or-the-request-did-not-come-from-this-site)。

## HSTS

`KEPT_PUBLIC_URL` 为 `https:` 时，Kept 发送 `Strict-Transport-Security: max-age=31536000`：浏览器此后一年内只以 https 打开该主机名。`http:` 时不发送任何内容。

- **整个主机名，所有端口：** 浏览器把策略应用于主机名，而非 Kept 的端口。同名下的普通 http 服务，例如 Kept 在 `https://server.lan` 时旁边的 `http://server.lan:8081`，会被强制 https 并停止加载。浏览器忽略来自 IP 地址的 HSTS。
- **关闭它：** 当其他普通 http 服务共享 Kept 的主机名时，设置 `KEPT_HSTS=off` 并重启。Kept 此后发送 `max-age=0`，因此已存储该策略的浏览器会在下次 https 访问 Kept 时忘记它。省略该头不会清除它。
- **你的代理：** 若它添加自己的 `Strict-Transport-Security` 头，也请在那边关闭。
- **预加载域名：** 在浏览器 HSTS preload 列表下的顶级域（如 `.dev` 或 `.app`）中，无论 Kept 发送什么，每个名称都只能是 https。

### 手动清除已存储的策略

当 Kept 不再可通过 https 访问时，`max-age=0` 到不了浏览器。请在每个访问过它的浏览器中清除该主机名：

- **Chrome、Edge 及其他 Chromium 浏览器：** 打开 `chrome://net-internals/#hsts`（Edge 中为 `edge://net-internals/#hsts`），在 **Delete domain security policies** 下输入主机名，并选择 **Delete**。
- **Firefox：** History → Manage History，找到该站点，右键并选择 **Forget About This Site**。这也会删除其历史、cookie 和已保存的登录。
- **Mac 上的 Safari：** 没有 HSTS 页面。删除站点数据（Settings → Privacy → Manage Website Data，选中它，**Remove**）；若普通 http 仍变成 https，再清除历史（History → Clear History）。
- **iPhone 或 iPad 上的 Safari：** Settings → Apps → Safari（iOS 18 之前为 Settings → Safari）→ Advanced → Website Data，找到该站点并删除；若不够，在 Safari 页面上 **Clear History and Website Data**。
