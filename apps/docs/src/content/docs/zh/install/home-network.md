---
title: 家庭网络上的 Kept
description: 在家庭网络上以普通 HTTP 运行 Kept——哪些功能可用、哪些需要 HTTPS 及原因，以及无需公开域名即可添加 HTTPS 的两种方式——Tailscale，或带自有证书颁发机构的 Caddy。
sidebar:
  order: 3
---

Kept 可在家庭网络上以普通 `http://` 地址工作，例如 `http://192.0.2.20:8080` 或 `http://kept.home.arpa:8080`。你自己的数据在那里可用：添加、查找和移动物品、照片和文件、标签、报告、导入，以及不含机密值的导出。

有少数功能需要 HTTPS。有的是因为 Kept 拒绝在网络中任何人都能读的连接上交出密钥或显示机密；有的是因为浏览器只允许在安全地址上使用它们，而 Kept 无法改变这一点。

## 普通 HTTP 下哪些可用

| | 普通 HTTP 下 | 原因 |
|---|---|---|
| 物品、位置、搜索、移动、标签、报告 | 可用 | |
| 从设备选择的照片和文件 | 可用 | |
| 导入（Homebox、CSV、Kept 导出） | 可用 | |
| 导入时打开导出中的机密 | 需要 HTTPS。普通 HTTP 下导出的其余部分仍可无机密导入 | Kept：口令和机密值 |
| 不含机密值的导出 | 可用。每个机密值被省略并标记为已省略；导出照常导入 | 你自己的数据 |
| 设置机密值 | 可用 | |
| 显示机密值 | 需要 HTTPS | Kept：机密绝不在普通 HTTP 上发送 |
| 含机密值的导出 | 需要 HTTPS | Kept：机密及其口令 |
| AI 应用（MCP）和 Home Assistant 的令牌 | 不能从浏览器创建。在服务器上创建：`kept admin token create`（[CLI](/zh/admin/cli/#a-token-from-the-server)） | Kept：令牌即密钥 |
| 用 OAuth 连接应用（连接器） | 需要 HTTPS | Kept：OAuth 需要安全地址 |
| 下载恢复套件 | 不能从浏览器下载。在服务器上：`kept admin recovery-kit`（[CLI](/zh/admin/cli/)） | Kept：其中含有服务器的密钥 |
| 备份设置及其测试 | 需要 HTTPS，或在服务器环境中设置（[配置](/zh/reference/configuration/)） | Kept：备份密码 |
| Passkey | 需要 HTTPS | 浏览器：普通 HTTP 地址上没有 passkey |
| 摄像头、安装 Kept、离线使用、推送通知、定位 | 需要 HTTPS | 浏览器 |

普通 HTTP 下登录持续 12 小时且不续期；HTTPS 下持续 30 天。要更改 12 小时，见[留在你的网络上](#staying-on-your-network)。

首页上的「开始使用」会要求实例管理员为 Kept 启用 HTTPS。若你打算留在家庭网络，请选择 **Staying on my home network**，该步骤即算完成。每页顶部的 HTTPS 行也可关闭。

`localhost` 在浏览器中算安全地址，但 Kept 以 `KEPT_PUBLIC_URL` 为准：只要它是 `http:`，Kept 自身的上述拒绝在 `localhost` 上也生效。

## 留在你的网络上

运行 Kept 的人可在服务器上更改两件事：普通 HTTP 下登录持续多久，以及 Kept 响应哪些地址。两者都无法从应用内更改，Admin → Status 会显示当前生效的设置。

### 普通 HTTP 下更长的登录

普通 HTTP 下每 12 小时需重新登录。`.env` 中的 `KEPT_HTTP_SIGN_IN_DAYS` 可将其设为若干天（1 到 30），使用时续期。家庭网络或 Tailscale 适合 7：

```sh
KEPT_HTTP_SIGN_IN_DAYS=7
```

然后 `docker compose up -d`。在 Home Assistant 应用中是 **Sign-in length over http** 选项。

仅通过更改 `KEPT_IMAGE` 从 1.14.4 升级的安装，仍使用旧的 `compose.yaml`，不会传递该设置：请先[下载新的](/zh/admin/upgrades/#settings-that-need-the-new-composeyaml)。

**代价：** 普通 HTTP 下，任何能看到流量的人都可能复制登录 cookie。开启该设置后，被复制的 cookie 在持续使用期间一直有效，直到该设备登出或你的其他设备被登出。因此请只在可信网络上开启，并在设备丢失时登出。

| | 未设置 | 已设置 |
|---|---|---|
| 普通 HTTP 下登录持续 | 12 小时 | 那么多天 |
| 续期 | 否 | 每使用一天续期一次（设为 1 天时，半天后续期） |
| HTTPS 下 | 30 天，续期 | 30 天，续期：该设置无效 |
| 普通 HTTP 下的机密和密钥 | 拒绝 | 拒绝 |
| 敏感操作 | 密码，或最近十分钟内的登录 | 相同；续期不算登录 |
| 全局登出 | 结束所有登录 | 结束所有登录 |

任何其他值（0、31、`7d`）会在启动时停止 Kept，并说明要求。留空等同于不设置。

开启后，已建立的登录在下次使用时采用更长的期限。关闭后，已建立的登录按自身期限到期；要提前结束，请使用 Admin → Users 中的 **Sign out everywhere**。

### 多个地址

Kept 只接受来自 `KEPT_PUBLIC_URL` 的登录和保存，因此访问同一 Kept 的第二种方式——LAN 名称旁的 Tailscale 名称，或 IP 旁的名称——会提示 "This Kept is set up for …"。`KEPT_EXTRA_ADDRESSES` 用逗号列出其他地址，必须与浏览器显示的完全一致：

```sh
KEPT_PUBLIC_URL=http://kept.lan:8080
KEPT_EXTRA_ADDRESSES=http://192.0.2.20:8080,http://<machine>.<tailnet>.ts.net:8080
```

然后 `docker compose up -d`。在 Home Assistant 应用中是 **Extra addresses** 选项。HTTPS 下同样有效。

仅通过更改 `KEPT_IMAGE` 从 1.14.4 升级的安装，仍使用旧的 `compose.yaml`，不会传递该设置：请先[下载新的](/zh/admin/upgrades/#settings-that-need-the-new-composeyaml)。

| | `KEPT_PUBLIC_URL` | 额外地址 |
|---|---|---|
| 使用 Kept、用密码或一次性代码登录 | 是 | 是 |
| 邮件链接或密码重置 | 在此打开 | 在 `KEPT_PUBLIC_URL` 打开 |
| Passkey | 是，需 HTTPS | 否；passkey 属于一个地址 |
| Google 和 OIDC 登录 | 是 | 按钮打开 `KEPT_PUBLIC_URL` |
| AI 应用（MCP、OAuth） | 是 | 在 `KEPT_PUBLIC_URL` 连接它们：`/mcp` 拒绝此地址，OAuth 的同意在此也被拒绝 |
| 链接、标签、二维码、邮件、日历订阅 | 指向此处 | 仍指向 `KEPT_PUBLIC_URL` |

- **每个地址分别登录，并作为自己的应用安装**，因为浏览器按地址保留 cookie 和离线数据。在一个地址登出，另一个仍保持登录；**Sign out everywhere** 会结束两者。在 HTTPS 允许推送的地方，推送通知在设备开启它的地址上打开。同一主机名上的两个端口共享 cookie：浏览器不按端口保留它们。
- **在额外地址请求的邮件链接**会在 `KEPT_PUBLIC_URL` 打开并在那里登录你，而不是在你请求的地方。密码重置会重设那里的密码；然后在你所在地址登录。若从你所在位置无法访问 `KEPT_PUBLIC_URL`，请使用密码。
- **Passkey：** 在 `KEPT_PUBLIC_URL` 添加和使用。额外地址会提供密码或邮件链接，并说明原因。
- **精确地址：** 协议、主机和端口整体比较。`http://kept.lan` 不等于 `http://kept.lan:8080`，`kept.lan.example.com` 不等于 `kept.lan`。通配符、路径、登录名或 `http` 与 `https` 混用会在启动时停止 Kept，并说明是哪一种。留空等同于不设置。
- **转发头：** `Host` 和 `X-Forwarded-*` 不起作用，因此你的代理无法意外添加或移除地址。为你列出的每个地址把代理指向 Kept。

**代价：** 在列出地址上提供的页面算作 Kept 本身，可使用在该处打开它的人的登录。因此只列出能到达此 Kept、且位于你控制的名称和 IP 上的地址。

## 添加 HTTPS：先用 Tailscale

对家庭来说工作量最少：在运行 Kept 的机器以及每部使用它的手机和电脑上安装 Tailscale，为你的 tailnet 开启 HTTPS 证书，然后用

```sh
tailscale serve --bg 8080
```

对外提供 Kept。之后 Kept 位于 `https://<machine>.<tailnet>.ts.net`，带每台设备都已信任的证书，无论在家还是在外。把 `KEPT_PUBLIC_URL` 设为该地址并重启 Kept。更多见[为 Kept 启用 HTTPS](/zh/install/https/#tailscale)。

## 添加 HTTPS：Caddy 与自有证书颁发机构

没有 Tailscale、也没有公开域名时，Caddy 可以为家庭网络名称自行签发证书（`tls internal`）。它能工作，但不快捷：**每台打开 Kept 的设备都必须被逐一告知信任 Caddy 的根证书**，家里每个人都是如此。设备信任它之前，浏览器会显示安全警告。

1. 选一个每台设备都能解析到该机器的名称，例如 `kept.home.arpa`（路由器上的 DNS 记录，或各设备 hosts 文件中的条目）。
2. 在 `.env` 中设置：

   ```sh
   KEPT_DOMAIN=kept.home.arpa
   KEPT_PUBLIC_URL=https://kept.home.arpa
   ```

3. Caddy 随 `compose.full.yaml` 提供：下载它和 `docker/caddy/Caddyfile`，并在 `.env` 中设置 `COMPOSE_FILE=compose.full.yaml`，如[为 Kept 启用 HTTPS](/zh/install/https/#composes-caddy-profile) 所述。然后在 Caddyfile 中添加 `tls internal`：

   ```caddy
   {$KEPT_DOMAIN} {
   	tls internal
   	encode zstd gzip
   	reverse_proxy kept:8080
   }
   ```

4. 启动 Caddy 并从其数据卷复制根证书：

   ```sh
   docker compose --profile https up -d
   docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./kept-root.crt
   ```

5. 在每台设备上安装 `kept-root.crt` 并信任它：
   - **iPhone 和 iPad：** 把它发到设备（AirDrop 或邮件），在 Settings → General → VPN & Device Management 中安装描述文件，然后在 Settings → General → About → Certificate Trust Settings 中开启完全信任。
   - **Android：** 在安全设置中，作为 CA 证书安装（菜单名称因厂商而异）。有些应用会忽略用户安装的证书。
   - **电脑：** 添加到系统的受信任证书（Mac 上的钥匙串访问、Windows 的证书管理器、Linux 发行版的 CA 存储）。Firefox 可能有自己的列表。

Caddy 的根证书有效期十年；用它签发的证书会自动续期。根证书的私钥留在 `caddy-data` 卷中：任何复制它的人都能为你的设备现在信任的任何名称签发证书，因此请像密码一样保护该卷。[mkcert](/zh/install/https/#a-certificate-only-your-devices-trust) 是用另一工具实现的同一思路。

## 在正确地址打开 Kept

请在 `KEPT_PUBLIC_URL` 中的地址打开 Kept。若用另一个地址打开（例如 URL 写的是 `kept.home.arpa`，却用机器 IP 打开），登录时会说明此 Kept 为哪个地址配置，并给出链接。
