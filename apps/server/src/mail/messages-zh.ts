// Simplified Chinese mail. Same shape as the English table in messages.ts; keep them in step.
import type { SecurityEvent } from '../auth/security.js';
import type { AdminAction, AiCapFacts } from './mailer.js';
import {
  aiPage,
  type Chrome,
  type CoreTable,
  capFactsOf,
  capitalise,
  day,
  deviceName,
  diskFacts,
  type Message,
  type MessageContext,
  mailDay,
  mailTime,
  num,
  page,
  tokens,
} from './message-kit.js';

const ZH_ROLE = { admin: '管理员', member: '成员', viewer: '查看者' } as const;

const ZH_NOT_YOU = '若这不是你操作的，请立即从登录页重置密码。';

const ZH_SECURITY: Record<SecurityEvent, (ctx: MessageContext) => Message> = {
  'passkey-added': () => ({
    subject: '你的 Kept 账户新增了通行密钥',
    paragraphs: ['你的 Kept 账户新增了一枚通行密钥，其他所有设备均已退出登录。'],
    footnote:
      '若这不是你操作的，请立即重置密码，并在 设置 → 登录与安全 中移除该通行密钥。',
  }),
  'two-factor-disabled': () => ({
    subject: '两步验证登录已关闭',
    paragraphs: ['你的 Kept 账户已关闭两步验证，其他所有设备均已退出登录。'],
    footnote: '若这不是你操作的，请立即重置密码，并重新开启两步验证。',
  }),
  'passkey-removed': () => ({
    subject: '你的 Kept 账户移除了一枚通行密钥',
    paragraphs: [
      '你的 Kept 账户移除了一枚通行密钥，其他所有设备均已退出登录。该密钥不再能用于登录。',
    ],
    footnote: ZH_NOT_YOU,
  }),
  'two-factor-enabled': () => ({
    subject: '两步验证登录已开启',
    paragraphs: [
      '你的 Kept 账户已开启两步验证，其他所有设备均已退出登录。现在登录时需要输入验证器应用提供的验证码。',
    ],
    footnote: '若这不是你操作的，请立即重置密码，并检查 设置 → 登录与安全。',
  }),
  'two-factor-replaced': () => ({
    subject: '两步验证登录已重新设置',
    paragraphs: [
      '你的 Kept 账户已用新的验证器应用重新设置两步验证，其他所有设备均已退出登录。旧应用的验证码和旧恢复码均已失效。',
    ],
    footnote: '若这不是你操作的，请立即重置密码，并检查 设置 → 登录与安全。',
  }),
  'backup-codes-new': () => ({
    subject: '你的 Kept 账户生成了新的恢复码',
    paragraphs: [
      '你的 Kept 账户生成了新的两步验证恢复码，其他所有设备均已退出登录。旧恢复码均已失效。',
    ],
    footnote: ZH_NOT_YOU,
  }),
  'sign-in-unlinked': () => ({
    subject: '你的 Kept 账户解除了一种登录方式',
    paragraphs: [
      '一种外部登录方式（例如 Google）已从你的 Kept 账户解除关联，其他所有设备均已退出登录。该方式不再能用于登录。',
    ],
    footnote: ZH_NOT_YOU,
  }),
  'password-changed': () => ({
    subject: '你的 Kept 密码已更改',
    paragraphs: ['你的 Kept 账户密码已更改，其他所有设备均已退出登录。'],
    footnote: ZH_NOT_YOU,
  }),
  'unverified-account-reset': () => ({
    subject: '你的邮箱地址已确认',
    paragraphs: [
      '已从这个邮箱重置你的 Kept 密码，这证明该账户的邮箱地址属于你。',
      '此前该地址尚未确认；为防账户由他人创建，此前添加的所有通行密钥、两步验证设置和已登录设备均已移除。',
    ],
    footnote:
      '请使用新密码登录；如果你使用两步验证，请重新设置。若你并未重置密码，请立即再次重置。',
  }),
  'unverified-account-link': () => ({
    subject: '你的邮箱地址已确认',
    paragraphs: [
      '你通过发送到这个邮箱的链接登录了 Kept，这证明该账户的邮箱地址属于你。',
      '此前该地址尚未确认；为防账户由他人创建，其密码、通行密钥、两步验证设置以及其他所有已登录设备均已移除。',
    ],
    footnote: '请在账户设置中选择新密码；如果你使用两步验证，请重新设置。',
  }),
};

