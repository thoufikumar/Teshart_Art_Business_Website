import { useEffect, useRef, useState, type ReactNode } from 'react'
import ref from './assets/ref.png'

/* Artwork crops taken from the approved reference (coordinates in 1568×669 reference space). */
const RW = 1568, RH = 669
type Box = [number, number, number, number]
const ART: Record<string, Box> = {
  hero: [92, 20, 140, 135],
  girl: [120, 28, 66, 88],
  works: [94, 252, 136, 90],
  child: [797, 69, 46, 48],
  childLarge: [1452, 82, 68, 90],
  single: [318, 308, 52, 36],
  couple: [318, 350, 52, 36],
  family: [318, 392, 52, 36],
  s1: [313, 243, 38, 32], s2: [354, 243, 37, 32], s3: [395, 243, 39, 32], s4: [438, 243, 40, 32],
  standard: [648, 298, 62, 42], framed: [720, 298, 56, 42], rolled: [787, 298, 54, 42],
}
function Art({ k, className = '', label }: { k: keyof typeof ART; className?: string; label: string }) {
  const [x, y, w, h] = ART[k]
  return (
    <div role="img" aria-label={label} className={className}
      style={{ aspectRatio: `${w}/${h}`, backgroundImage: `url(${ref})`, backgroundSize: `${(RW / w) * 100}% auto`,
        backgroundPosition: `${(x / (RW - w)) * 100}% ${(y / (RH - h)) * 100}%` }} />
  )
}

