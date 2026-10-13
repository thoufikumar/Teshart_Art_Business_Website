import { useEffect, useRef, useState } from 'react'
import { type RouteId, ROUTES, resolveRouteFromPath, type CheckoutStepIndex } from './config/routes'
import { type ArtworkId } from './domain/artworkRegistry'
import {
  FINISH_OPTIONS,
  PORTRAIT_TYPES,
  SAMPLE_PHOTOS,
  TESTIMONIALS,
  getAvailableSizesForType,
  getFinishOption,
  getPortraitSize,
  getPortraitType,
  type FinishOptionId,
  type PortraitSizeId,
  type PortraitTypeId,
} from './domain/catalogue'
import { PAYMENT_METHODS, type DeliveryDetails } from './domain/order'
import { formatInr, getFramingPriceDifferenceInr, getVariantPriceInr } from './domain/pricing'
import {
  sanitizePincodeInput,
  validateDeliveryDetails,
  validatePhotoFile,
  type DeliveryValidationErrors,
} from './domain/validation'
import { OrderProvider, useOrder } from './state/OrderContext'

import Button from './components/ui/Button'
import Card from './components/ui/Card'
import CheckDot from './components/ui/CheckDot'
import Eyebrow from './components/ui/Eyebrow'
import Field from './components/ui/Field'
import Icon from './components/ui/Icon'
import Logo from './components/ui/Logo'
import Radio from './components/ui/Radio'
import SectionTitle from './components/ui/SectionTitle'
import Stars from './components/ui/Stars'
import StepNum from './components/ui/StepNum'
import Container from './components/layout/Container'
import ArtworkImage from './components/shared/ArtworkImage'
import OrderTimeline from './components/shared/OrderTimeline'
import ProgressStepper from './components/shared/ProgressStepper'

import uploadImageIllustration from './assets/Other assets/Upload your image .jpg'
import drawByHandIllustration from './assets/Other assets/we draw it by hand.jpg'
import lastingGiftIllustration from './assets/Other assets/give lasting gifts.jpg'

const selCls = (on: boolean) =>
  `rounded-lg border text-left transition-colors ${
    on ? 'border-brown bg-sand/70 ring-1 ring-brown' : 'border-line bg-white hover:border-line-strong'
  }`

const Row = ({ l, v }: { l: string; v: string }) => (
  <div className="flex justify-between">
    <span className="text-muted">{l}</span>
    <span>{v}</span>
  </div>
)

/* ---------- Homepage ---------- */
function Header({ go }: { go: (v: RouteId) => void }) {
  return (
    <header className="sticky top-0 z-30 box-border w-full border-b border-line/70 bg-ivory/90 px-[20px] backdrop-blur sm:px-[32px] lg:px-[60px]">
      <div className="grid min-h-[68px] w-full max-w-none grid-cols-[1fr_auto] items-center sm:min-h-[76px] sm:grid-cols-[1fr_auto_1fr] lg:min-h-[88px]">
        <Logo
          onClick={() => go('home')}
          className="justify-self-start !text-[18px] font-medium lg:!text-[20px]"
        />
        <nav
          aria-label="Primary"
          className="hidden items-center justify-self-center gap-[32px] text-[16px] whitespace-nowrap text-muted sm:flex lg:gap-[44px] lg:text-[16.5px]"
        >
          <a href="#how" className="transition-colors hover:text-ink">
            Home
          </a>
          <a href="#why" className="transition-colors hover:text-ink">
            Why us
          </a>
          <a href="#works" className="transition-colors hover:text-ink">
            Our works
          </a>
        </nav>
        <Button
          onClick={() => go('order')}
          className="h-[40px] justify-self-end px-[18px] !text-[15px] sm:h-[44px] sm:px-[20px] lg:h-[48px] lg:px-[24px] lg:!text-[16px]"
        >
          Order now
        </Button>
      </div>
    </header>
  )
}

