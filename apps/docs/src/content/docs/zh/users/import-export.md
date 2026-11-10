---
title: 导入与导出
description: "从表格、Homebox 或另一个 Kept 导入物品，并把位置导出为完整导出，附带无需 Kept 即可阅读的副本。"
---

导入与导出位于 **Settings → Import** 和 **Settings → Export**。两者都针对位置的**所有者与管理员**，在服务器后台运行，且需要网络。若要迁移整个服务器，或在服务器间迁移家庭，另见[迁移到新服务器](/zh/admin/move-server/)。

## 导入

**Settings → Import** 会询问来源：

| 来源 | 是什么 |
|---|---|
| **表格（CSV）** | 每行一件物品，表头行命名各列；也包括 Homebox 自身的表格导出 |
| **Homebox 导出** | 来自 Homebox v0.26.1 或更新版本的 ZIP，推荐 v0.27.0（Collection → Tools → Backup & Restore → Create Backup → Download） |
| **Kept 导出** | 从本 Kept 或另一个 Kept 导出的位置 |

每次导入在写入任何内容前都会检查：**Check the import** 会逐行显示 **What the import will do**，并说明跳过项的原因。然后带进度条运行。你可以离开页面；导入会继续，Settings → Import 会显示进度。若中断，**Resume** 从最后一行继续。**Cancel the import** 会保留已导入的内容。

再次运行同一导入会跳过已导入项，因此重跑绝不会产生重复。归档（ZIP）最大 5 GB。导入的物品以已确认状态到达，不进收件箱。

### 表格（CSV）

1. **Choose the file**，以及它进入的位置：你拥有或管理的。文件最多 10,000 行（8 MB）；更大的请拆分。文件下方 **The columns Kept reads** 列出它理解的每一列，**Download a sample CSV** 提供一个可起步的小文件。
2. **Match the columns。** 对每一列，选择它对应的字段，包括 **A type's field…** 用于你自己的类型字段。必须有一列是名称：每件物品都需要。
3. **若干选项：**
   - 类似 `Garage > Shelf A` 的位置列会创建房间与地点：选择分隔符，以及是否 **Make the places the file names that don't exist yet**。
   - 没有位置的行去哪（默认 Unplaced）。
   - 日期写法（能从文件推断时），以及无货币行的货币。
   - **Match the type column to your types by name**，可用 Kept 的任一语言；关闭时，类型留在备注中。
4. **Check the import**，阅读报告，然后导入。

Kept 读取的列：name、quantity、place、type、brand、model、serial number、barcode、colour、condition、notes、tags、other names、purchase date、price、currency、shop、manual link、旧标签的代码、你自己的代码、行 ID（使重新导入跳过该行），以及你类型的自有字段。Kept 各语言的表头会自动匹配。标签与其他名称用逗号分隔，价格是不含货币符号的数字，整个文件日期写法一致。

#### Homebox 的表格

每个 Homebox 都能导出表格（至 v0.25：**Tools → Import/Export → Export Inventory**）。Homebox v0.10.3 与 v0.11.0 以制表符分隔写出（`homebox-items.tsv`）；Kept 两者都能读。当列是 Homebox 的（`HB.name`、`HB.location` 等）时，Kept 会说明，并自行匹配列，并读取普通表格导入会丢掉的内容：

| Homebox 列 | Kept |
|---|---|
| `HB.asset_id`，以及 `HB.url` 中的条目链接（v0.13 及以后） | 旧标签：已打印的 Homebox 标签可打开物品 |
| `HB.sold_*` | 有买家或价格：物品以已售结束，带日期、买家、备注与价格。仅有售出日期则留在备注 |
| `HB.archived` | 由你选择：**Archived**（默认）、**In use** 或 **Leave out**。有出售记录的以已售结束 |
| `HB.warranty_expires`、`HB.lifetime_warranty` | 在 Warranties 开启处，从购买日期起的保修 |
| `HB.warranty_details`、`HB.insured` | 记入备注行 |

价格 0 读作无价格（Homebox 未设置时写 0）。v0.26 及以后表格列出的位置行会被省略；位置来自每个条目的位置路径。表格无法携带照片、文件、维护或条目内的条目，自定义字段只有匹配到类型字段才会导入。以上全部请使用导出 ZIP。