/* ---------- Icons (thin line) ---------- */
const I = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  check: <path d="m5 12 5 5 9-10" />,
  bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  img: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m4 16 5-5 4 4 2-2 5 5" /><circle cx="15" cy="9" r="1.5" /></>,
  pen: <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18M12 9v11M12 9S10 4 7.5 5 9 9 12 9Zm0 0s2-5 4.5-4S15 9 12 9Z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4-6 8-6s7 2 8 6" /></>,
  phone: <path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  pin: <><path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
  truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></>,
  shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />,
  heart: <path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z" />,
  card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
  bank: <path d="M3 10 12 4l9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18" />,
  note: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 9h6M9 13h6" /></>,
  box: <path d="m12 3 8 4v10l-8 4-8-4V7l8-4Zm0 8 8-4M12 11 4 7m8 4v10" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8v.5" /></>,
  ruler: <path d="m4 16 12-12 4 4L8 20l-4-4Zm4-4 2 2m1-5 2 2" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  city: <path d="M4 20V8l6-3v15m0 0h10V11l-6-2m-8 3h2m-2 4h2" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
}
function Icon({ n, className = 'size-4' }: { n: keyof typeof I; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>{I[n]}</svg>
}

/* ---------- Primitives ---------- */
function Button({ children, onClick, variant = 'primary', className = '', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed'
  const v = variant === 'primary'
    ? 'bg-brown text-white hover:bg-brown-hover active:bg-brown-pressed disabled:bg-disabled'
    : 'border border-line-strong bg-ivory text-ink hover:bg-sand disabled:text-disabled'
  return <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${v} ${className}`}>{children}</button>
}
const Logo = ({ onClick }: { onClick?: () => void }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2 text-[15px] font-medium tracking-tight"><span className="size-3.5 rounded-full bg-ink" />Teshart</button>
)
const Radio = ({ on }: { on: boolean }) => (
  <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${on ? 'border-brown' : 'border-line-strong bg-white'}`}>{on && <span className="size-2 rounded-full bg-brown" />}</span>
)
const CheckDot = () => <span className="grid size-5 place-items-center rounded-full bg-brown text-white"><Icon n="check" className="size-3" /></span>
const StepNum = ({ n }: { n: number }) => <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brown text-xs font-medium text-white">{n}</span>
const Eyebrow = ({ children }: { children: ReactNode }) => <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brown">{children}</p>
const Stars = () => <div className="flex gap-0.5 text-[#d9a441]">{[0, 1, 2, 3, 4].map(i => <svg key={i} viewBox="0 0 24 24" className="size-3.5 fill-current">{I.star}</svg>)}</div>
const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

/* ---------- Homepage ---------- */
function Header({ go }: { go: (v: View) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10">
        <Logo onClick={() => go('home')} />
        <nav className="flex items-center gap-5 text-sm text-muted md:gap-8">
          <a href="#how" className="hidden hover:text-ink sm:block">Home</a>
          <a href="#why" className="hidden hover:text-ink sm:block">Why us</a>
          <a href="#works" className="hidden hover:text-ink sm:block">Our works</a>
          <Button onClick={() => go('order')} className="h-9 px-4">Order now</Button>
        </nav>
      </div>
    </header>
  )
}

function Hero({ go }: { go: (v: View) => void }) {
  const artRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      if (artRef.current && window.innerWidth < 768) artRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`
      else if (artRef.current) artRef.current.style.transform = ''
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ivory via-paper to-sand">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-24">
        <div className="relative z-10">
          <h1 className="font-serif text-[52px] leading-[0.98] tracking-tight md:text-[80px]">Some moments deserve <em className="text-brown">more</em> than a photo.</h1>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">Hand-drawn portraits of the people you love, made to last.</p>
          <Button onClick={() => go('order')} className="mt-8 h-11 px-6">Create your portrait <Icon n="arrow" /></Button>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">{(['s1', 's2', 's3'] as const).map(k => <Art key={k} k={k} label="Customer" className="size-8 rounded-full border-2 border-paper" />)}</div>
            <div><p className="text-xs text-muted">350+ happy customers</p><div className="flex items-center gap-1"><Stars /><span className="text-xs font-medium">4.9/5</span></div></div>
          </div>
        </div>
        <div ref={artRef} className="relative will-change-transform">
          <Art k="hero" label="Framed hand-drawn pencil portraits" className="w-full rounded-sm mix-blend-multiply" />
        </div>
      </div>
    </section>
  )
}

function How() {
  const steps = [
    ['img', 'Share your photo', 'Choose a favourite moment you\u2019d love to turn into a portrait.'],
    ['pen', 'We draw it by hand', 'Every portrait is crafted with care and attention.'],
    ['gift', 'Give a lasting gift', 'Receive a beautiful portrait they\u2019ll always treasure.'],
  ] as const
  return (
    <section id="how" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-5 text-center md:px-10">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Your photo, to their heart.</h2>
        <div className="mt-14 grid gap-12 sm:grid-cols-3">
          {steps.map(([ic, t, d], i) => (
            <div key={t} className="flex flex-col items-center">
              <div className="relative"><span className="absolute -left-4 -top-3"><StepNum n={i + 1} /></span>
                <span className="grid size-14 place-items-center rounded-full border border-line bg-ivory text-brown"><Icon n={ic} className="size-6" /></span></div>
              <h3 className="mt-5 text-[15px] font-medium">{t}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Works({ go }: { go: (v: View) => void }) {
  const slides: (keyof typeof ART)[] = ['works', 'girl', 'family']
  const [i, setI] = useState(0)
  return (
    <section id="works" className="bg-ivory py-20 md:py-28">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 md:grid-cols-[0.8fr_1.4fr] md:px-10">
        <div>
          <Eyebrow>Our works</Eyebrow>
          <h2 className="mt-3 font-serif text-5xl leading-[1] md:text-6xl">Made from moments <em className="text-brown">that matter.</em></h2>
          <p className="mt-5 text-sm leading-relaxed text-muted">Real people. Real stories.<br />Hand-drawn with care.</p>
          <Button onClick={() => go('order')} className="mt-7 h-10 px-5">Explore our works <Icon n="arrow" /></Button>
          <div className="mt-8 flex gap-4">
            <button aria-label="Previous" onClick={() => setI((i + 2) % 3)} className="text-muted hover:text-ink"><Icon n="back" /></button>
            <button aria-label="Next" onClick={() => setI((i + 1) % 3)} className="text-muted hover:text-ink"><Icon n="arrow" /></button>
          </div>
        </div>
        <div>
          <div className="relative flex items-center justify-center gap-4 overflow-hidden">
            <Art k={slides[(i + 2) % 3]} label="Portrait" className="hidden h-56 shrink-0 opacity-60 md:block" />
            <Art k={slides[i]} label="Featured hand-drawn portrait" className="h-64 shrink-0 shadow-card md:h-80" />
            <Art k={slides[(i + 1) % 3]} label="Portrait" className="hidden h-56 shrink-0 opacity-60 md:block" />
          </div>
          <div className="mt-6 flex justify-center gap-1.5">{slides.map((_, j) => <span key={j} className={`h-1.5 rounded-full transition-all ${j === i ? 'w-4 bg-brown' : 'w-1.5 bg-line-strong'}`} />)}</div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const t = [
    ['\u201cSuch a wonderful gift for my parents\u2019 anniversary. They cried! It captured my father\u2019s expression so well. Worth every rupee.\u201d', 'Anu'],
    ['\u201cI gifted this to my boyfriend on his birthday. He loved it! The detailing is amazing and it looks exactly like the photo I sent.\u201d', 'Sowmya'],
    ['\u201cThe portrait of my family came out so beautiful. Great communication and on-time delivery. Highly recommended!\u201d', 'Sathyakim'],
  ]
  return (
    <section id="why" className="bg-sand/60 py-20 md:py-24">
      <div className="mx-auto max-w-[1240px] px-5 text-center md:px-10">
        <Eyebrow>What our customers say</Eyebrow>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Their words mean everything.</h2>
        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {t.map(([q, n]) => (
            <figure key={n} className="rounded-lg border border-line bg-ivory p-6 shadow-card">
              <Stars /><blockquote className="mt-4 text-sm leading-relaxed">{q}</blockquote>
              <figcaption className="mt-5 text-xs font-medium">{n}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function CreateSection({ go }: { go: (v: View) => void }) {
  const field = 'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-muted'
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <div>
          <Eyebrow>Create yours</Eyebrow>
          <h2 className="mt-3 font-serif text-5xl leading-[1] md:text-6xl">A gift they&rsquo;ll <em className="text-brown">always cherish.</em></h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">Upload your photo, choose your details and we&rsquo;ll take care of the rest.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-xs text-muted">
            {([['pen', 'Hand-drawn with care'], ['truck', 'Safe delivery across India'], ['heart', 'A meaningful gift, always']] as const).map(([ic, l]) => (
              <div key={l}><Icon n={ic} className="size-5 text-brown" /><p className="mt-2 leading-snug">{l}</p></div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ivory p-5 shadow-card md:p-6">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <button onClick={() => go('order')} className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-line-strong bg-white text-center text-muted hover:bg-sand/40">
              <Icon n="img" className="size-6" /><span className="mt-2 text-xs text-ink">Upload your photo</span><span className="text-[11px]">JPG, PNG (max 10MB)</span>
            </button>
            <div className="space-y-2.5">
              <select className={field}><option>Select size</option><option>A5</option><option>A4</option><option>A3</option></select>
              <select className={field}><option>Select type</option><option>Single</option><option>Couple</option><option>Family</option></select>
              <input className={field} placeholder="Your mobile number" />
              <input className={field} placeholder="Delivery address" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Estimated price</span><span className="font-medium">₹999</span></div>
            <div className="flex justify-between text-xs text-muted"><span>Pay now (advance)</span><span>₹500</span></div>
            <div className="flex justify-between text-xs text-muted"><span>Pay on delivery</span><span>₹499</span></div>
          </div>
          <Button onClick={() => go('order')} className="mt-5 h-11 w-full">Create my portrait <Icon n="arrow" /></Button>
          <div className="mt-4 flex justify-center gap-6 text-[11px] text-muted"><span className="flex items-center gap-1"><Icon n="lock" className="size-3" />Secure payment</span><span className="flex items-center gap-1"><Icon n="truck" className="size-3" />7–10 days delivery</span></div>
        </div>
      </div>
    </section>
  )
}

function Footer({ go }: { go: (v: View) => void }) {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div><Logo /><p className="mt-2 text-xs text-muted">Hand-drawn portraits for your special moments.</p></div>
        <nav className="flex gap-6 text-sm text-muted"><a href="#how">Home</a><a href="#why">Why us</a><a href="#works">Our works</a><button onClick={() => go('system')} className="hover:text-ink">Design system</button></nav>
      </div>
    </footer>
  )
}

/* ---------- Order flow ---------- */
type View = 'home' | 'order' | 'confirm' | 'track' | 'system'
const TYPES = [
  { id: 'single', t: 'Single Portrait', d: 'A beautiful portrait of one person.', art: 'single' },
  { id: 'couple', t: 'Couple Portrait', d: 'A portrait of two people.', art: 'couple' },
  { id: 'family', t: 'Family Portrait', d: 'A portrait of your family.', art: 'family' },
] as const
const SIZES = [
  { id: 'A5', dim: '14.8 × 21 cm', p: 499, d: 'Perfect for gifting', tag: 'Most popular', w: 'w-10' },
  { id: 'A4', dim: '21 × 29.7 cm', p: 799, d: 'Great detail & clarity', w: 'w-12' },
  { id: 'A3', dim: '29.7 × 42 cm', p: 1299, d: 'Best for large and framed display', w: 'w-14' },
] as const
const FINISHES = [
  { id: 'standard', t: 'Standard Finish', d: 'Hand-drawn on premium sketch paper.', p: 0, art: 'standard' },
  { id: 'framed', t: 'Framed Portrait', d: 'Comes with a sleek wooden frame.', p: 300, art: 'framed' },
  { id: 'rolled', t: 'Rolled Artwork', d: 'Carefully packed in a protective tube.', p: 50, art: 'rolled' },
] as const
const SHIPPING = 50
const STEP_NAMES = ['Your portrait', 'Make it yours', 'Delivery details', 'Review & pay']

type Order = { photo: string | null; type: number; size: number; finish: number; pay: number; name: string; mobile: string; address: string; city: string; state: string; pincode: string; notes: string }

function Progress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {STEP_NAMES.map((s, i) => {
        const done = i < step, cur = i === step
        return (
          <li key={s} className="relative flex flex-col items-center gap-1.5 text-center" aria-current={cur ? 'step' : undefined}>
            {i > 0 && <span className={`absolute right-1/2 top-3 h-px w-[calc(100%-28px)] -translate-x-[14px] ${done || cur ? 'bg-brown' : 'bg-line-strong'}`} />}
            <span className={`relative z-10 grid size-6 place-items-center rounded-full border text-[11px] ${cur ? 'border-brown bg-brown text-white' : done ? 'border-brown bg-paper text-brown' : 'border-line-strong bg-paper text-muted'}`}>{done ? <Icon n="check" className="size-3" /> : i + 1}</span>
            <span className={`text-[11px] sm:text-xs ${cur ? 'font-medium text-ink' : 'text-muted'}`}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`rounded-xl border border-line bg-ivory shadow-card ${className}`}>{children}</div>
const SectionTitle = ({ n, children, right }: { n: number; children: ReactNode; right?: ReactNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><StepNum n={n} /><h2 className="text-[17px] font-medium">{children}</h2></div>{right}</div>
)
const selCls = (on: boolean) => `rounded-lg border text-left transition-colors ${on ? 'border-brown bg-sand/70 ring-1 ring-brown' : 'border-line bg-white hover:border-line-strong'}`

function Field({ icon, label, value, onChange, placeholder, error, className = '' }: { icon: keyof typeof I; label: string; value: string; onChange: (v: string) => void; placeholder: string; error?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 focus-within:border-brown focus-within:ring-1 focus-within:ring-brown ${error ? 'border-error' : 'border-line'}`}>
        <Icon n={icon} className="size-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{label}</span>
          <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70" /></span>
      </span>
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  )
}