function Hero({ go }: { go: (v: RouteId) => void }) {
  const scrollToWorks = () => {
    const el = document.getElementById('works')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ivory via-sand/45 to-paper">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col items-center px-5 pt-10 pb-0 sm:px-8 sm:pt-12 lg:px-14 lg:pt-16 xl:px-20">
        {/* Centered Editorial Headline (+15%) */}
        <h1 className="mx-auto max-w-[18ch] text-center font-serif text-[clamp(2.5875rem,5.29vw,5.75rem)] leading-[1.05] tracking-[-0.015em] text-ink md:max-w-none">
          <span className="md:block md:whitespace-nowrap">Turning your timeless moments</span>{' '}
          <span className="md:block md:whitespace-nowrap">
            into beautiful <em className="font-serif italic text-brown">keepsake.</em>
          </span>
        </h1>

        {/* Primary & Secondary CTAs immediately below the heading (+15%) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:mt-7 sm:gap-4">
          <Button onClick={() => go('order')} className="h-[50.6px] px-[27.6px] !text-[16.1px]">
            Create your portrait <Icon name="arrow" className="size-[18.4px]" />
          </Button>
          <Button
            variant="secondary"
            onClick={scrollToWorks}
            className="h-[50.6px] border-line-strong/90 bg-ivory/80 px-[27.6px] !text-[16.1px] hover:bg-sand/70"
          >
            Explore our works
          </Button>
        </div>

        {/* Three-Frame Portrait Gallery Composition (-10%) */}
        <div className="relative mt-8 flex w-full max-w-[1188px] items-end justify-center sm:mt-10 lg:mt-12">
          {/* Ambient soft warm studio glow behind frames */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-[8%] bottom-0 rounded-full bg-brown/10 blur-3xl"
          />

          {/* 1. Left: Framed portrait of a woman, rotated slightly counterclockwise */}
          <div className="relative z-10 w-[28.8%] max-w-[351px] shrink-0 translate-x-[12%] translate-y-[11%] -rotate-[6deg] overflow-hidden rounded-[2px] shadow-[0_20px_48px_rgba(28,25,21,0.26)] sm:w-[27%] sm:translate-x-[10%] lg:w-[26.1%]">
            <ArtworkImage
              artworkId="framed-woman"
              alt="Framed hand-drawn pencil portrait of a smiling woman"
              className="block aspect-[3/4] w-full scale-[1.06]"
              loading="eager"
            />
          </div>

          {/* 2. Center: Framed portrait of a child, upright and visually dominant */}
          <div className="relative z-20 w-[37.8%] max-w-[441px] shrink-0 translate-y-[8.5%] overflow-hidden rounded-[2px] shadow-[0_28px_64px_rgba(28,25,21,0.34)] sm:w-[35.1%] lg:w-[33.3%]">
            <ArtworkImage
              artworkId="framed-child"
              alt="Framed hand-drawn pencil portrait of a child"
              className="block aspect-[3/4] w-full scale-[1.14]"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* 3. Right: Framed family portrait, rotated slightly clockwise */}
          <div className="relative z-10 w-[28.8%] max-w-[351px] shrink-0 -translate-x-[12%] translate-y-[11%] rotate-[6deg] overflow-hidden rounded-[2px] shadow-[0_20px_48px_rgba(28,25,21,0.26)] sm:w-[27%] sm:-translate-x-[10%] lg:w-[26.1%]">
            <ArtworkImage
              artworkId="framed-family"
              alt="Framed hand-drawn family pencil portrait"
              className="block aspect-[3/4] w-full scale-[1.07]"
              loading="eager"
            />
          </div>
        </div>

        {/* Progressive bottom blur overlay confined to the hero artwork bottom region */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[28%] sm:h-[30%]"
        >
          <div
            className="absolute inset-0 backdrop-blur-[3px]"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 45%, black 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 45%, black 100%)',
            }}
          />
          <div
            className="absolute inset-0 backdrop-blur-[7px]"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.55) 65%, black 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.55) 65%, black 100%)',
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/55 to-paper backdrop-blur-[12px]"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 75%, black 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 75%, black 100%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

