---
title: 术语表
description: "Kept 自有含义的词汇，用平实语言说明。"
---

Kept 对少数词有自用的含义。本页说明每个词的意思，并给出阅读更多之处。

## A

**Admin（管理员）**：位置中的角色。可邀请和移除成员与查看者、更改设置与模块、导入导出、创建分享链接与理赔包、永久删除。只有所有者能授予或移除管理员。[角色](/zh/users/first-run/#the-roles)

**AI 提供商**：Kept 调用以根据照片命名物品、读取收据、运行助手，以及借助嵌入模型进行语义搜索的服务：Groq、OpenAI、Anthropic、Google、OpenRouter，或 Ollama 等 OpenAI 兼容服务器。你自备密钥。[AI 提供商](/zh/users/ai-providers/)

## B

**Backup（备份）**：每晚对数据库、文件和可读副本的 restic 快照，用你选择的密码加密，发送到另一块磁盘、S3 存储桶或 SFTP 服务器。[备份](/zh/admin/backups/)

**Box（箱子）**：见 Container。

## C

**Capture（拍摄）**：通过拍照添加物品。有 AI 提供商时，Kept 根据照片命名；没有时，物品在收件箱中等待命名。

**Claim pack（理赔包）**：包含事故相关收据、发票、照片与序列号的保险报告 ZIP，通过下载链接分享给保险公司。[报告](/zh/users/reports/)

**Compartment（隔间）**：用位置模板添加的家具内部位置：一个格子、一层架子或一个抽屉，有自己的名称、标签，可选自己的代码。并排的隔间可以合并成一个，也可以再拆开。[带隔间的家具](/zh/users/locations/#furniture-with-compartments)

**Condition report（状况报告）**：记录出租房在入住和退租时的状况，用于押金纠纷。[状况报告](/zh/users/condition-reports/)

**Consumable（消耗品）**：按数量计的物品，如螺丝、机油或电池，有最低量以触发低库存提醒。保养可**从库存**取用一件。

**Container（容器）**：装其他物品的东西，如箱子或袋子。容器可嵌套：架子上箱子里再放箱子。容器是物品，不是位置。

**Count（盘点）**：对照 Kept 预期在某处的内容清点位置或检查箱子。每次盘点都会保留，记录找到了什么、缺了什么。也称 stocktake。[盘点与清点](/zh/users/counts/)

## F

**Furniture（家具）**：一种位置类型，一步添加储物家具及其隔间：格子架、书架、抽屉柜。地图上画出的家具（如书桌）则是带形状的物品。[带隔间的家具](/zh/users/locations/#furniture-with-compartments)

## G

**Graph（关系图）**：位置的布局之一：其楼层、房间、箱子与物品作为节点与连线，2D 或 3D，需要关注处有标记。[关系图](/zh/users/graph/)

## H

**Hand-over（交接）**：借出一个箱子及其中所有东西：一条记录，箱子一行、里面每件物品一行，各自归还。[套件与交接](/zh/users/kits/)

## I

**Inbox（收件箱）**：物品等待你处理的地方：未命名的拍摄、AI 读取后需要查看的内容、邮件进来的收据、看起来异常的读数，以及需要决定的手机端更改。

**Incident（事故）**：入室盗窃、火灾、洪水或遗失，以及受影响的物品。[报告](/zh/users/reports/#incidents-and-claim-packs)

**Instance（实例）**：一个运行中的 Kept 服务器，及其账户与位置。

**Instance admin（实例管理员）**：运行服务器的人：用户、注册、备份。除非被邀请，实例管理员看不到某个位置的内部。

**Insurance report（保险报告）**：每件物品的照片、品牌、型号、序列号、购买日期、价格、当前价值与收据的 PDF 和 CSV，并按位置和币种汇总。[报告](/zh/users/reports/#insurance-report)

## K

**Kit（套件）**：带零件清单的容器，说明里面应该有什么。零件被移走、借出或丢失后，套件仍知道。[套件与交接](/zh/users/kits/#kits)

## L

**Label stock（标签纸）**：打印标签的材料：A4 或 Letter 纸张、标签打印机卷纸，或标签机带。窄带（9 和 12 mm）放不下二维码；**Scan** 改读其打印的短 ID。[打印](/zh/users/short-ids/#printing)

**Layout（布局）**：位置页面如何显示其内容：**List**、**Grid**、**Graph**、**Table**（电脑上）或 **Map**。Kept 在每台设备上按位置记住你的选择。[位置、房间与箱子](/zh/users/locations/)

**Lending（借用）**：记录某件物品（或数量的一部分）在某人处，含归还日期、状况与照片。

**Location（位置）**：住宅、车库、储物间、办公室或你存放东西的任何地方。每个位置有自己的成员、角色、模块、时区与货币。

## M

**Managed account（托管账户）**：有用户名、无邮箱的账户，供儿童或老人使用，由位置所有者或管理员创建。每个位置最多 20 个。[无邮箱人员](/zh/users/first-run/#people-without-email)

**Map（地图）**：位置的布局之一：位置的 3D 图，按楼层显示房间、货架与箱子，成员及以上可调整。[位置地图](/zh/users/location-map/)

**MCP**（Model Context Protocol）：Claude 等 AI 应用连接 Kept 以查找和修改物品的方式，在你的角色范围内。[连接 AI 客户端](/zh/users/mcp-clients/)

**Meters（仪表）**：读数、保养与日程，用于类型带仪表的物品：汽车、发电机、锅炉。[车辆与机器](/zh/users/vehicles/)

**Member（成员）**：位置中的角色。可添加、编辑、移动、借出与丢弃物品，记录读数与保养，打印标签，并使用 AI 拍摄。金额可见。

**Module（模块）**：Kept 按位置开关的部分，如 Lending 或 Vehicles。[模块与预设](/zh/users/modules/)

## N

**Needs you（需要你处理）**：首页对需要关注内容的计数：已逾期、到期、即将到期、已借出、不确定和低库存。[首页](/zh/users/home/)

## O

**Owner（所有者）**：持有位置的角色。管理员能做的一切，加上两步验证规则、转让与删除。只有一个所有者。

## P

**Personal location（Personal 位置）**：你自己的位置，随你的账户创建。从不共享：无成员、邀请或分享链接。有另一个位置后可以[隐藏它](/zh/users/locations/#hide-personal)。

**Place（位置点）**：位置内部的房间或地点：楼层、房间、架子、抽屉。箱子是容器，不是位置。

**Place template（位置模板）**：家具及其隔间的一套配方：布局（横竖格子、架子或抽屉）、类型、名称与代码模式。Kept 有格子架、书架、抽屉柜和货架；账户可在 **Settings → Account → Templates → Furniture** 添加自己的模板。[带隔间的家具](/zh/users/locations/#furniture-with-compartments)

**Preset（预设）**：位置初始的模块集合：Essentials、Household 或 Complete。[模块与预设](/zh/users/modules/)

## R

**Reading（读数）**：仪表在某一时刻的值，如里程表或运行小时表。

**Recovery kit（恢复套件）**：服务器密钥、备份仓库与凭据，以及恢复步骤，打印或保存在服务器之外。没有它，备份无法恢复 AI 密钥或已存密码。[恢复套件](/zh/admin/recovery-kit/)

**RLS**（row-level security，行级安全）：数据库中隔离各位置的规则：每个请求只能看到登录者有权看到的内容。[行级安全](/zh/developers/rls/)

## S

**Schedule（日程）**：要按日期或读数重复做的事，如换机油。[提醒](/zh/users/reminders/)

**Secret field（机密字段）**：物品上的字段，如 Wi-Fi 密码或门禁码，加密存储并隐藏，直到被授权显示。每次显示都会记录日志。

**Share link（分享链接）**：指向箱子、位置或一次搜索内容的只读链接，供无账户者使用。[分享链接](/zh/users/sharing/#share-links)

**Short ID（短 ID）**：每件物品和位置都有的六字符代码，如 `7KQ-4MZ`，印在其标签上。[短 ID 与标签](/zh/users/short-ids/)

**Stocktake（清点）**：见 Count。

## T

**Tape（标签带）**：代码一旦有打印标签后，标签上显示的琥珀色标签带。标签机带是一种标签纸。[短 ID 与标签](/zh/users/short-ids/)

**Thing（物品）**：你跟踪的任何东西：电钻、汽车、一箱线缆。

**Trash（回收站）**：被丢弃物品等待 30 天的地方。成员及以上可恢复；管理员可永久删除。

## U

**Unplaced（未放置）**：每个位置为还没有位置的物品保留的地点。

## V

**Vehicle（车辆）**：类型为 Vehicle 或其下类型的物品：汽车、摩托车、自行车、发电机。车辆有读数、保养和日程，Complete 上还有燃油。锅炉有仪表但不是车辆。[车辆与机器](/zh/users/vehicles/)

**Viewer（查看者）**：位置中的角色。只能查看与搜索。金额默认隐藏，除非位置允许查看者看到；助手会回答但不能做任何更改。

## W

**What's new（新功能介绍）**：Kept 更新后的卡片，含该版本亮点，每人一次；**帮助**可再次显示。[导览](/zh/users/first-run/#7-take-a-tour)

## 相关

- [最初几分钟](/zh/users/first-run/)了解如何开始。
- [常见问题](/zh/users/faq/)了解常见疑问。
