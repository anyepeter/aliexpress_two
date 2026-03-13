"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCard {
  src: string;
  alt: string;
  price: string;
  oldPrice: string;
  rotation: number;
}

interface Slide {
  id: number;
  headline: string;
  subtext: string;
  cta: string;
  href: string;
  bg: string;
  textColor: string;
  subtextColor: string;
  discountBadge?: string;
  productCards: ProductCard[];
  heroImage: { src: string; alt: string };
}

const slides: Slide[] = [
  {
    id: 1,
    headline: "Gear up",
    subtext: "Outdoor adventures await",
    cta: "Shop now",
    href: "/stores",
    bg: "#dce4ec",
    textColor: "text-[#1a1a1a]",
    subtextColor: "text-gray-600",
    productCards: [
      {
        src: "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/1.webp",
        alt: "Sports Gear",
        price: "$0.99",
        oldPrice: "$4.94",
        rotation: -8,
      },
      {
        src: "https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/1.webp",
        alt: "Training Equipment",
        price: "$0.99",
        oldPrice: "$3.29",
        rotation: 5,
      },
    ],
    heroImage: {
      src: "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp",
      alt: "Electronics Collection",
    },
  },
  {
    id: 2,
    headline: "Welcome deal",
    subtext: "New shopper special",
    cta: "Shop now",
    href: "/stores",
    bg: "#E53935",
    textColor: "text-white",
    subtextColor: "text-white/80",
    discountBadge: "-93%",
    productCards: [
      {
        src: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp",
        alt: "Wireless Earbuds",
        price: "$0.99",
        oldPrice: "$12.99",
        rotation: -4,
      },
      {
        src: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/3.webp",
        alt: "iPhone 13 Pro",
        price: "$699",
        oldPrice: "$999",
        rotation: 5,
      },
    ],
    heroImage: {
      src: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp",
      alt: "MacBook Pro",
    },
  },
];

const SLIDE_INTERVAL = 5000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const isPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? "right" : "left");
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection("right");
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection("left");
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) next();
    }, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const pause = () => { isPausedRef.current = true; };
  const resume = () => { isPausedRef.current = false; };

  return (
    <section
      className="group relative w-full overflow-hidden select-none"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div className="relative h-[220px] sm:h-[300px] md:h-[360px] lg:h-[400px]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const enterFrom = direction === "right" ? "100%" : "-100%";

          return (
            <div
              key={slide.id}
              className="absolute inset-0"
              style={{
                backgroundColor: slide.bg,
                opacity: isActive ? 1 : 0,
                transform: `translateX(${isActive ? "0%" : enterFrom})`,
                transition: "opacity 0.65s ease, transform 0.65s ease",
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <div className="relative max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">
                {/* ── Left: text ── */}
                <div className="relative z-20 max-w-md flex-shrink-0">
                  {slide.discountBadge && (
                    <div
                      className="hidden md:flex absolute -right-6 -top-14 w-[68px] h-[68px] rounded-full items-center justify-center"
                      style={{
                        background: "radial-gradient(circle, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 100%)",
                        border: "2px solid rgba(0,0,0,0.25)",
                        opacity: isActive ? 1 : 0,
                        transform: `scale(${isActive ? 1 : 0.5})`,
                        transition: "opacity 0.4s 0.25s, transform 0.4s 0.25s",
                      }}
                    >
                      <span className="text-white font-extrabold text-lg">{slide.discountBadge}</span>
                    </div>
                  )}

                  <h2
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black ${slide.textColor} leading-[1.05] tracking-tight`}
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                  >
                    {slide.headline}
                  </h2>

                  <p className={`text-sm sm:text-base md:text-lg ${slide.subtextColor} mt-1 mb-5 md:mb-7`}>
                    {slide.subtext}
                  </p>

                  <Link
                    href={slide.href}
                    className="inline-flex items-center px-7 py-2.5 md:px-9 md:py-3 bg-[#111] text-white text-sm md:text-base font-semibold rounded-[3px] hover:bg-[#333] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    {slide.cta}
                  </Link>
                </div>

                {/* ── Center: tilted product cards ── */}
                <div className="hidden md:flex absolute left-[34%] lg:left-[30%] top-1/2 -translate-y-[55%] z-10 gap-4 lg:gap-6 items-start">
                  {slide.productCards.map((card, ci) => (
                    <div
                      key={ci}
                      className="w-[160px] h-[200px] lg:w-[190px] lg:h-[235px]"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `rotate(${card.rotation}deg) translateY(${isActive ? 0 : 30}px)`,
                        transition: `opacity 0.5s ${0.15 + ci * 0.13}s, transform 0.5s ${0.15 + ci * 0.13}s`,
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col">
                        <div className="relative flex-1 bg-white">
                          <Image
                            src={card.src}
                            alt={card.alt}
                            fill
                            className="object-contain p-3"
                            sizes="200px"
                            priority={index === 0}
                          />
                        </div>
                        <div className="px-3 py-2 bg-white">
                          <span className="text-[#111] font-extrabold text-sm lg:text-base">{card.price}</span>
                          <span className="text-gray-400 text-xs line-through ml-1.5">{card.oldPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Right: hero product ── */}
                <div
                  className="hidden lg:flex absolute right-4 xl:right-10 top-0 bottom-0 w-[300px] xl:w-[360px] items-center justify-center"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateX(${isActive ? 0 : 50}px) scale(${isActive ? 1 : 0.93})`,
                    transition: "opacity 0.6s 0.2s, transform 0.6s 0.2s",
                  }}
                >
                  <div className="relative w-full h-[85%]">
                    <Image
                      src={slide.heroImage.src}
                      alt={slide.heroImage.alt}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="(min-width: 1024px) 360px, 0px"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Arrows: transparent + glassmorphism ── */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 bg-black/10 hover:bg-black/20 backdrop-blur-lg border border-white/15 text-white shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 drop-shadow" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 bg-black/10 hover:bg-black/20 backdrop-blur-lg border border-white/15 text-white shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 drop-shadow" />
      </button>

      {/* ── Progress dots ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className="relative h-2 rounded-full transition-all duration-500 overflow-hidden"
            style={{
              width: index === current ? 28 : 8,
              backgroundColor: index === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
            }}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === current && (
              <span
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ animation: `heroProgressFill ${SLIDE_INTERVAL}ms linear` }}
              />
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes heroProgressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
