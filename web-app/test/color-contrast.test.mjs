import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Reads the real theme tokens, so a token edited below WCAG AA fails here.
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const { CATEGORY_ORDER, getCategoryColor } = await import(
  new URL("../src/components/matches/categories.ts", import.meta.url).href
);

const block = (selector) => {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
};
const themes = { light: block(":root"), dark: { ...block(":root"), ...block(".dark") } };

const oklchToRgb = (l, c, h) => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return linear.map((x) => {
    const v = Math.min(1, Math.max(0, x));
    return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  });
};

const toRgb = (value) => {
  if (value.startsWith("#")) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const oklch = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (oklch) return oklchToRgb(...oklch.slice(1).map(Number));
  throw new Error(`unsupported color ${value}`);
};

const color = (theme, token) => (token.startsWith("#") ? toRgb(token) : toRgb(themes[theme][token]));
// Tailwind's `bg-x/10` is the token at 10% over what lies beneath.
const over = (fg, alpha, bg) => fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha)));

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const expectContrast = (theme, fg, bg, min) => {
  const actual = ratio(Array.isArray(fg) ? fg : color(theme, fg), Array.isArray(bg) ? bg : color(theme, bg));
  assert.ok(actual >= min, `${theme}: ${fg} on ${bg} is ${actual.toFixed(2)}:1, needs ${min}:1`);
};

for (const theme of ["light", "dark"]) {
  test(`${theme}: secondary text is readable on the page, cards and grey areas`, () => {
    for (const bg of ["background", "card", "muted", "success-muted"]) expectContrast(theme, "muted-foreground", bg, 4.5);
  });

  test(`${theme}: plum buttons and links are readable`, () => {
    expectContrast(theme, "primary-foreground", "primary", 4.5);
    expectContrast(theme, "primary", "background", 4.5);
    expectContrast(theme, "primary", "card", 4.5);
  });

  test(`${theme}: error, success and warning messages are readable`, () => {
    expectContrast(theme, "destructive", "background", 4.5);
    expectContrast(theme, "destructive", "card", 4.5);
    expectContrast(theme, "success", "card", 4.5);
    expectContrast(theme, "warning", "warning-muted", 4.5);
    for (const box of ["destructive-muted", "success-muted", "warning-muted"]) expectContrast(theme, "foreground", box, 4.5);
    expectContrast(theme, "destructive", "destructive-muted", 3);
    expectContrast(theme, "success", "success-muted", 3);
  });

  test(`${theme}: placeholders stay readable in fields, even hovered`, () => {
    // Dark fields are filled with the input token (dark:bg-input/10, hover /20).
    const alphas = theme === "dark" ? [0.1, 0.2] : [0];
    for (const alpha of alphas) {
      expectContrast(theme, "muted-foreground", over(color(theme, "input"), alpha, color(theme, "card")), 4.5);
    }
  });

  test(`${theme}: field borders and the keyboard focus ring stand out`, () => {
    for (const bg of ["background", "card"]) {
      expectContrast(theme, "input", bg, 3);
      expectContrast(theme, "ring", bg, 3);
    }
  });

  test(`${theme}: artwork status badges are readable`, () => {
    for (const badge of ["not-scanned", "matches-found", "no-matches"]) expectContrast(theme, "#ffffff", badge, 4.5);
    expectContrast(theme, "background", "muted-foreground", 4.5);
    expectContrast(theme, "blacklisted-foreground", "blacklisted", 4.5);
  });

  test(`${theme}: the match count badge is readable, including zero`, () => {
    const tint = over(color(theme, "primary"), theme === "light" ? 0.1 : 0.15, color(theme, "card"));
    expectContrast(theme, "primary", tint, 4.5);
    expectContrast(theme, "muted-foreground", "muted", 4.5);
  });

  test(`${theme}: every website category colour is visible on its card`, () => {
    for (const category of CATEGORY_ORDER) {
      expectContrast(theme, toRgb(getCategoryColor(category, theme === "dark")), "card", 3);
    }
  });
}
