import { createContext, useContext, useMemo, useState } from 'react'
import { Copy, PaintRoller, Ruler, Layers, Box, Square, Hammer } from 'lucide-react'
import { useI18n } from '../../i18n'
import { makeTr } from '../../data/renovationI18n'

const TrCtx = createContext(makeTr('en'))
const useTr = () => useContext(TrCtx)

// Renovation calculators. All maths runs locally in the browser; results are planning estimates.
const SQM_PER_PING = 400 / 121 // 1 坪 = 400/121 m² (≈ 3.3058)
const SQFT_PER_SQM = 10.7639104167
const L_PER_GAL = 3.785411784
const num = v => { const n = parseFloat(v); return Number.isFinite(n) && n >= 0 ? n : 0 }
const fmt = (v, d = 2) => Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: d }) : '–'
const copyText = async text => { try { await navigator.clipboard.writeText(String(text ?? '')) } catch { /* clipboard unavailable */ } }

const Field = ({ label, hint, children }) => { const tr = useTr(); return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-400">{tr(label)}</span>{children}{hint && <span className="mt-1 block text-xs text-slate-500">{tr(hint)}</span>}</label> }
const NumInput = ({ label, value, onChange, hint, step = 'any' }) => { const tr = useTr(); return <Field label={tr(label)} hint={hint}><input className="input" type="number" inputMode="decimal" min="0" step={step} value={value} onChange={e => onChange(e.target.value)} /></Field> }
const Seg = ({ value, onChange, options, label }) => { const tr = useTr(); return <div role="group" aria-label={tr(label)} className="segmented-control">{options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} className={value === v ? 'active' : ''} onClick={() => onChange(v)}>{tr(l)}</button>)}</div> }
const Stat = ({ label, value, sub, big }) => { const tr = useTr(); return <div className="result-tile"><div className="text-xs text-slate-500">{tr(label)}</div><div className={'mt-1 break-words font-black ' + (big ? 'text-3xl' : 'text-lg')}>{value}</div>{sub && <div className="mt-1 text-xs text-slate-500">{tr(sub)}</div>}</div> }
const Note = ({ children }) => { const tr = useTr(); return <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">{typeof children === 'string' ? tr(children) : children}</p> }
const CopyBtn = ({ text }) => { const tr = useTr(); return <button type="button" className="btn-ghost" onClick={() => copyText(text)}><Copy size={15} /> {tr('Copy summary')}</button> }
const Layout = ({ icon: Icon, controls, results }) => { const tr = useTr(); return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300"><Icon size={14} aria-hidden="true" /> {tr('Renovation planner')}</div>{controls}</section><section className="tool-result-panel space-y-3" aria-live="polite">{results}</section></div> }

// ---------------------------------------------------------------- Paint
function PaintCalculator() {
  const tr = useTr()
  const [unit, setUnit] = useState('metric')
  const metric = unit === 'metric'
  const [len, setLen] = useState('4'), [wid, setWid] = useState('3.5'), [hgt, setHgt] = useState('2.7')
  const [doors, setDoors] = useState('1'), [windows, setWindows] = useState('2')
  const [coats, setCoats] = useState('2'), [ceiling, setCeiling] = useState(false), [waste, setWaste] = useState('10')
  const [cover, setCover] = useState('9'), [pail, setPail] = useState('5')
  const switchUnit = u => {
    if (u === unit) return
    const k = u === 'imperial' ? 3.28084 : 1 / 3.28084
    setLen(fmt(num(len) * k, 1).replace(/,/g, '')); setWid(fmt(num(wid) * k, 1).replace(/,/g, '')); setHgt(fmt(num(hgt) * k, 1).replace(/,/g, ''))
    setCover(u === 'imperial' ? '350' : '9'); setPail(u === 'imperial' ? '1' : '5'); setUnit(u)
  }
  const r = useMemo(() => {
    const L = num(len), W = num(wid), H = num(hgt)
    const doorA = metric ? 1.9 : 20, winA = metric ? 1.4 : 15 // typical opening sizes (m² / ft²)
    const walls = 2 * (L + W) * H, ceil = ceiling ? L * W : 0
    const openings = num(doors) * doorA + num(windows) * winA
    const net = Math.max(0, walls - openings) + ceil
    const coated = net * Math.max(1, num(coats))
    const need = num(cover) > 0 ? coated / num(cover) * (1 + num(waste) / 100) : 0
    const pails = num(pail) > 0 ? Math.ceil(need / num(pail) - 1e-9) : 0
    return { walls, ceil, openings, net, need, pails, litres: metric ? need : need * L_PER_GAL, gallons: metric ? need / L_PER_GAL : need }
  }, [len, wid, hgt, doors, windows, coats, ceiling, waste, cover, pail, metric])
  const au = metric ? 'm²' : tr('sq ft'), vu = metric ? 'L' : 'gal'
  const summary = tr('Paint needed: {l} L ({g} gal) for {a} {au} × {c} coat(s); buy {n} × {size} {v} container(s).', { l: fmt(r.litres), g: fmt(r.gallons), a: fmt(r.net), au, c: coats, n: r.pails, size: pail, v: vu })
  return <Layout icon={PaintRoller} controls={<>
    <Seg label="Units" value={unit} onChange={switchUnit} options={[['metric', 'Metric (m, L)'], ['imperial', 'US (ft, gal)']]} />
    <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Length ({u})', { u: metric ? 'm' : 'ft' })} value={len} onChange={setLen} /><NumInput label={tr('Width ({u})', { u: metric ? 'm' : 'ft' })} value={wid} onChange={setWid} /><NumInput label={tr('Height ({u})', { u: metric ? 'm' : 'ft' })} value={hgt} onChange={setHgt} /></div>
    <div className="grid grid-cols-3 gap-3"><NumInput label="Doors" value={doors} onChange={setDoors} step="1" /><NumInput label="Windows" value={windows} onChange={setWindows} step="1" /><NumInput label="Coats" value={coats} onChange={setCoats} step="1" /></div>
    <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Coverage ({a}/{v})', { a: au, v: vu })} value={cover} onChange={setCover} hint="Check the paint can label" /><NumInput label={tr('Container ({u})', { u: vu })} value={pail} onChange={setPail} /><NumInput label="Waste (%)" value={waste} onChange={setWaste} /></div>
    <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={ceiling} onChange={e => setCeiling(e.target.checked)} /> {tr('Also paint the ceiling')}</label>
  </>} results={<>
    <Stat big label="Paint to buy" value={`${fmt(r.litres)} L · ${fmt(r.gallons)} gal`} sub={tr('{n} × {size} {v} container(s) incl. {w}% waste', { n: r.pails, size: pail, v: vu, w: waste })} />
    <div className="grid grid-cols-2 gap-3"><Stat label="Wall area" value={`${fmt(r.walls)} ${au}`} /><Stat label="Openings deducted" value={`${fmt(r.openings)} ${au}`} sub="door ≈ 1.9 m², window ≈ 1.4 m²" /><Stat label="Ceiling" value={`${fmt(r.ceil)} ${au}`} /><Stat label="Net paintable" value={`${fmt(r.net)} ${au}`} /></div>
    <CopyBtn text={summary} />
    <Note>Typical coverage is roughly 350–400 sq ft per US gallon (≈ 8–10 m² per litre) for one coat, but varies by product, surface porosity and primer. Dark colours or new plaster may need an extra coat.</Note>
  </>} />
}

// ---------------------------------------------------------------- Flooring / tile
function FlooringCalculator() {
  const tr = useTr()
  const [unit, setUnit] = useState('metric'), metric = unit === 'metric'
  const [len, setLen] = useState('5'), [wid, setWid] = useState('4'), [waste, setWaste] = useState('10')
  const [mode, setMode] = useState('tile')
  const [tl, setTl] = useState('60'), [tw, setTw] = useState('60'), [box, setBox] = useState('1.44'), [perBox, setPerBox] = useState('4')
  const switchUnit = u => { if (u === unit) return; setLen(u === 'imperial' ? '16.4' : '5'); setWid(u === 'imperial' ? '13.1' : '4'); setTl(u === 'imperial' ? '24' : '60'); setTw(u === 'imperial' ? '24' : '60'); setBox(u === 'imperial' ? '20' : '1.44'); setUnit(u) }
  const au = metric ? 'm²' : tr('sq ft'), lu = metric ? 'm' : 'ft', pu = metric ? 'cm' : 'in'
  const r = useMemo(() => {
    const area = num(len) * num(wid), buy = area * (1 + num(waste) / 100)
    const pieceArea = metric ? (num(tl) / 100) * (num(tw) / 100) : (num(tl) / 12) * (num(tw) / 12)
    const pieces = pieceArea > 0 ? Math.ceil(buy / pieceArea - 1e-9) : 0
    const boxes = num(box) > 0 ? Math.ceil(buy / num(box) - 1e-9) : 0
    return { area, buy, pieces, boxes, bought: mode === 'tile' ? pieces * pieceArea : boxes * num(box), tilesInBoxes: pieceArea > 0 && mode === 'tile' && num(perBox) > 0 ? Math.ceil(pieces / num(perBox)) : 0 }
  }, [len, wid, waste, tl, tw, box, perBox, mode, metric])
  const summary = mode === 'tile' ? tr('Flooring: {a} {au} + {w}% waste → {n} tiles ({tl}×{tw} {pu}).', { a: fmt(r.area), au, w: waste, n: r.pieces, tl, tw, pu }) : tr('Flooring: {a} {au} + {w}% waste → {n} boxes of {b} {au}.', { a: fmt(r.area), au, w: waste, n: r.boxes, b: box })
  return <Layout icon={Layers} controls={<>
    <Seg label="Units" value={unit} onChange={switchUnit} options={[['metric', 'Metric (m, cm)'], ['imperial', 'US (ft, in)']]} />
    <Seg label="Material type" value={mode} onChange={setMode} options={[['tile', 'Tiles by size'], ['box', 'Planks / boxes']]} />
    <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Length ({u})', { u: lu })} value={len} onChange={setLen} /><NumInput label={tr('Width ({u})', { u: lu })} value={wid} onChange={setWid} /><NumInput label="Waste (%)" value={waste} onChange={setWaste} hint="10% simple · 15% diagonal" /></div>
    {mode === 'tile'
      ? <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Tile length ({u})', { u: pu })} value={tl} onChange={setTl} /><NumInput label={tr('Tile width ({u})', { u: pu })} value={tw} onChange={setTw} /><NumInput label="Tiles per box (optional)" value={perBox} onChange={setPerBox} /></div>
      : <NumInput label={tr('Coverage per box ({u})', { u: au })} value={box} onChange={setBox} hint="Printed on the box" />}
  </>} results={<>
    <Stat big label={mode === 'tile' ? 'Tiles to buy' : 'Boxes to buy'} value={mode === 'tile' ? fmt(r.pieces, 0) : fmt(r.boxes, 0)} sub={mode === 'tile' && r.tilesInBoxes ? tr('≈ {n} boxes of {p}', { n: r.tilesInBoxes, p: perBox }) : tr('covers {a} {u}', { a: fmt(r.bought), u: au })} />
    <div className="grid grid-cols-2 gap-3"><Stat label="Room area" value={`${fmt(r.area)} ${au}`} /><Stat label={tr('Area incl. {w}% waste', { w: waste })} value={`${fmt(r.buy)} ${au}`} /></div>
    <CopyBtn text={summary} />
    <Note>Round up to whole boxes and keep a few spare pieces from the same batch for future repairs — colour and size can vary between production lots.</Note>
  </>} />
}

// ---------------------------------------------------------------- Drywall
const sheets = { '4x8': ['4 × 8 ft (1.22 × 2.44 m)', 1.2192 * 2.4384], '4x12': ['4 × 12 ft (1.22 × 3.66 m)', 1.2192 * 3.6576], '3x6': ['3 × 6 尺 (91 × 182 cm, Taiwan)', 0.91 * 1.82], '900x1800': ['900 × 1800 mm', 0.9 * 1.8] }
function DrywallCalculator() {
  const tr = useTr()
  const [unit, setUnit] = useState('metric'), metric = unit === 'metric'
  const [perim, setPerim] = useState('14'), [hgt, setHgt] = useState('2.7'), [ceil, setCeil] = useState('12'), [sheet, setSheet] = useState('4x8'), [waste, setWaste] = useState('10'), [layers, setLayers] = useState('1')
  const switchUnit = u => { if (u === unit) return; setPerim(u === 'imperial' ? '46' : '14'); setHgt(u === 'imperial' ? '9' : '2.7'); setCeil(u === 'imperial' ? '130' : '12'); setUnit(u) }
  const r = useMemo(() => {
    const wallsM2 = metric ? num(perim) * num(hgt) : num(perim) * num(hgt) / SQFT_PER_SQM
    const ceilM2 = metric ? num(ceil) : num(ceil) / SQFT_PER_SQM
    const total = (wallsM2 + ceilM2) * Math.max(1, num(layers))
    const count = Math.ceil(total * (1 + num(waste) / 100) / sheets[sheet][1] - 1e-9)
    return { wallsM2, ceilM2, total, count, screws: Math.ceil(count * sheets[sheet][1] * SQFT_PER_SQM) }
  }, [perim, hgt, ceil, sheet, waste, layers, metric])
  const au = metric ? 'm²' : tr('sq ft'), conv = v => metric ? v : v * SQFT_PER_SQM
  const sheetName = k => tr(sheets[k][0])
  const summary = tr('Drywall: {a} {au} + {w}% waste → {n} sheets of {s}.', { a: fmt(conv(r.total)), au, w: waste, n: r.count, s: sheetName(sheet) })
  return <Layout icon={Square} controls={<>
    <Seg label="Units" value={unit} onChange={switchUnit} options={[['metric', 'Metric (m)'], ['imperial', 'US (ft)']]} />
    <div className="grid grid-cols-2 gap-3"><NumInput label={tr('Wall perimeter ({u})', { u: metric ? 'm' : 'ft' })} value={perim} onChange={setPerim} hint="Total length of walls to board" /><NumInput label={tr('Wall height ({u})', { u: metric ? 'm' : 'ft' })} value={hgt} onChange={setHgt} /></div>
    <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Ceiling area ({u})', { u: au })} value={ceil} onChange={setCeil} hint="0 if none" /><NumInput label="Layers" value={layers} onChange={setLayers} step="1" /><NumInput label="Waste (%)" value={waste} onChange={setWaste} /></div>
    <Field label="Sheet size"><select className="input" value={sheet} onChange={e => setSheet(e.target.value)}>{Object.keys(sheets).map(k => <option key={k} value={k}>{sheetName(k)}</option>)}</select></Field>
  </>} results={<>
    <Stat big label="Sheets to buy" value={fmt(r.count, 0)} sub={tr('{s} · incl. {w}% waste', { s: sheetName(sheet), w: waste })} />
    <div className="grid grid-cols-2 gap-3"><Stat label="Walls" value={`${fmt(conv(r.wallsM2))} ${au}`} /><Stat label="Ceiling" value={`${fmt(conv(r.ceilM2))} ${au}`} /><Stat label="Board area (all layers)" value={`${fmt(conv(r.total))} ${au}`} /><Stat label="Screws (rule of thumb)" value={`≈ ${fmt(r.screws, 0)}`} sub="about 1 per sq ft of board" /></div>
    <CopyBtn text={summary} />
    <Note>Openings are not deducted so you keep an allowance for cut-offs. Add joint tape, compound and corner bead separately.</Note>
  </>} />
}

// ---------------------------------------------------------------- Concrete
const bagYield = { 80: 0.6, 60: 0.45, 50: 0.375 } // approx cu ft per US bag (lb)
function ConcreteCalculator() {
  const tr = useTr()
  const [unit, setUnit] = useState('metric'), metric = unit === 'metric'
  const [len, setLen] = useState('4'), [wid, setWid] = useState('3'), [th, setTh] = useState('10'), [waste, setWaste] = useState('10'), [bag, setBag] = useState('80')
  const switchUnit = u => { if (u === unit) return; setLen(u === 'imperial' ? '13' : '4'); setWid(u === 'imperial' ? '10' : '3'); setTh(u === 'imperial' ? '4' : '10'); setUnit(u) }
  const r = useMemo(() => {
    const m3 = metric ? num(len) * num(wid) * num(th) / 100 : num(len) * num(wid) * (num(th) / 12) * 0.0283168466
    const order = m3 * (1 + num(waste) / 100), ft3 = order / 0.0283168466
    return { m3, order, yd3: order / 0.764554858, ft3, bags: Math.ceil(ft3 / bagYield[bag] - 1e-9) }
  }, [len, wid, th, waste, bag, metric])
  const summary = tr('Concrete: {o} m³ ({y} yd³) incl. {w}% waste; ≈ {n} × {b} lb bags.', { o: fmt(r.order, 3), y: fmt(r.yd3, 3), w: waste, n: r.bags, b: bag })
  return <Layout icon={Box} controls={<>
    <Seg label="Units" value={unit} onChange={switchUnit} options={[['metric', 'Metric (m, cm)'], ['imperial', 'US (ft, in)']]} />
    <div className="grid grid-cols-3 gap-3"><NumInput label={tr('Length ({u})', { u: metric ? 'm' : 'ft' })} value={len} onChange={setLen} /><NumInput label={tr('Width ({u})', { u: metric ? 'm' : 'ft' })} value={wid} onChange={setWid} /><NumInput label={tr('Thickness ({u})', { u: metric ? 'cm' : 'in' })} value={th} onChange={setTh} /></div>
    <div className="grid grid-cols-2 gap-3"><NumInput label="Waste / spillage (%)" value={waste} onChange={setWaste} /><Field label="Bag size (US)"><select className="input" value={bag} onChange={e => setBag(e.target.value)}>{Object.keys(bagYield).map(b => <option key={b} value={b}>{tr('{b} lb bag (≈ {y} cu ft)', { b, y: bagYield[b] })}</option>)}</select></Field></div>
  </>} results={<>
    <Stat big label="Concrete to order" value={`${fmt(r.order, 3)} m³`} sub={tr('{y} yd³ · {f} cu ft (incl. {w}% waste)', { y: fmt(r.yd3, 3), f: fmt(r.ft3, 1), w: waste })} />
    <div className="grid grid-cols-2 gap-3"><Stat label="Exact volume" value={`${fmt(r.m3, 3)} m³`} /><Stat label={tr('{b} lb bags (DIY)', { b: bag })} value={`≈ ${fmt(r.bags, 0)}`} sub="pre-mixed bag yields vary by brand" /></div>
    <CopyBtn text={summary} />
    <Note>For ready-mix delivery, order in whole or half cubic metres/yards as your supplier requires. Structural slabs need an engineer’s specification — this is a volume estimate only.</Note>
  </>} />
}

// ---------------------------------------------------------------- Ping converter
function PingConverter() {
  const tr = useTr()
  const [vals, setVals] = useState({ ping: '25', sqm: fmt(25 * SQM_PER_PING, 4).replace(/,/g, ''), sqft: fmt(25 * SQM_PER_PING * SQFT_PER_SQM, 2).replace(/,/g, '') })
  const set = (key, raw) => {
    const n = num(raw); const sqm = key === 'ping' ? n * SQM_PER_PING : key === 'sqm' ? n : n / SQFT_PER_SQM
    const f = (x, d) => fmt(x, d).replace(/,/g, '')
    setVals({ ping: key === 'ping' ? raw : f(sqm / SQM_PER_PING, 3), sqm: key === 'sqm' ? raw : f(sqm, 3), sqft: key === 'sqft' ? raw : f(sqm * SQFT_PER_SQM, 2) })
  }
  const summary = `${vals.ping} 坪 = ${vals.sqm} m² = ${vals.sqft} ${tr('sq ft')}`
  return <Layout icon={Ruler} controls={<>
    <NumInput label="坪 (ping) — Taiwan" value={vals.ping} onChange={v => set('ping', v)} />
    <NumInput label="Square metres (m²)" value={vals.sqm} onChange={v => set('sqm', v)} />
    <NumInput label="Square feet (sq ft) — USA" value={vals.sqft} onChange={v => set('sqft', v)} />
  </>} results={<>
    <Stat big label="Equivalent" value={summary} />
    <div className="grid grid-cols-3 gap-3"><Stat label="1 坪" value="3.3058 m²" sub="= 400/121 m²" /><Stat label="1 m²" value="0.3025 坪" /><Stat label="1 坪" value="35.58 sq ft" /></div>
    <CopyBtn text={summary} />
    <Note>Taiwan listings quote 坪 for 權狀坪 (registered area) which includes shared areas; usable floor area is smaller. Confirm the area basis (主建物, 附屬建物, 公設) before budgeting renovation by 坪.</Note>
  </>} />
}

// ---------------------------------------------------------------- Budget
const twAges = {
  new: { label: 'New (0–5 yrs)', range: [30000, 50000], split: [['Design', 8], ['Carpentry / built-ins', 30], ['Plumbing & electrical', 0], ['Flooring & ceiling', 30], ['Painting', 20], ['Other / misc.', 12]] },
  mid: { label: 'Pre-owned (5–10 yrs)', range: [50000, 70000], split: [['Design', 6], ['Carpentry / built-ins', 30], ['Plumbing & electrical', 10], ['Flooring & ceiling', 20], ['Painting', 15], ['Other / misc.', 19]] },
  older: { label: 'Pre-owned (10–20 yrs)', range: [60000, 80000], split: [['Design', 5], ['Carpentry / built-ins', 20], ['Plumbing & electrical', 15], ['Flooring & ceiling', 15], ['Painting', 10], ['Other / misc.', 35]] },
  old: { label: 'Old (20+ yrs)', range: [70000, 100000], split: [['Design', 5], ['Carpentry / built-ins', 5], ['Plumbing & electrical', 20], ['Flooring & ceiling', 10], ['Painting', 10], ['Other / misc.', 50]] },
}
function BudgetEstimator() {
  const tr = useTr()
  const [market, setMarket] = useState('tw')
  const [age, setAge] = useState('mid'), [ping, setPing] = useState('25'), [cont, setCont] = useState('10')
  const [sqft, setSqft] = useState('1200'), [low, setLow] = useState('50'), [high, setHigh] = useState('150'), [cur, setCur] = useState('USD')
  const r = useMemo(() => {
    if (market === 'tw') { const a = twAges[age], [lo, hi] = a.range, area = num(ping); const base = [lo * area, hi * area]; return { area, base, with: base.map(v => v * (1 + num(cont) / 100)), split: a.split, unit: 'NT$', perUnit: [lo, hi], areaLabel: '坪' } }
    const area = num(sqft); const base = [num(low) * area, num(high) * area]; return { area, base, with: base.map(v => v * (1 + num(cont) / 100)), split: null, unit: cur, perUnit: [num(low), num(high)], areaLabel: tr('sq ft') }
  }, [market, age, ping, cont, sqft, low, high, cur])
  const money = v => `${r.unit === 'NT$' ? 'NT$' : r.unit + ' '}${fmt(v, 0)}`
  const mid = (r.with[0] + r.with[1]) / 2
  const summary = tr('Renovation budget ({m}): {a} – {b} for {n} {u} incl. {c}% contingency.', { m: tr(market === 'tw' ? 'Taiwan' : 'custom'), a: money(r.with[0]), b: money(r.with[1]), n: r.area, u: r.areaLabel, c: cont })
  return <Layout icon={Hammer} controls={<>
    <Seg label="Market" value={market} onChange={setMarket} options={[['tw', 'Taiwan (NT$ per 坪)'], ['custom', 'USA / custom rates']]} />
    {market === 'tw'
      ? <div className="grid grid-cols-2 gap-3"><Field label="Property age"><select className="input" value={age} onChange={e => setAge(e.target.value)}>{Object.entries(twAges).map(([k, v]) => <option key={k} value={k}>{tr(v.label)}</option>)}</select></Field><NumInput label="Area (坪)" value={ping} onChange={setPing} /></div>
      : <>
        <div className="grid grid-cols-2 gap-3"><NumInput label="Area (sq ft)" value={sqft} onChange={setSqft} /><Field label="Currency"><select className="input" value={cur} onChange={e => setCur(e.target.value)}>{['USD', 'CAD', 'EUR', 'GBP', 'PKR', 'AED'].map(c => <option key={c}>{c}</option>)}</select></Field></div>
        <div className="grid grid-cols-2 gap-3"><NumInput label="Low cost per sq ft" value={low} onChange={setLow} hint="Use quotes from local contractors" /><NumInput label="High cost per sq ft" value={high} onChange={setHigh} /></div>
      </>}
    <NumInput label="Contingency (%)" value={cont} onChange={setCont} hint="10–20% is a common planning buffer" />
  </>} results={<>
    <Stat big label="Estimated budget range" value={`${money(r.with[0])} – ${money(r.with[1])}`} sub={tr('mid-point {m} · incl. {c}% contingency', { m: money(mid), c: cont })} />
    <div className="grid grid-cols-2 gap-3"><Stat label="Base range (no contingency)" value={`${money(r.base[0])} – ${money(r.base[1])}`} /><Stat label="Rate used" value={`${money(r.perUnit[0])} – ${money(r.perUnit[1])} / ${r.areaLabel}`} /></div>
    {r.split && <div className="card p-4"><h3 className="mb-2 text-sm font-bold">{tr('Typical split of the budget')}</h3><ul className="space-y-1.5 text-sm">{r.split.map(([name, pct]) => <li key={name} className="flex items-center gap-3"><span className="w-36 shrink-0 text-slate-400">{tr(name)}</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-emerald-400" style={{ width: pct + '%' }} /></span><span className="w-40 shrink-0 text-right font-semibold whitespace-nowrap">{pct}% · {money(mid * pct / 100)}</span></li>)}</ul></div>}
    <CopyBtn text={summary} />
    <Note>{market === 'tw' ? 'Taiwan ranges are market quote ranges (PRO360, 2022–2026) excluding furniture and appliances; the split is a rough guide and "Other" is the remainder. Always collect 2–3 written quotes.' : 'No US-wide price is hard-coded because costs differ widely by city, scope and finishes. Enter low/high rates from your own contractor quotes. Homes built before 1978 may need lead-safe work practices (EPA RRP rule), which can add cost.'}</Note>
  </>} />
}

const components = {
  'paint-calculator': PaintCalculator,
  'flooring-calculator': FlooringCalculator,
  'drywall-calculator': DrywallCalculator,
  'concrete-calculator': ConcreteCalculator,
  'ping-converter': PingConverter,
  'renovation-budget': BudgetEstimator,
}
export const renovationToolSlugs = new Set(Object.keys(components))
export default function RenovationTools({ slug }) {
  const { lang } = useI18n()
  const tr = useMemo(() => makeTr(lang), [lang])
  const Component = components[slug]
  return Component ? <TrCtx.Provider value={tr}><Component /></TrCtx.Provider> : null
}
