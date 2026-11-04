import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const pieces = [
  [".hero-greeting", "Introduction", "#508acb", 100],
  [".hero-identity", "Identity", "#458c7b", 260],
  [".hero-statement", "Typography", "#b67b50", 540],
  [".hero-summary", "Content", "#508acb", 800],
  [".hero-actions", "Interaction", "#458c7b", 1080],
  [".hero-location", "Location", "#b67b50", 1300],
  [".hero-socials", "Connect", "#508acb", 1470],
  [".hero-signature", "Signature", "#458c7b", 1600],
] as const;

const assemblyPace = 1.8;

export default function HeroAssembly({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stop = useRef<() => void>(() => {});
  const [building, setBuilding] = useState(false);
  const reduceMotion = useReducedMotion();
  const lightX = useMotionValue(0);
  const lightY = useMotionValue(0);
  const lightOpacity = useMotionValue(0);
  const smoothLightX = useSpring(lightX, { stiffness: 65, damping: 25 });
  const smoothLightY = useSpring(lightY, { stiffness: 65, damping: 25 });

  useLayoutEffect(() => {
    const section = root.current;
    if (!section || reduceMotion || typeof Element.prototype.animate !== "function") return;
    const animations: Animation[] = [];
    const overlay = document.createElement("div");
    overlay.className = "hero-assembly-overlay";
    overlay.setAttribute("aria-hidden", "true");
    let timer: ReturnType<typeof setTimeout>;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      animations.forEach(animation => animation.cancel());
      overlay.remove();
      clearTimeout(timer);
      setBuilding(false);
    };
    stop.current = finish;
    try {
      const bounds = section.getBoundingClientRect();
      const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
        animations.push(element.animate(frames, {
          fill: "both",
          ...options,
          duration: Number(options.duration ?? 0) * assemblyPace,
          delay: (options.delay ?? 0) * assemblyPace,
        }));
      };
      section.append(overlay);
      pieces.forEach(([selector, label, color, delay]) => {
        const element = section.querySelector<HTMLElement>(selector);
        if (!element || !element.getClientRects().length) return;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const left = rect.left - bounds.left;
        const top = rect.top - bounds.top;
        const isIdentity = selector === ".hero-identity";
        const assemblyDuration = isIdentity ? 1250 : 850;
        const frame = document.createElement("div");
        frame.className = "hero-assembly-frame";
        Object.assign(frame.style, {
          left: `${left - 6}px`, top: `${top - 6}px`,
          width: `${rect.width + 12}px`, height: `${rect.height + 12}px`, color,
        });
        const cursor = document.createElement("div");
        cursor.className = "hero-assembly-cursor";
        cursor.style.color = color;
        cursor.style.setProperty("--agent-color", color);
        const name = document.createElement("span");
        name.textContent = label;
        cursor.append(name);
        overlay.append(frame, cursor);
        animate(frame, [
          { opacity: 0, transform: "scaleX(.02)", offset: 0 },
          { opacity: .75, transform: "scaleX(1)", offset: .35 },
          { opacity: .55, transform: "scaleX(1)", offset: .7 },
          { opacity: 0, transform: "scaleX(1)", offset: 1 },
        ], { duration: assemblyDuration, delay, easing: "cubic-bezier(.22,1,.36,1)" });
        const x = Math.max(8, Math.min(left + rect.width - 18, bounds.width - 105));
        const y = top + rect.height;
        animate(cursor, [
          { opacity: 0, transform: `translate3d(${Math.max(8, left - 15)}px,${top - 12}px,0)`, offset: 0 },
          { opacity: 1, transform: `translate3d(${left + 8}px,${top + 3}px,0)`, offset: .15 },
          { opacity: 1, transform: `translate3d(${x}px,${y}px,0)`, offset: .65 },
          { opacity: 0, transform: `translate3d(${x + 12}px,${y + 8}px,0)`, offset: 1 },
        ], { duration: assemblyDuration, delay, easing: "cubic-bezier(.22,1,.36,1)" });
        const fragments = isIdentity
          ? Array.from(element.querySelectorAll(".brick-wordmark > g > path"))
          : selector === ".hero-statement" ? Array.from(element.children) : [element];
        fragments.forEach((fragment, index) => {
          animate(fragment, [
            { opacity: 0, transform: isIdentity ? "translate3d(0,24px,0)" : "translate3d(0,10px,0)" },
            { opacity: 1, transform: "translate3d(0,0,0)" },
          ], { duration: 430, delay: delay + 180 + index * (isIdentity ? 140 : 100), easing: "cubic-bezier(.22,1,.36,1)" });
        });
      });
      setBuilding(true);
      timer = setTimeout(finish, 2700 * assemblyPace);
    } catch {
      finish();
    }
    // Measurements are taken once. Resizing completes the build rather than
    // keeping stale selection frames or measuring the layout on every frame.
    window.addEventListener("resize", finish, { once: true });
    return () => { finish(); window.removeEventListener("resize", finish); };
  }, [reduceMotion]);

  return (
    <section ref={root} className="hero" id="top"
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        lightX.set(event.clientX - bounds.left);
        lightY.set(event.clientY - bounds.top);
        lightOpacity.set(1);
      }}
      onPointerLeave={() => lightOpacity.set(0)}
    >
      <div className="hero-atmosphere" aria-hidden="true">
        <motion.div className="hero-pointer-light" style={{ x: smoothLightX, y: smoothLightY, opacity: lightOpacity }} />
        <div className="hero-ambient-light" />
        <div className="hero-glints">
          {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
        </div>
      </div>
      {children}
      {building && <button className="hero-assembly-skip" onClick={() => stop.current()} type="button">Skip intro ↗</button>}
    </section>
  );
}