const ZH_ADMIN: Record<AdminAction, (locationName: string) => Message> = {
  disabled: () => ({
    subject: '你的 Kept 账户已被停用',
    paragraphs: [
      '此 Kept 的管理员停用了你的账户。在重新启用之前，你无法登录。',
    ],
  }),
  enabled: () => ({
    subject: '你的 Kept 账户已重新启用',
    paragraphs: ['管理员重新启用了你的账户。你可以像以前一样登录。'],
  }),
  'two-factor-reset': () => ({
    subject: '你的账户两步验证已重置',
    paragraphs: [
      '管理员已从你的账户移除两步验证，并在所有设备上退出登录，通常是因为你丢失了验证器。',
      '请在账户设置中重新设置两步验证。',
    ],
  }),
  'signed-out-everywhere': () => ({
    subject: '你已在所有设备上退出 Kept',
    paragraphs: ['管理员已在每台设备上退出你的账户。请重新登录以继续使用。'],
  }),
  'instance-admin-granted': () => ({
    subject: '你现为此 Kept 的管理员',
    paragraphs: ['你已被设为服务器管理员：现在可以管理此 Kept 的用户和设置。'],
  }),
  'instance-admin-revoked': () => ({
    subject: '你不再为此 Kept 的管理员',
    paragraphs: [
      '你的服务器管理员权限已被移除。你自己的位置及其中的内容不受影响。',
    ],
  }),
  'password-reset-issued': () => ({
    subject: '已为你的账户签发密码重置',
    paragraphs: [
      '管理此 Kept 的人为你的账户签发了一次性密码重置，并在所有设备上退出登录。',
      '对方会把验证码交给你，用于选择新密码。',
    ],
  }),
  'location-ownership-received': (name) => ({
    subject: `你现在拥有「${name}」`,
    paragraphs: [`管理此 Kept 的人已将你设为「${name}」的所有者。`],
  }),
  'location-ownership-moved': (name) => ({
    subject: `「${name}」有了新的所有者`,
    paragraphs: [
      `管理此 Kept 的人已将「${name}」转给新的所有者。你仍以管理员身份保留在其中。`,
    ],
  }),
  'token-created': () => ({
    subject: '已为你的账户创建令牌',
    paragraphs: [
      '管理此 Kept 的人在服务器上为你的账户创建了个人令牌，供 Home Assistant 或 AI 助手等应用使用。在创建时指定的位置内，它能做你能做的一切。',
      '若这不是你要求的，请在 设置 → 连接 中撤销。',
    ],
  }),
};

// AI 用量上限（D206）：上限的说法，以及已用量。
function zhCapOf(c: AiCapFacts): string {
  switch (c.scope) {
    case 'location':
      return `${c.target} 的 AI 用量上限`;
    case 'member':
      return c.target ? `${c.target} 的 AI 用量上限` : '某人的 AI 用量上限';
    case 'account':
      return '你账户的 AI 用量上限';
    case 'user':
      return '你个人的 AI 用量上限';
    case 'instance':
      return '此服务器的 AI 用量上限';
    case 'instance_account':
      return c.target
        ? `${c.target} 在此服务器 AI 密钥上的额度`
        : '此服务器 AI 密钥上的额度';
  }
}
const zhUsed = (c: AiCapFacts) =>
  c.unit === 'money'
    ? `${c.currency} ${c.used} / ${c.currency} ${c.limit}`
    : `${tokens('zh', c.used)} / ${tokens('zh', c.limit)} token`;

