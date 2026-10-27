import { useI18n } from '../i18n'

// Original explanatory diagrams (inline SVG, theme-aware) shown under a tool.
// They use only numbers/symbols inside the drawing; all prose lives in the translated `copy` below.
const S = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const A = { stroke: 'var(--accent)', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' }
const T = { fill: 'var(--ink-2)', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }
const soft = 'var(--accent-soft)'
const Dim = ({ x1, y1, x2, y2 }) => {
 const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux
 const head = (x, y, d) => `M${x} ${y}l${(d * ux * 6 + nx * 3).toFixed(2)} ${(d * uy * 6 + ny * 3).toFixed(2)}M${x} ${y}l${(d * ux * 6 - nx * 3).toFixed(2)} ${(d * uy * 6 - ny * 3).toFixed(2)}`
 return <g {...A}><path d={`M${x1} ${y1}L${x2} ${y2}`} /><path d={head(x1, y1, 1)} /><path d={head(x2, y2, -1)} /></g>
}
const Svg = ({ children, label }) => <svg viewBox="0 0 320 200" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-md">{children}</svg>

const figures = {
 paint: label => <Svg label={label}>
  <rect x="30" y="28" width="190" height="110" rx="3" fill={soft} {...S} />
  <rect x="48" y="60" width="34" height="78" {...S} strokeDasharray="4 3" /><path d="M52 134L78 64M52 112L78 88M52 90L66 68" stroke="var(--muted)" strokeWidth="1" />
  <rect x="120" y="58" width="56" height="40" {...S} strokeDasharray="4 3" /><path d="M126 94L170 62M126 78L150 62M146 94L170 76" stroke="var(--muted)" strokeWidth="1" />
  <Dim x1={30} y1={160} x2={220} y2={160} /><text x="118" y="178" {...T}>L</text>
  <Dim x1={242} y1={28} x2={242} y2={138} /><text x="250" y="88" {...T}>H</text>
  <rect x="266" y="150" width="40" height="30" fill={soft} {...S} /><text x="278" y="170" {...T} fontSize="10">L×W</text>
 </Svg>,
 flooring: label => <Svg label={label}>
  <rect x="30" y="24" width="180" height="120" fill={soft} {...S} />
  {[...Array(5)].map((_, i) => <path key={'v' + i} d={`M${30 + (i + 1) * 30} 24V144`} stroke="var(--line-strong)" strokeWidth="1" />)}
  {[...Array(3)].map((_, i) => <path key={'h' + i} d={`M30 ${24 + (i + 1) * 30}H210`} stroke="var(--line-strong)" strokeWidth="1" />)}
  <rect x="180" y="24" width="30" height="120" fill="var(--accent)" opacity=".18" /><rect x="30" y="114" width="180" height="30" fill="var(--accent)" opacity=".18" />
  <Dim x1={30} y1={164} x2={210} y2={164} /><text x="116" y="182" {...T}>L</text>
  <Dim x1={228} y1={24} x2={228} y2={144} /><text x="236" y="88" {...T}>W</text>
  <g transform="translate(262 34)"><rect width="44" height="44" {...S} /><path d="M0 0L44 44" stroke="var(--accent)" strokeWidth="2" /><text x="4" y="62" {...T} fontSize="10">+10%</text></g>
 </Svg>,
 drywall: label => <Svg label={label}>
  <rect x="30" y="20" width="150" height="150" fill="none" {...S} />
  {[0, 1, 2, 3].map(i => <path key={i} d={`M${30 + i * 50} 20V170`} stroke="var(--muted)" strokeWidth="2" />)}
  <rect x="30" y="20" width="100" height="150" fill={soft} fillOpacity=".85" {...S} />
  {[0, 1, 2, 3, 4, 5, 6].map(i => <g key={i}><circle cx="80" cy={32 + i * 22} r="2" fill="var(--accent)" /><circle cx="30" cy={32 + i * 22} r="2" fill="var(--accent)" /><circle cx="130" cy={32 + i * 22} r="2" fill="var(--accent)" /></g>)}
  <Dim x1={30} y1={188} x2={130} y2={188} /><text x="66" y="199" {...T} fontSize="10">1.22 m</text>
  <Dim x1={196} y1={20} x2={196} y2={170} /><text x="204" y="98" {...T} fontSize="10">2.44 m</text>
  <text x="228" y="40" {...T} fontSize="10">4 × 8 ft</text><text x="228" y="58" {...T} fontSize="10">3 × 6 尺</text>
 </Svg>,
 concrete: label => <Svg label={label}>
  <path d="M40 110L110 80H260L190 110Z" fill={soft} {...S} />
  <path d="M40 110V138H190V110M190 138L260 108V80" fill="none" {...S} /><path d="M190 110L260 80" {...S} />
  <Dim x1={40} y1={158} x2={190} y2={158} /><text x="108" y="176" {...T}>L</text>
  <Dim x1={200} y1={158} x2={270} y2={128} /><text x="248" y="156" {...T}>W</text>
  <Dim x1={204} y1={112} x2={204} y2={138} /><text x="214" y="129" {...T}>T</text>
  <text x="70" y="40" {...T} fontSize="14">L × W × T = m³</text>
 </Svg>,
 ping: label => <Svg label={label}>
  <rect x="40" y="26" width="120" height="120" fill={soft} {...S} />
  <path d="M40 66H160M40 106H160M80 26V146M120 26V146" stroke="var(--line-strong)" strokeWidth="1" />
  <text x="82" y="92" {...T} fontSize="20">坪</text>
  <Dim x1={40} y1={166} x2={160} y2={166} /><text x="76" y="184" {...T}>≈ 1.82 m</text>
  <text x="190" y="64" {...T} fontSize="14">1 坪</text><text x="190" y="88" {...T} fontSize="14">≈ 3.31 m²</text><text x="190" y="112" {...T} fontSize="14">≈ 35.6 ft²</text>
 </Svg>,
 budget: label => <Svg label={label}>
  {[['8', 'var(--accent)'], ['30', '#f59e0b'], ['10', '#38bdf8'], ['20', '#a78bfa'], ['15', '#fb7185'], ['17', 'var(--line-strong)']].reduce((acc, [w, c], i) => { const width = Number(w) * 2.4; acc.nodes.push(<rect key={i} x={30 + acc.x} y="56" width={width} height="44" fill={c} opacity=".85" />); acc.x += width; return acc }, { x: 0, nodes: [] }).nodes}
  <rect x="30" y="56" width="240" height="44" {...S} />
  <Dim x1={30} y1={124} x2={270} y2={124} /><text x="118" y="146" {...T}>100% = NT$ / 坪 × 坪</text>
  <text x="30" y="40" {...T}>+10–20%</text><path d="M80 44L86 54" {...A} />
 </Svg>,
 idphoto: label => <Svg label={label}>
  <rect x="100" y="14" width="105" height="135" fill={soft} {...S} />
  <ellipse cx="152" cy="62" rx="24" ry="30" {...S} /><path d="M104 149C108 112 128 100 152 100C176 100 198 112 201 149" {...S} />
  <path d="M152 14V149M100 82H205" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
  <Dim x1={100} y1={168} x2={205} y2={168} /><text x="132" y="186" {...T}>35 mm</text>
  <Dim x1={228} y1={14} x2={228} y2={149} /><text x="236" y="86" {...T}>45 mm</text>
 </Svg>,
 aspect: label => <Svg label={label}>
  <rect x="24" y="30" width="144" height="81" fill={soft} {...S} /><text x="72" y="76" {...T} fontSize="16">16:9</text>
  <rect x="190" y="30" width="108" height="81" {...S} fill={soft} /><text x="226" y="76" {...T} fontSize="16">4:3</text>
  <rect x="24" y="126" width="64" height="64" {...S} fill={soft} /><text x="42" y="164" {...T} fontSize="16">1:1</text>
  <rect x="190" y="126" width="48" height="64" {...S} fill={soft} /><text x="196" y="164" {...T} fontSize="14">3:4</text>
  <rect x="104" y="126" width="64" height="36" {...S} fill={soft} /><text x="118" y="149" {...T} fontSize="12">16:9</text>
 </Svg>,
 dpi: label => <Svg label={label}>
  <rect x="40" y="26" width="240" height="120" fill={soft} {...S} />
  {[...Array(12)].map((_, i) => <path key={i} d={`M${40 + i * 20} 26V${i % 5 === 0 ? 38 : 32}`} stroke="var(--accent)" strokeWidth="1.4" />)}
  <Dim x1={40} y1={166} x2={280} y2={166} /><text x="72" y="186" {...T}>3000 px ÷ 10 in = 300 DPI</text>
  <text x="64" y="94" {...T} fontSize="16">px ÷ in</text>
 </Svg>,
}

const L = (en, zh, ar, ur) => ({ en, 'zh-TW': zh, ar, ur })
const copy = {
 paint: { fig: 'paint', title: L('How to measure a room for paint', '如何丈量房間以計算油漆', 'كيف تقيس الغرفة لحساب الدهان', 'پینٹ کے لیے کمرہ کیسے ناپیں'), alt: L('Wall elevation with length L, height H and door and window openings marked', '牆面立面圖，標示長度 L、高度 H 與門窗開口', 'مخطط جدار يوضح الطول L والارتفاع H وفتحات الأبواب والنوافذ', 'دیوار کا خاکہ جس میں لمبائی L، اونچائی H اور دروازے کھڑکیاں دکھائی گئی ہیں'),
  steps: [L('Measure each wall’s length (L) and the ceiling height (H) with a tape measure; add all wall lengths together.', '用捲尺量每面牆的長度（L）與天花板高度（H），再把所有牆長相加。', 'قِس طول كل جدار (L) وارتفاع السقف (H) بشريط القياس ثم اجمع أطوال الجدران.', 'ٹیپ سے ہر دیوار کی لمبائی (L) اور چھت کی اونچائی (H) ناپیں اور تمام لمبائیاں جمع کریں۔'),
   L('Count doors and windows — their area is subtracted because they are not painted.', '計算門與窗的數量——這些面積不需粉刷，會被扣除。', 'احسب عدد الأبواب والنوافذ — تُخصم مساحتها لأنها لا تُدهن.', 'دروازے اور کھڑکیاں گنیں — ان کا رقبہ منفی ہوتا ہے کیونکہ یہ پینٹ نہیں ہوتے۔'),
   L('Multiply by the number of coats and divide by the coverage printed on the paint can.', '乘以塗刷層數，再除以油漆罐上標示的覆蓋率。', 'اضرب في عدد الطبقات واقسم على التغطية المطبوعة على علبة الدهان.', 'کوٹس کی تعداد سے ضرب دیں اور پینٹ کے ڈبے پر لکھی کوریج سے تقسیم کریں۔')] },
 flooring: { fig: 'flooring', title: L('What tiles mean: measure, size and waste', '磁磚怎麼算：丈量、尺寸與損耗', 'معنى البلاط: القياس والمقاس والهدر', 'ٹائلوں کا حساب: ناپ، سائز اور ضیاع'), alt: L('Room plan covered with a tile grid; edge tiles are cut and become waste', '房間平面圖鋪滿磁磚格線，邊緣磁磚需裁切而產生損耗', 'مخطط غرفة مغطى بشبكة بلاط وتُقص بلاطات الحواف فتصبح هدراً', 'کمرے کا نقشہ ٹائل گرڈ کے ساتھ؛ کنارے کی ٹائلیں کٹ کر ضیاع بنتی ہیں'),
  steps: [L('Measure the room’s length (L) and width (W) at the widest points; area = L × W.', '量房間最寬處的長（L）與寬（W），面積 = L × W。', 'قِس طول (L) وعرض (W) الغرفة عند أوسع نقطة؛ المساحة = L × W.', 'کمرے کی سب سے چوڑی جگہ پر لمبائی (L) اور چوڑائی (W) ناپیں؛ رقبہ = L × W۔'),
   L('Read the tile size on the box. A 60 × 60 cm tile covers 0.36 m²; planks and boxes list their coverage instead.', '看包裝上的磚尺寸：60 × 60 公分的磁磚每片 0.36 m²；木地板與盒裝則標示每盒覆蓋面積。', 'اقرأ مقاس البلاطة على العلبة. بلاطة 60 × 60 سم تغطي 0.36 م²؛ أما الألواح فتُذكر تغطية العلبة.', 'ڈبے پر ٹائل کا سائز دیکھیں۔ 60 × 60 سینٹی میٹر کی ٹائل 0.36 م² ڈھانپتی ہے؛ تختوں پر فی ڈبہ کوریج لکھی ہوتی ہے۔'),
   L('Edge tiles must be cut. Add about 10% for waste (15% for diagonal layouts), then round up to whole boxes.', '邊緣磁磚需要裁切，請加約 10% 損耗（斜鋪 15%），再進位到整盒。', 'تُقص بلاطات الحواف. أضف نحو 10% للهدر (15% للتركيب القطري) ثم قرّب إلى علب كاملة.', 'کنارے کی ٹائلیں کاٹنی پڑتی ہیں۔ تقریباً 10% ضیاع شامل کریں (ترچھے لے آؤٹ کے لیے 15%) پھر پورے ڈبوں تک راؤنڈ اپ کریں۔')] },
 drywall: { fig: 'drywall', title: L('How a drywall sheet covers a wall', '石膏板如何覆蓋牆面', 'كيف يغطي لوح الجبس الجدار', 'ڈرائی وال شیٹ دیوار کو کیسے ڈھانپتی ہے'), alt: L('Wall frame with studs and one 4 by 8 ft sheet screwed along the studs', '牆體骨架與立柱，一張 4×8 呎石膏板沿立柱鎖螺絲', 'هيكل جدار بأعمدة ولوح جبس 4×8 قدم مثبت بالبراغي على الأعمدة', 'دیوار کا فریم اور اسٹڈز، ایک 4×8 فٹ شیٹ اسٹڈز پر پیچوں سے لگی ہوئی'),
  steps: [L('Measure the total wall length (perimeter) and the wall height.', '量出牆面總長度（周長）與牆高。', 'قِس إجمالي طول الجدران (المحيط) وارتفاعها.', 'دیواروں کی کل لمبائی (گھیر) اور اونچائی ناپیں۔')
   , L('Choose the sheet size: 4 × 8 ft (1.22 × 2.44 m) in the USA, or 3 × 6 尺 (91 × 182 cm) commonly in Taiwan.', '選擇板材規格：美國常用 4 × 8 呎（1.22 × 2.44 m），台灣常見 3 × 6 尺（91 × 182 公分）。', 'اختر مقاس اللوح: 4 × 8 قدم (1.22 × 2.44 م) في أمريكا أو 3 × 6 تشي (91 × 182 سم) شائع في تايوان.', 'شیٹ کا سائز چنیں: امریکہ میں 4 × 8 فٹ (1.22 × 2.44 م) یا تائیوان میں عام 3 × 6 چھی (91 × 182 سینٹی میٹر)۔'),
   L('Sheets are screwed into studs about every 12–16 in (30–40 cm); extra layers and waste add to the count.', '石膏板約每 30–40 公分（12–16 吋）鎖進立柱；多層與損耗都會增加數量。', 'تُثبت الألواح بالبراغي في الأعمدة كل 12–16 بوصة (30–40 سم) تقريباً؛ الطبقات الإضافية والهدر تزيد العدد.', 'شیٹیں اسٹڈز میں تقریباً ہر 12–16 انچ (30–40 سینٹی میٹر) پر پیچوں سے لگتی ہیں؛ اضافی تہیں اور ضیاع تعداد بڑھاتے ہیں۔')] },
 concrete: { fig: 'concrete', title: L('How concrete volume is measured', '混凝土體積怎麼量', 'كيف يُقاس حجم الخرسانة', 'کنکریٹ کا حجم کیسے ناپا جاتا ہے'), alt: L('Concrete slab with length L, width W and thickness T labelled', '混凝土板，標示長 L、寬 W 與厚度 T', 'بلاطة خرسانية مع تسمية الطول L والعرض W والسماكة T', 'کنکریٹ سلیب جس پر لمبائی L، چوڑائی W اور موٹائی T لکھی ہے'),
  steps: [L('Measure the length (L) and width (W) of the area you will pour.', '量出要澆置區域的長（L）與寬（W）。', 'قِس طول (L) وعرض (W) المنطقة التي ستصبّ فيها.', 'جس جگہ کنکریٹ ڈالنا ہے اس کی لمبائی (L) اور چوڑائی (W) ناپیں۔'),
   L('Decide the thickness (T). A light-duty slab is often about 4 in (10 cm); ask an engineer for structural work.', '決定厚度（T）。輕載地坪常見約 10 公分（4 吋）；結構工程請洽結構技師。', 'حدّد السماكة (T). البلاطة الخفيفة غالباً نحو 10 سم (4 بوصة)؛ واسأل مهندساً للأعمال الإنشائية.', 'موٹائی (T) طے کریں۔ ہلکے کام کا سلیب اکثر تقریباً 4 انچ (10 سینٹی میٹر) ہوتا ہے؛ ساختی کام کے لیے انجینئر سے پوچھیں۔'),
   L('Volume = L × W × T. Add about 10% for uneven ground and spillage, then order.', '體積 = L × W × T，再加約 10% 作為地面不平與溢灑的備量後訂購。', 'الحجم = L × W × T. أضف نحو 10% لعدم استواء الأرض والانسكاب ثم اطلب.', 'حجم = L × W × T۔ ناہموار زمین اور گراوٹ کے لیے تقریباً 10% شامل کر کے آرڈر کریں۔')] },
 ping: { fig: 'ping', title: L('What 1 坪 looks like', '1 坪 有多大', 'كم تبلغ مساحة 1 بينغ', '1 پنگ کتنا بڑا ہے'), alt: L('A square about 1.82 metres on each side equals one ping, about 3.31 square metres', '邊長約 1.82 公尺的正方形等於 1 坪，約 3.31 平方公尺', 'مربع طول ضلعه نحو 1.82 م يساوي بينغ واحد، أي نحو 3.31 م²', 'تقریباً 1.82 میٹر کے ضلع والا مربع ایک پنگ ہے، یعنی تقریباً 3.31 م²'),
  steps: [L('1 坪 is a square about 1.82 m on each side (6 尺 × 6 尺) — roughly two tatami mats.', '1 坪 約等於邊長 1.82 公尺的正方形（6 尺 × 6 尺），大約兩張榻榻米。', 'البينغ الواحد مربع طول ضلعه نحو 1.82 م (6 × 6 تشي)، أي نحو حصيرتي تاتامي.', '1 پنگ تقریباً 1.82 میٹر ضلع کا مربع ہے (6 × 6 چھی) — لگ بھگ دو تاتامی چٹائیاں۔'),
   L('Exactly 400/121 m² ≈ 3.3058 m² ≈ 35.58 sq ft.', '精確為 400/121 m² ≈ 3.3058 m² ≈ 35.58 平方英尺。', 'بالضبط 400/121 م² ≈ 3.3058 م² ≈ 35.58 قدم².', 'عین 400/121 م² ≈ 3.3058 م² ≈ 35.58 مربع فٹ۔'),
   L('Listings usually quote 權狀坪, which includes shared areas — usable space is smaller.', '房屋廣告多為「權狀坪」，含公共設施，實際可用面積較小。', 'تذكر الإعلانات عادةً 權狀坪 وتشمل المرافق المشتركة، فالمساحة المستخدمة أقل.', 'اشتہارات میں عموماً 權狀坪 ہوتا ہے جس میں مشترکہ حصے شامل ہیں؛ قابلِ استعمال جگہ کم ہوتی ہے۔')] },
 budget: { fig: 'budget', title: L('How to read the budget range', '如何閱讀預算範圍', 'كيف تقرأ نطاق الميزانية', 'بجٹ کی حد کیسے پڑھیں'), alt: L('A bar split into design, carpentry, plumbing and electrical, flooring, painting and other costs', '長條圖分為設計、木作、水電、地板、油漆與其他費用', 'شريط مقسّم إلى التصميم والنجارة والسباكة والكهرباء والأرضيات والدهان وأخرى', 'ایک پٹی جو ڈیزائن، بڑھئی، پلمبنگ/بجلی، فرش، پینٹ اور دیگر اخراجات میں بٹی ہے'),
  steps: [L('Choose the property age and the area (坪 in Taiwan, sq ft elsewhere).', '選擇屋齡與面積（台灣用坪，其他地區用平方英尺）。', 'اختر عمر العقار والمساحة (بينغ في تايوان وقدم² في غيرها).', 'جائیداد کی عمر اور رقبہ چنیں (تائیوان میں پنگ، دیگر جگہ مربع فٹ)۔'),
   L('Cost per unit × area gives the base range; older homes usually cost more per unit.', '單價 × 面積即為基本範圍；屋齡越高，每單位成本通常越高。', 'التكلفة للوحدة × المساحة تعطي النطاق الأساسي؛ وتكلفة المنازل الأقدم أعلى عادةً.', 'فی اکائی لاگت × رقبہ بنیادی حد دیتا ہے؛ پرانے گھروں میں فی اکائی لاگت عموماً زیادہ ہوتی ہے۔'),
   L('Add 10–20% contingency; the coloured bar shows where money typically goes.', '再加 10–20% 預備金；彩色長條顯示費用的常見分配。', 'أضف 10–20% احتياطياً؛ ويوضح الشريط الملوّن أين تذهب التكاليف عادةً.', '10–20% بفر شامل کریں؛ رنگین پٹی دکھاتی ہے کہ پیسہ عموماً کہاں خرچ ہوتا ہے۔')] },
 idphoto: { fig: 'idphoto', title: L('Passport / ID photo layout', '護照／證件照版面說明', 'تخطيط صورة الجواز / الهوية', 'پاسپورٹ / شناختی تصویر کا لے آؤٹ'), alt: L('Portrait frame 35 by 45 millimetres with the head centred', '35×45 公釐的直式相框，頭部置中', 'إطار عمودي 35×45 مم مع توسيط الرأس', '35×45 ملی میٹر کا عمودی فریم جس میں سر درمیان میں ہے'),
  steps: [L('Face the camera straight on, head and shoulders in frame, head centred.', '正面面對鏡頭，拍到頭部與肩膀，頭部置中。', 'واجه الكاميرا مباشرة مع ظهور الرأس والكتفين وتوسيط الرأس.', 'کیمرے کی طرف سیدھا دیکھیں، سر اور کندھے فریم میں اور سر درمیان میں ہو۔'),
   L('The final print size is 35 × 45 mm (413 × 531 px at 300 DPI).', '成品尺寸為 35 × 45 公釐（300 DPI 約 413 × 531 像素）。', 'المقاس النهائي للطباعة 35 × 45 مم (413 × 531 بكسل عند 300 DPI).', 'حتمی پرنٹ سائز 35 × 45 ملی میٹر ہے (300 DPI پر 413 × 531 پکسل)۔'),
   L('Use an even, plain background without shadows, then check the official rules before submitting.', '使用均勻無陰影的素色背景，送件前請再對照官方規定。', 'استخدم خلفية سادة متجانسة بلا ظلال ثم راجع القواعد الرسمية قبل التقديم.', 'سایوں کے بغیر ہموار سادہ پس منظر رکھیں اور جمع کرانے سے پہلے سرکاری قواعد دیکھ لیں۔')] },
 aspect: { fig: 'aspect', title: L('Common aspect ratios', '常見長寬比', 'نسب الأبعاد الشائعة', 'عام اسپیکٹ ریشو'), alt: L('Rectangles showing 16:9, 4:3, 1:1 and 3:4 shapes', '呈現 16:9、4:3、1:1 與 3:4 形狀的矩形', 'مستطيلات تعرض أشكال 16:9 و4:3 و1:1 و3:4', '16:9، 4:3، 1:1 اور 3:4 شکلیں دکھانے والے مستطیل'),
  steps: [L('An aspect ratio is width : height — 1920 × 1080 simplifies to 16:9.', '長寬比是 寬：高——1920 × 1080 約分後為 16:9。', 'نسبة الأبعاد هي العرض : الارتفاع — 1920 × 1080 تُبسّط إلى 16:9.', 'اسپیکٹ ریشو چوڑائی : اونچائی ہے — 1920 × 1080 سادہ ہو کر 16:9 بنتا ہے۔'),
   L('16:9 suits video, 4:3 older screens and photos, 1:1 square posts, 3:4 portrait photos.', '16:9 適合影片，4:3 適合舊式螢幕與照片，1:1 適合方形貼文，3:4 適合直式照片。', '16:9 للفيديو، 4:3 للشاشات والصور الأقدم، 1:1 للمنشورات المربعة، 3:4 للصور العمودية.', '16:9 ویڈیو، 4:3 پرانی اسکرین اور تصاویر، 1:1 مربع پوسٹس، 3:4 عمودی تصاویر کے لیے۔'),
   L('Keep the ratio when resizing so the image is not stretched.', '調整尺寸時維持比例，圖片才不會被拉伸變形。', 'حافظ على النسبة عند تغيير الحجم كي لا تتمدد الصورة.', 'سائز بدلتے وقت تناسب برقرار رکھیں تاکہ تصویر کھنچے نہیں۔')] },
 dpi: { fig: 'dpi', title: L('How DPI works', 'DPI 是什麼', 'كيف تعمل DPI', 'DPI کیسے کام کرتا ہے'), alt: L('A ruler across an image illustrating dots per inch', '尺規橫跨圖片，說明像素除以英寸即為 DPI', 'مسطرة عبر صورة توضح أن البكسل مقسوماً على البوصة يعطي DPI', 'تصویر پر رولر جو دکھاتا ہے کہ پکسل ÷ انچ = DPI'),
  steps: [L('DPI = pixels ÷ inches of printed width (3000 px over 10 in = 300 DPI).', 'DPI = 像素 ÷ 列印寬度（英寸）（3000 像素印 10 吋 = 300 DPI）。', 'DPI = البكسلات ÷ عرض الطباعة بالبوصة (3000 بكسل على 10 بوصات = 300 DPI).', 'DPI = پکسل ÷ پرنٹ چوڑائی (انچ) (10 انچ پر 3000 پکسل = 300 DPI)۔'),
   L('Around 300 DPI is typical for sharp prints; screens need far fewer.', '清晰列印通常約需 300 DPI；螢幕顯示所需遠低於此。', 'نحو 300 DPI معتاد للطباعة الحادة؛ والشاشات تحتاج أقل بكثير.', 'تیز پرنٹ کے لیے تقریباً 300 DPI عام ہے؛ اسکرین کو اس سے بہت کم چاہیے۔'),
   L('Lower DPI at the same print size looks blurry; resize or use a larger original.', '相同列印尺寸下 DPI 偏低會模糊；請縮小尺寸或改用更大的原圖。', 'انخفاض DPI بنفس حجم الطباعة يبدو ضبابياً؛ غيّر الحجم أو استخدم أصلاً أكبر.', 'اسی پرنٹ سائز پر کم DPI دھندلا لگتا ہے؛ سائز بدلیں یا بڑی اصل تصویر استعمال کریں۔')] },
}
const bySlug = { 'paint-calculator': 'paint', 'flooring-calculator': 'flooring', 'drywall-calculator': 'drywall', 'concrete-calculator': 'concrete', 'ping-converter': 'ping', 'renovation-budget': 'budget', 'taiwan-id-photo': 'idphoto', 'aspect-ratio-calculator': 'aspect', 'dpi-calculator': 'dpi' }
const heading = L('Visual guide', '圖解說明', 'دليل مرئي', 'تصویری رہنمائی')
export const hasIllustration = slug => Boolean(bySlug[slug])

export default function ToolIllustration({ slug }) {
 const { lang } = useI18n()
 const key = bySlug[slug]
 if (!key) return null
 const c = copy[key], pick = o => o[lang] || o.en
 return <section className="tool-visual-guide mt-6" aria-labelledby="visual-guide-title">
  <h2 id="visual-guide-title" className="mb-3 text-2xl font-black">{pick(c.title)}</h2>
  <div className="tool-visual-card">
   <figure className="m-0">{figures[c.fig](pick(c.alt))}<figcaption className="sr-only">{pick(c.alt)}</figcaption></figure>
   <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{pick(heading)}</p><ol className="tool-visual-steps">{c.steps.map((s, i) => <li key={i}>{pick(s)}</li>)}</ol></div>
  </div>
 </section>
}
