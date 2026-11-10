---
title: 位置、房间与箱子
description: "一切所在的树：位置、房间与地点、箱子与容器、Unplaced、位置的布局（List、Grid、Graph、Table、Map），以及一次处理多件物品的 Select。"
---

一切都放在树中：**位置**（家、车库、储物间）包含**房间与地点**（“房间或地点”是 Kept 对任何地点的说法），其中放**物品**。物品可以是**箱子或容器**，里面再装其他物品，可无限嵌套。每个位置还有 **Unplaced**，放还没有位置的物品。

- 在位置、房间或箱子上，**在此添加**可添加 **Thing**、**Box / container** 或 **Room or spot**，或[带隔间的家具](#furniture-with-compartments)。
- 列表有搜索框、**+ Filter**、保存的 **Views**，以及用于排序与分组的 **Display** 按钮。筛选条件在地址栏中，因此筛选后的列表可以书签保存或分享。
- **Select**（搜索框旁，任何能编辑物品的人都可用）在 List 或 Grid 中勾选位置、地点或箱子列表里的物品。**Shift-click** 某行的复选框（或其上的 **Shift+Space**）可从上次勾选处起勾选所有行。然后可：**Move**、**Add tags…** 或 **Remove tags…**、**Set a field…**、**Pick up**（放入托盘）、**Print labels**、**Add to incident** 与 **Claim pack**（所有者与管理员，且 Receipts and warranties 开启处），或 **Move to Trash**。该工具条与 [Table](/zh/users/spreadsheet/) 相同。
- **Set a field…** 给每个勾选的物品一个值：类型、品牌、型号、状况等。更改会等待，标记为 **Not saved yet**，直到 **Save N changes**；一次 **Undo** 可撤回整个保存。需要网络。若期间有人改了其中一项，那一项会等待：**Keep mine** 或 **Keep theirs**。
- **Move to Trash** 一次最多 200 件且需要网络。会先询问箱子里的内容怎么办（移出，或一起丢弃）以及借出物品，之后一次 **Undo** 全部恢复。
- **顺序：** 位置与物品按 A 到 Z，数字按顺序（Box 2 在 Box 10 前），应用内、离线、导出和 AI 应用中都一样。楼层保持创建顺序：第一个在地图上是底层。在位置上，**Display → Things: sort by** 排列其物品；其位置点仍按 A 到 Z。
- **你自己的顺序：** 在位置上，**Manage → Order of the places here → Custom order** 按你选择的顺序排列其内部位置，每项有 **Move up** 与 **Move down**（也支持键盘）。**A to Z** 随时可切回，再切到 **Custom order** 会恢复你的顺序。树、地图、导出和 AI 应用都遵循它。位置的顶级仍保持 A to Z。
- 位置 **Manage** 上的 **Turn places into boxes…** 列出其内部位置：勾选若干或 **Select all**，一步变成箱子，各自保留 ID、标签与内容。内部还有位置的位置不能勾选：箱子只装物品。提示中的 **Undo** 把它们全部恢复为位置；历史中保留 7 天。
- **助手与 AI 应用**也能做同样的事：重命名位置、更改类型、移动、设置其字段与内部位置顺序，以及把位置变成箱子（`update_place` 与 `turn_into_boxes`，[MCP 客户端](/zh/users/mcp-clients/)）。助手会先显示卡片确认；撤销与应用中相同。
- **位置树**（电脑上在页面旁，手机上为 **All places**）在位置下显示箱子及其中物品数，每个位置最多 50 个，之后是 **+N boxes**。位置旁的箭头折叠其下内容；**Fold all** 与 **Open all** 一次处理所有位置。Kept 为你的账户在各设备记住折叠状态。你所在页面上方的位置保持展开，即使 **Fold all** 之后。
- **宽度**（电脑上，1280 px 宽及以上）：沿树边缘拖动分隔线，或聚焦后用方向键、Home 与 End。树顶部的 **Collapse places** 按钮会折叠它，把空间留给页面；**Expand places** 恢复。本设备会记住两者。
- 在位置上，**Sort them** 会一次一件处理 Unplaced，并用位置选择器。
- 从标签打开的箱子会显示内部内容的照片网格。
- **布局：** 位置页面在 **List**、**Grid**、**Graph**、**Table** 和 **Map** 间切换，各有图标。**Graph** 把位置画成楼层、房间、箱子与物品的关系图，2D 或 3D（[关系图](/zh/users/graph/)）。**Table** 以表格显示其物品，需屏幕宽 1024 px 及以上（[表格视图](/zh/users/spreadsheet/)），因此手机显示 List、Grid、Graph、Map。**Map** 以 3D 按楼层显示位置，含房间、货架与箱子（[位置地图](/zh/users/location-map/)）。列表的 **Display** 菜单提供相同选择。位置自身页面（非 Unplaced）也有该切换，但没有 Table。Kept 在该设备上记住每个位置与每个位置点的布局。
- **Grid** 以磁贴显示位置或房间的地点与物品，与 List 相同的 **Places** 和 **Things** 标题下；每个标题可折叠。**Display → Size** 选择 **Small**、**Medium** 或 **Large** 磁贴（手机上每行 3、2 或 1 个），Kept 在该设备记住你的尺寸。
- 电脑或平板上，侧边栏会标记你所在的位置：在其页面，以及其房间、物品、箱子和设置上。

![Grid 布局下的位置，小磁贴：Places, 9 标题在房间上方，然后是 Things, 20+ 标题在物品上方，每行六个磁贴，每个只显示名称](../../../assets/screens/grid-desktop-light.webp)

![深色主题下的同一网格](../../../assets/screens/grid-desktop-dark.webp)

链接使用 ID，从不使用路径，因此移动物品永远不会破坏指向它的链接。

## 带隔间的家具

格子架、书架或抽屉柜是一个位置，每个格子、层架或抽屉是其中的位置，有自己的名称、标签，可选自己的代码。服务器机架也是家具，按机架单位计量（[机架](#racks)）。

- **在此添加 → Room or spot → Furniture with compartments…** 一步创建家具及其所有隔间。选择模板：1 × 4、2 × 2、2 × 4、4 × 4 或 2 × 8 的格子架，书架（6 层）、抽屉柜（9 抽）或货架（4 层）。添加前可更改层架或抽屉数量。家具的类型是 **Furniture**；其隔间是 **Cube**、**Shelf** 或 **Drawer**。
- **如何站立：** 非正方形的格子架可 **Upright**（立放）或 **On its side**（侧放）。2 × 4 立放是 4 行 2；侧放是 2 行 4。隔间按其站立方式构建。
- **编号：** 从左上起，逐行，如同你看到的那样。4 × 4 是 Cube 1 到 Cube 16；侧放的 2 × 4 顶行是 1 到 4，下面是 5 到 8。面板会在你添加前显示编号。**Compartment names** 可用 `{n}` 表示编号，`{row}` 与 `{col}` 表示位置。
- **代码：** **Its own code** 给家具一个代码（`KX01`），**Compartment codes** 给隔间一个模式，如 `{parent}-F{col:02}{row:02}`：`{parent}` 是家具代码，`{col:02}` 是两位数的列。4 × 4 因此得到 `KX01-F0101` 到 `KX01-F0404`。每个代码都会对照位置的格式规则（**Settings → 该位置 → General → Your own codes**）以及已有代码检查；若不符合，不会创建任何东西，Kept 会点名该代码。扫描或搜索代码可找到其隔间。
- **撤销：** 提示中的 **Undo** 把家具及其隔间放入回收站并释放其代码，前提是此后没有放入东西或更改。
- **标签：** 在新家具上，**Label everything here** 会按编号顺序为它和每个隔间打印标签。
- **其页面**按站立方式显示隔间，编号与标签一致。点按打开。**Print their labels** 会按编号顺序全部重印，使用当前名称。
- **移入回收站：** 其隔间随之进入回收站，**Restore** 时一起回来。若其中或任一隔间有东西，Kept 只询问那些：**Move them to** 其所在的房间（或 **Choose another place**），或 **Trash them too**。箱子连同内容一起移动。你自己加到家具上的位置也算其中的东西。提示中的 **Undo** 把每件放回各自隔间。

### 翻转家具

家具页面上的 **Turn it…**，用于非正方形的格子架。

- **顶部去了哪：** **To the right** 或 **To the left**，以你面对它的方向。每个隔间连同其物品与已打印标签一起移动。
- **其隔间**每次都询问，因为标签已经贴好：
  - **Renumber：** 每个隔间获得其现在位置的编号、名称与代码，从左上重新编号。旧代码仍有效：它打开现在位于其原命名位置的隔间。为新名称重印标签。
  - **Keep the codes：** 只改变站立方式。每个隔间保留编号、名称与代码。
- 面板会在你翻转前显示新网格。你自己输入的名称或代码无论哪种方式都保留在其隔间上。
- **Undo** 可翻转回去，含编号、名称与代码，前提是其中没有变化。

### 合并与拆分隔间

放入格子插件或移除层架会使两个或更多隔间合一。

- **Merge or split…**，然后点选能构成矩形的并排隔间，再 **Merge**。左上那个保留，含其编号、名称与代码。其余进入回收站；它们的代码与已打印标签会打开合并后的隔间，其中的东西移入其中。
- 要拆分已合并的隔间，点选它并 **Split**。每个单元恢复其代码与标签；物品留在左上那个中。
- **Undo** 可逆转任一操作。
- **你自己的模板：** **Settings → Account → Templates → Furniture** 有账户自己的位置模板：横竖格子（立放）、架子或抽屉、类型、名称与代码模式，与你选择的位置共享。所有者与管理员创建；任何能添加位置的人都可使用。
- **AI 应用**也能做同样的事：`create_place` 接受 `template`，`update_place` 接受 `turn`（[MCP 客户端](/zh/users/mcp-clients/#the-tools)）。合并与拆分仅在应用中。

### 机架

19 英寸或 10 英寸机架是按机架单位（U）计量的家具。设备是其中的物品：占多少单位，以及从哪个单位开始。

- **在此添加 → Room or spot → Furniture with compartments…**，然后选机架模板：**19-inch rack, 42U**、**19-inch rack, 24U**、**12U on a wall**、**6U on a wall** 或 **10-inch rack, 8U**。可改 **Units**（1 到 60），以及是否 **Numbered from** **The bottom**（U1 在底部，通常方式）或 **The top**。机架没有隔间位置；**Its own code** 可选。
- **其页面**从 **Front** 或 **Rear** **Seen from** 显示机架，从上到下：每件设备在其单位上（`U11`、`U5–U6`），其间空闲单位显示为 **Empty**。单位按导轨打印方式书写，各语言一致。
- **放入设备：** 把物品移入机架，如同移入任何位置。它会显示在 **Not placed yet** 下，**Place it** 询问位置：**Starts at**（其最低单位，或从顶部编号机架的顶部单位）、**Height** 以机架单位（也可半单位，如 1.5）、**Faces**（**Front** 或 **Rear**）与 **Depth**。**Full depth** 在两面都占该单位；**Half depth** 只占自己一面，因此前面的半深交换机与后面的架子可以共用一个单位。
- **拒绝：** 同一面同一单位放两件，或某件超出机架顶部。Kept 会点名已在那里的设备（“U11 is taken by Switch at the front.”）且不保存任何内容。
- **Height 0** 是导轨旁的设备，如插线板或理线器：不占单位，列在 **Beside the rails (0U)** 下。
- **物品页面**显示 **In the rack**：机架、单位与深度，带 **Change**。**Take it off its unit** 释放单位但物品仍在机架中。
- **把设备移出**机架会释放其单位；移回时又变成 **Not placed yet**。
- **Undo** 可恢复位置，除非此后有人占用了该单位。
- **AI 应用**也能做同样的事：`create_place` 接受带 `units` 与 `numbering` 的机架模板，`update_thing` 接受 `rack_units` 与 `rack_at`（[MCP 客户端](/zh/users/mcp-clients/#the-tools)）。

## 它的位置

位置的位置让拍摄的 **Suggest where I am** 在你在那里时选中它（[手机上的 Kept](/zh/users/phone-app/#camera-gallery-and-scanning)）。

- **设置：** **Location settings → General → Position**，所有者与管理员可用。**Use where I am now** 读取一次手机位置（浏览器会先询问）并填写 **Latitude** 与 **Longitude**；或按度输入，如 30.0444 和 31.2357。然后 **Save**。**Remove position** 清除。Personal 没有：它跟着你走。
- **普通 HTTP 下**浏览器拒绝提供位置：请手动输入。
- **Open in maps** 在新标签页打开保存位置上的 OpenStreetMap。只有此时位置才会离开 Kept。
- **多近：** 手机在其位置 150 米内时拍摄会建议该位置，两个都近则选更近的。150 米覆盖一栋房子及其花园，加上室内手机的通常误差，且仍能区分相隔两条街的位置。
- **谁能看到：** 所有者与管理员，在此页面；以及在那里添加物品的人的手机，用于建议。查看者与分享链接永远得不到。历史会说位置已更改、谁改的、何时，从不说在哪里。位置导出会带上它，导入该导出会恢复它。

## 隐藏 Personal

每个人都有 **Personal** 位置。若用不上，在 **Settings → Me → Your locations** 打开 **Hide Personal**，关闭即可随时再显示。这是你自己的偏好：别人看不到变化。

- **从何处消失：** 菜单中的位置、首页、列表、搜索及其筛选。仅 Personal 跟踪的模块（比如 Vehicles）会随之从菜单消失。
- **不变：** 其中的一切。指向 Personal 或其中物品的链接仍会打开它。隐藏是整理，不是保护：不会锁定任何东西。
- **提醒仍会到达你**，作为通知、摘要和日历订阅。在 **Settings → Me → Notifications** 中关闭，那里仍列出 Personal。
- **拍摄**从你的其他位置开始，或在你无法在别处添加物品时从 Personal 开始。
- **导入**提供你拥有或管理的其他位置，若没有则提供 Personal。过去的导入仍可从 Activity 打开，无论它去了哪里。
- **Settings → This device** 中的 **Keep available offline** 在副本仍在设备上时保留 Personal 行，以便你能关闭它。
- **Export my data** 会带上你拥有的第一个其他位置，Personal 留在 **Export a location** 上。若你没有其他位置，它会带上 Personal。
- **Your personal AI key** 也为你独自拥有并使用的位置付费，当该位置所属账户没有自己的密钥时。它从不为共享位置付费。
- **助手**会排除 Personal，除非你从 Personal 打开它。**Connections**（个人令牌与已连接应用）保留你给它们的位置，无论是否隐藏。

当它是你唯一的位置时无法隐藏。若后来成为唯一的位置（你离开、被移除、另一位置被删除），它会自行再次显示，当你有另一个时再隐藏。

## 相关

- [日常使用](/zh/users/everyday-use/)了解整体概览。
- [标签](/zh/users/tags/)了解物品除了位置之外是什么。
- [共享位置](/zh/users/everyday-use/#sharing-a-location)了解如何让他人进入一个位置。
