import { tools } from './tools.js'
// Authoritative external references shown on tool, category and static pages (and in the prerendered HTML).
// Only stable, well-known standards bodies / documentation sites are used. Tool-specific entries win over category defaults.
const MDN='https://developer.mozilla.org/en-US/docs/'
const WP='https://en.wikipedia.org/wiki/'
const W3C_WCAG='https://www.w3.org/WAI/standards-guidelines/wcag/'

const byCategory={
  money:[{label:'Bureau of Labor Insurance (Taiwan)',url:'https://www.bli.gov.tw/en/'},{label:'National Health Insurance Administration (Taiwan)',url:'https://www.nhi.gov.tw/en/'}],
  general:[{label:'Percentage — Wikipedia',url:WP+'Percentage'},{label:'Unit of measurement — Wikipedia',url:WP+'Unit_of_measurement'}],
  image:[{label:'Image file formats — MDN',url:MDN+'Web/Media/Formats/Image_types'},{label:'Using files from web applications — MDN',url:MDN+'Web/API/File_API/Using_files_from_web_applications'}],
  document:[{label:'PDF — Wikipedia',url:WP+'PDF'},{label:'ISO 32000 (PDF) — ISO',url:'https://www.iso.org/standard/75839.html'}],
  ai:[{label:'Optical character recognition — Wikipedia',url:WP+'Optical_character_recognition'}],
  developer:[{label:'JavaScript reference — MDN',url:MDN+'Web/JavaScript'},{label:'IETF RFC index',url:'https://www.rfc-editor.org/'}],
  text:[{label:'Reading time — Wikipedia',url:WP+'Words_per_minute'},{label:'Unicode Consortium',url:'https://home.unicode.org/'}],
  security:[{label:'NIST digital identity guidelines (SP 800-63B)',url:'https://pages.nist.gov/800-63-3/sp800-63b.html'},{label:'OWASP Authentication Cheat Sheet',url:'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'}],
  renovation:[{label:'EPA lead-safe renovation (RRP) — USA',url:'https://www.epa.gov/lead/renovation-repair-and-painting-program'},{label:'建築物室內裝修管理辦法 — 全國法規資料庫 (Taiwan)',url:'https://law.moj.gov.tw/'}],
  design:[{label:'WCAG 2.2 — W3C',url:W3C_WCAG},{label:'CSS reference — MDN',url:MDN+'Web/CSS'}],
}

