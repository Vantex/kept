---
title: 为 Kept 启用 HTTPS
description: Kept 为何需要 HTTPS，以及如何获得它——来自 compose.full.yaml 的 Caddy、Tailscale、NetBird、Twingate、Cloudflare Tunnel，或你自己的代理。
sidebar:
  order: 2
---

Kept 可在普通 HTTP 下工作，但手机会把普通 HTTP 地址视为不安全，若干功能会停止工作：

- **摄像头**（Kept 回退到文件选择器），
- **安装 Kept** 到主屏幕，以及从它离线工作，
- **推送通知**，
- **定位**。

`localhost` 算安全；HTTP 上的局域网地址不算。`KEPT_PUBLIC_URL` 为 `https:` 时，Kept 还会把 cookie 标记为 `Secure` 并发送 HSTS；普通 http 服务共享主机名时，`KEPT_HSTS=off` 可清除它（[HSTS](/zh/install/reverse-proxy/#hsts)）。

`KEPT_PUBLIC_URL` 为 `http:` 时，即使在 `localhost` 上，Kept 也会直接拒绝某些涉及交出或更改机密的操作：显示机密值、含机密值的导出、导入时打开导出中的机密、在浏览器中创建访问令牌、用 OAuth 连接应用、下载恢复套件，以及更改或测试备份设置。不含机密值的导出可用，不含机密值的导入也可用。HTTP 下会话也更短。Kept 通过 HTTP 对外期间，首页的「开始使用」清单会把「为 Kept 启用 HTTPS」放在首位，直到管理员选择「Staying on my home network」。普通 HTTP 下全部可用功能一览：[家庭网络上的 Kept](/zh/install/home-network/)。

无论选择哪种方式，都要把 `KEPT_PUBLIC_URL` 设为人们将打开的 `https://` 地址，并重启 Kept。

## Compose 的 Caddy profile

适用于指向本机的域名，且 80 和 443 端口可从互联网访问（Caddy 通过它们向 Let's Encrypt 或 ZeroSSL 证明域名）。Caddy 随 `compose.full.yaml` 提供，而非 `compose.yaml`（[Caddy 与 Ollama](/zh/install/compose/#caddy-and-ollama)）：

```sh
# in .env
COMPOSE_FILE=compose.full.yaml
KEPT_DOMAIN=kept.example.org
KEPT_PUBLIC_URL=https://kept.example.org
```

Caddy 读取 Compose 文件旁的 `docker/caddy/Caddyfile`。仓库检出目录中已有这两个文件；没有的安装可一次性下载：

```sh
curl -fsSLO https://raw.githubusercontent.com/keptinventory/kept/v1.14.6/compose.full.yaml
mkdir -p docker/caddy
curl -fsSLo docker/caddy/Caddyfile https://raw.githubusercontent.com/keptinventory/kept/v1.14.6/docker/caddy/Caddyfile
docker compose --profile https up -d
```

没有该文件时，`docker compose --profile https up -d` 会以 "bind source path does not exist" 停止。其他任何代理都可替代；它转发到 Kept 的端口，如下各节所述。

Caddy 获取并续期证书，并把一切转发给 Kept。Compose 给 Caddy 一个自己网络上的固定地址，并把该地址作为 `KEPT_TRUSTED_PROXIES` 传给 Kept，因此 Kept 只相信 Caddy 的 `X-Forwarded-For`，不相信其他来源。之后你可以用 `KEPT_HTTP_PORT=127.0.0.1:8080` 只把普通 HTTP 绑定到回环地址。

若 `172.29.72.0/24` 与你的局域网冲突，请在 `compose.full.yaml` 中一起更改网络的子网、其 `ip_range`、Caddy 的 `ipv4_address` 和 `KEPT_TRUSTED_PROXIES`。

## Tailscale

适用于只有你自己的设备能访问、没有端口对互联网开放的 Kept：在运行 Kept 的机器上，并为你的 tailnet 启用 HTTPS 证书，

```sh
tailscale serve --bg 8080
```

会以真实证书在 `https://<machine>.<tailnet>.ts.net` 上对外提供 Kept，供 tailnet 上的任何设备访问。把 `KEPT_PUBLIC_URL` 设为该地址。

Tailscale 的代理运行在同一台机器上，从 `127.0.0.1` 连接 Kept；除非你信任它，否则 Kept 会把每个请求都视为来自那里。在只有单个家庭的实例上，这只影响[设置锁定](/zh/install/reverse-proxy/#the-setup-lockout)。

## NetBird

NetBird 的反向代理为对等节点的端口提供带证书的公开 `https://` 地址：

```sh
netbird expose 8080
```

它会打印该地址。把 `KEPT_PUBLIC_URL` 设为它（或设为你自己的域名，并使用 `--with-custom-domain kept.example.org`，需先在 NetBird 中配置）。除非你在仪表板中为服务选择 **NetBird-Only Access**（限制为你的对等节点），否则地址是公开的。账户管理员需先在 Settings → Clients 下开启 **Peer Expose**。

## Twingate

Twingate 让你的设备无需开端口即可访问 Kept，但证书是你的：给 Kept 一个你拥有域名下的主机名（`kept.example.org`），用 DNS challenge 获取证书（Caddy、Traefik 或 cert-manager 可以），并将该主机名添加为 Twingate 资源。把 `KEPT_PUBLIC_URL` 设为 `https://kept.example.org`。

## Cloudflare Tunnel

适用于没有开放端口的公开地址。Cloudflare 以 HTTPS 对外提供主机名，并通过 `cloudflared` 转发到 Kept：

```sh
cloudflared tunnel login
cloudflared tunnel create kept
cloudflared tunnel route dns kept kept.example.org
cloudflared tunnel run kept
```

配合 `~/.cloudflared/config.yml`：

```yaml
tunnel: kept
credentials-file: <home>/.cloudflared/<tunnel id>.json
ingress:
  - hostname: kept.example.org
    service: http://localhost:8080
  - service: http_status:404
```

把 `KEPT_PUBLIC_URL` 设为 `https://kept.example.org`。Cloudflare Access 可在它前面加登录。公开地址也是 claude.ai 等 Web 应用[连接 Kept 的 MCP 服务器](/zh/users/mcp-clients/#connect-as-a-connector-oauth)所需要的。

`cloudflared` 与这里的其他隧道一样，从同一台机器访问 Kept；信任方式见[反向代理](/zh/install/reverse-proxy/#trust-the-proxy-and-only-the-proxy)。

## 你自己的反向代理

任何终止 TLS 并转发到 8080 端口的代理都可用。阅读[反向代理](/zh/install/reverse-proxy/)了解三个关键设置。

## 只有你的设备信任的证书

在没有域名的局域网上，mkcert 可以为机器的地址生成证书，经由任何 TLS 代理对外。然后每部手机都必须信任 mkcert 的根证书；在 iPhone 上这意味着安装描述文件，并在 Settings → General → About → Certificate Trust Settings 中开启完全信任。Tailscale 通常工作量更小。