function Step1({ o, set }: { o: Order; set: (p: Partial<Order>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">Let&rsquo;s begin with your <em className="text-brown">favourite</em> photo.</h1>
      <p className="mt-3 max-w-md text-sm text-muted">Upload a clear photo and choose the type of portrait you&rsquo;d like.</p>
      <section className="mt-8"><SectionTitle n={1}>Upload your photo</SectionTitle>
        <div className="grid gap-5 rounded-xl bg-sand/50 p-4 sm:grid-cols-[1.1fr_1fr]">
          <button onClick={() => fileRef.current?.click()} className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-white p-4 text-center hover:bg-ivory">
            {o.photo ? <img src={o.photo} alt="Selected photo" className="max-h-32 rounded object-contain" /> : <><Icon n="img" className="size-6 text-muted" /><span className="mt-2 text-sm">Tap to upload</span><span className="text-xs text-muted">JPG, PNG (max 10MB)</span></>}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={e => { const f = e.target.files?.[0]; if (f) set({ photo: URL.createObjectURL(f) }) }} />
          <div className="self-center text-xs text-muted"><p className="mb-3 text-ink">A few tips for best results</p>
            {['Use a clear, well lit photo', 'Avoid heavy filters', 'Make sure faces are visible'].map(t => <p key={t} className="mb-2 flex items-center gap-2"><Icon n="check" className="size-3.5 text-brown" />{t}</p>)}</div>
        </div>
        <p className="mb-2 mt-5 text-xs text-muted">Or try a sample</p>
        <div className="grid grid-cols-5 gap-2">
          {(['s1', 's2', 's3', 's4'] as const).map(k => <button key={k} onClick={() => set({ photo: k })} className={`overflow-hidden rounded-md ${o.photo === k ? 'ring-2 ring-brown' : ''}`}><Art k={k} label="Sample photo" className="w-full" /></button>)}
          <button className="flex flex-col items-center justify-center rounded-md border border-line bg-white text-[11px] text-muted"><Icon n="img" />View more</button>
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={2}>Choose portrait type</SectionTitle>
        <div className="space-y-2.5">
          {TYPES.map((t, i) => (
            <button key={t.id} onClick={() => set({ type: i })} className={`flex w-full items-center gap-4 p-2.5 pr-4 ${selCls(o.type === i)}`} aria-pressed={o.type === i}>
              <Art k={t.art} label={t.t} className="w-20 shrink-0 rounded" />
              <span className="flex-1"><span className="block text-sm font-medium">{t.t}</span><span className="text-xs text-muted">{t.d}</span></span><Radio on={o.type === i} />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

function Step2({ o, set }: { o: Order; set: (p: Partial<Order>) => void }) {
  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div><h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">Make it <em className="text-brown">yours.</em></h1>
          <p className="mt-3 max-w-sm text-sm text-muted">Choose the size and finish to match your style and space.</p></div>
        <div className="text-center"><Art k="child" label="Your photo" className="w-20 rounded-md md:w-24" /><p className="mt-1 text-[11px]">Your photo</p><p className="text-[11px] text-muted">Change</p></div>
      </div>
      <section className="mt-8"><SectionTitle n={1} right={<span className="flex items-center gap-1 text-xs text-muted"><Icon n="ruler" className="size-3.5" />Size guide</span>}>Choose your size</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SIZES.map((s, i) => (
            <button key={s.id} onClick={() => set({ size: i })} aria-pressed={o.size === i} className={`relative flex flex-col p-3 ${selCls(o.size === i)}`}>
              <span className="flex justify-between"><span className="text-sm font-medium">{s.id}</span>{o.size === i ? <CheckDot /> : <Radio on={false} />}</span>
              <span className="text-[11px] text-muted">{s.dim}</span>
              <span className="relative my-4 grid h-20 place-items-center"><span className={`${s.w} aspect-[1/1.41] border border-line bg-paper shadow-sm`} />
                {'tag' in s && <span className="absolute bottom-0 rounded-full bg-brown px-2 py-0.5 text-[10px] text-white">{s.tag}</span>}</span>
              <span className="font-serif text-2xl">{inr(s.p)}</span><span className="text-[11px] text-muted">{s.d}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={2} right={<span className="flex items-center gap-1 text-xs text-muted"><Icon n="info" className="size-3.5" />About our finishes</span>}>Choose your finish</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FINISHES.map((f, i) => (
            <button key={f.id} onClick={() => set({ finish: i })} aria-pressed={o.finish === i} className={`relative flex flex-col p-2.5 ${selCls(o.finish === i)}`}>
              <span className="absolute right-3 top-3 z-10">{o.finish === i ? <CheckDot /> : <Radio on={false} />}</span>
              <Art k={f.art} label={f.t} className="w-full rounded" />
              <span className="mt-3 text-sm font-medium">{f.t}</span><span className="text-[11px] text-muted">{f.d}</span>
              <span className="mt-2 font-serif text-lg text-brown">{f.p ? `+ ${inr(f.p)}` : 'Included'}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-sand/60 px-4 py-3 text-xs text-muted"><Icon n="gift" className="size-4" />All portraits are hand-drawn with care. Colours may slightly vary from the preview.</p>
      </section>
    </>
  )
}

function Step3({ o, set, errors }: { o: Order; set: (p: Partial<Order>) => void; errors: Record<string, string> }) {
  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">Where should we send <em className="text-brown">your portrait?</em></h1>
      <p className="mt-3 max-w-md text-sm text-muted">Add your details so we can deliver it safely and on time.</p>
      <section className="mt-8"><SectionTitle n={1}>Contact information</SectionTitle>
        <div className="space-y-3">
          <Field icon="user" label="Full name" value={o.name} onChange={v => set({ name: v })} placeholder="Enter your full name" error={errors.name} />
          <Field icon="phone" label="Mobile number" value={o.mobile} onChange={v => set({ mobile: v })} placeholder="+91 98765 43210" error={errors.mobile} />
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={2} right={<span className="flex items-center gap-1 text-xs text-brown underline"><Icon n="pin" className="size-3.5" />Use current location</span>}>Delivery address</SectionTitle>
        <div className="space-y-3">
          <Field icon="pin" label="Address" value={o.address} onChange={v => set({ address: v })} placeholder="House no., street, area" error={errors.address} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field icon="city" label="City" value={o.city} onChange={v => set({ city: v })} placeholder="e.g. Coimbatore" error={errors.city} />
            <Field icon="bank" label="State" value={o.state} onChange={v => set({ state: v })} placeholder="e.g. Tamil Nadu" error={errors.state} />
          </div>
          <Field icon="note" label="Pincode" value={o.pincode} onChange={v => set({ pincode: v.replace(/\D/g, '').slice(0, 6) })} placeholder="Enter 6 digit pincode" error={errors.pincode} className="sm:w-1/2" />
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={3}>Delivery instructions <span className="text-sm font-normal text-muted">(optional)</span></SectionTitle>
        <div className="rounded-lg border border-line bg-white p-3 focus-within:border-brown">
          <textarea value={o.notes} maxLength={200} onChange={e => set({ notes: e.target.value })} rows={3} placeholder="e.g. Best time to deliver, nearby landmark, etc." className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted/70" />
          <p className="text-right text-[11px] text-muted">{o.notes.length}/200</p>
        </div>
      </section>
    </>
  )
}

function Step4({ o, set, edit }: { o: Order; set: (p: Partial<Order>) => void; edit: (s: number) => void }) {
  const t = TYPES[o.type], s = SIZES[o.size], f = FINISHES[o.finish]
  const total = s.p + f.p + SHIPPING, now = Math.ceil(total / 2)
  const Edit = ({ to }: { to: number }) => <button onClick={() => edit(to)} className="flex items-center gap-1 text-xs text-brown">Edit <Icon n="pen" className="size-3" /></button>
  const pays = [['UPI (Google Pay, PhonePe, Paytm, etc.)', 'Fast and secure', 'phone'], ['Debit / Credit Card', 'Visa, MasterCard, Rupay', 'card'], ['Net Banking', 'All major banks supported', 'bank']] as const
  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">Almost there!<br />Let&rsquo;s <em className="text-brown">make it official.</em></h1>
      <p className="mt-3 max-w-md text-sm text-muted">Review your order and complete the advance payment to confirm.</p>
      <section className="mt-8"><SectionTitle n={1} right={<Edit to={1} />}>Order summary</SectionTitle>
        <div className="divide-y divide-line rounded-lg border border-line bg-white">
          {[[<Art k={t.art} label="" className="w-14 rounded" />, 'Portrait type', t.t, inr(0), 0], [<span className="grid w-14 place-items-center"><span className="aspect-[1/1.41] w-6 border border-line bg-paper" /></span>, 'Size', `${s.id} (${s.dim})`, inr(s.p), 1], [<Art k={f.art} label="" className="w-14 rounded" />, 'Finish', f.t, inr(f.p), 1]].map(([img, l, v, p]) => (
            <div key={l as string} className="flex items-center gap-4 p-3">{img}<div className="flex-1"><p className="text-sm font-medium">{l}</p><p className="text-xs text-muted">{v}</p></div><span className="text-sm">{p}</span></div>
          ))}
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={2}>Price details</SectionTitle>
        <div className="space-y-2 text-sm">
          <Row l={`Portrait price (${s.id})`} v={inr(s.p)} /><Row l={`Finish (${f.t.split(' ')[0]})`} v={inr(f.p)} /><Row l="Shipping" v={inr(SHIPPING)} />
          <div className="flex justify-between border-t border-line pt-3 font-medium"><span>Total amount</span><span>{inr(total)}</span></div>
          <div className="rounded-lg bg-sand/70 p-3 text-sm">
            <div className="flex justify-between font-medium"><span>Pay now (50% advance)</span><span>{inr(now)}</span></div>
            <div className="mt-1 flex justify-between text-muted"><span>Pay on delivery (remaining)</span><span>{inr(total - now)}</span></div>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted"><Icon n="info" className="size-3.5" />The remaining amount will be collected on delivery.</p>
        </div>
      </section>
      <section className="mt-8"><SectionTitle n={3}>Choose payment method</SectionTitle>
        <div className="space-y-2.5" role="radiogroup">
          {pays.map(([l, d, ic], i) => (
            <button key={l} role="radio" aria-checked={o.pay === i} onClick={() => set({ pay: i })} className={`flex w-full items-center gap-3 p-3 ${selCls(o.pay === i)}`}>
              <Radio on={o.pay === i} /><Icon n={ic} className="size-5 text-brown" /><span><span className="block text-sm font-medium">{l}</span><span className="text-xs text-muted">{d}</span></span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
const Row = ({ l, v }: { l: string; v: string }) => <div className="flex justify-between"><span className="text-muted">{l}</span><span>{v}</span></div>

function Aside({ step, o, edit }: { step: number; o: Order; edit: (s: number) => void }) {
  const t = TYPES[o.type], s = SIZES[o.size], f = FINISHES[o.finish]
  const perks = [['shield', 'Safe and secure delivery', 'across India'], ['heart', 'Handle with care', 'packaging'], ['gift', 'A meaningful gift,', 'always']] as const
  if (step < 2) return (
    <Card className="p-5"><p className="text-xs uppercase tracking-[0.16em] text-muted">Your order</p>
      <Art k={step === 0 ? t.art : 'childLarge'} label="Portrait preview" className="mt-4 w-full rounded-md" />
      <div className="mt-4 space-y-2 text-sm"><Row l="Portrait type" v={t.t} />{step === 1 && <><Row l="Size" v={s.id} /><Row l="Finish" v={f.t} /></>}</div>
      {step === 1 && <div className="mt-4 flex justify-between border-t border-line pt-3"><span className="text-sm text-muted">Estimated price</span><span className="font-serif text-2xl">{inr(s.p + f.p)}</span></div>}
    </Card>
  )
  if (step === 2) return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4"><Art k="child" label="Portrait preview" className="w-20 rounded-md" /><div className="flex-1 text-right"><p className="text-sm font-medium">Your order</p><button onClick={() => edit(1)} className="text-xs text-brown">Edit</button></div></div>
        <div className="mt-4 space-y-2 text-sm"><Row l="Portrait type" v={t.t} /><Row l="Size" v={`${s.id} (${s.dim})`} /><Row l="Finish" v={f.t} /></div>
        <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm"><span className="text-muted">Price</span><span className="font-medium">{inr(s.p + f.p)}</span></div>
        <div className="mt-4 flex gap-3 rounded-lg bg-sand/70 p-3"><Icon n="truck" className="size-5 text-brown" /><div className="text-xs"><p className="text-muted">Estimated delivery</p><p className="text-sm font-medium">7–10 days</p><p className="text-muted">from order confirmation</p></div></div>
      </Card>
      <Card className="space-y-4 p-5">{perks.map(([ic, a, b]) => <div key={a} className="flex gap-3 text-xs text-muted"><Icon n={ic} className="size-5 text-brown" /><p>{a}<br />{b}</p></div>)}</Card>
    </div>
  )
  return (
    <div className="space-y-4">
      <Card className="p-5"><div className="flex justify-between text-sm"><span className="font-medium">Preview</span><button onClick={() => edit(1)} className="text-xs text-brown">Edit</button></div>
        <Art k="childLarge" label="Portrait preview" className="mt-3 w-full rounded-md" />
        <p className="mt-3 flex gap-2 text-[11px] text-muted"><Icon n="info" className="size-3.5 shrink-0" />This is a preview. The final artwork may have slight variations as it is hand-drawn.</p>
      </Card>
      <Card className="p-5"><div className="flex justify-between text-sm"><span className="font-medium">Delivery to</span><button onClick={() => edit(2)} className="text-xs text-brown">Edit</button></div>
        <div className="mt-3 flex gap-2 text-xs text-muted"><Icon n="pin" className="size-4 shrink-0 text-brown" /><p><span className="font-medium text-ink">{o.name || 'Thoufik Umer A'}</span><br />{o.address || '23C/379, Sri Eshwar College of Engineering'}, {o.city || 'Coimbatore'}, {o.state || 'Tamil Nadu'} – {o.pincode || '641202'}<br />{o.mobile || '+91 98765 43210'}</p></div>
      </Card>
      <Card className="space-y-4 p-5">{([['truck', 'Estimated delivery', '7–10 days'], ['shield', 'Safe and secure payment', '100% secure transactions'], ['gift', 'A meaningful gift', 'Hand-drawn with care'], ['box', 'Pan India delivery', 'Tracked and insured']] as const).map(([ic, a, b]) => <div key={a} className="flex gap-3 text-xs"><Icon n={ic} className="size-5 text-brown" /><p className="text-muted"><span className="text-ink">{a}</span><br />{b}</p></div>)}</Card>
    </div>
  )
}

function OrderFlow({ o, set, step, setStep, go }: { o: Order; set: (p: Partial<Order>) => void; step: number; setStep: (n: number) => void; go: (v: View) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const s = SIZES[o.size], f = FINISHES[o.finish], total = s.p + f.p + SHIPPING, now = Math.ceil(total / 2)
  useEffect(() => { window.scrollTo(0, 0) }, [step])
  const next = () => {
    if (step === 2) {
      const e: Record<string, string> = {}
      if (!o.name.trim()) e.name = 'Please enter your full name'
      if (o.mobile.replace(/\D/g, '').length < 10) e.mobile = 'Enter a valid 10-digit mobile number'
      if (!o.address.trim()) e.address = 'Please enter your address'
      if (!o.city.trim()) e.city = 'Required'
      if (!o.state.trim()) e.state = 'Required'
      if (o.pincode.length !== 6) e.pincode = 'Enter a 6-digit pincode'
      setErrors(e); if (Object.keys(e).length) return
    }
    if (step === 3) return go('confirm')
    setStep(step + 1)
  }
  const footer = [
    { l: null, cta: 'Continue to next step' },
    { l: ['Estimated price', inr(s.p + f.p), null], cta: 'Continue to next step' },
    { l: ['Total amount', inr(total), '(Advance payment at next step)'], cta: 'Continue to review' },
    { l: ['Total amount', inr(total), `You'll pay ${inr(now)} now (50% advance)`], cta: `Place order and pay ${inr(now)}` },
  ][step]
  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sand/60">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10"><Logo onClick={() => go('home')} /><Icon n="bag" className="size-5" /></div>
      </header>
      <div className="mx-auto max-w-[1240px] px-5 pb-40 pt-8 md:px-10">
        <div className="mx-auto max-w-2xl"><Progress step={step} /></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <main className="min-w-0">
            {step === 0 && <Step1 o={o} set={set} />}{step === 1 && <Step2 o={o} set={set} />}
            {step === 2 && <Step3 o={o} set={set} errors={errors} />}{step === 3 && <Step4 o={o} set={set} edit={setStep} />}
          </main>
          <aside className="lg:sticky lg:top-24 lg:self-start"><Aside step={step} o={o} edit={setStep} /></aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5 md:px-10">
          <div className="flex items-center gap-4">
            {step > 0 && <button onClick={() => setStep(step - 1)} aria-label="Back" className="grid size-10 place-items-center rounded-md border border-line-strong hover:bg-sand"><Icon n="back" /></button>}
            {footer.l && <div><p className="text-xs text-muted">{footer.l[0]}</p><p className="font-serif text-2xl leading-none md:text-3xl">{footer.l[1]}</p>{footer.l[2] && <p className="text-[11px] text-muted">{footer.l[2]}</p>}</div>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={next} className="h-11 px-5 md:min-w-[260px]">{footer.cta} <Icon n="arrow" /></Button>
            {step === 3 && <p className="flex items-center gap-1 text-[10px] text-muted"><Icon n="lock" className="size-3" />Secure payment (prototype — no real charge)</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Post-order ---------- */
const MILESTONES = ['Order confirmed', 'Artist assigned', 'Drawing in progress', 'Quality check', 'Shipped', 'Delivered']
function Timeline({ current }: { current: number }) {
  return (
    <ol className="space-y-0">
      {MILESTONES.map((m, i) => {
        const done = i < current, cur = i === current
        return (
          <li key={m} className="relative flex gap-4 pb-6 last:pb-0">
            {i < MILESTONES.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-px ${done ? 'bg-brown' : 'bg-line-strong'}`} />}
            <span className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border ${done ? 'border-brown bg-brown text-white' : cur ? 'border-brown bg-paper' : 'border-line-strong bg-paper'}`}>{done ? <Icon n="check" className="size-3" /> : cur && <span className="size-2 rounded-full bg-brown" />}</span>
            <div><p className={`text-sm ${done || cur ? 'font-medium' : 'text-muted'}`}>{m}</p><p className="text-xs text-muted">{done ? 'Completed' : cur ? 'Current status' : 'Upcoming'}</p></div>
          </li>
        )
      })}
    </ol>
  )
}
function PostOrder({ mode, o, go }: { mode: 'confirm' | 'track'; o: Order; go: (v: View) => void }) {
  const s = SIZES[o.size], f = FINISHES[o.finish], total = s.p + f.p + SHIPPING, now = Math.ceil(total / 2)
  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sand/60">
      <header className="border-b border-line/70"><div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10"><Logo onClick={() => go('home')} /><Icon n="bag" className="size-5" /></div></header>
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main>
          {mode === 'confirm' ? <>
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success"><Icon n="check" className="size-7" /></span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.02]">Thank you! Your order is <em className="text-brown">confirmed.</em></h1>
            <p className="mt-3 max-w-md text-sm text-muted">We&rsquo;ve received your advance payment. Our artist will begin your portrait shortly.</p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
              <Card className="p-4"><p className="text-xs text-muted">Order reference</p><p className="mt-1 font-medium">TSH-240518</p></Card>
              <Card className="p-4"><p className="text-xs text-muted">Estimated delivery</p><p className="mt-1 font-medium">7–10 days</p></Card>
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => go('track')} className="h-11 px-6">Track your order <Icon n="arrow" /></Button><Button variant="secondary" onClick={() => go('home')} className="h-11 px-6">Back to home</Button></div>
          </> : <>
            <Eyebrow>Order TSH-240518</Eyebrow>
            <h1 className="mt-3 font-serif text-5xl leading-[1.02]">Your portrait is <em className="text-brown">in progress.</em></h1>
            <p className="mt-3 text-sm text-muted">Current status: Drawing in progress</p>
            <Card className="mt-8 max-w-lg p-6"><Timeline current={2} /></Card>
          </>}
        </main>
        <aside className="space-y-4">
          <Card className="p-5"><Art k="childLarge" label="Portrait preview" className="w-full rounded-md" />
            <div className="mt-4 space-y-2 text-sm"><Row l="Portrait type" v={TYPES[o.type].t} /><Row l="Size" v={s.id} /><Row l="Finish" v={f.t} /></div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm"><Row l="Total amount" v={inr(total)} /><Row l="Paid (advance)" v={inr(now)} /><Row l="Pay on delivery" v={inr(total - now)} /></div>
          </Card>
          {mode === 'confirm' && <Card className="p-5"><p className="mb-4 text-sm font-medium">Order progress</p><Timeline current={1} /></Card>}
        </aside>
      </div>
    </div>
  )
}

/* ---------- Design system reference ---------- */
function System({ go }: { go: (v: View) => void }) {
  const colors = [['ink', '#1C1915'], ['paper', '#F7F3EC'], ['ivory', '#FBF8F3'], ['sand', '#EFE7DB'], ['brown', '#8B6A4B'], ['brown-hover', '#7A5B3F'], ['brown-pressed', '#664A32'], ['line', '#E6DED2'], ['line-strong', '#D4C8B7'], ['muted', '#7A7168'], ['disabled', '#C9C1B6'], ['success', '#4F7A52'], ['error', '#B4483B']]
  const type = [['Display', 'font-serif text-[80px] leading-none', 'Serif 80/0.98'], ['Section heading', 'font-serif text-5xl', 'Serif 48/1.1'], ['Page heading', 'font-serif text-[42px]', 'Serif 42/1.02'], ['Card heading', 'text-[17px] font-medium', 'Inter 17 Medium'], ['Body large', 'text-[15px]', 'Inter 15/1.6'], ['Body', 'text-sm', 'Inter 14/1.5'], ['Small / helper', 'text-xs text-muted', 'Inter 12'], ['Price', 'font-serif text-2xl', 'Serif 24'], ['Eyebrow', 'text-[11px] uppercase tracking-[0.18em] text-brown', 'Inter 11 / 0.18em']]
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line"><div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10"><Logo onClick={() => go('home')} /><span className="text-sm text-muted">Design system</span></div></header>
      <div className="mx-auto max-w-[1240px] space-y-16 px-5 py-14 md:px-10">
        <section><Eyebrow>Colour</Eyebrow><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{colors.map(([n, h]) => <div key={n}><div className="h-16 rounded-lg border border-line" style={{ background: h }} /><p className="mt-2 text-xs font-medium">{n}</p><p className="text-[11px] text-muted">{h}</p></div>)}</div></section>
        <section><Eyebrow>Typography</Eyebrow><div className="mt-5 divide-y divide-line">{type.map(([n, c, s]) => <div key={n} className="grid items-baseline gap-2 py-4 md:grid-cols-[180px_1fr]"><p className="text-xs text-muted">{n} · {s}</p><p className={`${c} truncate`}>Some moments <em>deserve</em> more</p></div>)}</div></section>
        <section><Eyebrow>Radius · spacing · shadow</Eyebrow><div className="mt-5 flex flex-wrap gap-6 text-xs text-muted">{[['sm 4', 'rounded'], ['md 6', 'rounded-md'], ['lg 8', 'rounded-lg'], ['xl 12', 'rounded-xl'], ['full', 'rounded-full']].map(([l, c]) => <div key={l}><div className={`size-16 border border-line-strong bg-ivory ${c}`} /><p className="mt-2">{l}</p></div>)}<div><div className="size-16 rounded-xl bg-ivory shadow-card" /><p className="mt-2">shadow-card</p></div><p className="self-center">Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 40 · 56 · 80 · 112 px. Breakpoints: mobile 360–767, tablet 768–1023, desktop ≥1024.</p></div></section>
        <section><Eyebrow>Buttons & controls</Eyebrow><div className="mt-5 flex flex-wrap items-center gap-3"><Button className="h-11 px-5">Primary <Icon n="arrow" /></Button><Button variant="secondary" className="h-11 px-5">Secondary</Button><Button disabled className="h-11 px-5">Disabled</Button><Radio on /><Radio on={false} /><CheckDot /><StepNum n={1} /></div>
          <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2"><Field icon="user" label="Default" value="" onChange={() => {}} placeholder="Enter your full name" /><Field icon="phone" label="Error" value="98" onChange={() => {}} placeholder="" error="Enter a valid 10-digit mobile number" /></div></section>
        <section><Eyebrow>Progress states</Eyebrow><div className="mt-5 max-w-2xl space-y-6">{[0, 2, 3].map(n => <Progress key={n} step={n} />)}</div></section>
        <section><Eyebrow>Tracking</Eyebrow><Card className="mt-5 max-w-sm p-6"><Timeline current={2} /></Card></section>
      </div>
    </div>
  )
}

/* ---------- App ---------- */
export default function App() {
  const [view, setView] = useState<View>('home')
  const [step, setStep] = useState(0)
  const [o, setO] = useState<Order>({ photo: null, type: 0, size: 0, finish: 0, pay: 0, name: '', mobile: '', address: '', city: '', state: '', pincode: '', notes: '' })
  const set = (p: Partial<Order>) => setO(prev => ({ ...prev, ...p }))
  const go = (v: View) => { if (v === 'order') setStep(0); setView(v); window.scrollTo(0, 0) }
  if (view === 'order') return <OrderFlow o={o} set={set} step={step} setStep={setStep} go={go} />
  if (view === 'confirm' || view === 'track') return <PostOrder mode={view} o={o} go={go} />
  if (view === 'system') return <System go={go} />
  return (
    <>
      <Header go={go} /><Hero go={go} /><How /><Works go={go} /><Testimonials /><CreateSection go={go} /><Footer go={go} />
    </>
  )
}