function How() {
  const steps = [
    {
      img: uploadImageIllustration,
      title: 'Share your image',
      desc: 'Choose a favourite moment you\u2019d love to turn into a portrait.',
    },
    {
      img: drawByHandIllustration,
      title: 'We draw it by hand',
      desc: 'Every portrait is crafted with care and attention.',
    },
    {
      img: lastingGiftIllustration,
      title: 'Give a lasting gift',
      desc: 'Receive a beautiful portrait they\u2019ll always treasure.',
    },
  ]

  return (
    <section id="how" className="box-border w-full bg-paper py-20 sm:py-28 lg:py-32 px-5 sm:px-8 lg:px-[62px]">
      <div className="w-full text-center">
        <Eyebrow className="text-xs sm:text-sm tracking-[0.2em]">How it works</Eyebrow>
        <h2 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.1] tracking-tight">
          Your photo, to their heart.
        </h2>
        <div className="mt-14 sm:mt-16 lg:mt-20 grid gap-10 sm:grid-cols-3 lg:gap-14 xl:gap-16">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="relative">
                <span className="absolute -left-2 -top-2 z-10 grid size-9 sm:size-10 place-items-center rounded-full bg-brown text-sm sm:text-base font-semibold text-white shadow-md ring-4 ring-paper">
                  {i + 1}
                </span>
                <div className="size-48 sm:size-56 md:size-60 lg:size-64 xl:size-72 rounded-full overflow-hidden border-2 border-line/80 bg-white shadow-md transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="mt-6 sm:mt-7 font-serif text-2xl sm:text-3xl lg:text-[32px] font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[280px] sm:max-w-[340px] text-base sm:text-lg leading-relaxed text-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Works({ go }: { go: (v: RouteId) => void }) {
  const slides: ArtworkId[] = ['framed-couple', 'framed-girl-crown', 'framed-family']
  const [i, setI] = useState(0)

  return (
    <section id="works" className="bg-ivory py-20 md:py-28">
      <Container className="grid items-center gap-12 md:grid-cols-[0.8fr_1.4fr]">
        <div>
          <Eyebrow>Our works</Eyebrow>
          <h2 className="mt-3 font-serif text-5xl leading-[1] md:text-6xl">
            Made from moments <em className="text-brown">that matter.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Real people. Real stories.
            <br />
            Hand-drawn with care.
          </p>
          <Button onClick={() => go('order')} className="mt-7 h-10 px-5">
            Explore our works <Icon name="arrow" />
          </Button>
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setI((i + 2) % slides.length)}
              className="text-muted hover:text-ink"
            >
              <Icon name="back" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setI((i + 1) % slides.length)}
              className="text-muted hover:text-ink"
            >
              <Icon name="arrow" />
            </button>
          </div>
        </div>
        <div>
          <div className="relative flex items-center justify-center gap-4 overflow-hidden">
            <ArtworkImage
              artworkId={slides[(i + 2) % slides.length]}
              alt="Portrait"
              className="hidden h-56 shrink-0 opacity-60 md:block"
            />
            <ArtworkImage
              artworkId={slides[i]}
              alt="Featured hand-drawn portrait"
              className="h-64 shrink-0 shadow-card md:h-80"
            />
            <ArtworkImage
              artworkId={slides[(i + 1) % slides.length]}
              alt="Portrait"
              className="hidden h-56 shrink-0 opacity-60 md:block"
            />
          </div>
          <div className="mt-6 flex justify-center gap-1.5">
            {slides.map((_, j) => (
              <span
                key={j}
                className={`h-1.5 rounded-full transition-all ${
                  j === i ? 'w-4 bg-brown' : 'w-1.5 bg-line-strong'
                }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="why" className="bg-sand/60 py-20 md:py-24">
      <Container className="text-center">
        <Eyebrow>What our customers say</Eyebrow>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Their words mean everything.</h2>
        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {TESTIMONIALS.map(item => (
            <figure key={item.id} className="rounded-lg border border-line bg-ivory p-6 shadow-card">
              <Stars count={item.rating} />
              <blockquote className="mt-4 text-sm leading-relaxed">{item.quote}</blockquote>
              <figcaption className="mt-5 text-xs font-medium">{item.customerName}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

function CreateSection({ go }: { go: (v: RouteId) => void }) {
  const { draft, pricing, selectPortraitType, selectSize } = useOrder()
  const availableSizes = getAvailableSizesForType(draft.configuration.portraitType)
  const field = 'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink'

  return (
    <section className="bg-paper py-20 md:py-28">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <Eyebrow>Create yours</Eyebrow>
          <h2 className="mt-3 font-serif text-5xl leading-[1] md:text-6xl">
            A gift they&rsquo;ll <em className="text-brown">always cherish.</em>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Upload your photo, choose your details and we&rsquo;ll take care of the rest.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-xs text-muted">
            {(
              [
                ['pen', 'Hand-drawn with care'],
                ['truck', 'Safe delivery across India'],
                ['heart', 'A meaningful gift, always'],
              ] as const
            ).map(([ic, l]) => (
              <div key={l}>
                <Icon name={ic} className="size-5 text-brown" />
                <p className="mt-2 leading-snug">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ivory p-5 shadow-card md:p-6">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <button
              type="button"
              onClick={() => go('order')}
              className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-line-strong bg-white text-center text-muted hover:bg-sand/40"
            >
              <Icon name="img" className="size-6" />
              <span className="mt-2 text-xs text-ink">Upload your photo</span>
              <span className="text-[11px]">JPG, PNG (max 10MB)</span>
            </button>
            <div className="space-y-2.5">
              <select
                aria-label="Select portrait type"
                value={draft.configuration.portraitType}
                onChange={e => selectPortraitType(e.target.value as PortraitTypeId)}
                className={field}
              >
                {PORTRAIT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <select
                aria-label="Select size"
                value={draft.configuration.size}
                onChange={e => selectSize(e.target.value as PortraitSizeId)}
                className={field}
              >
                {availableSizes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.dimensionsCm})
                  </option>
                ))}
              </select>
              <input className={field} placeholder="Your mobile number" />
              <input className={field} placeholder="Delivery address" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Estimated price</span>
              <span className="font-medium">{formatInr(pricing.totalAmountInr)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Pay now (advance)</span>
              <span>{formatInr(pricing.advancePayableInr)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Pay on delivery</span>
              <span>{formatInr(pricing.remainingOnDeliveryInr)}</span>
            </div>
          </div>
          <Button onClick={() => go('order')} className="mt-5 h-11 w-full">
            Create my portrait <Icon name="arrow" />
          </Button>
          <div className="mt-4 flex justify-center gap-6 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Icon name="lock" className="size-3" />
              Secure payment
            </span>
            <span className="flex items-center gap-1">
              <Icon name="truck" className="size-3" />
              7–10 days delivery
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Footer({ go }: { go: (v: RouteId) => void }) {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo onClick={() => go('home')} />
          <p className="mt-2 text-xs text-muted">Hand-drawn portraits for your special moments.</p>
        </div>
        <nav className="flex gap-6 text-sm text-muted">
          <a href="#how">Home</a>
          <a href="#why">Why us</a>
          <a href="#works">Our works</a>
          <button type="button" onClick={() => go('system')} className="hover:text-ink">
            Design system
          </button>
        </nav>
      </Container>
    </footer>
  )
}

/* ---------- Order Flow Steps (Temporary Compatibility Adapter using Phase 1 Domain) ---------- */
function Step1() {
  const { draft, selectPortraitType, setUploadedPhotoUrl, selectSamplePhoto } = useOrder()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    const check = validatePhotoFile(file)
    if (!check.valid) {
      setUploadError(check.error ?? 'Invalid file')
      return
    }
    setUploadError(null)
    setUploadedPhotoUrl(URL.createObjectURL(file), {
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
    })
  }

  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">
        Let&rsquo;s begin with your <em className="text-brown">favourite</em> photo.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Upload a clear photo and choose the type of portrait you&rsquo;d like.
      </p>
      <section className="mt-8">
        <SectionTitle n={1}>Upload your photo</SectionTitle>
        <div className="grid gap-5 rounded-xl bg-sand/50 p-4 sm:grid-cols-[1.1fr_1fr]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-white p-4 text-center hover:bg-ivory"
          >
            {draft.photo.sourceType === 'upload' && draft.photo.previewUrl ? (
              <img
                src={draft.photo.previewUrl}
                alt="Selected photo"
                className="max-h-32 rounded object-contain"
              />
            ) : draft.photo.sourceType === 'sample' && draft.photo.sampleArtworkId ? (
              <ArtworkImage
                artworkId={draft.photo.sampleArtworkId}
                className="max-h-32 rounded object-contain"
              />
            ) : (
              <>
                <Icon name="img" className="size-6 text-muted" />
                <span className="mt-2 text-sm">Tap to upload</span>
                <span className="text-xs text-muted">JPG, PNG (max 10MB)</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={e => handleFileChange(e.target.files?.[0])}
          />
          <div className="self-center text-xs text-muted">
            <p className="mb-3 text-ink">A few tips for best results</p>
            {['Use a clear, well lit photo', 'Avoid heavy filters', 'Make sure faces are visible'].map(t => (
              <p key={t} className="mb-2 flex items-center gap-2">
                <Icon name="check" className="size-3.5 text-brown" />
                {t}
              </p>
            ))}
          </div>
        </div>
        {uploadError && (
          <p role="alert" className="mt-2 text-xs text-error">
            {uploadError}
          </p>
        )}
        <p className="mb-2 mt-5 text-xs text-muted">Or try a sample</p>
        <div className="grid grid-cols-5 gap-2">
          {SAMPLE_PHOTOS.map(s => {
            const isSelected =
              draft.photo.sourceType === 'sample' && draft.photo.sampleArtworkId === s.artworkId
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => selectSamplePhoto(s.artworkId)}
                className={`overflow-hidden rounded-md ${isSelected ? 'ring-2 ring-brown' : ''}`}
              >
                <ArtworkImage artworkId={s.artworkId} alt={s.label} className="aspect-[6/5] w-full" />
              </button>
            )
          })}
          <button
            type="button"
            className="flex flex-col items-center justify-center rounded-md border border-line bg-white text-[11px] text-muted"
          >
            <Icon name="img" />
            View more
          </button>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle n={2}>Choose portrait type</SectionTitle>
        <div className="space-y-2.5">
          {PORTRAIT_TYPES.map(t => {
            const isSelected = draft.configuration.portraitType === t.id
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => selectPortraitType(t.id)}
                className={`flex w-full items-center gap-4 p-2.5 pr-4 ${selCls(isSelected)}`}
                aria-pressed={isSelected}
              >
                <ArtworkImage
                  artworkId={t.artworkId}
                  alt={t.title}
                  className="aspect-[13/9] w-20 shrink-0 rounded"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{t.title}</span>
                  <span className="text-xs text-muted">{t.description}</span>
                </span>
                <Radio on={isSelected} />
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

function Step2() {
  const { draft, selectSize, selectFinish } = useOrder()
  const { portraitType, size: selectedSize, finish: selectedFinish } = draft.configuration
  const availableSizes = getAvailableSizesForType(portraitType)
  const framingDiff = getFramingPriceDifferenceInr(portraitType, selectedSize)

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">
            Make it <em className="text-brown">yours.</em>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Choose the size and finish to match your style and space.
          </p>
        </div>
        <div className="text-center">
          <ArtworkImage
            artworkId={draft.photo.sampleArtworkId ?? 'raw-child-sketch'}
            alt="Your photo"
            className="aspect-square w-20 rounded-md md:w-24"
          />
          <p className="mt-1 text-[11px]">Your photo</p>
          <p className="text-[11px] text-muted">Change</p>
        </div>
      </div>
      <section className="mt-8">
        <SectionTitle
          n={1}
          right={
            <span className="flex items-center gap-1 text-xs text-muted">
              <Icon name="ruler" className="size-3.5" />
              Size guide
            </span>
          }
        >
          Choose your size
        </SectionTitle>
        <div
          className={`grid grid-cols-1 gap-3 ${
            availableSizes.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
          }`}
        >
          {availableSizes.map(s => {
            const isSelected = selectedSize === s.id
            const unframedPrice = getVariantPriceInr(portraitType, s.id, 'unframed')
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => selectSize(s.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col p-3 ${selCls(isSelected)}`}
              >
                <span className="flex justify-between">
                  <span className="text-sm font-medium">{s.id}</span>
                  {isSelected ? <CheckDot /> : <Radio on={false} />}
                </span>
                <span className="text-[11px] text-muted">{s.dimensionsCm}</span>
                <span className="relative my-4 grid h-20 place-items-center">
                  <span
                    className={`${s.illustrationWidthClass} aspect-[1/1.41] border border-line bg-paper shadow-sm`}
                  />
                  {s.badge && (
                    <span className="absolute bottom-0 rounded-full bg-brown px-2 py-0.5 text-[10px] text-white">
                      {s.badge}
                    </span>
                  )}
                </span>
                <span className="font-serif text-2xl">{formatInr(unframedPrice)}</span>
                <span className="text-[11px] text-muted">{s.description}</span>
              </button>
            )
          })}
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle
          n={2}
          right={
            <span className="flex items-center gap-1 text-xs text-muted">
              <Icon name="info" className="size-3.5" />
              About our finishes
            </span>
          }
        >
          Choose your finish
        </SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FINISH_OPTIONS.map((f: { id: FinishOptionId; title: string; description: string; artworkId: ArtworkId }) => {
            const isSelected = selectedFinish === f.id
            const variantPrice = getVariantPriceInr(portraitType, selectedSize, f.id)
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => selectFinish(f.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col p-2.5 ${selCls(isSelected)}`}
              >
                <span className="absolute right-3 top-3 z-10">
                  {isSelected ? <CheckDot /> : <Radio on={false} />}
                </span>
                <ArtworkImage
                  artworkId={f.artworkId}
                  alt={f.title}
                  className="aspect-[3/2] w-full rounded"
                />
                <span className="mt-3 text-sm font-medium">{f.title}</span>
                <span className="text-[11px] text-muted">{f.description}</span>
                <span className="mt-2 font-serif text-lg text-brown">
                  {f.id === 'unframed'
                    ? `Included (${formatInr(variantPrice)})`
                    : `${formatInr(variantPrice)} (+ ${formatInr(framingDiff)})`}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-sand/60 px-4 py-3 text-xs text-muted">
          <Icon name="gift" className="size-4" />
          All portraits are hand-drawn with care. Colours may slightly vary from the preview.
        </p>
      </section>
    </>
  )
}

function Step3({ errors }: { errors: DeliveryValidationErrors }) {
  const { draft, updateDelivery } = useOrder()
  const d: DeliveryDetails = draft.delivery

  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">
        Where should we send <em className="text-brown">your portrait?</em>
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Add your details so we can deliver it safely and on time.
      </p>
      <section className="mt-8">
        <SectionTitle n={1}>Contact information</SectionTitle>
        <div className="space-y-3">
          <Field
            icon="user"
            label="Full name"
            value={d.fullName}
            onChange={v => updateDelivery({ fullName: v })}
            placeholder="Enter your full name"
            error={errors.fullName}
          />
          <Field
            icon="phone"
            label="Mobile number"
            value={d.mobile}
            onChange={v => updateDelivery({ mobile: v })}
            placeholder="+91 98765 43210"
            error={errors.mobile}
          />
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle
          n={2}
          right={
            <span className="flex items-center gap-1 text-xs text-brown underline">
              <Icon name="pin" className="size-3.5" />
              Use current location
            </span>
          }
        >
          Delivery address
        </SectionTitle>
        <div className="space-y-3">
          <Field
            icon="pin"
            label="Address"
            value={d.addressLine}
            onChange={v => updateDelivery({ addressLine: v })}
            placeholder="House no., street, area"
            error={errors.addressLine}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              icon="city"
              label="City"
              value={d.city}
              onChange={v => updateDelivery({ city: v })}
              placeholder="e.g. Coimbatore"
              error={errors.city}
            />
            <Field
              icon="bank"
              label="State"
              value={d.state}
              onChange={v => updateDelivery({ state: v })}
              placeholder="e.g. Tamil Nadu"
              error={errors.state}
            />
          </div>
          <Field
            icon="note"
            label="Pincode"
            value={d.pincode}
            onChange={v => updateDelivery({ pincode: sanitizePincodeInput(v) })}
            placeholder="Enter 6 digit pincode"
            error={errors.pincode}
            className="sm:w-1/2"
          />
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle n={3}>
          Delivery instructions <span className="text-sm font-normal text-muted">(optional)</span>
        </SectionTitle>
        <div className="rounded-lg border border-line bg-white p-3 focus-within:border-brown">
          <textarea
            value={d.instructions}
            maxLength={200}
            onChange={e => updateDelivery({ instructions: e.target.value })}
            rows={3}
            placeholder="e.g. Best time to deliver, nearby landmark, etc."
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted/70"
          />
          <p className="text-right text-[11px] text-muted">{d.instructions.length}/200</p>
        </div>
      </section>
    </>
  )
}

function Step4({ edit }: { edit: (s: CheckoutStepIndex) => void }) {
  const { draft, pricing, selectPaymentMethod } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)

  const Edit = ({ to }: { to: CheckoutStepIndex }) => (
    <button
      type="button"
      onClick={() => edit(to)}
      className="flex items-center gap-1 text-xs text-brown"
    >
      Edit <Icon name="pen" className="size-3" />
    </button>
  )

  return (
    <>
      <h1 className="font-serif text-[42px] leading-[1.02] md:text-5xl">
        Almost there!
        <br />
        Let&rsquo;s <em className="text-brown">make it official.</em>
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Review your order and complete the advance payment to confirm.
      </p>
      <section className="mt-8">
        <SectionTitle n={1} right={<Edit to={1} />}>
          Order summary
        </SectionTitle>
        <div className="divide-y divide-line rounded-lg border border-line bg-white">
          <div className="flex items-center gap-4 p-3">
            <ArtworkImage artworkId={t.artworkId} alt={t.title} className="aspect-[13/9] w-14 rounded" />
            <div className="flex-1">
              <p className="text-sm font-medium">Portrait type</p>
              <p className="text-xs text-muted">{t.title}</p>
            </div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-4 p-3">
            <span className="grid w-14 place-items-center">
              <span className="aspect-[1/1.41] w-6 border border-line bg-paper" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Size</p>
              <p className="text-xs text-muted">
                {s.id} ({s.dimensionsCm})
              </p>
            </div>
            <span className="text-sm">{formatInr(pricing.unframedBasePriceInr)}</span>
          </div>
          <div className="flex items-center gap-4 p-3">
            <ArtworkImage artworkId={f.artworkId} alt={f.title} className="aspect-[3/2] w-14 rounded" />
            <div className="flex-1">
              <p className="text-sm font-medium">Finish</p>
              <p className="text-xs text-muted">{f.title}</p>
            </div>
            <span className="text-sm">
              {pricing.framingDiffInr > 0 ? `+ ${formatInr(pricing.framingDiffInr)}` : 'Included'}
            </span>
          </div>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle n={2}>Price details</SectionTitle>
        <div className="space-y-2 text-sm">
          <Row l={`${t.title} (${s.id}, ${f.shortLabel})`} v={formatInr(pricing.productPriceInr)} />
          <Row
            l="Shipping"
            v={pricing.shippingFeeInr > 0 ? formatInr(pricing.shippingFeeInr) : 'Included'}
          />
          <div className="flex justify-between border-t border-line pt-3 font-medium">
            <span>Total amount</span>
            <span>{formatInr(pricing.totalAmountInr)}</span>
          </div>
          <div className="rounded-lg bg-sand/70 p-3 text-sm">
            <div className="flex justify-between font-medium">
              <span>Pay now (advance)</span>
              <span>{formatInr(pricing.advancePayableInr)}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted">
              <span>Pay on delivery (remaining)</span>
              <span>{formatInr(pricing.remainingOnDeliveryInr)}</span>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted">
            <Icon name="info" className="size-3.5" />
            The remaining amount will be collected on delivery.
          </p>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle n={3}>Choose payment method</SectionTitle>
        <div className="space-y-2.5" role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map(pm => {
            const isSelected = draft.paymentMethod === pm.id
            return (
              <button
                type="button"
                key={pm.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => selectPaymentMethod(pm.id)}
                className={`flex w-full items-center gap-3 p-3 ${selCls(isSelected)}`}
              >
                <Radio on={isSelected} />
                <Icon name={pm.iconName} className="size-5 text-brown" />
                <span>
                  <span className="block text-sm font-medium">{pm.title}</span>
                  <span className="text-xs text-muted">{pm.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

function Aside({ step, edit }: { step: CheckoutStepIndex; edit: (s: CheckoutStepIndex) => void }) {
  const { draft, pricing } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)
  const d = draft.delivery

  const perks = [
    ['shield', 'Safe and secure delivery', 'across India'],
    ['heart', 'Handle with care', 'packaging'],
    ['gift', 'A meaningful gift,', 'always'],
  ] as const

  if (step < 2) {
    return (
      <Card className="p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Your order</p>
        <ArtworkImage
          artworkId={step === 0 ? t.artworkId : t.previewArtworkId}
          alt="Portrait preview"
          className="mt-4 w-full rounded-md"
        />
        <div className="mt-4 space-y-2 text-sm">
          <Row l="Portrait type" v={t.title} />
          {step === 1 && (
            <>
              <Row l="Size" v={s.id} />
              <Row l="Finish" v={f.title} />
            </>
          )}
        </div>
        {step === 1 && (
          <div className="mt-4 flex justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">Estimated price</span>
            <span className="font-serif text-2xl">{formatInr(pricing.productPriceInr)}</span>
          </div>
        )}
      </Card>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <ArtworkImage
              artworkId="raw-child-sketch"
              alt="Portrait preview"
              className="aspect-square w-20 rounded-md"
            />
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">Your order</p>
              <button type="button" onClick={() => edit(1)} className="text-xs text-brown">
                Edit
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row l="Portrait type" v={t.title} />
            <Row l="Size" v={`${s.id} (${s.dimensionsCm})`} />
            <Row l="Finish" v={f.title} />
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
            <span className="text-muted">Price</span>
            <span className="font-medium">{formatInr(pricing.productPriceInr)}</span>
          </div>
          <div className="mt-4 flex gap-3 rounded-lg bg-sand/70 p-3">
            <Icon name="truck" className="size-5 text-brown" />
            <div className="text-xs">
              <p className="text-muted">Estimated delivery</p>
              <p className="text-sm font-medium">7–10 days</p>
              <p className="text-muted">from order confirmation</p>
            </div>
          </div>
        </Card>
        <Card className="space-y-4 p-5">
          {perks.map(([ic, a, b]) => (
            <div key={a} className="flex gap-3 text-xs text-muted">
              <Icon name={ic} className="size-5 text-brown" />
              <p>
                {a}
                <br />
                {b}
              </p>
            </div>
          ))}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Preview</span>
          <button type="button" onClick={() => edit(1)} className="text-xs text-brown">
            Edit
          </button>
        </div>
        <ArtworkImage
          artworkId={t.previewArtworkId}
          alt="Portrait preview"
          className="mt-3 w-full rounded-md"
        />
        <p className="mt-3 flex gap-2 text-[11px] text-muted">
          <Icon name="info" className="size-3.5 shrink-0" />
          This is a preview. The final artwork may have slight variations as it is hand-drawn.
        </p>
      </Card>
      <Card className="p-5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Delivery to</span>
          <button type="button" onClick={() => edit(2)} className="text-xs text-brown">
            Edit
          </button>
        </div>
        <div className="mt-3 flex gap-2 text-xs text-muted">
          <Icon name="pin" className="size-4 shrink-0 text-brown" />
          <p>
            <span className="font-medium text-ink">{d.fullName || 'Thoufik Umer A'}</span>
            <br />
            {d.addressLine || '23C/379, Sri Eshwar College of Engineering'}, {d.city || 'Coimbatore'},{' '}
            {d.state || 'Tamil Nadu'} – {d.pincode || '641202'}
            <br />
            {d.mobile || '+91 98765 43210'}
          </p>
        </div>
      </Card>
      <Card className="space-y-4 p-5">
        {(
          [
            ['truck', 'Estimated delivery', '7–10 days'],
            ['shield', 'Safe and secure payment', '100% secure transactions'],
            ['gift', 'A meaningful gift', 'Hand-drawn with care'],
            ['box', 'Pan India delivery', 'Tracked and insured'],
          ] as const
        ).map(([ic, a, b]) => (
          <div key={a} className="flex gap-3 text-xs">
            <Icon name={ic} className="size-5 text-brown" />
            <p className="text-muted">
              <span className="text-ink">{a}</span>
              <br />
              {b}
            </p>
          </div>
        ))}
      </Card>
    </div>
  )
}

function OrderFlow({ go }: { go: (v: RouteId) => void }) {
  const { draft, step, setStep, pricing } = useOrder()
  const [errors, setErrors] = useState<DeliveryValidationErrors>({})

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const next = () => {
    if (step === 2) {
      const validation = validateDeliveryDetails(draft.delivery)
      setErrors(validation.errors)
      if (!validation.valid) return
    }
    if (step === 3) {
      go('confirm')
      return
    }
    setStep((step + 1) as CheckoutStepIndex)
  }

  const footer = [
    { l: null, cta: 'Continue to next step' },
    {
      l: ['Estimated price', formatInr(pricing.productPriceInr), null] as const,
      cta: 'Continue to next step',
    },
    {
      l: ['Total amount', formatInr(pricing.totalAmountInr), '(Advance payment at next step)'] as const,
      cta: 'Continue to review',
    },
    {
      l: [
        'Total amount',
        formatInr(pricing.totalAmountInr),
        `You'll pay ${formatInr(pricing.advancePayableInr)} now (advance)`,
      ] as const,
      cta: `Place order and pay ${formatInr(pricing.advancePayableInr)}`,
    },
  ][step]

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sand/60">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Logo onClick={() => go('home')} />
          <Icon name="bag" className="size-5" />
        </Container>
      </header>
      <Container className="pb-40 pt-8">
        <div className="mx-auto max-w-2xl">
          <ProgressStepper step={step} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <main className="min-w-0">
            {step === 0 && <Step1 />}
            {step === 1 && <Step2 />}
            {step === 2 && <Step3 errors={errors} />}
            {step === 3 && <Step4 edit={setStep} />}
          </main>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Aside step={step} edit={setStep} />
          </aside>
        </div>
      </Container>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 backdrop-blur">
        <Container className="flex items-center justify-between gap-4 py-3.5">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as CheckoutStepIndex)}
                aria-label="Back"
                className="grid size-10 place-items-center rounded-md border border-line-strong hover:bg-sand"
              >
                <Icon name="back" />
              </button>
            )}
            {footer.l && (
              <div>
                <p className="text-xs text-muted">{footer.l[0]}</p>
                <p className="font-serif text-2xl leading-none md:text-3xl">{footer.l[1]}</p>
                {footer.l[2] && <p className="text-[11px] text-muted">{footer.l[2]}</p>}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={next} className="h-11 px-5 md:min-w-[260px]">
              {footer.cta} <Icon name="arrow" />
            </Button>
            {step === 3 && (
              <p className="flex items-center gap-1 text-[10px] text-muted">
                <Icon name="lock" className="size-3" />
                Secure payment (prototype — no real charge)
              </p>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}

/* ---------- Post-order ---------- */
function PostOrder({ mode, go }: { mode: 'confirm' | 'track'; go: (v: RouteId) => void }) {
  const { draft, pricing } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sand/60">
      <header className="border-b border-line/70">
        <Container className="flex h-16 items-center justify-between">
          <Logo onClick={() => go('home')} />
          <Icon name="bag" className="size-5" />
        </Container>
      </header>
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main>
          {mode === 'confirm' ? (
            <>
              <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                <Icon name="check" className="size-7" />
              </span>
              <h1 className="mt-6 font-serif text-5xl leading-[1.02]">
                Thank you! Your order is <em className="text-brown">confirmed.</em>
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted">
                We&rsquo;ve received your advance payment. Our artist will begin your portrait shortly.
              </p>
              <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
                <Card className="p-4">
                  <p className="text-xs text-muted">Order reference</p>
                  <p className="mt-1 font-medium">TSH-240518</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted">Estimated delivery</p>
                  <p className="mt-1 font-medium">7–10 days</p>
                </Card>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => go('track')} className="h-11 px-6">
                  Track your order <Icon name="arrow" />
                </Button>
                <Button variant="secondary" onClick={() => go('home')} className="h-11 px-6">
                  Back to home
                </Button>
              </div>
            </>
          ) : (
            <>
              <Eyebrow>Order TSH-240518</Eyebrow>
              <h1 className="mt-3 font-serif text-5xl leading-[1.02]">
                Your portrait is <em className="text-brown">in progress.</em>
              </h1>
              <p className="mt-3 text-sm text-muted">Current status: Drawing in progress</p>
              <Card className="mt-8 max-w-lg p-6">
                <OrderTimeline current={2} />
              </Card>
            </>
          )}
        </main>
        <aside className="space-y-4">
          <Card className="p-5">
            <ArtworkImage
              artworkId={t.previewArtworkId}
              alt="Portrait preview"
              className="w-full rounded-md"
            />
            <div className="mt-4 space-y-2 text-sm">
              <Row l="Portrait type" v={t.title} />
              <Row l="Size" v={s.id} />
              <Row l="Finish" v={f.title} />
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
              <Row l="Total amount" v={formatInr(pricing.totalAmountInr)} />
              <Row l="Paid (advance)" v={formatInr(pricing.advancePayableInr)} />
              <Row l="Pay on delivery" v={formatInr(pricing.remainingOnDeliveryInr)} />
            </div>
          </Card>
          {mode === 'confirm' && (
            <Card className="p-5">
              <p className="mb-4 text-sm font-medium">Order progress</p>
              <OrderTimeline current={1} />
            </Card>
          )}
        </aside>
      </Container>
    </div>
  )
}

/* ---------- Design system reference ---------- */
function System({ go }: { go: (v: RouteId) => void }) {
  const colors = [
    ['ink', '#1C1915'],
    ['paper', '#F7F3EC'],
    ['ivory', '#FBF8F3'],
    ['sand', '#EFE7DB'],
    ['brown', '#8B6A4B'],
    ['brown-hover', '#7A5B3F'],
    ['brown-pressed', '#664A32'],
    ['line', '#E6DED2'],
    ['line-strong', '#D4C8B7'],
    ['muted', '#7A7168'],
    ['disabled', '#C9C1B6'],
    ['success', '#4F7A52'],
    ['error', '#B4483B'],
  ]
  const type = [
    ['Display', 'font-serif text-[80px] leading-none', 'Serif 80/0.98'],
    ['Section heading', 'font-serif text-5xl', 'Serif 48/1.1'],
    ['Page heading', 'font-serif text-[42px]', 'Serif 42/1.02'],
    ['Card heading', 'text-[17px] font-medium', 'Inter 17 Medium'],
    ['Body large', 'text-[15px]', 'Inter 15/1.6'],
    ['Body', 'text-sm', 'Inter 14/1.5'],
    ['Small / helper', 'text-xs text-muted', 'Inter 12'],
    ['Price', 'font-serif text-2xl', 'Serif 24'],
    ['Eyebrow', 'text-[11px] uppercase tracking-[0.18em] text-brown', 'Inter 11 / 0.18em'],
  ]

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <Container className="flex h-16 items-center justify-between">
          <Logo onClick={() => go('home')} />
          <span className="text-sm text-muted">Design system</span>
        </Container>
      </header>
      <Container className="space-y-16 py-14">
        <section>
          <Eyebrow>Colour</Eyebrow>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {colors.map(([n, h]) => (
              <div key={n}>
                <div className="h-16 rounded-lg border border-line" style={{ background: h }} />
                <p className="mt-2 text-xs font-medium">{n}</p>
                <p className="text-[11px] text-muted">{h}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <Eyebrow>Typography</Eyebrow>
          <div className="mt-5 divide-y divide-line">
            {type.map(([n, c, s]) => (
              <div key={n} className="grid items-baseline gap-2 py-4 md:grid-cols-[180px_1fr]">
                <p className="text-xs text-muted">
                  {n} · {s}
                </p>
                <p className={`${c} truncate`}>
                  Some moments <em>deserve</em> more
                </p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <Eyebrow>Radius · spacing · shadow</Eyebrow>
          <div className="mt-5 flex flex-wrap gap-6 text-xs text-muted">
            {[
              ['sm 4', 'rounded'],
              ['md 6', 'rounded-md'],
              ['lg 8', 'rounded-lg'],
              ['xl 12', 'rounded-xl'],
              ['full', 'rounded-full'],
            ].map(([l, c]) => (
              <div key={l}>
                <div className={`size-16 border border-line-strong bg-ivory ${c}`} />
                <p className="mt-2">{l}</p>
              </div>
            ))}
            <div>
              <div className="size-16 rounded-xl bg-ivory shadow-card" />
              <p className="mt-2">shadow-card</p>
            </div>
            <p className="self-center">
              Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 40 · 56 · 80 · 112 px. Breakpoints: mobile
              360–767, tablet 768–1023, desktop ≥1024.
            </p>
          </div>
        </section>
        <section>
          <Eyebrow>Buttons & controls</Eyebrow>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button className="h-11 px-5">
              Primary <Icon name="arrow" />
            </Button>
            <Button variant="secondary" className="h-11 px-5">
              Secondary
            </Button>
            <Button disabled className="h-11 px-5">
              Disabled
            </Button>
            <Radio on />
            <Radio on={false} />
            <CheckDot />
            <StepNum n={1} />
          </div>
          <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
            <Field
              icon="user"
              label="Default"
              value=""
              onChange={() => {}}
              placeholder="Enter your full name"
            />
            <Field
              icon="phone"
              label="Error"
              value="98"
              onChange={() => {}}
              placeholder=""
              error="Enter a valid 10-digit mobile number"
            />
          </div>
        </section>
        <section>
          <Eyebrow>Progress states</Eyebrow>
          <div className="mt-5 max-w-2xl space-y-6">
            {[0, 2, 3].map(n => (
              <ProgressStepper key={n} step={n} />
            ))}
          </div>
        </section>
        <section>
          <Eyebrow>Tracking</Eyebrow>
          <Card className="mt-5 max-w-sm p-6">
            <OrderTimeline current={2} />
          </Card>
        </section>
      </Container>
    </div>
  )
}

/* ---------- App Shell & Centralized Router ---------- */
function AppRouter() {
  const [route, setRoute] = useState<RouteId>(() =>
    typeof window !== 'undefined' ? resolveRouteFromPath(window.location.pathname) : 'home',
  )
  const { setStep } = useOrder()

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.title = ROUTES[route].title
  }, [route])

  const go = (nextRoute: RouteId) => {
    if (nextRoute === 'order') setStep(0)
    setRoute(nextRoute)
    const targetPath = ROUTES[nextRoute].path
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ route: nextRoute }, '', targetPath)
    }
    window.scrollTo(0, 0)
  }

  if (route === 'order') return <OrderFlow go={go} />
  if (route === 'confirm' || route === 'track') return <PostOrder mode={route} go={go} />
  if (route === 'system') return <System go={go} />

  return (
    <>
      <Header go={go} />
      <Hero go={go} />
      <How />
      <Works go={go} />
      <Testimonials />
      <CreateSection go={go} />
      <Footer go={go} />
    </>
  )
}

export default function App() {
  return (
    <OrderProvider>
      <AppRouter />
    </OrderProvider>
  )
}
