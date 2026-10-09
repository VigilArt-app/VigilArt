"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

// A line travelling down the visitor's own artwork while the search runs. It is
// the only animation on the page, and it is here because the wait is 60 to 120
// seconds: without it there is no evidence anything is happening.
export function ScanSweep({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let start: number | null = null;

    // Redraw at the element's real pixel size so the line stays crisp on a
    // high-density screen and does not stretch when the panel resizes.
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (now: number) => {
      if (start === null) start = now;
      const { width, height } = canvas;
      // 2.4s down, 2.4s back, so the eye reads one object moving rather than a
      // line that teleports to the top.
      const cycle = ((now - start) % 4800) / 4800;
      const progress = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
      const y = progress * height;
      const band = Math.max(height * 0.06, 24);

      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, y - band, 0, y + band);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.55)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, y - band, width, band * 2);

      context.fillStyle = "rgba(255,255,255,0.9)";
      context.fillRect(0, y, width, Math.max(1, window.devicePixelRatio || 1));

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div className="relative mx-auto w-fit overflow-hidden rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element -- object URL of a
          file the visitor just picked; next/image cannot optimise a blob. */}
      <img
        src={src}
        alt={alt}
        className="block max-h-64 w-auto opacity-80"
      />
      {!reduceMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay"
        />
      )}
    </div>
  );
}
