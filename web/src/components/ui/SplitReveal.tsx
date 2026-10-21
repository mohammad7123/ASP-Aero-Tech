"use client";

import { useEffect, useRef } from "react";
import { onBootComplete } from "@/lib/boot";
import { prefersReducedMotion } from "@/lib/device";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "boot" waits for the intro to finish (hero); "view" plays on scroll into view. */
  trigger?: "boot" | "view";
  /** Words (exact match, punctuation included) rendered in the accent colour. */
  accent?: string[];
  /** Extra classes for accent words (e.g. the hero's underline swoosh). */
  accentClassName?: string;
  delay?: number;
};

/**
 * Headline that reveals letter by letter. Letters are server-rendered (no
 * layout shift, readable without JS); the element carries an aria-label so
 * assistive tech reads the sentence, not individual letters.
 */
export function SplitReveal({ text, as = "h2", className, trigger = "view", accent = [], accentClassName, delay = 0 }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".reveal-char");
    if (prefersReducedMotion()) {
      gsap.set(chars, { clearProps: "all" });
      el.dataset.revealed = "";
      return;
    }
    gsap.set(chars, { yPercent: 115, opacity: 0 });
    const play = () =>
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "expo.out",
        stagger: 0.02,
        delay,
        clearProps: "transform,opacity",
        // Lets CSS stop hiding the letters (html.boot-skip pre-hides them until this point).
        onComplete: () => {
          el.dataset.revealed = "";
        },
      });

    if (trigger === "boot") return onBootComplete(play);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, delay]);

  const words = text.split(" ");
  // The element type only affects markup; typing it as h2 keeps the ref/JSX types simple.
  const Tag = as as "h2";
  // Headings may carry aria-label; other elements (e.g. <p>) may not, so they get visually hidden text.
  const heading = as !== "p";
  return (
    <Tag ref={ref} aria-label={heading ? text : undefined} data-reveal="" className={cn(className)}>
      {!heading && <span className="sr-only">{text}</span>}
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true">
          <span className={cn("reveal-word", accent.includes(word) && cn("text-cyan", accentClassName))}>
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="reveal-char">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
