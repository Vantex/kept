---
title: Paperless-ngx
description: "在 Paperless-ngx 中把物品或位置关联到其收据、说明书与保修卡。Kept 保存链接与标题，不保存文件，除非你复制进来。"
---

若你把单据保存在 [Paperless-ngx](https://docs.paperless-ngx.com/) 中，Kept 可以把物品关联到那里的文档，而不必你上传两遍。电钻显示其收据与说明书；厨房显示冰箱的发票。

可选：仅当你已经运行 Paperless-ngx 时。没有它 Kept 也一样工作。

## 开始前

| 你需要 | 原因 |
|---|---|
| **Paperless-ngx 2.16 或更高** | Kept 请求 Paperless 的 API 版本 9，2.16 引入且 3.x 仍在提供 |
| **API 令牌** | 在 Paperless 中：**我的资料**，然后点 API 令牌旁的循环箭头。Kept 看到的是该 Paperless 用户所见，因此一个只能查看你文档的用户就足够 |
| **Kept 能访问 Paperless** | 从运行 Kept 的机器上，而不是从你的手机 |
| **`https`**，或你自己的网络 | 普通 `http` 上令牌明文传输，因此 Kept 仅对自有网络上的地址接受 `http`。此类地址需要 **管理 → 设置 → 允许私有地址**（[出站请求](/zh/admin/security-model/#outbound-requests-ssrf)） |

## 连接

该位置的所有者或管理员：

1. **位置设置 → Paperless**。
2. **Paperless 地址**：你打开 Paperless 所用的地址，如 `https://paperless.example.com`（路径如 `/paperless` 也可以）。
3. **API 令牌**，然后**连接**。Kept 会先登录，失败时说明原因：令牌被拒绝、地址不像 Paperless 那样响应、版本太旧。

连接后页面显示 Paperless 版本以及已关联的文档数。**测试连接**会再次询问 Paperless。要更换令牌，输入新令牌并**保存**；留空则保留已保存的令牌。

## 关联文档

在物品页面的**文件**下，**从 Paperless 关联**位于**添加文件**旁（位置页面上在**添加文档**旁）。它会打开你的 Paperless 搜索：标题或正文中的词、发件方、类型或标签。词的开头就够：`Camel` 能找到 “Camelot”。你输入时 Paperless 自身的搜索语法会原样传递，如 `title:manual` 或 `*amel*` 匹配词中间。勾选一个或多个并**关联**。

关联的文档与文件在同一份文件列表中。每项显示其缩略图、标题、Paperless 的类型与发件方，以及日期，并带有：

- **类型：***说明书*、*保修*、*收据*、*发票*或*文档*。当 Paperless 的类型没说明文档是什么时更改它。
- **在 Paperless 中打开：**文档在 Paperless 中的页面，在新标签页打开。
- **下载：**文档，经由 Kept。成员及以上。
- **复制到 Kept：**见下。
- **解除关联：**它从物品上移除。Paperless 仍保留它。

类型来自文档在 Paperless 中的类型，然后是其标签：*Receipt*、*Invoice*、*Manual* 与 *Warranty*（以及 Kept 其他语言中的相同词）会被识别，其他一律算作文档。此后类型可由你更改，**复制到 Kept** 会按该类型复制文档。文件中的**类型**筛选会同时收窄文件与关联文档。

**来自 [Homebox 导入](/zh/users/import-export/#a-homebox-export)：**Homebox 指向你某份 Paperless 文档的链接（`…/documents/123`，或 API 的 `…/api/documents/123/download/`），若地址是该位置已连接的，会作为关联文档进入物品或位置。其标题来自 Paperless，类型来自 Homebox 附件类型。导入前先连接 Paperless；其他链接仍是普通链接。

导入运行时 Kept 才向 Paperless 请求标题，而不是检查导出时。若 Paperless 不可达、没有该文档或不向其用户展示，导入仍会完成，该链接保留 Homebox 的标题，Homebox 没有标题则保留其地址。导入报告会说明有多少。之后要获得 Paperless 的标题，**解除关联**该文档并使用**从 Paperless 关联**，或**复制到 Kept**。

## 关联还是复制

| | 关联 | 复制到 Kept |
|---|---|---|
| Kept 保存什么 | 文档在 Paperless 中的编号、标题、类型、Paperless 类型、发件方与日期 | 文件本身，作为物品上的附件 |
| Paperless 宕机时 | 标题仍显示，并注明 Paperless 不可达 | 无变化 |
| 在 Kept 备份与导出中 | 否：链接需要本服务器的 Paperless | 是，与其他文件一样 |
| 文档在 Paperless 中变更时 | 复制时更新其标题 | 副本保持原样 |

**复制到 Kept** 按文档、且需显式操作：用于必须在没有 Paperless 时仍存活的内容，例如理赔需要的收据。副本是 Paperless 提供下载的文件（若生成过归档 PDF 则为该 PDF），按上传同样检查与限尺寸。

## 谁能做什么

| | 查看者 | 成员 | 管理员、所有者 |
|---|---|---|---|
| 查看关联文档与缩略图 | ✓ | ✓ | ✓ |
| 搜索 Paperless、关联、复制、下载 | | ✓ | ✓ |
| 更改类型、解除关联 | | 自己的 | 任何 |
| 连接、更改、断开 | | | ✓ |

收据与发票涉及金额：在某位置对你隐藏金额时，关联的收据与发票也会隐藏，你也无法把关联文档设为收据。

[个人令牌](/zh/users/mcp-clients/#make-a-personal-token)读取物品或位置的链接（`GET /api/v1/paperless-links?thingId=…`），从不读取连接、搜索、缩略图或文档。MCP 工具 `get_thing` 按标题列出物品的关联文档。

## 隐私

- 令牌用 Kept 的密钥封装，如同邮箱密码。Kept 从不显示、记录，或写入审计条目与导出。
- 你的浏览器从不带着令牌与 Paperless 通信。搜索、缩略图与下载都经由 Kept，Kept 先检查你是否可见该物品。缩略图由 Kept 重新编码并保留五分钟。
- **在 Paperless 中打开**是普通链接：你以自己的身份登录 Paperless。
- 把物品移到另一位置会移除其链接：它们指向旧位置 Paperless 中的文档，新位置的成员可能看不到。

## 断开

**位置设置 → Paperless → 断开**移除连接及其文档的全部链接。已复制到 Kept 的文档会保留。

## 尚未完成

- 双向同步：Kept 不会更改 Paperless 中的任何内容。
- 自动把收据匹配到物品。
- 把 Kept 自身的文件发送到 Paperless。