const byTool={
  'qr-generator':[{label:'QR code — Wikipedia',url:WP+'QR_code'},{label:'ISO/IEC 18004 (QR Code) — ISO',url:'https://www.iso.org/standard/62021.html'}],
  'qr-scanner':[{label:'QR code — Wikipedia',url:WP+'QR_code'}],
  'barcode-generator':[{label:'Barcode — Wikipedia',url:WP+'Barcode'}],
  'dpi-calculator':[{label:'Dots per inch — Wikipedia',url:WP+'Dots_per_inch'}],
  'image-resize':[{label:'Image scaling — Wikipedia',url:WP+'Image_scaling'}],
  'image-compress':[{label:'Image compression — Wikipedia',url:WP+'Image_compression'}],
  'png-to-jpg':[{label:'JPEG — Wikipedia',url:WP+'JPEG'},{label:'PNG — Wikipedia',url:WP+'PNG'}],
  'jpg-to-png':[{label:'JPEG — Wikipedia',url:WP+'JPEG'},{label:'PNG — Wikipedia',url:WP+'PNG'}],
  'exif-viewer':[{label:'Exif — Wikipedia',url:WP+'Exif'}],
  'pdf-merge':[{label:'PDF — Wikipedia',url:WP+'PDF'}],
  'pdf-split':[{label:'PDF — Wikipedia',url:WP+'PDF'}],
  'ocr':[{label:'Optical character recognition — Wikipedia',url:WP+'Optical_character_recognition'}],
  'json-formatter':[{label:'Working with JSON — MDN',url:MDN+'Web/JavaScript/Reference/Global_Objects/JSON'},{label:'ECMA-404 JSON standard',url:'https://ecma-international.org/publications-and-standards/standards/ecma-404/'}],
  'base64':[{label:'Base64 — MDN glossary',url:MDN+'Glossary/Base64'}],
  'url-encoder':[{label:'encodeURIComponent — MDN',url:MDN+'Web/JavaScript/Reference/Global_Objects/encodeURIComponent'}],
  'jwt-decoder':[{label:'RFC 7519 — JSON Web Token',url:'https://datatracker.ietf.org/doc/html/rfc7519'}],
  'uuid-generator':[{label:'RFC 9562 — UUIDs',url:'https://datatracker.ietf.org/doc/html/rfc9562'}],
  'hash-generator':[{label:'Cryptographic hash function — Wikipedia',url:WP+'Cryptographic_hash_function'}],
  'regex-tester':[{label:'Regular expressions — MDN',url:MDN+'Web/JavaScript/Guide/Regular_expressions'}],
  'timestamp-converter':[{label:'Unix time — Wikipedia',url:WP+'Unix_time'}],
  'csv-converter':[{label:'RFC 4180 — CSV',url:'https://datatracker.ietf.org/doc/html/rfc4180'}],
  'yaml-json-converter':[{label:'YAML specification',url:'https://yaml.org/spec/'}],
  'sql-formatter':[{label:'SQL — Wikipedia',url:WP+'SQL'}],
  'cron-generator':[{label:'Cron — Wikipedia',url:WP+'Cron'}],
  'table-converter':[{label:'Markdown table syntax — CommonMark',url:'https://commonmark.org/'}],
  'json-to-types':[{label:'TypeScript handbook',url:'https://www.typescriptlang.org/docs/'}],
  'color-converter':[{label:'Contrast (Minimum) — WCAG 2.2',url:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'}],
  'aspect-ratio-calculator':[{label:'Aspect ratio — Wikipedia',url:WP+'Aspect_ratio_(image)'}],
  'favicon-generator':[{label:'Favicon — MDN',url:MDN+'Glossary/Favicon'}],
  'gradient-generator':[{label:'CSS gradients — MDN',url:MDN+'Web/CSS/CSS_images/Using_CSS_gradients'}],
  'box-shadow-generator':[{label:'box-shadow — MDN',url:MDN+'Web/CSS/box-shadow'}],
  'password-generator':[{label:'NIST SP 800-63B',url:'https://pages.nist.gov/800-63-3/sp800-63b.html'}],
  'password-strength-checker':[{label:'OWASP Authentication Cheat Sheet',url:'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'}],
  'word-counter':[{label:'Words per minute — Wikipedia',url:WP+'Words_per_minute'}],
  'typing-test':[{label:'Words per minute — Wikipedia',url:WP+'Words_per_minute'}],
  'ping-converter':[{label:'坪 (unit of area) — Wikipedia',url:WP+'Ping_(unit)'},{label:'Square foot — Wikipedia',url:WP+'Square_foot'}],
  'renovation-budget':[{label:'PRO360 renovation budget guide (Taiwan)',url:'https://www.pro360.com.tw/price/home_renovation_budget'},{label:'EPA lead-safe renovation (RRP) — USA',url:'https://www.epa.gov/lead/renovation-repair-and-painting-program'}],
  'concrete-calculator':[{label:'Concrete — Wikipedia',url:WP+'Concrete'},{label:'Cubic yard — Wikipedia',url:WP+'Cubic_yard'}],
  'drywall-calculator':[{label:'Drywall — Wikipedia',url:WP+'Drywall'}],
  'paint-calculator':[{label:'Paint — Wikipedia',url:WP+'Paint'}],
  'flooring-calculator':[{label:'Tile — Wikipedia',url:WP+'Tile'}],
  'unit-converter':[{label:'International System of Units — BIPM',url:'https://www.bipm.org/en/measurement-units'}],
  'date-calculator':[{label:'ISO 8601 date format — ISO',url:'https://www.iso.org/iso-8601-date-and-time-format.html'}],
  'world-clock':[{label:'IANA time zone database',url:'https://www.iana.org/time-zones'}],
  'timer':[{label:'Timer — Wikipedia',url:WP+'Timer'}],
  'pomodoro-timer':[{label:'Pomodoro Technique — Wikipedia',url:WP+'Pomodoro_Technique'}],
  'percentage':[{label:'Percentage — Wikipedia',url:WP+'Percentage'}],
  'loan-payment':[{label:'Amortization calculator — Wikipedia',url:WP+'Amortization_calculator'}],
  'annual-salary':[{label:'Ministry of Labor (Taiwan)',url:'https://english.mol.gov.tw/'}],
  'random-picker':[{label:'Randomness — Wikipedia',url:WP+'Randomness'}],
  'love-calculator':[{label:'Love — Wikipedia',url:WP+'Love'}],
  'zodiac-matcher':[{label:'Western astrological signs — Wikipedia',url:WP+'Astrological_sign'}],
  'screenshot-beautifier':[{label:'HTML canvas — MDN',url:MDN+'Web/API/Canvas_API'}],
  'image-watermark':[{label:'Digital watermarking — Wikipedia',url:WP+'Digital_watermarking'}],
  'image-flip':[{label:'Canvas API — MDN',url:MDN+'Web/API/Canvas_API'}],
  'image-to-sketch':[{label:'Canvas API — MDN',url:MDN+'Web/API/Canvas_API'}],
  'taiwan-id-photo':[{label:'Bureau of Consular Affairs (Taiwan) — passport photo rules',url:'https://www.boca.gov.tw/'}],
}

const byStatic={
  '/about':[{label:'AnyTool on GitHub',url:'https://github.com/KanwarAfaq/anytool-online'}],
  '/contact':[{label:'Report an issue on GitHub',url:'https://github.com/KanwarAfaq/anytool-online/issues'}],
  '/privacy':[{label:'Privacy policy — Wikipedia',url:WP+'Privacy_policy'}],
  '/terms':[{label:'Terms of service — Wikipedia',url:WP+'Terms_of_service'}],
  '/accessibility':[{label:'WCAG overview — W3C',url:W3C_WCAG}],
  '/methodology':[{label:'Ministry of Labor (Taiwan)',url:'https://english.mol.gov.tw/'},{label:'Bureau of Labor Insurance (Taiwan)',url:'https://www.bli.gov.tw/en/'}],
  '/sources':[{label:'Bureau of Labor Insurance (Taiwan)',url:'https://www.bli.gov.tw/en/'},{label:'National Health Insurance Administration (Taiwan)',url:'https://www.nhi.gov.tw/en/'}],
  '/tools':[{label:'MDN Web Docs',url:'https://developer.mozilla.org/'}],
  '/':[{label:'MDN Web Docs',url:'https://developer.mozilla.org/'},{label:'W3C accessibility standards',url:W3C_WCAG}],
}

/** External references for a tool (tool-specific first, then category defaults), max `limit`. */
export function toolRefs(tool,limit=3){
  const seen=new Set();const out=[]
  for(const r of [...(byTool[tool.slug]||[]),...(byCategory[tool.category]||[])]){if(!seen.has(r.url)){seen.add(r.url);out.push(r)}}
  return out.slice(0,limit)
}
export const categoryRefs=id=>(byCategory[id]||[]).slice(0,2)
export const staticRefs=path=>byStatic[path]||byStatic['/tools']

/** References for any clean (locale-stripped) route: tool page, category page, or static page. */
export function refsForPath(cleanPath){
  const tool=cleanPath.match(/^\/tools\/([^/]+)$/)?.[1]
  if(tool){const t=tools.find(x=>x.slug===tool);if(t)return toolRefs(t)}
  const cat=cleanPath.match(/^\/categories\/([^/]+)$/)?.[1]
  if(cat)return categoryRefs(cat)
  return staticRefs(cleanPath)
}