### Homebox 导出

Kept 读取 Homebox 自身的导出 ZIP，其中包含一切，包括文件。在 Homebox 中打开 **Collection → Tools → Backup & Restore**，选择 **Create Backup**，列出后 **Download** 备份。它从 Homebox v0.26 起可用：请用 v0.26.1 或更新（v0.26.0 的 Docker 镜像会丢附件），能用则用 v0.27.0。早于 v0.26 的 Homebox 没有导出：见[来自更旧的 Homebox](#coming-from-an-older-homebox)。没有 Homebox `manifest.json` 的 ZIP 会被拒绝并给出该建议。

:::tip[若 Homebox 显示 “Topic has been Shutdown”]
Homebox v0.26 每次启动只做一次导出。重启 Homebox 再导出，或升级到没有此限制的 v0.27.0。
:::

上传后，Kept 显示集合及其导出日期。它进入 **A new location** 或 **A location you run**，其中已有物品保留，重跑只添加新内容。新位置在你按 **Import** 时才创建，不是之前：停在检查步骤的导入不会留下任何东西。**Connect to Homebox (optional)** 读取集合的货币（ZIP 不携带）：给出 Homebox 地址与 API 密钥，或邮箱与密码。它们只使用一次且永不存储。

对新位置，接下来是 **What to track**：**Essentials**（房间、箱子、标签与搜索），并在其上、默认勾选备份用到的：**Prices on 10 things** 开启 Money，**5 warranties** 开启 Warranties，**2 maintenance entries** 开启 Schedules。取消勾选则该数据留在物品备注中成为文本，之后无法变成记录。完全没有这些的备份从仅 Essentials 开始。**Also for Personal** 给你的 Personal 位置同样设置，使菜单只显示你跟踪的内容。随时可在 **Location settings → What to track** 更改；关闭任何内容都不会删除。

然后选择：

- **Prices are in**：货币，仅当备份有价格时询问。选择只重新标注金额；不换算。
- **Archived items**：**Archived**（默认：在 Kept 中也归档，仍属于你，收起来）、**In use** 或 **Leave out**。有买家或价格的归档条目以已售结束。
- **Items with quantity 0**：**Keep 0 or archive**（默认：会用完的类型保留 0，其他归档进入）、**Set to 1** 或 **Leave out**。每件进入的备注中有 “Quantity in Homebox: 0”。装其他条目的条目绝不因 0 被归档或省略，变成箱子的位置没有数量可检查。
- **Add an "Insured" yes/no field**，以及 **Leave out Homebox's starter places and tags**（每个新 Homebox 集合开始的八个房间和六个标签，未使用时）。
- **These look like boxes**：名称像箱子或容器（Box 01、Bin 2、Kiste 3…）且不装其他位置的位置。勾选它们或 **Choose all**，它们以箱子进入：装东西的物品，带其标签与内容。其余以位置进入。
- **Custom fields**：对每个，**Add to the type** 或 **Keep in notes**。
- **Types**：对每个 Homebox 类型，选择 Kept 类型、**New type…**（你输入名称）或 **No type**。Homebox 0.27 自有类型 `global.item` 与 `global.location` 读作 **Item** 与 **Location**，与 Homebox 一致；包罗一切的 **Item** 从 **No type** 开始。

检查会列出每个需要查看的条目，各用文字说明发生了什么，导入页在导入后保留该列表：从 **Activity**（Ran an import）打开。

会带过来的内容：

| Homebox | Kept |
|---|---|
| Collection | 一个位置 |
| Locations（嵌套） | 房间与地点，保持树结构 |
| Items | 物品；装其他条目的条目成为箱子，绝不整类变成箱子 |
| Manufacturer、model、serial | Brand、model、serial |
| Purchase date、shop and price | 带商店的购买 |
| Warranty、lifetime warranty | 保修 |
| Sold details | 有买家或价格（大于 0）：物品以已售结束，带日期、价格、买家与备注。仅有售出日期不算出售：物品仍在使用，日期留在备注 |
| Tags | 带颜色的标签（嵌套标签展平） |
| Photos、manuals、receipts、warranty files | 照片、说明书、购买收据、保修文档 |
| Links | 链接。指向该位置已连接的 [Paperless-ngx](/zh/users/paperless/)（同一地址）文档的链接，作为 Paperless 链接进入，如同 **Link from Paperless** 所建，标题取自 Paperless（Paperless 无法提供时用 Homebox 的；报告说明数量）；导入前请先连接 Paperless |
| Completed maintenance | 保养记录 |
| Scheduled maintenance | 一次性日程 |
| Templates | 账户模板，在可映射范围内 |

通知器、成员与角色不导入。位置中模块关闭处，该记录的文本留在物品备注中。位置描述不保留（位置点没有备注）；检查会点名每一个。

Homebox 会写入没人输入的日期：某些升级会填充空日期字段，备份可能把空日期带成第 0 年最后一天。Kept 把 1000 年前的日期读作无日期，出售需要买家或价格。

#### 修复更早的导入

Kept 1.13.0 之前的导入会把数量 0 变成 1，当某类型的某个条目装着另一个时把整个类型变成箱子类型（因此该类型的每件物品都打开空的 Contents 标签页），并可能创建名为 `global.item` 的类型。1.14.1 之前的导入在 Homebox 只有售出日期时把物品标为已售。从 **Activity**（Ran an import）打开导入：**Repair this import** 会列出能纠正的内容，按名称：

- **Archive the things that had quantity 0 in Homebox**（仍在使用，数量为 1）；
- **Make the type an ordinary type again**（装东西的物品仍是箱子）；
- **Rename `global.item` to Item**；
- **Put the things marked sold on a date alone back in use**：无买家无价格且此后未改过的已售。在 Homebox 中归档的条目也会恢复使用：请再手动归档一次。

勾选所需并按 **Repair**。一次 **Undo** 全部撤回。

**旧标签继续有效。** 每个 Homebox 资产 ID（`000-001`）都会记住并列在物品的 **Your codes** 下。Kept 扫描器识别 Homebox 标签并打开导入的物品；若把旧 Homebox 主机名指向 Kept，用手机自带相机扫描也有效。Homebox 的长条目与位置 ID（其标签链接中的那些）为扫描记住但不列出。导入的物品会获得自己的 Kept 代码，在打印标签前不出现在列表中。

### 来自更旧的 Homebox

早于 v0.26 的 Homebox 无法生成导出 ZIP。两种进入方式：

- **全部，含照片与维护：** 把 Homebox 副本升级到 v0.27.0，从副本导出 ZIP。已从 Homebox v0.10.3（原 `hay-kot/homebox` 的最后一个版本）直接测试到 v0.27.0。
- **更快、内容更少：** 导入其[表格](#homeboxs-spreadsheet)。

升级不可撤销（自 v0.23 起 Homebox 自己的说明也如此），因此在副本上运行，你的 Homebox 保持原样：

1. **停止 Homebox 并复制其数据目录**，即挂载在 `/data` 的那个（`homebox.db` 及其 `-wal` 与 `-shm` 文件，以及附件）。把原件留作备份。
2. **在副本上启动 Homebox v0.27.0。** Homebox 现位于 `ghcr.io/sysadminsmedia/homebox`；v0.26 及以后需要 `HBOX_AUTH_API_KEY_PEPPER`，32 个以上随机字符：

   ```sh
   docker run --rm -p 7745:7745      -e HBOX_AUTH_API_KEY_PEPPER="$(openssl rand -hex 24)"      -v /path/to/homebox-copy:/data      ghcr.io/sysadminsmedia/homebox:0.27.0
   ```

   首次启动会一次性更新数据库。它还会添加 Homebox 的八个起始房间，为空时 Kept 默认省略。
3. **登录**常用账户并打开 **Collection → Tools → Backup & Restore**。选择 **Create Backup**，列出后 **Download** 备份。
4. **作为 [Homebox 导出](#a-homebox-export) 导入 Kept。**
5. 导入完成后停止并删除副本。

Homebox 记录文件类型之前添加的照片也能通过：Kept 自行检查每个文件。

### Kept 导出

Kept 导出总是作为**新位置**进入，含其物品、位置、文件、状况报告、搬家与历史，以及位置的位置（若有，用于[建议我在哪](/zh/users/phone-app/#camera-gallery-and-scanning)）。若含机密值，**Open the secrets** 需要导出时选择的口令；没有它，其余内容仍会导入。打开需要 HTTPS：普通 HTTP 下导入屏幕会说明并导入其余。**People to invite** 列出共享该位置的人；导入不会邀请任何人，请自行邀请。

**状况报告**会带其日期、备注、房间与照片回来，每张照片保留 Kept 首次收到它的时间。已完成报告以相同时间以已完成状态回来，并保持锁定。在新服务器上，照片与完成操作记在导入者名下；历史仍显示导入前各事由谁完成。

**搬家**会带其箱子回来：每箱的编号、状态与去往的房间，已完成的搬家会再完成一次。去另一位置的搬家作为新位置内的搬家进入，房间需重新选择。

由比目标服务器更新的 Kept 创建的导出可能被拒绝：请先更新该服务器。

### 车辆的 LubeLogger 历史

在车辆的 Overview 上，**Import from LubeLogger** 接受 LubeLogger 为单车辆导出的 CSV：其燃油、保养记录（含维修与改装）或里程表读数，一次一个文件。Kept 读取文件，说明是哪一种，并猜测日期与小数写法（LubeLogger 按其服务器语言写）；猜错可改任一项，并说明燃油是升还是加仑。**Check** 显示将添加什么、哪些行不能添加及原因；**Import** 按最旧优先添加，并带其里程表读数。再次导入同一文件不会添加任何内容。该位置的所有者与管理员可导入。

### 导入后的搜索词

连接了 AI 提供商时，导入结束时可能提供 **Add search words with AI?**，并估算所需 token。它在后台运行，按位置的语言添加别名，与拍摄物品获得别名的方式相同（[AI 提供商](/zh/users/ai-providers/)）。

## 导出

**Settings → Export** 有两种：

- **Export a location**，你拥有或管理的：每件物品、位置、照片、文档、状况报告与搬家始终包含。
- **Export my data**：你的 Personal 位置及其文件、你的资料与偏好，以及你自己的 AI 调用。配合 [Personal 隐藏](/zh/users/locations/#hide-personal)，它会带上你拥有的第一个其他位置，Personal 在 **Export a location** 上。

此外还包含：归档与已结束的物品（已售、赠送、丢弃）、回收站、历史、AI 调用，以及 **A copy you can read without Kept**：网页、表格、缩略图与收据，可在任何浏览器打开，可选附带清单 PDF，用独立语言。

**Include secrets** 供位置所有者使用。机密值用至少 12 字符的口令加密，需输入两次。任何持有文件与口令的人都能读取其中所有机密，Kept 无法找回忘记的口令。可读副本从不包含机密。

不带机密的导出会省略每个机密值并说明：每个曾有机密的位置或物品在 `secretsWithheld` 中点名该字段，清单会计数，可读副本中也有一行说明。它像其他导出一样导入；字段为空进入。普通 HTTP 下这是唯一一种（**Include secrets** 需要 HTTPS，[家庭网络上的 Kept](/zh/install/home-network/)）。

导出在后台构建；就绪时通知你。每个导出留在列表中，可 **Download** 七天。ZIP 中每个文件的日期都是导出创建时。

### 导出与备份

导出是你带走的东西：一个位置，任何地方可读，可导入任何 Kept。服务器自己的每晚备份是另一回事，覆盖整个实例；它还保存每个位置的可读副本（[备份](/zh/admin/backups/)）。删除位置时会提供 **Export first**。

## 在实例间迁移

要把一个家庭迁到另一个 Kept 服务器：导出位置（需要时含机密），然后在那里作为 Kept 导入该 ZIP。已打印的标签继续有效：当该代码在新服务器上空闲时标签保留其代码；不空闲时旧标签仍能打开物品。要迁移带全部账户的整个服务器，请改用备份。两种方式都在[迁移到新服务器](/zh/admin/move-server/)中。
