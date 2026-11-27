import { useEffect, useRef, useState } from "react"

import {
  type RouteId,
  ROUTES,
  resolveRouteFromPath,
  type CheckoutStepIndex,
} from "./config/routes"

import { type ArtworkId } from "./domain/artworkRegistry"

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
} from "./domain/catalogue"

import { PAYMENT_METHODS, type DeliveryDetails } from "./domain/order"

import {
  formatInr,
  getFramingPriceDifferenceInr,
  getVariantPriceInr,
} from "./domain/pricing"

import {
  sanitizePincodeInput,
  validateDeliveryDetails,
  validatePhotoFile,
  type DeliveryValidationErrors,
} from "./domain/validation"

import { OrderProvider, useOrder } from "./state/OrderContext"

import {
  orderRepository,
  type CreateOrderInput,
  type CustomerTrackingOutput,
} from "./infrastructure/supabase/repositories/OrderRepository"

import { photoStorageService } from "./infrastructure/supabase/storage/PhotoStorageService"

declare global {
  interface Window {
    Razorpay?: any
  }
}

import Button from "./components/ui/Button"

import Card from "./components/ui/Card"

import CheckDot from "./components/ui/CheckDot"

import Eyebrow from "./components/ui/Eyebrow"

import Field from "./components/ui/Field"

import Icon from "./components/ui/Icon"

import Logo from "./components/ui/Logo"

import Radio from "./components/ui/Radio"

import SectionTitle from "./components/ui/SectionTitle"

import Stars from "./components/ui/Stars"

import StepNum from "./components/ui/StepNum"

import Container from "./components/layout/Container"

import ArtworkImage from "./components/shared/ArtworkImage"

import OrderTimeline from "./components/shared/OrderTimeline"

import ProgressStepper from "./components/shared/ProgressStepper"

import uploadImageIllustration from "./assets/Other assets/Upload image.svg"

import drawByHandIllustration from "./assets/Other assets/we draw by hand.svg"

import lastingGiftIllustration from "./assets/Other assets/Gift to your loved one.svg"

const selCls = (on: boolean) =>
  `rounded-lg border text-left transition-colors ${
    on
      ? "border-primary bg-surface-subtle ring-1 ring-primary"
      : "border-border bg-white hover:border-border-strong hover:bg-surface-subtle/50"
  }`

const Row = ({ l, v }: { l: string; v: string }) => (
  <div className="flex justify-between">
    <span className="text-text-secondary">{l}</span>
    <span className="text-primary font-medium">{v}</span>
  </div>
)

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)

  if (el) {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",

      block: "start",
    })
  }
}

/* ---------- Homepage ---------- */

function Header({ go }: { go: (v: RouteId) => void }) {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,

    targetId: string,
  ) => {
    e.preventDefault()

    scrollToSection(targetId)

    if (
      typeof window !== "undefined" &&
      window.location.hash !== `#${targetId}`
    ) {
      window.history.pushState(null, "", `#${targetId}`)
    }
  }

  return (
    <header className="sticky top-0 z-[1000] isolate box-border w-full border-b border-border bg-bg-primary/95 backdrop-blur">
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1300px] items-center justify-between px-5 sm:min-h-[66px] sm:px-8 lg:min-h-[72px] lg:px-12">
        <Logo
          onClick={() => go("home")}
          className="text-[17px] font-medium lg:text-[19px]"
        />
        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-[15px] font-medium whitespace-nowrap text-text-secondary sm:flex lg:gap-9"
        >
          <a
            href="#how"
            onClick={(e) => handleNavClick(e, "how")}
            className="transition-colors hover:text-primary"
          >
            Home
          </a>
          <a
            href="#why"
            onClick={(e) => handleNavClick(e, "why")}
            className="transition-colors hover:text-primary"
          >
            Why us
          </a>
          <a
            href="#works"
            onClick={(e) => handleNavClick(e, "works")}
            className="transition-colors hover:text-primary"
          >
            Our works
          </a>
        </nav>
        <Button
          variant="nav-glass"
          onClick={() => go("order")}
          className="h-9 px-4 text-sm font-medium sm:h-10 sm:px-5 lg:h-10.5 lg:px-6 lg:text-[15px]"
        >
          Order now
        </Button>
      </div>
    </header>
  )
}