function zhCap(level: 80 | 100, c: AiCapFacts, ctx: MessageContext, footnote: string): Message {
  const cap = zhCapOf(c);
  if (level === 80) {
    return {
      subject: `Kept：本月已用 ${cap} 的 80%`,
      paragraphs: [
        `${capitalise(cap)}截至目前已用 ${zhUsed(c)}。`,
        '达到上限后，AI 将暂停至下月 1 日。抓取内容仍会保存；AI 恢复后再读取其照片。',
      ],
      action: { label: '打开 AI 设置', url: aiPage(ctx, c.scope) },
      footnote,
    };
  }
  return {
    subject: `Kept：AI 已暂停至 ${day(c.pausedUntil)}`,
    paragraphs: [
      `${capitalise(cap)}已达上限：本月已用 ${zhUsed(c)}。`,
      `AI 已暂停至 ${day(c.pausedUntil)}。抓取内容仍会保存；恢复后再读取其照片。若想提前恢复，请提高或取消上限。`,
    ],
    action: { label: '立即恢复', url: aiPage(ctx, c.scope) },
    footnote,
  };
}

export const ZH: CoreTable = {
  'magic-link': (m) => ({
    subject: '你的 Kept 登录链接',
    paragraphs: ['使用此链接登录 Kept。链接仅能使用一次，有效期为接下来的 15 分钟。'],
    action: { label: '登录', url: m.url },
    footnote: '若你并未请求登录，请忽略此邮件。没有链接，任何人都无法登录。',
  }),
  'password-reset': (m) => ({
    subject: '重置你的 Kept 密码',
    paragraphs: [
      '有人请求重置此 Kept 账户的密码。使用此链接选择新密码。链接仅能使用一次，有效期为接下来的一小时。',
    ],
    action: { label: '选择新密码', url: m.url },
    footnote: '若这不是你操作的，请忽略此邮件：你的密码保持不变。',
  }),
  'email-change-confirm': (m) => ({
    subject: '确认你的新邮箱地址',
    paragraphs: [
      `有人登录你的 Kept 账户后，请求将其改为 ${m.newEmail}。若这是你，请在一小时内通过此链接确认。`,
    ],
    action: { label: '确认更改', url: m.url },
    footnote: '若这不是你操作的，请不要使用该链接：账户仍使用此地址。你可能需要更改密码。',
  }),
  'email-change-verify': (m) => ({
    subject: '验证你在 Kept 的邮箱地址',
    paragraphs: ['使用此链接完成将 Kept 账户迁移到此地址。'],
    action: { label: '验证此地址', url: m.url },
    footnote: '若你并未预期此操作，请忽略：在使用链接之前不会发生任何更改。',
  }),
  'email-changed': (m) => ({
    subject: '你的 Kept 邮箱地址已更改',
    paragraphs: [`你的 Kept 账户现使用 ${m.newEmail}。此地址不再接收该账户的邮件。`],
    footnote: '若这不是你操作的，请联系管理你 Kept 的人。',
  }),
  'account-deletion': (m) => {
    const day = mailDay('zh', m.purgeAfter, m.timezone);
    return {
      subject: `你的 Kept 账户将于 ${day} 删除`,
      paragraphs: [
        `你请求删除自己的 Kept 账户。删除将于 ${day} 执行，连同你的个人位置及其中的全部内容。`,
        '在此之前，登录会显示该日期，并允许你保留账户。你添加到他人位置中的内容仍留在那里。',
      ],
      footnote: '若你并未请求此操作，请立即登录，选择「保留我的账户」，并更改密码。',
    };
  },
  'report-ready': (m) => {
    const name = {
      inventory: '清单',
      insurance: '保险报告',
      vehicle_history: '车辆历史',
    }[m.report];
    return {
      subject: m.place ? `${name}：${m.place}` : name,
      paragraphs: [
        m.attached
          ? 'Kept 已生成你请求的报告，并以 PDF 附上。'
          : 'Kept 已生成你请求的报告，但体积过大无法附上。请再次从 Kept 打印以下载。',
      ],
      footnote: '计划中的报告列在 设置 → 我 → 通知，你可以在那里停止它们。',
    };
  },
  invite: (m) => ({
    subject: m.inviterName
      ? `${m.inviterName} 邀请你加入 Kept 上的「${m.locationName}」`
      : `你受邀加入 Kept 上的「${m.locationName}」`,
    paragraphs: [
      m.inviterName
        ? `${m.inviterName} 邀请你以${ZH_ROLE[m.role]}身份加入「${m.locationName}」。`
        : `你受邀以${ZH_ROLE[m.role]}身份加入「${m.locationName}」。`,
      'Kept 记录你拥有的物品、它们的位置，以及即将到期的事项。',
    ],
    action: { label: '接受邀请', url: m.url },
    footnote: '若你并未预期此邀请，请忽略：除非你接受，否则不会发生任何事。',
  }),
  'sign-up-existing': (_m, ctx) => ({
    subject: '有人尝试用你的邮箱地址注册',
    paragraphs: [
      '有人尝试用此地址创建 Kept 账户，但该地址已有账户。没有创建新账户。',
      '若这是你，请改为直接登录。若你忘记了密码，可以从登录页重置。',
    ],
    action: { label: '登录', url: page(ctx, '/signin') },
    footnote: '若这不是你，你无需做任何事。',
  }),
  'security-notice': (m, ctx) => ZH_SECURITY[m.event](ctx),
  'backup-code-used': (m) => {
    const when = mailTime('zh', m.at, m.timeZone);
    const device = deviceName(m, (browser, os) => `${os} 上的 ${browser}`);
    return {
      subject: '有人使用恢复码登录了你的 Kept 账户',
      paragraphs: [
        device
          ? `有人于 ${when} 从 ${device} 使用恢复码登录了你的 Kept 账户。`
          : `有人于 ${when} 使用恢复码登录了你的 Kept 账户。`,
        m.left === 0
          ? '那是你最后一枚恢复码。请在 设置 → 登录与安全 → 新恢复码 中生成新的。'
          : m.left === 1
            ? '你还剩 1 枚恢复码。'
            : `你还剩 ${m.left} 枚恢复码。`,
        '若你是因为验证器应用丢失才使用恢复码，请在 设置 → 登录与安全 → 重新设置 中用新应用重新设置两步验证。这也会生成新的恢复码。',
      ],
      footnote:
        '若这不是你操作的，请立即从登录页重置密码。然后在 设置 → 登录与安全 → 新恢复码 中生成新的恢复码（旧码将失效），并在 设置 → 会话与设备 → 退出其他所有设备 中退出其他所有设备。',
    };
  },
  'admin-action': (m) => ({
    ...ZH_ADMIN[m.action](m.locationName ?? ''),
    footnote: '这是关于你账户的自动通知。',
  }),
  'owner-new-member': (m) => ({
    subject: `${m.memberName} 加入了「${m.locationName}」`,
    paragraphs: [
      m.managed
        ? `${m.memberName} 已以受管账户身份加入「${m.locationName}」，角色为${ZH_ROLE[m.role]}。`
        : `${m.memberName} 现以${ZH_ROLE[m.role]}身份可以访问「${m.locationName}」。`,
    ],
    footnote:
      '作为所有者，每有新成员你都会收到此邮件。可在该位置的设置中更改或移除成员。',
  }),
  'ai-cap': (m, ctx) =>
    zhCap(
      m.level,
      m.cap,
      ctx,
      '你收到此邮件是因为你设置了此上限，或它覆盖你的工作。每月发送一次。',
    ),
  'admin-alert': (m, ctx) => {
    const footnote =
      '你作为此 Kept 的管理员会收到此邮件。问题存在期间每天最多发送一次。';
    if (m.alert === 'ai_instance_cap_warning' || m.alert === 'ai_instance_cap_reached') {
      const c = capFactsOf(m.details);
      if (c) return zhCap(m.alert === 'ai_instance_cap_warning' ? 80 : 100, c, ctx, footnote);
    }
    if (m.alert === 'ai_instance_key_rejected') {
      return {
        subject: 'Kept：服务器的 AI 密钥被拒绝',
        paragraphs: [
          `${String(m.details.provider ?? '提供商')}拒绝了此服务器的 AI 密钥，因此由其付费的 AI 任务正在等待。`,
          '请在管理员 AI 设置中更换密钥。保存新密钥后，等待中的任务会继续。',
        ],
        action: { label: '打开 AI 设置', url: page(ctx, '/admin/ai') },
        footnote,
      };
    }
    if (m.alert === 'failed_jobs_rising') {
      return {
        subject: 'Kept：后台任务正在失败',
        paragraphs: [
          `过去一小时有 ${num(m.details.failedLastHour)} 个后台任务失败。`,
          '失败任务列表显示哪些任务失败及原因；你可以在那里重试或丢弃它们。',
        ],
        action: { label: '打开失败任务', url: page(ctx, '/admin/jobs') },
        footnote,
      };
    }
    if (m.alert === 'backup_failed') {
      return {
        subject: 'Kept：夜间备份失败',
        paragraphs: [
          `夜间备份未能完成：${String(m.details.error ?? '')}`,
          m.details.lastOk
            ? `上次成功备份于 ${day(m.details.lastOk)} 完成。在再次成功之前，此后写入的内容都不在备份中。`
            : '尚无备份成功过，因此此 Kept 中没有任何内容有备份。',
        ],
        action: { label: '打开状态页', url: page(ctx, '/admin/status') },
        footnote,
      };
    }
    if (m.alert === 'backup_stale') {
      return {
        subject: 'Kept：已超过 36 小时没有备份',
        paragraphs: [
          m.details.lastOkAt
            ? `上次成功备份于 ${day(m.details.lastOkAt)} 完成。Kept 每晚备份，因此夜间备份已停止工作。`
            : '备份已配置，但尚未有任何一次完成。',
          '备份页面列出每次运行及失败原因。若 Kept 的后台工作进程未运行，请重新启动它。',
        ],
        action: { label: '打开备份', url: page(ctx, '/admin/backups') },
        footnote,
      };
    }
    if (m.alert === 'disk_space_low') {
      const d = diskFacts(m.details);
      return {
        subject: d.backup ? 'Kept：备份磁盘快满了' : 'Kept：数据磁盘快满了',
        paragraphs: [
          `已使用 ${d.percent}%，剩余 ${d.gb} GB。`,
          d.backup
            ? '磁盘写满后夜间备份会失败。请释放空间、更换更大的磁盘，或在备份设置中减少保留的备份数量。'
            : '磁盘写满后，Kept 无法保存新照片或文档，数据库也可能停止工作。请释放空间或更换更大的磁盘。',
        ],
        action: { label: '打开状态页', url: page(ctx, '/admin/status') },
        footnote,
      };
    }
    if (m.alert === 'bucket_versioning_off') {
      return {
        subject: 'Kept：文件存储桶未开启版本控制',
        paragraphs: [
          'Kept 将文件保存在 S3 存储桶中，夜间备份也保留在那里。该存储桶未开启版本控制，因此被误删、被覆盖，或被持有密钥的人删除的文件无法找回。',
          '请在你的存储服务商处为该存储桶开启版本控制。下次备份发现已开启后，此提示会停止。',
        ],
        action: { label: '打开状态页', url: page(ctx, '/admin/status') },
        footnote,
      };
    }
    if (m.alert === 'restore_drill_due') {
      return {
        subject: 'Kept：该做恢复演练了',
        paragraphs: [
          m.details.lastDrillAt
            ? `上次恢复演练在 ${day(m.details.lastDrillAt)}，已超过 30 天。`
            : '尚未做过任何恢复演练。',
          '演练会把最新备份恢复到临时数据库并检查每张表，以确认备份确实可以恢复。请按恢复手册所示运行 `kept admin backup drill`。',
        ],
        action: { label: '打开备份', url: page(ctx, '/admin/backups') },
        footnote,
      };
    }
    if (m.alert === 'backup_verify_failed') {
      return {
        subject: 'Kept：每周备份检查发现问题',
        paragraphs: [
          `每周对备份仓库的检查失败：${String(m.details.error ?? '')}`,
          '你的备份可能无法按现状恢复。请打开「备份」查看检查结果，修复后再检查一次。',
        ],
        action: { label: '打开备份', url: page(ctx, '/admin/backups') },
        footnote,
      };
    }
    if (m.alert === 'backup_suspicious_size') {
      return {
        subject: 'Kept：最新备份看起来过小',
        paragraphs: [
          '最新备份比上次成功的备份小很多。Kept 保留了它，但未删除任何更旧的备份，因此好的备份仍在。',
          '若大量删除是有意为之，则没有问题，后续备份会清除此提示。若不是，请先弄清发生了什么再恢复任何内容。',
        ],
        action: { label: '打开备份', url: page(ctx, '/admin/backups') },
        footnote,
      };
    }
    if (m.alert === 'webhook_failing') {
      return {
        subject: 'Kept：某个位置的 Webhook 持续失败',
        paragraphs: [
          `此 Kept 某个位置中设置的 Webhook 自 ${day(m.details.since)} 起每次投递都失败，因此 Kept 已将其标记为失败。`,
          'Kept 在每次新事件时仍会尝试。该位置的所有者和管理员可以在 位置设置 → Webhooks 中修复或移除它。',
        ],
        action: { label: '打开状态页', url: page(ctx, '/admin/status') },
        footnote,
      };
    }
    if (m.alert === 'reminders_not_scanned') {
      return {
        subject: 'Kept：提醒已停止发出',
        paragraphs: [
          m.details.lastOkAt
            ? `Kept 上次检查到期提醒在 ${day(m.details.lastOkAt)}，已超过 2 小时。在再次检查之前，没有人会收到新提醒。`
            : 'Kept 尚未完成过一次到期提醒检查，因此没有人会收到提醒。',
          '该检查在 Kept 的后台工作进程中每 15 分钟运行一次。失败任务列表显示它为何停止；若工作进程未运行，请重新启动它。',
        ],
        action: { label: '打开失败任务', url: page(ctx, '/admin/jobs') },
        footnote,
      };
    }
    if (m.alert === 'llm_default_partition') {
      return {
        subject: 'Kept：AI 调用记录需要处理',
        paragraphs: [
          `${num(m.details.rows)} 条 AI 调用记录（${day(m.details.oldest)} 至 ${day(m.details.newest)}）存放在其月度分区之外。`,
          '在它们被移入分区之前，Kept 无法创建该月的分区，因此夜间 AI 维护任务会持续失败。移动它们是管理此 Kept 的人的数据库操作。',
        ],
        action: { label: '打开状态页', url: page(ctx, '/admin/status') },
        footnote,
      };
    }
    return {
      subject: 'Kept：审计事件需要处理',
      paragraphs: [
        `${num(m.details.rows)} 条审计事件（${day(m.details.oldest)} 至 ${day(m.details.newest)}）存放在其月度分区之外。`,
        '在它们被移入分区之前，Kept 无法创建该月的分区，因此夜间维护任务会持续失败。移动它们是管理此 Kept 的人的数据库操作。',
      ],
      action: { label: '打开状态页', url: page(ctx, '/admin/status') },
      footnote,
    };
  },
};

export const ZH_CHROME: Chrome = {
  dir: 'ltr',
  linkFallback: '若按钮无法使用，请将此地址复制到浏览器中：',
  sentBy: (host) => `由 Kept 于 ${host} 发送。`,
  about: (site) => `Kept，开源的家庭物品清单软件：${site}`,
};
