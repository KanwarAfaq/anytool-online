// Search-result titles for tool pages that already rank (Google Search Console, Oct 2026).
// Written around the real queries people use. Falls back to "<tool name> | AnyTool.online".
const S = ' | AnyTool.online'
const titles = {
  'minimum-wage': { en: 'Taiwan Minimum Wage 2026: NT$29,500/mo' + S, 'zh-TW': '2026 台灣最低工資：月薪 29,500、時薪 196 比較' + S },
  'dpi-calculator': { en: 'DPI Calculator: Pixels to Print Size' + S, 'zh-TW': 'DPI 計算器：像素與列印尺寸換算' + S },
  'labor-insurance': { en: 'Taiwan Labor Insurance Calculator 2026 (勞保費)' + S, 'zh-TW': '勞保費計算（台灣勞保）2026：勞保與就業保險試算' + S },
  'taiwan-elder-care': { en: 'Taiwan Elder Care Subsidy 2026 + Bed Finder' + S, 'zh-TW': '台灣老人照護補助與床位查詢 2026（最高 18 萬）' + S },
  'url-encoder': { en: 'URL Encoder / Decoder Online' + S, 'zh-TW': 'URL 編碼／解碼器（線上 encodeURIComponent）' + S },
  'employer-cost': { en: 'Taiwan Employer Cost 2026 Calculator' + S, 'zh-TW': '2026 台灣雇主總成本：薪資加勞健保與 6% 勞退' + S },
  'overtime-pay': { en: 'Taiwan Overtime Pay Calculator 2026 (加班費)' + S, 'zh-TW': '台灣加班費 2026：平日與休息日加班費計算' + S },
}
export const seoTitleOverride = (slug, lang) => titles[slug]?.[lang] || null