function Hero({ go }: { go: (v: RouteId) => void }) {
  const scrollToWorks = () => {
    scrollToSection("works")
  }

  return (
    <section
      id="home"
      className="relative isolate z-10 overflow-hidden bg-bg-primary scroll-mt-0"
    >
      <div className="mx-auto flex w-full max-w-[1300px] flex-col items-center px-5 pt-4 pb-0 sm:px-8 sm:pt-6 lg:px-12 lg:pt-[clamp(1.25rem,2.5vh,2rem)]">
        {/* Top Header & Interaction Group */}
        <div className="flex flex-col items-center text-center">
          {/* 1. Centered Editorial Headline: clamp(40px, 4.2vw, 68px) */}
          <h1 className="mx-auto max-w-[18ch] text-center font-serif text-[clamp(2.5rem,4.2vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-primary md:max-w-none">
            <span className="md:block md:whitespace-nowrap">
              Turning your timeless moments
            </span>{" "}
            <span className="md:block md:whitespace-nowrap">
              into beautiful{" "}
              <em className="font-serif italic text-primary">
                <span className="champagne-shimmer">keepsake</span>.
              </em>
            </span>
          </h1>

          {/* 2. Brand tags: comfortable breathing room from headline */}
          <div className="mt-[clamp(0.95rem,1.8vh,1.35rem)] flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-[#9B793E]">
            <span>Cherished</span>
            <span className="text-[#C6A66B]/50 select-none text-[10px]" aria-hidden="true">
              ·
            </span>
            <span>Beloved</span>
            <span className="text-[#C6A66B]/50 select-none text-[10px]" aria-hidden="true">
              ·
            </span>
            <span>Eternal</span>
          </div>

          {/* 3. Primary & Secondary CTAs: separated with equal breathing room */}
          <div className="mt-[clamp(1.15rem,2.2vh,1.55rem)] flex flex-wrap items-center justify-center gap-3 sm:gap-3.5">
            <Button
              variant="hero-cta"
              onClick={() => go("order")}
              className="h-10.5 px-5.5 text-sm font-medium sm:h-11 sm:px-6 sm:text-[15px]"
            >
              Create your portrait <Icon name="arrow" className="size-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={scrollToWorks}
              className="h-10.5 px-5.5 text-sm font-medium sm:h-11 sm:px-6 sm:text-[15px]"
            >
              Explore our works
            </Button>
          </div>
        </div>

        {/* 4. Three-Frame Portrait Gallery Composition: moved upward with controlled, balanced gap */}
        <div className="relative mt-[clamp(1.65rem,3.2vh,2.5rem)] flex w-full max-w-[820px] items-end justify-center">
          {/* Ambient soft warm studio glow behind frames */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-[6%] bottom-0 rounded-full bg-accent/20 blur-3xl"
          />

          {/* 1. Left: Framed portrait of a woman */}
          <div className="relative z-10 w-[26%] max-w-[215px] shrink-0 translate-x-[10%] translate-y-[4%] -rotate-[6deg] overflow-hidden rounded-[2px] shadow-[0_14px_32px_rgba(28,25,21,0.20)] sm:w-[25%] lg:w-[24%]">
            <ArtworkImage
              artworkId="framed-woman"
              alt="Framed hand-drawn pencil portrait of a smiling woman"
              className="block aspect-[3/4] w-full scale-[1.04]"
              loading="eager"
            />
          </div>

          {/* 2. Center: Framed portrait of a child (Prominent Hero Anchor) */}
          <div className="relative z-20 w-[34%] max-w-[285px] shrink-0 translate-y-[2%] overflow-hidden rounded-[2px] shadow-[0_20px_44px_rgba(28,25,21,0.26)] sm:w-[33%] lg:w-[32%]">
            <ArtworkImage
              artworkId="framed-child"
              alt="Framed hand-drawn pencil portrait of a child"
              className="block aspect-[3/4] w-full scale-[1.06]"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* 3. Right: Framed family portrait */}
          <div className="relative z-10 w-[26%] max-w-[215px] shrink-0 -translate-x-[10%] translate-y-[4%] rotate-[6deg] overflow-hidden rounded-[2px] shadow-[0_14px_32px_rgba(28,25,21,0.20)] sm:w-[25%] lg:w-[24%]">
            <ArtworkImage
              artworkId="framed-family"
              alt="Framed hand-drawn family pencil portrait"
              className="block aspect-[3/4] w-full scale-[1.04]"
              loading="eager"
            />
          </div>
        </div>

        {/* Progressive bottom blur overlay (increased spread by 15%) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[25.3%] sm:h-[27.6%]"
        >
          <div
            className="absolute inset-0 backdrop-blur-[2.3px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 45%, black 100%)",

              maskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 45%, black 100%)",
            }}
          />
          <div
            className="absolute inset-0 backdrop-blur-[5.75px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.5) 65%, black 100%)",

              maskImage:
                "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.5) 65%, black 100%)",
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary backdrop-blur-[9.2px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 75%, black 100%)",

              maskImage:
                "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 75%, black 100%)",
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

      title: "Share your image",

      desc: "Choose a favourite moment you\u2019d love to turn into a portrait.",
    },

    {
      img: drawByHandIllustration,

      title: "We draw by hand",

      desc: "Every portrait is crafted with care and attention.",
    },

    {
      img: lastingGiftIllustration,

      title: "Gift to your loved one",

      desc: "Receive a beautiful portrait they\u2019ll always treasure.",
    },
  ]

  return (
    <section
      id="how"
      className="box-border w-full bg-bg-primary py-16 sm:py-18 lg:py-20 scroll-mt-[76px] sm:scroll-mt-[82px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12 text-center">
        <Eyebrow className="text-xs sm:text-[13px] tracking-[0.2em]">
          How it works
        </Eyebrow>
        <h2 className="mt-3.5 sm:mt-4 font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[46px] leading-[1.12] tracking-tight text-primary">
          Your photo, to their heart.
        </h2>
        <div className="mt-12 sm:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="relative">
                <span className="absolute left-1/2 -top-2.5 z-10 grid size-8 sm:size-8.5 -translate-x-1/2 place-items-center rounded-full bg-primary text-sm sm:text-base font-semibold text-white shadow-md ring-4 ring-bg-primary">
                  {i + 1}
                </span>
                <div className="size-40 sm:size-44 lg:size-48 transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="size-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="mt-5 font-serif text-xl sm:text-[22px] lg:text-[23px] font-medium tracking-tight text-primary">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[280px] sm:max-w-[320px] text-sm sm:text-[15px] leading-relaxed text-text-secondary">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface WorkStorySlide {
  id: string

  artworkId: ArtworkId

  category: string

  headingLead: string

  headingAccent: string

  description: string
}

const WORK_SLIDES: WorkStorySlide[] = [
  {
    id: "couple",

    artworkId: "framed-couple",

    category: "COUPLE PORTRAIT",

    headingLead: "A little piece of your",

    headingAccent: "forever.",

    description:
      "Two people, countless memories, and a moment worth keeping close. Turn your favourite photograph together into something timeless.",
  },

  {
    id: "child",

    artworkId: "framed-girl-crown",

    category: "CHILD PORTRAIT",

    headingLead: "Little moments, big",

    headingAccent: "memories.",

    description:
      "Childhood passes in the blink of an eye. Preserve those innocent smiles and precious little expressions in a portrait made to last.",
  },

  {
    id: "family",

    artworkId: "framed-family",

    category: "FAMILY PORTRAIT",

    headingLead: "The people who make a place feel like",

    headingAccent: "home.",

    description:
      "From everyday smiles to once-in-a-lifetime gatherings, bring your favourite family moments together in one beautiful frame.",
  },
]

function Works({ go }: { go: (v: RouteId) => void }) {
  const [activeSlide, setActiveSlide] = useState(0)

  const [isPaused, setIsPaused] = useState(false)

  // Active carousel autoplay (pauses on user hover/touch)

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % WORK_SLIDES.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused])

  const currentSlide = WORK_SLIDES[activeSlide]

  return (
    <section
      id="works"
      className="relative flex flex-col justify-center bg-bg-primary py-14 sm:py-16 lg:py-20 scroll-mt-[76px] sm:scroll-mt-[82px] lg:scroll-mt-[88px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="mx-auto box-border flex w-full max-w-[1300px] flex-1 flex-col justify-center px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-[38%_62%] xl:gap-14">
          {/* Left Editorial Content (35-40% width) */}
          <div className="flex flex-col items-start">
            <div
              key={activeSlide}
              className="animate-story-fade flex flex-col items-start min-h-[210px] sm:min-h-[225px] lg:min-h-[240px]"
            >
              <Eyebrow className="text-xs sm:text-[13px] tracking-[0.2em]">
                {currentSlide.category}
              </Eyebrow>
              <h2 className="mt-3.5 sm:mt-4 font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-[-0.015em] text-primary">
                {currentSlide.headingLead}{" "}
                <em className="font-serif italic text-primary">
                  {currentSlide.headingAccent}
                </em>
              </h2>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-base leading-relaxed text-text-secondary max-w-[36ch]">
                {currentSlide.description}
              </p>
            </div>
            <Button
              onClick={() => go("order")}
              className="mt-7 sm:mt-8 h-11 sm:h-11.5 px-6 sm:px-7 text-[15px] font-medium shadow-sm hover:shadow transition-all"
            >
              Explore our works <Icon name="arrow" className="size-4.5" />
            </Button>
          </div>

          {/* Right Artwork Carousel (60-65% width) */}
          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Subtle warm ambient backdrop glow behind the showcase */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[12%] inset-y-[8%] rounded-full bg-accent/20 blur-3xl"
            />

            {/* Active Carousel Stage with adaptive sizing & smooth transition */}
            <div className="relative flex w-full items-center justify-center overflow-hidden py-3 sm:py-4 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[460px]">
              {/* Previous Arrow Button — positioned in the carousel */}
              <button
                type="button"
                aria-label="Previous artwork"
                onClick={() =>
                  setActiveSlide(
                    (activeSlide + WORK_SLIDES.length - 1) % WORK_SLIDES.length,
                  )
                }
                className="absolute left-2 sm:left-4 z-30 grid size-10 sm:size-11 place-items-center rounded-full border border-border bg-white text-primary shadow-md backdrop-blur transition-all hover:bg-surface-subtle hover:text-primary hover:scale-105 active:scale-95"
              >
                <Icon name="back" className="size-4.5" />
              </button>

              {/* All slides rendered with smooth transition and self-adapting dimensions */}
              <div className="relative flex w-full items-center justify-center h-full min-h-[300px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px]">
                {WORK_SLIDES.map((slide, idx) => {
                  const isActive = idx === activeSlide

                  const diff =
                    (idx - activeSlide + WORK_SLIDES.length) %
                    WORK_SLIDES.length

                  const isNext = diff === 1

                  const isPrev = diff === WORK_SLIDES.length - 1

                  let transformClass =
                    "scale-95 opacity-0 pointer-events-none z-10"

                  if (isActive) {
                    transformClass =
                      "scale-100 opacity-100 translate-x-0 z-20 pointer-events-auto"
                  } else if (isNext) {
                    transformClass =
                      "scale-95 opacity-0 translate-x-10 sm:translate-x-14 pointer-events-none z-10"
                  } else if (isPrev) {
                    transformClass =
                      "scale-95 opacity-0 -translate-x-10 sm:-translate-x-14 pointer-events-none z-10"
                  }

                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${transformClass}`}
                    >
                      <ArtworkImage
                        artworkId={slide.artworkId}
                        alt={`${slide.category} — featured hand-drawn portrait`}
                        className="max-h-[300px] sm:max-h-[360px] md:max-h-[400px] lg:max-h-[450px] w-auto max-w-[85%] md:max-w-[80%] object-contain rounded-[3px] shadow-[0_20px_44px_rgba(28,25,21,0.2)] ring-1 ring-black/5 transition-transform duration-500 hover:scale-[1.01]"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Next Arrow Button — positioned in the carousel */}
              <button
                type="button"
                aria-label="Next artwork"
                onClick={() =>
                  setActiveSlide((activeSlide + 1) % WORK_SLIDES.length)
                }
                className="absolute right-2 sm:right-4 z-30 grid size-10 sm:size-11 place-items-center rounded-full border border-border bg-white text-primary shadow-md backdrop-blur transition-all hover:bg-surface-subtle hover:text-primary hover:scale-105 active:scale-95"
              >
                <Icon name="arrow" className="size-4.5" />
              </button>
            </div>

            {/* Pagination indicators */}
            <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-2">
              {WORK_SLIDES.map((slide, j) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to ${slide.category} slide (${j + 1} of ${WORK_SLIDES.length})`}
                  onClick={() => setActiveSlide(j)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    j === activeSlide
                      ? "w-7 bg-primary"
                      : "w-2 bg-border-strong hover:bg-muted-element"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section
      id="why"
      aria-label="Their words mean everything"
      className="relative overflow-hidden bg-bg-primary py-14 sm:py-16 lg:py-18 scroll-mt-[76px] sm:scroll-mt-[82px] lg:scroll-mt-[88px]"
    >
      <Container className="text-center">
        <Eyebrow className="text-xs sm:text-[13px] tracking-[0.2em]">
          What our customers say
        </Eyebrow>
        <h2 className="mt-3.5 font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.12] text-primary">
          Their words mean everything.
        </h2>
      </Container>

      <div className="relative mt-8 sm:mt-10 w-full overflow-hidden py-4">
        {/* Soft edge gradient fades so cards emerge and dissolve smoothly */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-bg-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-bg-primary to-transparent" />

        <div className="animate-marquee-slow flex w-max">
          <div className="flex shrink-0 gap-6 pr-6">
            {TESTIMONIALS.map((item, idx) => (
              <figure
                key={`review-a-${item.id}-${idx}`}
                className="glass-review-card relative flex w-[290px] sm:w-[330px] shrink-0 flex-col justify-between rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:bg-white"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(36, 35, 33, 0.03), 0 8px 20px 0 rgba(36, 35, 33, 0.04)",
                }}
              >
                <div>
                  <Stars count={item.rating} />
                  <blockquote className="mt-3.5 text-sm leading-relaxed text-primary">
                    {item.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-4 text-xs font-semibold tracking-wide text-text-secondary">
                  {item.customerName}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
            {TESTIMONIALS.map((item, idx) => (
              <figure
                key={`review-b-${item.id}-${idx}`}
                className="glass-review-card relative flex w-[290px] sm:w-[330px] shrink-0 flex-col justify-between rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:bg-white"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(36, 35, 33, 0.03), 0 8px 20px 0 rgba(36, 35, 33, 0.04)",
                }}
              >
                <div>
                  <Stars count={item.rating} />
                  <blockquote className="mt-3.5 text-sm leading-relaxed text-primary">
                    {item.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-4 text-xs font-semibold tracking-wide text-text-secondary">
                  {item.customerName}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CreateSection({ go }: { go: (v: RouteId) => void }) {
  const { draft, pricing, selectPortraitType, selectSize } = useOrder()

  const availableSizes = getAvailableSizesForType(
    draft.configuration.portraitType,
  )

  const field =
    "h-11 sm:h-12 w-full rounded-lg border border-border bg-white px-3.5 text-sm sm:text-[15px] text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

  return (
    <section
      id="create"
      className="bg-bg-primary py-14 sm:py-16 lg:py-18 scroll-mt-[76px] sm:scroll-mt-[82px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 xl:gap-14">
          <div className="flex flex-col justify-center">
            <Eyebrow className="text-xs sm:text-[13px] tracking-[0.2em]">
              CREATE YOURS
            </Eyebrow>
            <h2 className="mt-3.5 font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-tight text-primary">
              A portrait they&rsquo;ll{" "}
              <em className="font-serif italic text-primary">always cherish.</em>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary sm:mt-5 sm:text-base">
              Upload your photo, choose your portrait style and size, and share
              your delivery details. We&rsquo;ll take care of turning your
              favourite memory into a hand-drawn keepsake.
            </p>
            <div className="mt-7 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-primary">
                  <Icon name="pen" className="size-4" />
                </div>
                <p className="text-xs font-medium leading-snug text-primary sm:text-[13px]">
                  Hand-drawn with care
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-primary">
                  <Icon name="heart" className="size-4" />
                </div>
                <p className="text-xs font-medium leading-snug text-primary sm:text-[13px]">
                  Personalised to your choice
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-primary">
                  <Icon name="truck" className="size-4" />
                </div>
                <p className="text-xs font-medium leading-snug text-primary sm:text-[13px]">
                  Delivered safely across India
                </p>
              </div>
            </div>
          </div>

          <div
            className="w-full rounded-2xl border border-border bg-white p-6 sm:p-7 md:p-8 shadow-card transition-all"
          >
            <div className="grid gap-4.5 sm:grid-cols-[210px_1fr] lg:grid-cols-[225px_1fr]">
              <button
                type="button"
                onClick={() => go("order")}
                className="group flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-strong bg-surface-subtle/50 p-4.5 text-center transition-all hover:border-primary hover:bg-surface-subtle sm:aspect-square cursor-pointer"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-surface-subtle text-primary transition-transform group-hover:scale-105">
                  <Icon name="img" className="size-5.5" />
                </div>
                <span className="mt-2.5 text-sm font-medium text-primary">
                  Upload your photo
                </span>
                <span className="mt-0.5 text-xs text-text-secondary">
                  JPG, PNG (max 10MB)
                </span>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-white">
                  Browse file
                </span>
              </button>

              <div className="space-y-3">
                <select
                  aria-label="Select portrait type"
                  value={draft.configuration.portraitType}
                  onChange={(e) =>
                    selectPortraitType(e.target.value as PortraitTypeId)
                  }
                  className={field}
                >
                  {PORTRAIT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Select size"
                  value={draft.configuration.size}
                  onChange={(e) => selectSize(e.target.value as PortraitSizeId)}
                  className={field}
                >
                  {availableSizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} ({s.dimensionsCm})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className={field}
                  placeholder="Your mobile number"
                  aria-label="Your mobile number"
                />
                <input
                  type="text"
                  className={field}
                  placeholder="Delivery address"
                  aria-label="Delivery address"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm sm:text-[15px]">
              <div className="flex items-baseline justify-between">
                <span className="text-text-secondary">Estimated price</span>
                <span className="font-serif text-2xl font-semibold text-primary sm:text-[26px]">
                  {formatInr(pricing.totalAmountInr)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary sm:text-sm">
                <span>Pay now (advance)</span>
                <span className="font-medium text-primary">
                  {formatInr(pricing.advancePayableInr)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary sm:text-sm">
                <span>Pay on delivery</span>
                <span className="font-medium text-primary">
                  {formatInr(pricing.remainingOnDeliveryInr)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => go("order")}
              className="mt-5 h-12 w-full text-[15px] font-medium tracking-wide shadow-sm transition-all hover:shadow sm:mt-6 sm:text-base cursor-pointer"
            >
              Create my portrait <Icon name="arrow" className="size-4" />
            </Button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary sm:gap-7">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon name="lock" className="size-3.5 text-primary" />
                Secure payment
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Icon name="truck" className="size-3.5 text-primary" />
                7–10 days delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ go }: { go: (v: RouteId) => void }) {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,

    targetId: string,
  ) => {
    e.preventDefault()

    scrollToSection(targetId)

    if (
      typeof window !== "undefined" &&
      window.location.hash !== `#${targetId}`
    ) {
      window.history.pushState(null, "", `#${targetId}`)
    }
  }

  return (
    <footer className="border-t border-border bg-bg-primary">
      <Container className="flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between sm:py-9">
        <div>
          <Logo onClick={() => go("home")} className="text-[17px]" />
          <p className="mt-1.5 text-xs text-text-secondary">
            Hand-drawn portraits for your special moments.
          </p>
        </div>
        <nav className="flex gap-6 text-xs sm:text-sm text-text-secondary">
          <a
            href="#how"
            onClick={(e) => handleNavClick(e, "how")}
            className="hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="#why"
            onClick={(e) => handleNavClick(e, "why")}
            className="hover:text-primary transition-colors"
          >
            Why us
          </a>
          <a
            href="#works"
            onClick={(e) => handleNavClick(e, "works")}
            className="hover:text-primary transition-colors"
          >
            Our works
          </a>
          <button
            type="button"
            onClick={() => go("system")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Design system
          </button>
        </nav>
      </Container>
    </footer>
  )
}

/* ---------- Order Flow Components & Step Views ---------- */

function OrderPhotoPreview({
  draft,
  fallbackArtworkId,
  className = "w-full aspect-[4/3] object-cover rounded-md",
  alt = "Your portrait",
}: {
  draft: ReturnType<typeof useOrder>["draft"]
  fallbackArtworkId?: ArtworkId
  className?: string
  alt?: string
}) {
  if (draft.photo.sourceType === "upload" && draft.photo.previewUrl) {
    return <img src={draft.photo.previewUrl} alt={alt} className={className} />
  }
  if (draft.photo.sourceType === "sample" && draft.photo.sampleArtworkId) {
    return (
      <ArtworkImage
        artworkId={draft.photo.sampleArtworkId}
        alt={alt}
        className={className}
      />
    )
  }
  const t = getPortraitType(draft.configuration.portraitType)
  return (
    <ArtworkImage
      artworkId={fallbackArtworkId ?? t.previewArtworkId}
      alt={alt}
      className={className}
    />
  )
}

function Step1() {
  const {
    draft,
    selectPortraitType,
    setUploadedPhotoUrl,
    selectSamplePhoto,
    setUploadedFile,
  } = useOrder()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    const check = validatePhotoFile(file)
    if (!check.valid) {
      setUploadError(check.error ?? "Invalid file")
      return
    }
    setUploadError(null)
    setUploadedFile(file)
    setUploadedPhotoUrl(URL.createObjectURL(file), {
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
    })
  }

  const hasPhoto =
    (draft.photo.sourceType === "upload" && Boolean(draft.photo.previewUrl)) ||
    (draft.photo.sourceType === "sample" &&
      Boolean(draft.photo.sampleArtworkId))

  return (
    <>
      <div className="col-span-full">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-primary">
          Let&rsquo;s begin with your{" "}
          <em className="italic text-primary font-serif">favourite</em> photo.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Upload a clear photo and choose the type of portrait you&rsquo;d like.
        </p>
      </div>

      {/* Left Column: Photo Upload & lively checkpoints */}
      <div className="flex flex-col">
        <SectionTitle n={1}>Upload your photo</SectionTitle>
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-card">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[170px] sm:min-h-[190px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-strong bg-surface-subtle/40 p-4 text-center transition-all hover:border-primary hover:bg-surface-subtle cursor-pointer"
          >
            {draft.photo.sourceType === "upload" && draft.photo.previewUrl ? (
              <div className="relative flex flex-col items-center">
                <img
                  src={draft.photo.previewUrl}
                  alt="Uploaded preview"
                  className="max-h-36 sm:max-h-40 rounded-md object-contain shadow-xs"
                />
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-primary">
                  <Icon name="pen" className="size-3 text-primary" /> Change photo
                </span>
              </div>
            ) : draft.photo.sourceType === "sample" &&
              draft.photo.sampleArtworkId ? (
              <div className="relative flex flex-col items-center">
                <ArtworkImage
                  artworkId={draft.photo.sampleArtworkId}
                  alt="Sample preview"
                  className="max-h-36 sm:max-h-40 rounded-md object-contain shadow-xs"
                />
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-primary">
                  <Icon name="pen" className="size-3 text-primary" /> Change photo
                </span>
              </div>
            ) : (
              <>
                <div className="grid size-11 place-items-center rounded-full bg-surface-subtle text-primary">
                  <Icon name="img" className="size-5.5" />
                </div>
                <span className="mt-2.5 text-sm font-medium text-primary">
                  Tap or drop to upload photo
                </span>
                <span className="text-xs text-text-secondary mt-0.5">
                  JPG, PNG (max 10MB)
                </span>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-white">
                  Browse file
                </span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />

          {uploadError && (
            <div
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-lg bg-error/10 p-2.5 text-xs text-error"
            >
              <Icon name="info" className="size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Lively Photo Validation Checkpoints */}
          <div className="mt-4 rounded-lg bg-surface-subtle border border-border p-3 text-xs space-y-1.5">
            <p className="font-medium text-[11px] uppercase tracking-wider text-text-secondary">
              Photo validation feedback
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`grid size-4 place-items-center rounded-full ${
                  hasPhoto ? "bg-success/15 text-success" : "bg-white border border-border text-muted-element"
                }`}
              >
                <Icon name="check" className="size-2.5" />
              </span>
              <span
                className={hasPhoto ? "text-primary font-medium" : "text-text-secondary"}
              >
                {hasPhoto
                  ? "Format verified (JPG / PNG)"
                  : "Format: JPG or PNG supported"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`grid size-4 place-items-center rounded-full ${
                  hasPhoto ? "bg-success/15 text-success" : "bg-white border border-border text-muted-element"
                }`}
              >
                <Icon name="check" className="size-2.5" />
              </span>
              <span
                className={hasPhoto ? "text-primary font-medium" : "text-text-secondary"}
              >
                {hasPhoto
                  ? draft.photo.sourceType === "upload" && draft.photo.fileName
                    ? `File verified: ${draft.photo.fileName}`
                    : "Sample photo verified"
                  : "File size under 10MB limit"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`grid size-4 place-items-center rounded-full ${
                  hasPhoto ? "bg-success/15 text-success" : "bg-white border border-border text-muted-element"
                }`}
              >
                <Icon name="check" className="size-2.5" />
              </span>
              <span
                className={hasPhoto ? "text-primary font-medium" : "text-text-secondary"}
              >
                {hasPhoto
                  ? "Ready for hand-drawn pencil artwork"
                  : "Clear faces and well-lit photo for best results"}
              </span>
            </div>
          </div>

          {/* Secondary sample photo action */}
          <div className="mt-3.5 flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowSampleModal(true)}
              className="text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1 transition-colors font-medium cursor-pointer"
            >
              Try with a sample photo &rarr;
            </button>
            {hasPhoto && (
              <button
                type="button"
                onClick={() => {
                  setUploadedFile(null)
                  setUploadedPhotoUrl(null)
                }}
                className="text-text-secondary hover:text-primary transition-colors text-xs cursor-pointer"
              >
                Clear photo
              </button>
            )}
          </div>
        </div>

        {/* Modal for Sample Selector */}
        {showSampleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-2xl animate-story-fade">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-serif text-xl font-medium text-primary">
                  Choose a sample photo
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(false)}
                  className="grid size-8 place-items-center rounded-full text-text-secondary hover:bg-surface-subtle hover:text-primary transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
              <p className="mt-2.5 text-xs text-text-secondary leading-relaxed">
                Pick a sample photo to test the order configuration and preview
                your portrait.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {SAMPLE_PHOTOS.map((s) => {
                  const isSelected =
                    draft.photo.sourceType === "sample" &&
                    draft.photo.sampleArtworkId === s.artworkId
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setUploadedFile(null)
                        selectSamplePhoto(s.artworkId)
                        selectPortraitType(s.portraitType)
                        setShowSampleModal(false)
                      }}
                      className={`group flex flex-col overflow-hidden rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-surface-subtle ring-1 ring-primary"
                          : "border-border bg-white hover:border-border-strong hover:bg-bg-primary"
                      }`}
                    >
                      <ArtworkImage
                        artworkId={s.artworkId}
                        alt={s.label}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                      <span className="mt-2 block text-xs font-medium text-primary">
                        {s.label}
                      </span>
                      <span className="text-[10px] text-text-secondary capitalize">
                        {s.portraitType} portrait
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Portrait Type Selection */}
      <div className="flex flex-col">
        <SectionTitle n={2}>Choose portrait type</SectionTitle>
        <div className="space-y-3">
          {PORTRAIT_TYPES.map((t) => {
            const isSelected = draft.configuration.portraitType === t.id
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => selectPortraitType(t.id)}
                className={`flex w-full items-center gap-4 p-3 pr-4 transition-all cursor-pointer ${selCls(isSelected)}`}
                aria-pressed={isSelected}
              >
                <ArtworkImage
                  artworkId={t.artworkId}
                  alt={t.title}
                  className="aspect-[4/3] w-20 shrink-0 rounded-md object-cover"
                />
                <span className="flex-1 text-left min-w-0">
                  <span className="block text-sm font-semibold text-primary">
                    {t.title}
                  </span>
                  <span className="text-xs text-text-secondary block mt-0.5">
                    {t.description}
                  </span>
                </span>
                <div className="shrink-0">
                  <Radio on={isSelected} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

function Step2() {
  const { draft, selectSize, selectFinish } = useOrder()
  const {
    portraitType,
    size: selectedSize,
    finish: selectedFinish,
  } = draft.configuration
  const availableSizes = getAvailableSizesForType(portraitType)
  const framingDiff = getFramingPriceDifferenceInr(portraitType, selectedSize)

  return (
    <>
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-primary">
          Make it <em className="italic text-primary font-serif">yours.</em>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Choose the size and finish to match your style and space.
        </p>
      </div>

      {/* Choose your size - compact design to fit viewport */}
      <section className="mt-5 sm:mt-6">
        <SectionTitle
          n={1}
          right={
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Icon name="ruler" className="size-3.5 text-text-secondary" />
              Size guide
            </span>
          }
        >
          Choose your size
        </SectionTitle>
        <div
          className={`grid gap-2.5 sm:gap-3 ${
            availableSizes.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {availableSizes.map((s) => {
            const isSelected = selectedSize === s.id
            const unframedPrice = getVariantPriceInr(
              portraitType,
              s.id,
              "unframed",
            )
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => selectSize(s.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col justify-between p-3 min-h-[96px] cursor-pointer ${selCls(isSelected)}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-primary">
                        {s.id}
                      </span>
                      {s.badge && (
                        <span className="rounded-full bg-surface-subtle border border-border px-1.5 py-0.2 text-[9px] font-medium text-primary">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {s.dimensionsCm}
                    </span>
                  </div>
                  {isSelected ? <CheckDot /> : <Radio on={false} />}
                </div>
                <div className="mt-2 flex items-baseline justify-between w-full border-t border-border pt-1.5">
                  <span className="font-serif text-lg font-semibold text-primary">
                    {formatInr(unframedPrice)}
                  </span>
                  <span className="text-[10px] text-text-secondary truncate max-w-[90px]">
                    {s.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Choose your finish - compact design to fit viewport */}
      <section className="mt-5 sm:mt-6">
        <SectionTitle
          n={2}
          right={
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Icon name="info" className="size-3.5 text-text-secondary" />
              About our finishes
            </span>
          }
        >
          Choose your finish
        </SectionTitle>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {FINISH_OPTIONS.map((f) => {
            const isSelected = selectedFinish === f.id
            const variantPrice = getVariantPriceInr(
              portraitType,
              selectedSize,
              f.id,
            )
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => selectFinish(f.id)}
                aria-pressed={isSelected}
                className={`relative flex items-center gap-3 p-2.5 sm:p-3 min-h-[88px] cursor-pointer ${selCls(isSelected)}`}
              >
                <ArtworkImage
                  artworkId={f.artworkId}
                  alt={f.title}
                  className="size-16 sm:size-18 rounded-md object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {f.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">
                    {f.description}
                  </span>
                  <span className="mt-1 block font-serif text-base text-primary font-medium">
                    {f.id === "unframed"
                      ? `Included (${formatInr(variantPrice)})`
                      : `${formatInr(variantPrice)} (+ ${formatInr(framingDiff)})`}
                  </span>
                </div>
                <div className="shrink-0">
                  {isSelected ? <CheckDot /> : <Radio on={false} />}
                </div>
              </button>
            )
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
          <Icon name="gift" className="size-3.5 text-text-secondary shrink-0" />
          All portraits are hand-drawn with care. Colours may slightly vary from
          the preview.
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
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-primary">
          Where should we send{" "}
          <em className="italic text-primary font-serif">your portrait?</em>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Add your details so we can deliver it safely and on time.
        </p>
      </div>

      <div className="mt-5 sm:mt-6 space-y-4">
        {/* Contact Information */}
        <section>
          <SectionTitle n={1}>Contact information</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              icon="user"
              label="Full name"
              value={d.fullName}
              onChange={(v) => updateDelivery({ fullName: v })}
              placeholder="Enter your full name"
              error={errors.fullName}
            />
            <Field
              icon="phone"
              label="Mobile number"
              value={d.mobile}
              onChange={(v) => updateDelivery({ mobile: v })}
              placeholder="+91 98765 43210"
              error={errors.mobile}
            />
          </div>
        </section>

        {/* Delivery Address */}
        <section>
          <SectionTitle
            n={2}
            right={
              <button
                type="button"
                onClick={() => {
                  updateDelivery({
                    addressLine: "23C/379, Sri Eshwar College of Engineering",
                    city: "Coimbatore",
                    state: "Tamil Nadu",
                    pincode: "641202",
                  })
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
              >
                <Icon name="pin" className="size-3.5" />
                Use sample address
              </button>
            }
          >
            Delivery address
          </SectionTitle>
          <div className="space-y-3">
            <Field
              icon="pin"
              label="Address"
              value={d.addressLine}
              onChange={(v) => updateDelivery({ addressLine: v })}
              placeholder="House no., street, area"
              error={errors.addressLine}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field
                icon="city"
                label="City"
                value={d.city}
                onChange={(v) => updateDelivery({ city: v })}
                placeholder="e.g. Coimbatore"
                error={errors.city}
              />
              <Field
                icon="bank"
                label="State"
                value={d.state}
                onChange={(v) => updateDelivery({ state: v })}
                placeholder="e.g. Tamil Nadu"
                error={errors.state}
              />
              <Field
                icon="note"
                label="Pincode"
                value={d.pincode}
                onChange={(v) =>
                  updateDelivery({ pincode: sanitizePincodeInput(v) })
                }
                placeholder="6 digit pincode"
                error={errors.pincode}
              />
            </div>
          </div>
        </section>

        {/* Delivery Instructions (compact) */}
        <section>
          <SectionTitle n={3}>
            Delivery instructions{" "}
            <span className="text-xs font-normal text-text-secondary">(optional)</span>
          </SectionTitle>
          <div className="rounded-lg border border-border bg-white px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <textarea
              value={d.instructions}
              maxLength={200}
              onChange={(e) => updateDelivery({ instructions: e.target.value })}
              rows={2}
              placeholder="e.g. Best time to deliver, nearby landmark, etc."
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-text-secondary/70 text-primary"
            />
            <p className="text-right text-[10px] text-text-secondary">
              {d.instructions.length}/200
            </p>
          </div>
        </section>
      </div>
    </>
  )
}

function Step4({ edit }: { edit: (s: CheckoutStepIndex) => void }) {
  const { draft, pricing, selectPaymentMethod } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)
  const d = draft.delivery

  const Edit = ({ to }: { to: CheckoutStepIndex }) => (
    <button
      type="button"
      onClick={() => edit(to)}
      className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
    >
      Edit <Icon name="pen" className="size-3" />
    </button>
  )

  return (
    <>
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-primary">
          Almost there! Let&rsquo;s{" "}
          <em className="italic text-primary font-serif">make it official.</em>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Review your order and complete the advance payment to confirm.
        </p>
      </div>

      <div className="mt-5 sm:mt-6 space-y-4">
        {/* 1. Portrait Details Card */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Icon name="pen" className="size-4 text-primary" />
              Portrait details
            </span>
            <Edit to={1} />
          </div>
          <div className="mt-3.5 flex items-center gap-4">
            <OrderPhotoPreview
              draft={draft}
              className="size-16 rounded-lg object-cover shrink-0 border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary">{t.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Size: <span className="font-medium text-primary">{s.id}</span> (
                {s.dimensionsCm}) &bull; Finish:{" "}
                <span className="font-medium text-primary">{f.title}</span>
              </p>
            </div>
            <span className="font-serif text-lg font-semibold text-primary">
              {formatInr(pricing.productPriceInr)}
            </span>
          </div>
        </div>

        {/* 2. Delivery Details Card */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Icon name="pin" className="size-4 text-primary" />
              Delivery details
            </span>
            <Edit to={2} />
          </div>
          <div className="mt-3.5 space-y-1 text-sm">
            <p className="font-medium text-primary">
              {d.fullName || "Thoufik Umer A"}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              {d.addressLine || "23C/379, Sri Eshwar College of Engineering"},{" "}
              {d.city || "Coimbatore"}, {d.state || "Tamil Nadu"} –{" "}
              {d.pincode || "641202"}
            </p>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-0.5">
              <Icon name="phone" className="size-3.5 text-primary" />
              {d.mobile || "+91 98765 43210"}
            </p>
            {d.instructions && (
              <p className="text-xs text-text-secondary italic pt-1 border-t border-border mt-1.5">
                Note: &ldquo;{d.instructions}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* 3. Price Details Card */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-card">
          <div className="pb-3 border-b border-border">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Icon name="card" className="size-4 text-primary" />
              Price details
            </span>
          </div>
          <div className="mt-3.5 space-y-2 text-sm">
            <Row
              l={`${t.title} (${s.id}, ${f.shortLabel})`}
              v={formatInr(pricing.productPriceInr)}
            />
            <Row
              l="Shipping"
              v={
                pricing.shippingFeeInr > 0
                  ? formatInr(pricing.shippingFeeInr)
                  : "Included (Free)"
              }
            />
            <div className="flex items-baseline justify-between border-t border-border pt-2.5 font-medium">
              <span className="text-sm font-semibold text-primary">
                Total amount
              </span>
              <span className="font-serif text-2xl font-bold text-primary">
                {formatInr(pricing.totalAmountInr)}
              </span>
            </div>

            {/* Prominent Advance Payment Box */}
            <div className="mt-3 rounded-lg border border-border-strong bg-surface-subtle p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-primary">
                  Pay now (advance)
                </span>
                <span className="font-serif text-2xl font-bold text-primary">
                  {formatInr(pricing.advancePayableInr)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-text-secondary">Pay on delivery (remaining)</span>
                <span className="font-medium text-primary">
                  {formatInr(pricing.remainingOnDeliveryInr)}
                </span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-text-secondary pt-1">
              <Icon name="info" className="size-3.5 text-primary shrink-0" />
              The remaining amount will be collected on delivery.
            </p>
          </div>
        </div>

        {/* 4. Payment Method Card */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-card">
          <div className="pb-3 border-b border-border">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <Icon name="bank" className="size-4 text-primary" />
              Choose payment method
            </span>
          </div>
          <div
            className="mt-3.5 space-y-2.5"
            role="radiogroup"
            aria-label="Payment method"
          >
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = draft.paymentMethod === pm.id
              return (
                <button
                  type="button"
                  key={pm.id}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectPaymentMethod(pm.id)}
                  className={`flex w-full items-center gap-3 p-3 text-left cursor-pointer ${selCls(isSelected)}`}
                >
                  <Radio on={isSelected} />
                  <Icon name={pm.iconName} className="size-5 text-primary" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-primary">
                      {pm.title}
                    </span>
                    <span className="text-xs text-text-secondary">{pm.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function Aside({
  step,
  edit,
}: {
  step: CheckoutStepIndex
  edit: (s: CheckoutStepIndex) => void
}) {
  const { draft, pricing } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)

  if (step === 1) {
    // Step 2: Make it yours -> Order Summary (matching Wireframe 2)
    return (
      <Card className="p-4 sm:p-5 bg-white border border-border shadow-card">
        <OrderPhotoPreview
          draft={draft}
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
        <div className="mt-4 space-y-2 text-sm">
          <Row l="Portrait type" v={t.title} />
          <Row l="Size" v={`${s.id} (${s.dimensionsCm})`} />
          <Row l="Finish" v={f.title} />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-text-secondary">Estimated price</span>
          <span className="font-serif text-2xl font-semibold text-primary">
            {formatInr(pricing.productPriceInr)}
          </span>
        </div>
      </Card>
    )
  }

  if (step === 2) {
    // Step 3: Delivery details -> Order Summary with delivery info (matching Wireframe 3)
    return (
      <Card className="p-4 sm:p-5 bg-white border border-border shadow-card">
        <OrderPhotoPreview
          draft={draft}
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
        <div className="mt-4 space-y-2 text-sm">
          <Row l="Portrait type" v={t.title} />
          <Row l="Size" v={`${s.id} (${s.dimensionsCm})`} />
          <Row l="Finish" v={f.title} />
          <Row l="Price" v={formatInr(pricing.productPriceInr)} />
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-subtle border border-border p-3">
          <Icon name="truck" className="size-5 shrink-0 text-primary mt-0.5" />
          <div className="text-xs">
            <p className="font-medium text-primary">
              Estimated delivery: 7–10 days
            </p>
            <p className="text-text-secondary mt-0.5">from order confirmation</p>
          </div>
        </div>
      </Card>
    )
  }

  // Step 4 (Review & pay): Reassurance Aside
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5 bg-white border border-border shadow-card">
        <div className="flex justify-between items-center text-sm font-medium pb-2 border-b border-border">
          <span className="text-primary font-medium">Order preview</span>
          <button
            type="button"
            onClick={() => edit(1)}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>
        <div className="mt-3">
          <OrderPhotoPreview
            draft={draft}
            className="w-full aspect-[4/3] rounded-lg object-cover"
          />
        </div>
        <p className="mt-3 flex gap-2 text-[11px] text-text-secondary leading-relaxed">
          <Icon name="info" className="size-3.5 shrink-0 text-primary mt-0.5" />
          This preview represents your selected configuration. Each portrait is
          lovingly hand-drawn by artist hands.
        </p>
      </Card>
      <Card className="p-4 sm:p-5 bg-white space-y-3 border border-border shadow-card">
        {[
          ["shield", "Safe & secure payment", "100% encrypted & protected"],
          [
            "truck",
            "Estimated delivery: 7–10 days",
            "Carefully packaged with tracking",
          ],
          [
            "gift",
            "Handcrafted with care",
            "Original pencil artwork guarantee",
          ],
        ].map(([ic, a, b]) => (
          <div key={a} className="flex gap-3 text-xs">
            <Icon name={ic as any} className="size-4.5 text-primary shrink-0" />
            <p className="text-text-secondary">
              <span className="font-medium text-primary block">{a}</span>
              {b}
            </p>
          </div>
        ))}
      </Card>
    </div>
  )
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function OrderFlow({ go }: { go: (v: RouteId) => void }) {
  const { draft, step, setStep, pricing, uploadedFile, setConfirmedOrder } =
    useOrder()
  const [errors, setErrors] = useState<DeliveryValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatusMessage, setSubmitStatusMessage] = useState("")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const next = async () => {
    if (step === 2) {
      const validation = validateDeliveryDetails(draft.delivery)
      setErrors(validation.errors)
      if (!validation.valid) return
    }
    if (step === 3) {
      await handlePlaceOrder()
      return
    }
    setStep((step + 1) as CheckoutStepIndex)
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setCheckoutError(null)
    setSubmitStatusMessage("Creating your order...")

    try {
      const createInput: CreateOrderInput = {
        portraitType: draft.configuration.portraitType,
        size: draft.configuration.size,
        finish: draft.configuration.finish,
        customer: {
          fullName: draft.delivery.fullName.trim(),
          mobile: draft.delivery.mobile.trim(),
          email: draft.delivery.email?.trim() || undefined,
        },
        delivery: {
          addressLine: draft.delivery.addressLine.trim(),
          city: draft.delivery.city.trim(),
          state: draft.delivery.state.trim(),
          pincode: draft.delivery.pincode.trim(),
          instructions: draft.delivery.instructions?.trim() || undefined,
        },
      }

      const orderRes = await orderRepository.createViaFunction(createInput)
      if (!orderRes.ok) {
        setCheckoutError(
          orderRes.error.message || "Failed to create order. Please try again.",
        )
        setIsSubmitting(false)
        setSubmitStatusMessage("")
        return
      }

      const createdOrder = orderRes.value

      // If a custom file was chosen, securely upload to storage
      if (uploadedFile) {
        setSubmitStatusMessage("Uploading reference photograph...")
        const uploadRes = await photoStorageService.uploadSecurely(
          uploadedFile,
          createdOrder.trackingToken,
        )

        if (uploadRes.ok) {
          setSubmitStatusMessage("Attaching photo to order...")
          await orderRepository.attachPhoto({
            trackingToken: createdOrder.trackingToken,
            storagePath: uploadRes.value.storagePath,
            originalFilename: uploadRes.value.originalFilename,
            mimeType: uploadedFile.type,
            fileSizeBytes: uploadedFile.size,
          })
        } else {
          console.warn("Photo upload notice:", uploadRes.error)
        }
      }

      // Create Razorpay payment order
      setSubmitStatusMessage("Initiating payment gateway...")
      const rzpRes = await orderRepository.createRazorpayOrder(
        createdOrder.orderNumber,
      )
      if (!rzpRes.ok) {
        setCheckoutError(
          rzpRes.error.message ||
            "Payment initiation failed. Please check gateway configuration.",
        )
        setIsSubmitting(false)
        setSubmitStatusMessage("")
        return
      }

      const { razorpayOrderId, razorpayKeyId, advanceAmountPaise, currency } =
        rzpRes.value

      // Load Razorpay Checkout SDK
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        setCheckoutError(
          "Payment gateway could not be loaded. Please check your internet connection.",
        )
        setIsSubmitting(false)
        setSubmitStatusMessage("")
        return
      }

      setSubmitStatusMessage("Awaiting payment...")

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: advanceAmountPaise,
        currency: currency || "INR",
        name: "Teshart",
        description: `Advance payment for order ${createdOrder.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: draft.delivery.fullName,
          contact: draft.delivery.mobile,
          email: draft.delivery.email || undefined,
        },
        theme: {
          color: "#242321",
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          setSubmitStatusMessage("Verifying payment...")
          const verifyRes = await orderRepository.verifyPayment({
            orderNumber: createdOrder.orderNumber,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          if (!verifyRes.ok) {
            setCheckoutError(
              `Payment verification failed: ${verifyRes.error.message}`,
            )
            setIsSubmitting(false)
            setSubmitStatusMessage("")
            return
          }

          setConfirmedOrder({
            orderNumber: createdOrder.orderNumber,
            trackingToken: createdOrder.trackingToken,
            pricing: createdOrder.pricing,
          })

          setIsSubmitting(false)
          setSubmitStatusMessage("")
          go("confirm")
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false)
            setSubmitStatusMessage("")
            setCheckoutError(
              "Payment window closed. You can retry paying to confirm your order.",
            )
          },
        },
      })

      rzp.on("payment.failed", (errResp: any) => {
        console.error("Payment failed:", errResp.error)
        setCheckoutError(
          errResp.error?.description || "Payment failed. Please try again.",
        )
        setIsSubmitting(false)
        setSubmitStatusMessage("")
      })

      rzp.open()
    } catch (err: any) {
      console.error("Order placement exception:", err)
      setCheckoutError(
        err.message || "An unexpected error occurred during checkout.",
      )
      setIsSubmitting(false)
      setSubmitStatusMessage("")
    }
  }

  const footer = [
    { l: null, cta: "Continue to next step" },
    {
      l: ["Estimated price", formatInr(pricing.productPriceInr), null] as const,
      cta: "Continue to next step",
    },
    {
      l: [
        "Total amount",
        formatInr(pricing.totalAmountInr),
        "(Advance payment at next step)",
      ] as const,
      cta: "Continue to review",
    },
    {
      l: [
        "Total amount",
        formatInr(pricing.totalAmountInr),
        `You'll pay ${formatInr(pricing.advancePayableInr)} now (advance)`,
      ] as const,
      cta: isSubmitting
        ? submitStatusMessage || "Processing..."
        : `Place order and pay ${formatInr(pricing.advancePayableInr)}`,
    },
  ][step]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Fixed Header with Unified Progress Stepper */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg-primary/95 backdrop-blur shadow-xs">
        <div className="mx-auto flex h-16 w-full max-w-[1300px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Logo onClick={() => go("home")} />
          <div className="flex-1 max-w-2xl px-3 sm:px-6 hidden sm:block">
            <ProgressStepper step={step} onStepClick={setStep} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border border-border bg-white text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              aria-label="View cart"
            >
              <Icon name="bag" className="size-4.5" />
            </button>
          </div>
        </div>
        {/* Mobile Stepper Row */}
        <div className="block sm:hidden border-t border-border bg-bg-primary/95 px-4 py-2">
          <ProgressStepper step={step} onStepClick={setStep} compact />
        </div>
      </header>

      {/* Main Content Area - padded to avoid overlapping fixed header and footer */}
      <Container className="pt-24 sm:pt-28 pb-32 sm:pb-36">
        {step === 0 ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Step1 />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <main className="min-w-0">
              {step === 1 && <Step2 />}
              {step === 2 && <Step3 errors={errors} />}
              {step === 3 && <Step4 edit={setStep} />}
            </main>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Aside step={step} edit={setStep} />
            </aside>
          </div>
        )}
      </Container>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-primary/95 backdrop-blur shadow-lg">
        {checkoutError && (
          <div className="bg-error/10 border-b border-error/20 px-4 py-2.5 text-center text-xs text-error font-medium flex items-center justify-center gap-2">
            <Icon name="info" className="size-4 shrink-0 text-error" />
            <span>{checkoutError}</span>
            <button
              type="button"
              onClick={() => setCheckoutError(null)}
              className="ml-2 text-error hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
        <Container className="flex items-center justify-between gap-4 py-3 sm:py-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as CheckoutStepIndex)}
                disabled={isSubmitting}
                aria-label="Back to previous step"
                className="grid size-10 place-items-center rounded-lg border border-border-strong bg-white hover:bg-surface-subtle text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="back" className="size-4.5" />
              </button>
            )}
            {footer.l && (
              <div>
                <p className="text-[11px] sm:text-xs text-text-secondary">
                  {footer.l[0]}
                </p>
                <p className="font-serif text-xl sm:text-2xl leading-tight text-primary font-semibold">
                  {footer.l[1]}
                </p>
                {footer.l[2] && (
                  <p className="text-[10px] sm:text-[11px] text-text-secondary">
                    {footer.l[2]}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={next}
              disabled={isSubmitting}
              className="h-10 sm:h-11 px-5 sm:px-6 text-sm font-medium sm:min-w-[240px] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {footer.cta}
                </span>
              ) : (
                <>
                  {footer.cta} <Icon name="arrow" className="size-4" />
                </>
              )}
            </Button>
            {step === 3 && (
              <p className="flex items-center gap-1 text-[10px] text-text-secondary">
                <Icon name="lock" className="size-3 text-text-secondary" />
                Secure 50% advance payment &bull; 256-bit SSL encrypted
              </p>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}

/* ---------- Post-order ---------- */

function mapStatusToMilestoneIndex(status: string): number {
  switch (status) {
    case "ORDER_CONFIRMED":
    case "PAYMENT_VERIFIED":
    case "DRAFT":
    case "CONFIGURED":
    case "PAYMENT_PENDING":
      return 0
    case "ARTWORK_QUEUED":
      return 1
    case "IN_PROGRESS":
      return 2
    case "QUALITY_CHECK":
    case "PACKED":
      return 3
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return 4
    case "DELIVERED":
      return 5
    default:
      return 0
  }
}

function PostOrder({
  mode,
  go,
}: {
  mode: "confirm" | "track"
  go: (v: RouteId) => void
}) {
  const { draft, pricing, confirmedOrder } = useOrder()
  const t = getPortraitType(draft.configuration.portraitType)
  const s = getPortraitSize(draft.configuration.size)
  const f = getFinishOption(draft.configuration.finish)

  const [copied, setCopied] = useState(false)
  const [tokenInput, setTokenInput] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search)
      return sp.get("track") || sp.get("token") || confirmedOrder?.trackingToken || ""
    }
    return confirmedOrder?.trackingToken || ""
  })
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingData, setTrackingData] = useState<CustomerTrackingOutput | null>(null)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  const orderNum = confirmedOrder?.orderNumber ?? "TSH-240518"
  const trackingToken = confirmedOrder?.trackingToken ?? ""
  const trackingUrl = trackingToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?track=${trackingToken}`
    : ""

  const handleCopy = () => {
    if (!trackingUrl) return
    navigator.clipboard?.writeText(trackingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const fetchTracking = async (token: string) => {
    if (!token.trim()) {
      setTrackingError("Please enter a tracking token")
      return
    }
    setTrackingLoading(true)
    setTrackingError(null)
    const res = await orderRepository.trackViaFunction(token.trim())
    setTrackingLoading(false)
    if (!res.ok) {
      setTrackingError("Order not found or tracking link expired.")
      setTrackingData(null)
    } else {
      setTrackingData(res.value)
    }
  }

  useEffect(() => {
    if (mode === "track" && tokenInput) {
      fetchTracking(tokenInput)
    }
  }, [mode])

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Logo onClick={() => go("home")} />
          <button
            type="button"
            onClick={() => go("home")}
            className="text-xs font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Back to store
          </button>
        </Container>
      </header>
      <Container className="py-10 sm:py-14">
        {mode === "confirm" ? (
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <main>
              <span className="grid size-12 place-items-center rounded-full bg-success/15 text-success">
                <Icon name="check" className="size-6" />
              </span>
              <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-primary">
                Thank you! Your order is{" "}
                <em className="italic text-primary font-serif">confirmed.</em>
              </h1>
              <p className="mt-2.5 max-w-md text-sm text-text-secondary leading-relaxed">
                We&rsquo;ve received your 50% advance payment of{" "}
                {formatInr(confirmedOrder?.pricing.advancePayableInr ?? pricing.advancePayableInr)}.
                Our master portrait artist will begin your hand-drawn artwork shortly.
              </p>

              <div className="mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
                <Card className="p-4 bg-white border border-border shadow-card">
                  <p className="text-xs text-text-secondary">Order reference</p>
                  <p className="mt-1 font-mono font-medium text-primary">
                    {orderNum}
                  </p>
                </Card>
                <Card className="p-4 bg-white border border-border shadow-card">
                  <p className="text-xs text-text-secondary">Estimated delivery</p>
                  <p className="mt-1 font-medium text-primary">7–10 business days</p>
                </Card>
              </div>

              {/* Real-time Order Tracking Link Card */}
              {trackingUrl && (
                <div className="mt-4 rounded-xl border border-border bg-surface-subtle/60 p-4 max-w-lg shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                      <Icon name="lock" className="size-3.5 text-primary" />
                      Your Private Order Tracking Link
                    </p>
                    <span className="text-[10px] text-text-secondary">Bookmark or save</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      readOnly
                      value={trackingUrl}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-xs text-text-secondary font-mono truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <p className="text-[11px] text-text-secondary">
                      No password required. Anyone with this link can check progress.
                    </p>
                    <button
                      type="button"
                      onClick={() => go("track")}
                      className="text-xs font-medium text-primary hover:underline cursor-pointer"
                    >
                      Track now &rarr;
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-border bg-white p-4 max-w-lg shadow-card">
                <p className="text-xs text-text-secondary">Order summary</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="font-medium text-primary">
                    {t.title} ({s.id})
                  </span>
                  <span className="text-text-secondary">{f.title}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-xs">
                  <span className="text-text-secondary">Total amount</span>
                  <span className="font-medium text-primary">
                    {formatInr(confirmedOrder?.pricing.totalAmountInr ?? pricing.totalAmountInr)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-text-secondary">Paid now (50% advance)</span>
                  <span className="font-medium text-success">
                    {formatInr(confirmedOrder?.pricing.advancePayableInr ?? pricing.advancePayableInr)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-text-secondary">Pay on delivery</span>
                  <span className="font-medium text-primary">
                    {formatInr(confirmedOrder?.pricing.remainingOnDeliveryInr ?? pricing.remainingOnDeliveryInr)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => go("home")}
                  className="h-11 px-6 cursor-pointer"
                >
                  Back to home
                </Button>
                {trackingToken && (
                  <Button
                    onClick={() => go("track")}
                    className="h-11 px-6 cursor-pointer"
                  >
                    View order status
                  </Button>
                )}
              </div>
            </main>

            <aside>
              <Card className="p-5 sm:p-6 bg-white border border-border shadow-card">
                <div className="border-b border-border pb-3.5 mb-4">
                  <h2 className="font-serif text-xl font-medium text-primary">
                    Order progress
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Real-time status of your commissioned portrait
                  </p>
                </div>
                <OrderTimeline current={0} />
                <p className="mt-5 text-xs text-text-secondary border-t border-border pt-3 flex items-center gap-1.5">
                  <Icon name="info" className="size-3.5 text-text-secondary shrink-0" />
                  We&rsquo;ll update you as each milestone is completed.
                </p>
              </Card>
            </aside>
          </div>
        ) : (
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <main>
              <Eyebrow>Order Tracking</Eyebrow>
              <h1 className="mt-3 font-serif text-4xl sm:text-5xl leading-[1.05] text-primary">
                Track your{" "}
                <em className="italic text-primary font-serif">portrait.</em>
              </h1>
              <p className="mt-2.5 text-sm text-text-secondary">
                Enter your private tracking token or link to view live artist progress.
              </p>

              {/* Tracking input form */}
              <div className="mt-5 max-w-lg flex gap-2">
                <input
                  type="text"
                  placeholder="Paste tracking token or URL..."
                  value={tokenInput}
                  onChange={(e) => {
                    const val = e.target.value
                    // Extract token if user pasted full URL
                    if (val.includes("track=")) {
                      const sp = new URLSearchParams(val.split("?")[1])
                      setTokenInput(sp.get("track") || val)
                    } else {
                      setTokenInput(val)
                    }
                  }}
                  className="flex-1 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-mono text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none"
                />
                <Button
                  onClick={() => fetchTracking(tokenInput)}
                  disabled={trackingLoading || !tokenInput.trim()}
                  className="h-9 px-4 text-xs font-medium cursor-pointer"
                >
                  {trackingLoading ? "Looking up..." : "Track"}
                </Button>
              </div>

              {trackingError && (
                <p className="mt-3 text-xs text-error">{trackingError}</p>
              )}

              {trackingData ? (
                <div className="mt-6 space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-white border border-border shadow-card">
                      <p className="text-xs text-text-secondary">Order reference</p>
                      <p className="mt-1 font-mono font-medium text-primary">
                        {trackingData.orderNumber}
                      </p>
                    </Card>
                    <Card className="p-4 bg-white border border-border shadow-card">
                      <p className="text-xs text-text-secondary">Current status</p>
                      <p className="mt-1 font-medium text-primary capitalize">
                        {trackingData.orderStatus.replace(/_/g, " ").toLowerCase()}
                      </p>
                    </Card>
                  </div>

                  <Card className="p-4 bg-white border border-border shadow-card">
                    <p className="text-xs text-text-secondary mb-2">Artwork Details</p>
                    <div className="flex justify-between text-xs py-1 border-b border-border">
                      <span className="text-text-secondary">Portrait Type</span>
                      <span className="font-medium text-primary capitalize">{trackingData.portraitType}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-border">
                      <span className="text-text-secondary">Size</span>
                      <span className="font-medium text-primary">{trackingData.size}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-text-secondary">Finish</span>
                      <span className="font-medium text-primary capitalize">{trackingData.finish}</span>
                    </div>
                  </Card>

                  {trackingData.shipment && (
                    <Card className="p-4 bg-white border border-border shadow-card">
                      <p className="text-xs text-text-secondary mb-2">Shipment & Courier</p>
                      <div className="flex justify-between text-xs py-1 border-b border-border">
                        <span className="text-text-secondary">Courier</span>
                        <span className="font-medium text-primary">{trackingData.shipment.courierName}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1">
                        <span className="text-text-secondary">Tracking No.</span>
                        <span className="font-medium text-primary font-mono">{trackingData.shipment.trackingNumber}</span>
                      </div>
                      {trackingData.shipment.trackingUrl && (
                        <a
                          href={trackingData.shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block text-xs font-medium text-primary hover:underline"
                        >
                          Track on courier website &rarr;
                        </a>
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <div className="mt-6 max-w-lg rounded-xl border border-border bg-white p-6 text-center shadow-card">
                  <Icon name="truck" className="size-8 mx-auto text-muted-element" />
                  <p className="mt-2 text-xs font-medium text-primary">
                    Enter your 64-character tracking token above
                  </p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Your tracking token was provided when your advance payment was verified.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant="secondary"
                  onClick={() => go("home")}
                  className="h-10 px-5 cursor-pointer"
                >
                  Back to home
                </Button>
              </div>
            </main>
            <aside>
              <Card className="p-6 bg-white border border-border shadow-card">
                <p className="mb-4 text-sm font-medium text-primary">
                  Order tracking timeline
                </p>
                <OrderTimeline
                  current={
                    trackingData
                      ? mapStatusToMilestoneIndex(trackingData.orderStatus)
                      : 0
                  }
                />
              </Card>
            </aside>
          </div>
        )}
      </Container>
    </div>
  )
}

/* ---------- Design system reference ---------- */

function System({ go }: { go: (v: RouteId) => void }) {
  const colors = [
    ["bg-primary", "#FFFFFF"],
    ["primary", "#242321"],
    ["primary-hover", "#3A3834"],
    ["surface", "#FFFFFF"],
    ["surface-subtle", "#F2F0EB"],
    ["text-primary", "#242321"],
    ["text-secondary", "#706D67"],
    ["border", "#E6E2DC"],
    ["border-strong", "#D8D3CB"],
    ["muted-element", "#A69B8C"],
    ["accent", "#D8C9B8"],
    ["success", "#4F7A52"],
    ["error", "#B4483B"],
  ]

  const type = [
    ["Display", "font-serif text-[80px] leading-none", "Serif 80/0.98"],

    ["Section heading", "font-serif text-5xl", "Serif 48/1.1"],

    ["Page heading", "font-serif text-[42px]", "Serif 42/1.02"],

    ["Card heading", "text-[17px] font-medium", "Inter 17 Medium"],

    ["Body large", "text-[15px]", "Inter 15/1.6"],

    ["Body", "text-sm", "Inter 14/1.5"],

    ["Small / helper", "text-xs text-text-secondary", "Inter 12"],

    ["Price", "font-serif text-2xl", "Serif 24"],

    [
      "Eyebrow",

      "text-[11px] uppercase tracking-[0.18em] text-text-secondary",

      "Inter 11 / 0.18em",
    ],
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-primary/95">
        <Container className="flex h-16 items-center justify-between">
          <Logo onClick={() => go("home")} />
          <span className="text-sm text-text-secondary">Design system</span>
        </Container>
      </header>
      <Container className="space-y-16 py-14">
        <section>
          <Eyebrow>Colour</Eyebrow>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {colors.map(([n, h]) => (
              <div key={n}>
                <div
                  className="h-16 rounded-lg border border-border shadow-xs"
                  style={{ background: h }}
                />
                <p className="mt-2 text-xs font-medium text-primary">{n}</p>
                <p className="text-[11px] text-text-secondary">{h}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <Eyebrow>Typography</Eyebrow>
          <div className="mt-5 divide-y divide-border">
            {type.map(([n, c, s]) => (
              <div
                key={n}
                className="grid items-baseline gap-2 py-4 md:grid-cols-[180px_1fr]"
              >
                <p className="text-xs text-text-secondary">
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
          <div className="mt-5 flex flex-wrap gap-6 text-xs text-text-secondary">
            {[
              ["sm 4", "rounded"],

              ["md 6", "rounded-md"],

              ["lg 8", "rounded-lg"],

              ["xl 12", "rounded-xl"],

              ["full", "rounded-full"],
            ].map(([l, c]) => (
              <div key={l}>
                <div
                  className={`size-16 border border-border-strong bg-white ${c}`}
                />
                <p className="mt-2">{l}</p>
              </div>
            ))}
            <div>
              <div className="size-16 rounded-xl bg-white border border-border shadow-card" />
              <p className="mt-2">shadow-card</p>
            </div>
            <p className="self-center">
              Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 40 · 56 · 80 · 112 px.
              Breakpoints: mobile 360–767, tablet 768–1023, desktop ≥1024.
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
            {[0, 2, 3].map((n) => (
              <ProgressStepper key={n} step={n} />
            ))}
          </div>
        </section>
        <section>
          <Eyebrow>Tracking</Eyebrow>
          <Card className="mt-5 max-w-sm p-6 bg-white border border-border shadow-card">
            <OrderTimeline current={2} />
          </Card>
        </section>
      </Container>
    </div>
  )
}

/* ---------- App Shell & Centralized Router ---------- */

function AppRouter() {
  const [route, setRoute] = useState<RouteId>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search)
      if (sp.get("track") || sp.get("token")) {
        return "track"
      }
      return resolveRouteFromPath(window.location.pathname)
    }
    return "home"
  })

  const { setStep } = useOrder()

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname))
    }

    window.addEventListener("popstate", onPopState)

    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    document.title = ROUTES[route].title
  }, [route])

  const go = (nextRoute: RouteId) => {
    if (nextRoute === "order") setStep(0)

    if (route === "home" && nextRoute === "home") {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      window.scrollTo({
        top: 0,

        behavior: prefersReducedMotion ? "auto" : "smooth",
      })

      if (typeof window !== "undefined" && window.location.hash) {
        window.history.pushState(null, "", window.location.pathname)
      }

      return
    }

    setRoute(nextRoute)

    const targetPath = ROUTES[nextRoute].path

    if (
      typeof window !== "undefined" &&
      window.location.pathname !== targetPath
    ) {
      window.history.pushState({ route: nextRoute }, "", targetPath)
    }

    window.scrollTo(0, 0)
  }

  if (route === "order") return <OrderFlow go={go} />

  if (route === "confirm" || route === "track")
    return <PostOrder mode={route} go={go} />

  if (route === "system") return <System go={go} />

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
