---
title: 最初几分钟
description: "用设置码认领新的 Kept，创建第一个家、添加物品、邀请人员，并选择语言与主题。"
---

本页从 Kept 已运行且你能打开其地址开始。安装见[使用 Docker Compose 安装](/zh/install/compose/)。

## 1. 用设置码认领服务器

Kept 首次启动且没有管理员时，会在日志中打印一次性设置码，形如 `KEPT SETUP CODE: K7Q-2M9`。打开 Kept 地址会进入 **Set up this Kept**，共三步：

1. **Setup code。** 输入六个字符。短横可选，大小写不敏感。用过之后码即失效。日志丢了？`kept admin setup-code` 会签发新码（[如何操作，在 Compose 下](/zh/install/compose/#3-finish-setup)）。
2. **First account。** 你的姓名、邮箱和至少 8 位密码。此账户是**实例管理员**：运行服务器（用户、注册、备份）。除非被邀请，否则看不到任何人的家里面。
3. **Instance options。** 一个开关：**Let anyone with the address create an account**。家庭使用请保持关闭：人们通过邀请加入，或由你添加。之后可在 Settings → Admin 更改。

**Finish setup** 会带你到首页。

:::caution[请立即完成设置]
设置完成之前，任何能打开该地址的人都可能尝试认领服务器。
:::

AI 与条码查询不属于设置。没有它们 Kept 也能工作，之后可再连接 AI（[AI 提供商](/zh/users/ai-providers/)）。

## 2. 阅读首页的入门清单

首页打开时显示 **Get started**，一行显示进度与下一步，根据你实际做过的事计算，因此步骤会自动打勾。箭头展开步骤：

| 步骤 | 要求 |
|---|---|
| **Put Kept on HTTPS** | Kept 以普通 HTTP 提供时对实例管理员显示。手机会在 HTTP 下阻止摄像头、安装 Kept、推送通知和定位。参见 [HTTPS](/zh/install/https/)。 |
| **Create your first home** | 一个位置，见下。 |
| **Add 3 things** | 几件你不愿跟丢的东西。 |
| **Print your first label** | 当某位置开启 Labels 时。 |
| **Invite someone** | 链接或二维码；无需邮箱。 |
| **Connect an AI provider** | 对被邀请的成员不显示，或在 Essentials 预设的位置不显示。 |
| **Install on your phone** | 第一次从主屏幕图标打开 Kept 时自动打勾。 |

**×** 永久隐藏；**Help → Get-started checklist → Bring it back** 可再显示。全部完成后会自动消失。首页更多说明见[日常使用](/zh/users/everyday-use/#home)。

## 3. 创建你的第一个家

每个人一开始都有一个 **Personal** 位置：它只属于你（无成员、邀请或分享链接），没有位置的拍摄会落在这里。在 **Location settings → General** 中重命名，Kept 会在各处显示新名称。有了另一个位置后，可在 **Settings → Me → Your locations** 中[隐藏它](/zh/users/locations/#hide-personal)。共享的物品应放在自己的位置中。选择 **Create your first home**（或首页上的 **New location**）：

1. **What's this place called?** 名称，如 Home 或 Garage，以及类型：House、Apartment、Garage、Storage unit、Office、Vacation home 或 Other。
2. **Rooms。** 类型模板会填好房间与位置；可重命名、删除或 **Add room or spot**。每个位置还有 **Unplaced**，放还没有位置的物品。**Skip** 只保留 Unplaced。
3. **What to track。** 三个预设：
   - **Essentials**：找到东西：房间、箱子、标签和搜索。
   - **Household**：加上收据与保修、提醒、借用、文书和车辆。
   - **Complete**：加上燃油、会用完的物品、密码与验证码、搬家，以及 “Connect ChatGPT or Claude”。

时区与货币来自你的浏览器。可在位置的 **Location settings**（**General** 与 **What to track**）中更改，并单独开关模块。关闭模块会隐藏它；不会删除任何内容。

## 4. 添加第一件物品

最快的方式是 **Capture**（手机上中间的标签）：对准相机，按快门，物品就保存在顶部位置芯片所示的位置。拍摄时名称可选：连接了 AI 提供商时 Kept 会根据照片命名；没有时，未命名的物品在 **Inbox** 中等待命名。电脑上，房间或箱子上的 **Add here** 用表单添加物品。[日常使用](/zh/users/everyday-use/)涵盖拍摄、标签等其余内容。

## 5. 邀请人员

共享按位置进行：你邀请到 Home 的人只能看到 Home，看不到你的其他内容。创建位置后，Home 会显示 **Invite people to …** 卡片；同一页面在 **Location settings → Members → Invite** 下。

1. 选择 **Role**，在 **Access** 下选 **No end date** 或 **Until a date**。其访问权限，以及其创建的任何令牌，会在该日期停止。
2. **Create invite link。** 用 **Copy link** 获取链接，并有二维码可 **Scan with their phone**。链接可用一次，7 天有效，在使用前显示在 Members 下为待处理邀请，你可在那撤销。
3. **Send by email** 仅当服务器配置了邮件（`KEPT_SMTP_URL`）时可用。

对方打开链接后，用已有账户加入或创建新账户；注册关闭时，邀请是创建账户的唯一途径。

### 角色

| 角色 | 在该位置能做什么 |
|---|---|
| **Owner** | 一切，包括两步验证规则、转让与删除。只有一个所有者。 |
| **Admin** | 邀请与移除成员和查看者、设置与模块、导入导出、分享链接与理赔包、永久删除。只有所有者能授予或移除管理员。 |
| **Member** | 添加、编辑、移动、借出与丢弃物品；记录读数与保养；打印标签；使用 AI 拍摄。金额可见。 |
| **Viewer** | 仅查看与搜索。金额默认隐藏，除非位置允许查看者看到；助手会回答但不能做任何更改。 |

完整矩阵见 [`packages/shared/src/roles.ts`](https://github.com/keptinventory/kept/blob/main/packages/shared/src/roles.ts) 中的 `MATRIX`。

### 无邮箱人员

对没有邮箱的孩子或老人，所有者或管理员在 Members 页面使用 **Add someone without email**。Kept 创建带用户名的**托管账户**并显示一次性码（可用一次，30 分钟）。对方用 **I have a one-time code**、用户名和码登录，并自行设置密码；你永远看不到密码。创建账户的人（当时仍是该处所有者或管理员），或该位置的所有者，之后可签发新码，会使账户在所有设备登出。对方可以添加邮箱接管账户。托管账户不能拥有位置，每个位置最多容纳 20 个。

## 6. 语言与主题

**Settings → Me → Display** 保存设备的显示选项，在页面绘制前生效：

- **Language**：العربية、Deutsch、English、Español、Français、Italiano、Українська 或 Tiếng Việt。打开列表，或输入查找：其自身名称、英文名或当前使用语言中的名称，轻微拼写错误也没问题（`german`、`deutsch` 和 `francais` 都可用）。阿拉伯语会把整个应用从右到左排版。登录页有相同选择器。在你选择之前，Kept 跟随浏览器语言。邮件与提醒跟随你最近选择的语言。
- **Digits in Arabic**：Western（0123）或 Eastern（٠١٢٣），仅语言为阿拉伯语时显示。短 ID 与序列号始终用 Western 数字。
- **Region**：**United States**（Oct 29）或 **United Kingdom**（29 Oct, 29/10/2026），仅语言为英语时显示。西班牙语无需选择：数字与日期跟随浏览器地区，设为墨西哥的浏览器写 `1,234,567.5`，设为西班牙的写 `1.234.567,5`。
- **Amounts** 按你的语言书写方式读取。在逗号作小数点的语言（如德语）中，`1.234` 是一千二百三十四，`12,50` 是十二点五。像 `0.125` 这样两可的金额会被拒绝，而不是猜测。
- **Date format**：**Default**（29 Oct，仅其他年份才带年）、29 Oct 2026、29/10/2026 或 2026-10-29（如 United Kingdom 写法）。每个选项按你所在地区显示当天日期的该写法。购买与保修日期始终显示年份。
- **Theme**：**System**（跟随设备的浅色/深色设置）、**Light** 或 **Dark**。
- **Units**：**Metric** 或 **Imperial**，保存在账户而非设备上，因此所有设备都跟随。Imperial 会把房间尺寸、家具尺寸、物品在墙上的高度和标签纸尺寸显示为英尺英寸，油耗为 mpg 或 mi/kWh，你添加的车辆会得到英里里程表。已保存的内容不变：尺寸仍是厘米，读数仍是输入时的样子。里程表有自己的单位：见[车辆](/zh/users/vehicles/#units)。
- **Content width**：**Centered** 或 **Full width**，在 768 px 及以上屏幕。

## 7. 走一遍导览

**Help → The tour** 会在真实界面上带你了解 Kept，每章三到六步：

| 章节 | 内容 |
|---|---|
| 基础 | 首页、你的位置、扫描、搜索，以及其余功能在哪里 |
| 物品与位置 | 向位置添加、其中有什么、物品页面及其标签页 |
| 关系图与 3D 地图 | List、Grid、Graph、Table、Map 切换（电脑上有 Table）、2D 或 3D 关系图、3D 或平面、标记、楼层与整理，以及房间如何随其中的东西移动 |
| 拍摄与收件箱 | 选择拍摄内容、快门，以及审核 Kept 读取的结果 |
| 扫描 | 扫描会话：盘点、装箱或搬运、位置，以及完成会改什么 |
| 搜索与标签 | 搜索框、保存的视图、选择（移动、打印标签、移到回收站）、打印标签与扫描（可把空白标签放到已有位置上） |
| 搬家 | 开始搬家、其箱子，以及它们在哪里 |
| 借用 | 借出了什么、标记归还，以及物品上的借出 |
| 日程与提醒 | 新建日程、到期项、完成，以及提醒如何到达你 |
| 文书与保修 | 文书库、即将到期、添加文件、理赔 |
| 车辆与燃油 | 车辆列表、记录读数或保养、可打开的保养，以及燃油 |
| 导入与导出 | 导入来自哪里、文件，以及导出 |
| 设置与共享 | 通知、你的位置、邀请人员、要跟踪什么 |

只列出你已有的章节：某模块的章节在你某个位置开启该模块时显示；查看者不会得到会更改内容的步骤。

- 顶部：已完成多少章，带细条，以及 **Take the tour**。部分完成后显示 **Continue the tour**，并从你尚未完成的第一章继续。
- 其下，每章一行短内容：编号与步骤。点按某行从该章开始导览。已完成的章节折叠到 **Done (N)** 下；打开可重播某一章。
- 导览从 Help 开始。页面顶栏只保留该页自己的工具；扫描会话的 **Start a session** 有小的 **Show me** 指向其章节。
- 弹出层显示你在哪里：“Chapter 3 of 12, step 2 of 5”。
- **Next** 继续，**Back** 在章内返回，方向键两者都可，**Esc** 或 **×** 关闭。
- 某章最后一步会点名下一章：**Continue** 直接进入，**Stop here** 在此结束导览。最后一章以 **Done** 结束。
- 导览运行时页面仍可用：点高亮外的任何地方。去了导览未打开的地方会关闭导览。
- 已完成的章节在 Help 上显示 **Done**，各设备一致。中途关闭的章节下次从第一步开始。
- 某章需要展示某物却什么都没有时，会创建一个明确命名的示例，如 “Sample: Cordless drill”。导览结束时你选择保留或丢弃；它从不碰你已有的内容。
- 导览从不自动开始。

首次使用拍摄、扫描、收件箱建议值或标签时，还会出现一些一次性提示。

Kept 更新后，**What's new in Kept** 会显示该版本亮点，每人每版本一次，各设备一致：每页一张，含图片或短片、标题和一行说明。**Next** 与 **Back**、圆点、方向键或滑动切换；最后一页的 **Got it** 关闭，**Help → What's new** 可再显示。短片静音播放且可暂停；开启减少动态效果时保持静止直到你按 **Play**。离线时用该节的图标代替图片。新账户上从不显示，也不会盖在拍摄或扫描上。亮点在所有语言中都是英文，并附 GitHub 完整发行说明链接。

:::tip[保管好密钥]
第一个 AI 密钥、机密值或备份之前，Kept 会等待实例管理员已保存[恢复套件](/zh/admin/recovery-kit/)（Admin → Status 会要求）。没有套件，备份无法在新服务器上恢复 AI 密钥或已存密码。
:::
