---
title: 仪表盘
description: "Kept 的计数显示在仪表盘上。可复制粘贴的组件，用于 Homepage、Glance 和 Homarr，从 Kept 的摘要中读取逾期、到期和即将到期的数据。"
---

仪表盘可以显示 Kept 中需要你处理的事项：逾期、到期、即将到期、已借出、不确定和低库存，可显示总数及各位置。下面每个组件读取一次调用：`GET /api/v1/summary`，使用[个人令牌](/zh/users/mcp-clients/#make-a-personal-token)（**只读**，以及你希望统计的位置）。[Home Assistant](/zh/users/home-assistant/) 读取同一接口。

## 摘要

```json
{
  "asOf": "2026-10-15T11:30:00.000Z",
  "totals": { "things": 61, "unplaced": 4, "overdue": 2, "due": 3, "expiring": 2,
              "lentOut": 2, "borrowedIn": 0, "uncertain": 2, "longUnseen": 0, "lowStock": 0 },
  "locations": [
    { "id": "…", "name": "Home", "kind": "home", "timeZone": "Africa/Cairo",
      "counts": { "things": 34, "unplaced": 1, "overdue": 2, "due": 1, "expiring": 1,
                  "lentOut": 1, "borrowedIn": 0, "uncertain": 1, "longUnseen": 0,
                  "lowStock": null } }
  ]
}
```

- 每个计数与 Kept 首页上的相同，统计范围是令牌可达的位置。
- 某位置中的 `null`：该模块在那里已关闭（`lentOut` 和 `borrowedIn` 对应 Lending，`lowStock` 对应 Consumables）。`totals` 只累加适用的位置，因此始终是数字。
- 不含物品名称，不含金额。

请将令牌放在仪表盘的密钥配置中，不要放在你共享的文件里。每个示例都使用 `https://kept.example.org`：请换成你的 Kept 地址。

## Homepage

在 `services.yaml` 中使用 [Custom API](https://gethomepage.dev/widgets/services/customapi/) 组件。令牌来自环境变量 `HOMEPAGE_VAR_KEPT_TOKEN`（[环境变量密钥](https://gethomepage.dev/installation/docker/#using-environment-secrets)）。已对照 Homepage 2.5.0 文档核对。

```yaml
- Home:
    - Kept:
        href: https://kept.example.org
        description: What needs you
        widget:
          type: customapi
          url: https://kept.example.org/api/v1/summary
          refreshInterval: 300000 # 5 minutes
          headers:
            Authorization: Bearer {{HOMEPAGE_VAR_KEPT_TOKEN}}
          mappings:
            - field: totals.overdue
              label: Overdue
              format: number
            - field: totals.due
              label: Due
              format: number
            - field: totals.expiring
              label: Expiring
              format: number
            - field: totals.lowStock
              label: Low stock
              format: number
```

若按位置显示，每位置一行：

```yaml
        widget:
          type: customapi
          url: https://kept.example.org/api/v1/summary
          refreshInterval: 300000
          headers:
            Authorization: Bearer {{HOMEPAGE_VAR_KEPT_TOKEN}}
          display: dynamic-list
          mappings:
            items: locations
            name: name
            label: counts.overdue
```

## Glance

在 `glance.yml` 中使用 [`custom-api`](https://github.com/glanceapp/glance/blob/main/docs/configuration.md#custom-api) 组件。`${KEPT_TOKEN}` 从 Glance 的环境变量读取。已对照 Glance 0.8.6 文档核对。

```yaml
- type: custom-api
  title: Kept
  cache: 5m
  url: https://kept.example.org/api/v1/summary
  headers:
    Authorization: Bearer ${KEPT_TOKEN}
    Accept: application/json
  template: |
    <div class="flex justify-between text-center">
      <div>
        <div class="color-highlight size-h3">{{ .JSON.Int "totals.overdue" }}</div>
        <div class="size-h6">OVERDUE</div>
      </div>
      <div>
        <div class="color-highlight size-h3">{{ .JSON.Int "totals.due" }}</div>
        <div class="size-h6">DUE</div>
      </div>
      <div>
        <div class="color-highlight size-h3">{{ .JSON.Int "totals.expiring" }}</div>
        <div class="size-h6">EXPIRING</div>
      </div>
      <div>
        <div class="color-highlight size-h3">{{ .JSON.Int "totals.lowStock" }}</div>
        <div class="size-h6">LOW STOCK</div>
      </div>
    </div>
    <ul class="list list-gap-10" style="margin-top: 1rem">
    {{ range .JSON.Array "locations" }}
      <li>{{ .String "name" }}: {{ .Int "counts.overdue" }} overdue, {{ .Int "counts.due" }} due</li>
    {{ end }}
    </ul>
```

自签名证书需加 `allow-insecure: true`。

## Homarr

自定义组件（Homarr 2.x）。将下面的定义保存为 `kept.homarr-widget.json`，然后在 Homarr 中：**自定义组件 → 导入**。在 **Configure API sources** 中，把建议地址换成你的 Kept 地址，勾选确认，并把令牌粘贴到 **API key or token**。然后添加到看板：**选择要添加的项目 → 自定义组件**。Homarr 从其服务器调用 Kept，令牌不会进入浏览器。

已对照 Homarr 2.5.2 的导入 schema，尚未在预览中实际运行：依赖它之前请先用 **Test and preview**。

- `networkScope: private` 让 Homarr 能通过局域网访问 Kept。Homarr 在任何设置下都拒绝 Tailscale 的 `100.x` 地址，且不跟随重定向：请使用 Kept 的局域网地址，即最终地址。
- 自签名证书很可能被拒绝；请使用受信任的证书，或在局域网使用 `http://`。

```json
{
  "$schema": "homarr-custom-widget-v2",
  "name": "Kept",
  "description": "Overdue, due, expiring, lent out, uncertain and low stock from Kept.",
  "sources": {
    "default": {
      "name": "Kept",
      "baseUrl": "https://your-kept.example.com",
      "networkScope": "private",
      "auth": "bearer"
    }
  },
  "requests": {
    "summary": {
      "path": "/api/v1/summary",
      "cacheSeconds": 60
    }
  },
  "options": {
    "showLocations": {
      "label": "Show each location",
      "control": "switch",
      "default": true
    }
  },
  "template": "<Stack gap=\"sm\" p=\"sm\" h=\"100%\" style={{ minWidth: 0, minHeight: 0 }}>\n  <Group justify=\"space-between\" wrap=\"nowrap\"><Text size=\"xs\" c=\"dimmed\" tt=\"uppercase\" fw={700}>Kept</Text><RefreshButton requestId=\"summary\" label=\"Refresh\" size=\"xs\" /></Group>\n  {status.summary?.loading && <Skeleton height={120} radius=\"md\" />}\n  {status.summary?.ok === false && <Alert color=\"red\" title=\"Kept unavailable\">{status.summary.error || \"Check the address and token under Configure sources.\"}</Alert>}\n  {!status.summary?.loading && status.summary?.ok !== false && <ScrollArea style={{ flex: 1, minHeight: 0 }}><Stack gap=\"sm\">\n    <SimpleGrid type=\"container\" cols={{ base: 2, \"300px\": 3 }} spacing=\"xs\">{[{ label: \"Overdue\", value: data.summary?.totals?.overdue }, { label: \"Due\", value: data.summary?.totals?.due }, { label: \"Expiring\", value: data.summary?.totals?.expiring }, { label: \"Lent out\", value: data.summary?.totals?.lentOut }, { label: \"Uncertain\", value: data.summary?.totals?.uncertain }, { label: \"Low stock\", value: data.summary?.totals?.lowStock }].map(item => <Paper key={item.label} withBorder radius=\"md\" p=\"sm\"><Text size=\"xs\" c=\"dimmed\">{item.label}</Text><Text fw={700} size=\"xl\">{item.value ?? \"-\"}</Text></Paper>)}</SimpleGrid>\n    {options.showLocations && <Stack gap={0}>{(data.summary?.locations ?? []).map(location => <Group key={location.id} justify=\"space-between\" wrap=\"wrap\" gap=\"xs\" py=\"xs\"><Text size=\"sm\" fw={600}>{location.name}</Text><Text size=\"xs\" c=\"dimmed\">{\"Overdue \" + location.counts.overdue + \" · Due \" + location.counts.due}</Text></Group>)}</Stack>}\n  </Stack></ScrollArea>}\n</Stack>"
}
```
