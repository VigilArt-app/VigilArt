# VigilArt — Brand Guidelines for AI Coding Agents

This file is the source of truth for implementing the VigilArt visual identity across the website, application, pitch deck, social media, and external communications.

## 1. Core principles

- Keep the interface neutral, structured, and spacious.
- Place artists’ work at the center of the visual identity.
- Reserve plum for primary actions, important links, selections, and brand markers.
- Avoid gratuitous decoration, decorative gradients, and glow effects.
- Maintain the same identity across all platforms.

## 2. Color system

### Visual distribution

- Dominant color: 60 to 70% of the composit ion.
- Secondary color: 20 to 30%.
- Accent color: 5 to 10%.

### Light mode

| Role | Color | Code |
|---|---|---|
| Dominant background | White | `#FFFFFF` |
| Card and window surfaces | White | `#FFFFFF` |
| Secondary background and subtle elements | Very light gray | `#F5F5F5` |
| Brand accent | VigilArt plum | `#5E3B7D` |
| Primary text | Soft black | `#0A0A0A` |
| Text on secondary background | Charcoal | `#171717` |
| Secondary text | Gray | `#737373` |
| Borders and fields | Light gray | `#E5E5E5` |
| Error and destructive actions | Red | `#E7000B` |
| Focus ring | Medium gray | `#A1A1A1` |

### Dark mode

| Role | Color | Code |
|---|---|---|
| Dominant background | Soft black | `#0A0A0A` |
| Card and window surfaces | Dark charcoal | `#171717` |
| Secondary background and subtle elements | Charcoal | `#262626` |
| Brand accent | Light plum | `#B692DB` |
| Primary text | Off-white | `#FAFAFA` |
| Text on plum accent | Dark charcoal | `#171717` |
| Secondary text | Light gray | `#A1A1A1` |
| Borders | White at 10% | `rgba(255, 255, 255, 0.10)` |
| Field borders | White at 15% | `rgba(255, 255, 255, 0.15)` |
| Error and destructive actions | Light red | `#FF6467` |
| Focus ring | Gray | `#737373` |

In the codebase, the plum brand accent is technically named `primary`. The variable named `accent` refers to the subtle gray: `#F5F5F5` in light mode and `#262626` in dark mode. Reference values: `web-app/src/app/globals.css:45`.

### Purple shades derived from the poster

Use only these shades when a composition draws from the official poster colors:

| Token | Code |
|---|---|
| Violet 100 | `#F1EBF6` |
| Violet 200 | `#E8DCF3` |
| Violet 300 | `#D9C7EB` |
| Violet 500 | `#B692DB` |
| Violet 800 | `#5E3B7D` |

Do not use the poster’s beige, coral, or navy blue as VigilArt brand colors.

### Functional colors

| Function | Light mode | Dark mode |
|---|---|---|
| Error and destructive actions | `#E7000B` | `#FF6467` |
| Success | `#008300` | `#008300` |
| Information | `#2A78D6` | `#2A78D6` |

Functional colors retain their defined meaning. Never use plum for errors, success states, or data categories.

### CSS tokens

```css
:root {
  --va-bg: #ffffff;
  --va-card: #ffffff;
  --accent: #f5f5f5;
  --primary: #5e3b7d;
  --va-text: #0a0a0a;
  --va-text-on-secondary: #171717;
  --va-text-muted: #737373;
  --va-border: #e5e5e5;
  --va-field-border: #e5e5e5;
  --va-focus-ring: #a1a1a1;
  --va-error: #e7000b;
  --va-success: #008300;
  --va-info: #2a78d6;

  --va-violet-100: #f1ebf6;
  --va-violet-200: #e8dcf3;
  --va-violet-300: #d9c7eb;
  --va-violet-500: #b692db;
  --va-violet-800: #5e3b7d;
}

[data-theme="dark"] {
  --va-bg: #0a0a0a;
  --va-card: #171717;
  --accent: #262626;
  --primary: #b692db;
  --va-text: #fafafa;
  --va-text-on-primary: #171717;
  --va-text-muted: #a1a1a1;
  --va-border: rgba(255, 255, 255, 0.10);
  --va-field-border: rgba(255, 255, 255, 0.15);
  --va-focus-ring: #737373;
  --va-error: #ff6467;
}
```

## 3. Typography

Use no more than two font families in the interface.

### Font families

- `Geist Sans`: headings, body text, navigation, buttons, and labels.
- `Geist Mono`: technical data, identifiers, code, timestamps, and values that require consistent alignment.

The serif design of the VigilArt wordmark belongs exclusively to the official logo. Never imitate it with a decorative typeface in the interface.

### Font weights

- Main headings: 500 or 600, with slightly tightened letter spacing.
- Section headings: 600.
- Body text: 400.
- Buttons and labels: 500.

### Reference sizes

| Use | Size |
|---|---|
| Main heading on mobile | `36px` |
| Main heading on desktop | `48px` |
| Page title | `30px` |
| Card title | `20px` to `24px` |
| Body text | `16px` |
| Label and button | `14px` |
| Metadata | `12px` |

Give headings character through hierarchy, scale, spacing, and composition. Do not add a third font family.

## 4. Icon system

- Use Lucide exclusively, through `lucide-react` in React projects.
- Use a consistent `2px` stroke width.
- Use the standard sizes `16px`, `20px`, or `24px`.
- Pair an icon with a text label when the action may be ambiguous.
- Give icon-only buttons an accessible name using `aria-label` or visually hidden text.
- Do not mix Lucide with another icon library.
- Do not draw a custom SVG when a suitable Lucide icon exists.
- Do not use emoji as interface icons.

Example:

