/**
 * From the currency mark printed on a receipt to an ISO code (the currency
 * rule; D136, D168, D189). The model returns what it saw (`$`, `E£`, `ج.م`, `EUR`…) and this
 * decides. Unambiguous marks map directly. A bare `$` always waits for the person, with no
 * preselection (D189). A bare `£` is GBP only when something on the receipt is British;
 * otherwise it waits between GBP and EGP, since Egyptian receipts print `£` too.
 */

import { ISO_CURRENCIES, SUPPORTED_DEFAULT } from './currencies.js';

export type CurrencyContext = {
  /** ISO 3166 alpha-2 of the vendor, when known. */
  vendorCountry?: string;
  /** The printed vendor address, phone and footer, as read. */
  addressText?: string;
  /** The location's languages (BCP 47), e.g. `['ar', 'en']`. */
  languages: readonly string[];
  /** Currencies enabled on the instance (D168); defaults to the five of D136. */
  enabled?: readonly string[];
};

export type CurrencyMatch = { code: string } | { ambiguous: string[] };

/** Latin marks, upper-cased with spaces and dots removed. */
const LATIN: Readonly<Record<string, string>> = Object.freeze({
  US$: 'USD',
  USD: 'USD',
  C$: 'CAD',
  CA$: 'CAD',
  CAD: 'CAD',
  GBP: 'GBP',
  'E£': 'EGP',
  LE: 'EGP',
  EGP: 'EGP',
  '€': 'EUR',
  EUR: 'EUR',
  CNY: 'CNY',
  RMB: 'CNY',
  'CN¥': 'CNY',
  'RMB¥': 'CNY',
});

/** Chinese marks, with spaces and punctuation folded. `元`/`块` only with a Chinese hint. */
const CHINESE: Readonly<Record<string, string>> = Object.freeze({
  人民币: 'CNY',
  中国人民银行: 'CNY',
});

/** Arabic marks, with spaces, dots and alef variants folded. */
const ARABIC: Readonly<Record<string, string>> = Object.freeze({
  جم: 'EGP',
  جنيه: 'EGP',
  جنيهمصري: 'EGP',
  جنيهات: 'EGP',
  جنيهاسترليني: 'GBP',
  دولارامريكي: 'USD',
  دولاركندي: 'CAD',
  يورو: 'EUR',
});

const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

function britishHint(ctx: CurrencyContext): boolean {
  const country = ctx.vendorCountry?.toUpperCase();
  if (country === 'GB' || country === 'UK') return true;
  if (ctx.languages.some((l) => /^en-GB$/i.test(l))) return true;
  const text = ctx.addressText ?? '';
  return (
    UK_POSTCODE.test(text) ||
    /\+\s?44\b/.test(text) ||
    /\bVAT\s*Reg/i.test(text) ||
    /\bLtd\b/i.test(text)
  );
}

/** The vendor or text reads as Chinese Mainland (for ¥ → CNY). */
function chineseHint(ctx: CurrencyContext): boolean {
  if (ctx.languages.some((l) => /^zh\b/i.test(l))) return true;
  const country = ctx.vendorCountry?.toUpperCase();
  if (country === 'CN' || country === 'CHN') return true;
  const text = ctx.addressText ?? '';
  return /人民币|中国人民银行|\bChina\b|北京|上海|广州|深圳/.test(text);
}

/** The vendor or text reads as Japanese (for ¥ → JPY). */
function japaneseHint(ctx: CurrencyContext): boolean {
  if (ctx.languages.some((l) => /^ja\b/i.test(l))) return true;
  const country = ctx.vendorCountry?.toUpperCase();
  if (country === 'JP' || country === 'JPN') return true;
  const text = ctx.addressText ?? '';
  return /日本|東京|大阪|Tokyo|Osaka/.test(text);
}

/**
 * The code for a printed mark, the choices to offer when it is ambiguous, or null when the
 * mark means nothing here (the inbox then asks with no suggestion).
 */
export function mapCurrencyMark(seen: string, ctx: CurrencyContext): CurrencyMatch | null {
  const latin = seen.toUpperCase().replace(/[\s.]/g, '');
  if (!latin) return null;
  if (latin === '$') return { ambiguous: ['USD', 'CAD'] };
  if (latin === '£') return britishHint(ctx) ? { code: 'GBP' } : { ambiguous: ['GBP', 'EGP'] };
  // ¥ / ￥: Chinese yuan or Japanese yen. A Chinese hint picks CNY; a Japanese hint picks JPY
  // (or nothing when that one is off); otherwise whichever of the two is enabled.
  if (latin === '¥' || latin === '￥') {
    const enabled: readonly string[] = ctx.enabled ?? SUPPORTED_DEFAULT;
    if (chineseHint(ctx)) return enabled.includes('CNY') ? { code: 'CNY' } : null;
    if (japaneseHint(ctx)) return enabled.includes('JPY') ? { code: 'JPY' } : null;
    const cny = enabled.includes('CNY');
    const jpy = enabled.includes('JPY');
    if (cny && jpy) return { ambiguous: ['CNY', 'JPY'] };
    if (cny) return { code: 'CNY' };
    if (jpy) return { code: 'JPY' };
    return null;
  }
  const fromLatin = LATIN[latin];
  if (fromLatin) return { code: fromLatin };

  const arabic = latin.replace(/[أإآ]/g, 'ا');
  if (arabic === 'دولار') return { ambiguous: ['USD', 'CAD'] };
  const fromArabic = ARABIC[arabic];
  if (fromArabic) return { code: fromArabic };

  // Chinese words are matched on the original (not upper-cased Latin fold).
  const chinese = seen.replace(/\s+/g, '');
  const fromChinese = CHINESE[chinese];
  if (fromChinese && (ctx.enabled ?? SUPPORTED_DEFAULT).includes(fromChinese))
    return { code: fromChinese };
  if (chineseHint(ctx) && (chinese === '元' || chinese === '块')) return { code: 'CNY' };

  if (/^[A-Z]{3}$/.test(latin)) {
    const enabled: readonly string[] = ctx.enabled ?? SUPPORTED_DEFAULT;
    const known = ISO_CURRENCIES.some((c) => c.code === latin);
    if (known && enabled.includes(latin)) return { code: latin };
  }
  return null;
}
