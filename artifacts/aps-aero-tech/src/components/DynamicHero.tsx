import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { getListHeroSlidesQueryKey, useListHeroSlides } from "@workspace/api-client-react";
import type { HeroSlide } from "@workspace/api-client-react";

const fallbackSlides: HeroSlide[] = [
  {
    id: 0,
    title: "Built to fly. Engineered for the mission.",
    subtitle:
      "ASP Aero Tech designs and manufactures mission-configurable drones for intelligence, surveillance, inspection, mapping, emergency response, and autonomous operations.",
    imageUrl: "/product-images/vtol.jpg",
    eyebrow: "Indigenous unmanned aerial systems",
    badge: "Mission ready",
    ctaText: "Request a briefing",
    ctaUrl: "/contact",
    stat1: "Designed & manufactured in India",
    stat2: "Mission-configurable architecture",
    stat3: "Training and lifecycle support",
  },
];

function safeLink(value: string | null) {
  if (!value) return "/contact";
  return value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://")
    ? value
    : `/${value}`;
}

export function DynamicHero() {
  const { data, isLoading } = useListHeroSlides({
    query: { queryKey: getListHeroSlidesQueryKey(), staleTime: 30_000, refetchOnMount: "always" },
  });
  const slides = data?.length ? data : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeIndex] ?? slides[0];
  const goTo = (index: number) => setActiveIndex((index + slides.length) % slides.length);

  return (
    <section
      className="relative min-h-[610px] overflow-hidden bg-[#1A1F36] sm:min-h-[660px] lg:min-h-[690px]"
      aria-roledescription="carousel"
      aria-label="ASP Aero Tech highlights"
      data-testid="section-dynamic-hero"
    >
      {slides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        >
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            data-testid={`img-hero-${item.id}`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,20,42,.98)_0%,rgba(26,31,54,.9)_43%,rgba(26,31,54,.35)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(26,31,54,.75)_0%,transparent_55%)]" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[610px] max-w-[1440px] items-center px-5 py-20 sm:min-h-[660px] sm:px-8 lg:min-h-[690px]">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D4920C]">
              <span className="h-0.5 w-8 bg-[#D4920C]" />
              {slide.eyebrow || "ASP Aero Tech"}
            </span>
            {slide.badge && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                {slide.badge}
              </span>
            )}
          </div>
          <h1
            className="max-w-3xl text-4xl font-black leading-[.98] tracking-tight text-white sm:text-6xl lg:text-[76px]"
            data-testid="text-hero-title"
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {slide.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={safeLink(slide.ctaUrl)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E84821] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              data-testid="link-hero-primary"
            >
              {slide.ctaText || "Request a briefing"} <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              data-testid="link-hero-products"
            >
              Explore platforms <ChevronRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 text-xs font-bold uppercase tracking-wider text-white/55 sm:grid-cols-3">
            {[slide.stat1, slide.stat2, slide.stat3].filter(Boolean).map((stat) => (
              <span key={stat} className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-[#D4920C]" size={14} />
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-5 right-5 mx-auto flex max-w-[1376px] items-center justify-between sm:left-8 sm:right-8">
          <div className="flex gap-2" aria-label="Choose hero slide">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-10 bg-[#D4920C]" : "w-5 bg-white/35 hover:bg-white/60"
                }`}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === activeIndex}
                data-testid={`button-hero-slide-${item.id}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#1A1F36]/50 text-white backdrop-blur transition-colors hover:bg-white/15"
              aria-label="Previous hero slide"
              data-testid="button-hero-previous"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#1A1F36]/50 text-white backdrop-blur transition-colors hover:bg-white/15"
              aria-label="Next hero slide"
              data-testid="button-hero-next"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
      {isLoading && <span className="sr-only">Loading hero slides</span>}
    </section>
  );
}