```tsx
import { Search } from "lucide-react";

<button type="button" aria-label="Search">
  <Search size={20} strokeWidth={2} aria-hidden="true" />
</button>
```

## 5. Artwork and image direction

Artists’ work is the primary visual universe of VigilArt. Generic photography and decorative illustrations must not compete with it.

### Required treatment

- Preserve the original colors of each artwork. Do not apply a brand filter.
- Never stretch or distort an artwork.
- Use a square crop with `object-fit: cover` in galleries.
- Preserve the original proportions in detailed views.
- Use white, soft black, or neutral gray backgrounds.
- Add a light shadow and subtle border only when separation is necessary.
- Use a black overlay only when text requires additional contrast.
- Use the same corner radius on all thumbnails.
- Use only authorized artwork in external communications.
- Maintain consistent lighting, framing logic, neutral atmosphere, and treatment within each medium.

Do not mix generated visuals, stock photography, 3D illustrations, and decorative vector drawings on the same medium.

## 6. Grid, spacing, and responsive behavior

Use a grid based on `8px`. Use `4px` only for small adjustments.

### Allowed scale

```text
4, 8, 16, 24, 32, 48, 64px
```

Do not introduce arbitrary values unless a component-specific constraint is documented.

### Layout rules

- Maximum width for public pages: `1152px`.
- Horizontal margin on mobile: `16px`.
- Horizontal margin on tablet: `24px`.
- Application page margin on desktop: `32px`.
- Spacing between major blocks: `24px`.
- Card padding: `24px`.
- Spacing between a label and its field: `8px`.

### Responsive grids

- Mobile: one column.
- Tablet: up to two columns.
- Desktop application: three columns.
- Large-screen gallery: no more than four columns.

Use the breakpoints already defined in the project. The margins and column counts above remain mandatory even if breakpoint values vary by implementation.

### Corner radii

- Fields and buttons: `8px`.
- Cards and large containers: `12px`.
- Pills and switches: fully rounded.

```css
:root {
  --va-space-1: 4px;
  --va-space-2: 8px;
  --va-space-3: 16px;
  --va-space-4: 24px;
  --va-space-5: 32px;
  --va-space-6: 48px;
  --va-space-7: 64px;

  --va-radius-control: 8px;
  --va-radius-container: 12px;
  --va-radius-pill: 9999px;
  --va-content-max: 1152px;
}
```

## 7. Cross-platform consistency

The website, application, pitch deck, social media, and external communications must use:

- The same official black or white logo.
- The same plum accent `#5E3B7D`.
- The same neutral backgrounds; use light purple shades only as occasional poster-derived accents.
- Geist Sans for communications and interface text.
- The same simple typographic hierarchy.
- Artwork as the central visual element.
- Spacious, structured compositions without gratuitous decoration.

### Presentations and social media

- Keep an outer margin of at least 5% of the medium’s width.
- Limit each composition to one main idea.
- Reserve plum for short headings, markers, and calls to action.
- Apply the same image treatment used in the application.
- Avoid decorative gradients and glow effects.

## 8. Logo system and scaling

Use the provided official assets. Do not recreate the monogram or wordmark in HTML, CSS, canvas, or with a font.

| Use | Asset | Minimum size |
|---|---|---|
| Favicon | Simplified favicon | `16 × 16px` |
| Interface | VigilArt monogram | `24 × 24px` |
| Communications | Full wordmark | `120px` wide on screen or `30mm` in print |

- Below `120px` wide, replace the full wordmark with the monogram.
- Keep a clear space around the logo equal to at least 25% of its height.
- The logo may be enlarged without limit as long as its aspect ratio is preserved.

### Approved versions

- Black logo on a light background.
- White logo on a dark background.
- Dedicated favicon for very small sizes.

## 9. Prohibited uses

Never:

- Stretch, compress, tilt, rotate, or crop the logo.
- Modify the logo’s proportions.
- Recolor the logo in plum or apply a gradient to it.
- Add a shadow, outline, glow, or light effect to the logo.
- Place the logo over a visually busy image.
- Use the full wordmark below its minimum size.
- Use more than two font families.
- Mix Lucide with emoji, another icon library, or improvised SVGs.
- Use multiple card radii without a defined rule.
- Add a color without a defined purpose.
- Apply a brand filter to an artwork.
- Use pure black as a large surface, except when reproducing the logo.
- Use plum for errors, success states, or data categories.
- Change the identity between the website, application, presentations, and social media.

## 10. Implementation checklist

Before considering an interface or communication asset complete, verify:

- [ ] The 60–70 / 20–30 / 5–10 distribution is respected.
- [ ] Every color comes from a defined token.
- [ ] Geist Sans and Geist Mono are the only interface font families.
- [ ] Every interface icon comes from Lucide and uses a `2px` stroke.
- [ ] Every icon-only action has an accessible name.
- [ ] Artwork colors and proportions remain intact.
- [ ] Image framing and atmosphere are consistent.
- [ ] Spacing uses the allowed scale.
- [ ] Margins and column counts match the screen size.
- [ ] The correct logo asset, contrast, clear space, and minimum size are used.
- [ ] The result remains consistent with other VigilArt platforms.
- [ ] None of these guidelines’ prohibited uses appear in the result.

## 11. Instructions for AI agents

When implementing or reviewing a VigilArt interface:

1. Reuse the official tokens and assets before creating a new element.
2. Reject visual choices that contradict this file, even if they appear in an isolated legacy component.
3. Limit changes to the requested scope and follow neighboring components that comply with these guidelines.
4. Do not invent a missing brand rule. Flag the ambiguity and request a decision.
5. Treat artwork as protected content. Do not alter, recolor, or repurpose it as decoration.
