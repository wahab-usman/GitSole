# Handoff: Gitsole — thrift footwear storefront

## Overview
Gitsole is a Pakistani thrift footwear brand selling hand-picked, condition-graded branded
pre-owned shoes. Single-piece stock: one pair, one size, one price. Free home delivery
nationwide, cash on delivery, WhatsApp as the parallel sales channel.

This bundle covers the full storefront: 12 screens, each designed at desktop (1440px) and
mobile (390px).

## About the design files
The files here are **design references written in HTML** — prototypes that show intended
look and behaviour. They are not production code to copy. Recreate them in your target
codebase using its existing framework, component library and conventions. If there is no
codebase yet, pick the framework that suits the project (Next.js + Tailwind is a natural
fit for this one) and build there.

Two implementation notes before you start:
- The prototype is a single canvas showing all 24 artboards side by side. In production
  each artboard is a route, not a section.
- The prototype uses a custom `<image-slot>` web component as a drag-and-drop photo
  placeholder. Replace it with your own image component (`next/image` or equivalent).
  Photos in the prototype are stand-in Pexels stock, not real product shots.

## Fidelity
**High fidelity.** Colours, type, spacing, copy and interaction timings are final and
should be matched. Copy is production-ready English — use it verbatim.

---

## Approach: mobile first

Design and build mobile first, then widen. Pakistan's traffic for this category is
mobile-majority and the brand's discovery channels are Instagram, TikTok and WhatsApp,
so mobile is the primary surface, not a reduction of desktop.

Breakpoints used in the designs:

| Token | Width | Notes |
|---|---|---|
| base | 0–767px | Designed at 390px. Single column, 18px page gutters. |
| md | 768–1279px | Two-up product grid, sidebar filters become a sheet. |
| lg | 1280px+ | Designed at 1440px. Three/four-up grids, 40–56px gutters. |

Rules that carry across breakpoints:
- Page gutter: 18px mobile, 40px desktop, 56px on editorial sections (home, about, guide).
- Product grid: 2 columns mobile, 3 columns shop desktop, 4 columns home/related.
- Every tap target is at least 44px tall. Primary buttons are 15–16px padding.
- Filters are a left rail at lg, a bottom sheet below that.
- The buy column on product detail is `position: sticky; top: 0` at lg only; below lg
  it becomes a fixed bottom action bar (Add to cart + WhatsApp icon button).

---

## Design tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| `ink` | `#16130F` | Text, dark sections, primary buttons, condition chip |
| `paper` | `#F1EDE4` | Page background, text on ink |
| `card` | `#FAF8F3` | Product card and summary panel background |
| `oxblood` | `#8C2F23` | Accent: brand labels, primary CTA, links, condition fill |
| `rose` | `#E8B4AB` | Accent on ink backgrounds only (free/none values, order ids) |
| `body` | `#4A443B` | Body copy |
| `muted` | `#6E6558` | Secondary copy |
| `faint` | `#8B8377` | Labels, struck-through prices, disabled |
| `disabled` | `#B5AC9E` | Unavailable sizes |
| `imageBg` | `#E6E1D6` | Photo frame background |
| `line` | `rgba(22,19,15,0.14)` | Hairline dividers and artboard borders |
| `lineStrong` | `rgba(22,19,15,0.22)` | Input and chip borders |
| `onInk` | `rgba(241,237,228,0.65–0.75)` | Body copy on ink |
| `onInkLine` | `rgba(241,237,228,0.2–0.4)` | Dividers and outline buttons on ink |

Only two background colours in the whole site: paper and ink. Nothing else.

### Typography
Three families, loaded from Google Fonts:

```
Bricolage Grotesque — 600, 800   display, headings, prices, product names
Instrument Sans     — 400, 500, 600   body copy, buttons, nav
DM Mono             — 400, 500   labels, sizes, condition scores, item codes, prices in tables
```

| Role | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero (desktop) | Bricolage | 88px | 800 | 0.88 | -0.045em |
| Hero (mobile) | Bricolage | 44px | 800 | 0.90 | -0.04em |
| Page title (desktop) | Bricolage | 44–46px | 800 | 1.0 | -0.035em |
| Page title (mobile) | Bricolage | 28–34px | 800 | 0.98 | -0.04em |
| Section heading | Bricolage | 26–38px | 800 | 1.05 | -0.03em |
| Product name (card) | Bricolage | 16–17px | 600 | 1.2 | 0 |
| Product name (PDP) | Bricolage | 44px desktop / 30px mobile | 800 | 1.0 | -0.035em |
| Price | Bricolage | 19–34px | 800 | 1.0 | 0 |
| Body | Instrument Sans | 14–18px | 400 | 1.55–1.65 | 0 |
| Button | Instrument Sans | 15–16px | 600 | 1 | 0 |
| Mono label | DM Mono | 10–12px | 400 | 1 | 0.12–0.16em, uppercase |

Minimum body size is 13px (mobile secondary copy). Never smaller.

### Spacing
4px base. Used steps: 4, 7, 9, 12, 14, 18, 22, 26, 32, 40, 44, 56, 64, 76.
Card padding 10px mobile / 14px desktop. Section padding 22–30px mobile / 48–76px desktop.

### Shape
No border radius anywhere except: pills (`999px`) on the "Quality over quantity" badge,
the desktop search field, and the cart badge; and `22px 22px 0 0` on the mobile filter
sheet. Everything else is square. No shadows anywhere.

---

## Condition grading system

Central to the brand — implement it as real data, not decoration.

Each product carries a numeric score out of 10 and a worded tier:

| Tier | Score | Meaning | Typical price |
|---|---|---|---|
| Like new | 9.5–10 | Barely worn, no visible flaws beyond faint sole marks | 45–60% of retail |
| Excellent | 8.5–9 | Light wear, clean upper, minor creasing | 30–45% of retail |
| Great | 7.5–8 | Clearly worn but strong, tread well above half | 25–35% of retail |
| Good | 6.5–7 | Honest wear at an honest price, every flaw photographed | 15–25% of retail |

Displayed as:
- **Card badge** — ink chip, top-left of photo, DM Mono 10px uppercase, `4px 8px` padding:
  `9/10 · EXCELLENT`. Mobile shows the score only.
- **PDP block** — ink panel with the heading `Condition 9 / 10 · Excellent`, a 5px track
  (`rgba(241,237,228,0.25)`) with an oxblood fill at `score × 10`%, then written notes
  naming upper, midsole, outsole, insoles and laces.
- **Guide page** — the four tiers with example photography and price bands.

Every listing must also carry a flaw close-up photo, framed with a `1.5px solid #8C2F23`
border and captioned. If a shoe has visible wear it is shown.

---

## Screens

All 12 exist at both widths. Route names are suggestions.

### 1. Home — `/`
Hero: two-column grid at lg (`minmax(0,1.05fr) minmax(0,1fr)`, min-height 560px), copy left,
full-bleed photo right; stacked on mobile with the photo at 230px tall below the copy.
Copy column uses `justify-content: space-between`.

**Use `minmax(0,1fr)` for every grid track that holds an image.** A plain `1fr` track takes
its min-width from the image's min-content and blows the layout out. This bit the prototype
three times.

Below the hero: a four-up value strip (free delivery / cash on delivery / graded condition /
one pair only), a "This week's selection" grid of 4, an ink manifesto band
("Quantity se zyada quality." plus the four selection criteria), a brand chip row, footer.

### 2. Shop all — `/shop`
Header with count ("48 pairs available"), sort and view controls. 270px filter rail at lg
(brand with counts, UK size grid, condition tiers, price range slider); at md and below the
rail becomes a bottom sheet opened by a `Filter · 2` chip. Active filters render as
removable ink chips above the grid. 3-up grid desktop, 2-up mobile, "Load more pairs" button.

### 3. Search results — `/search?q=`
Large bordered search field (`1.5px solid #16130F`), suggestion chips beneath, result count
headline, and a horizontal card layout (120px thumb desktop, 92px mobile) rather than the
vertical grid card.

### 4. Product detail — `/product/[code]`
Two columns at lg: gallery `minmax(0,1fr)`, buy column fixed 560px and sticky.
Gallery is a 2-column grid — main photo spans both at 4:3, sole and heel at 1:1, flaw
close-up spans both at 16:7 with the oxblood border.
Buy column order: brand label, name, price + struck retail + "63% below retail" chip,
condition block, size row (available size filled ink, others struck through and disabled),
Add to cart (oxblood) then Order on WhatsApp (outline), four trust lines, details table.
Mobile: 300px swipeable gallery with dots, then the same content stacked, with a fixed
bottom bar holding Add to cart plus a 56×52px WhatsApp icon button.

### 5. Sold out — `/product/[code]` (sold state)
Photo greyed with an ink `SOLD` plate centred. Name and price render in `#8B8377`.
A bordered panel explains single-piece stock and takes a WhatsApp number for a
"notify me when something close arrives" alert. Related pairs below.

**Empty results** (mobile artboard) — zero-state for a filter combination with no stock:
a `0` in a bordered square, a headline naming the filter ("Nothing in UK 6 from Timberland
right now"), a size-alert capture, a clear-filters link, then in-stock suggestions.

### 6. Cart — `/cart`
"reserved for 30 minutes" line under the title. Rows carry a 150px thumb, brand, name,
size / score / item code, and the line "Single pair — cannot increase quantity" — there is
no quantity stepper anywhere in this product. Ink summary panel: subtotal, Delivery = Free,
COD charge = None, total, then Checkout (oxblood) and "Send this cart to WhatsApp" (outline).

### 7. Checkout — `/checkout`
Stripped header (logo, "Secure checkout · cash on delivery", WhatsApp help link) — no nav.
Fields: full name, WhatsApp number, complete address, city, province. Payment is two radio
cards: Cash on delivery (default) and Bank transfer / Easypaisa with a "Save 3%" note.
A required checkbox acknowledging the shoes are pre-owned and the condition notes were read.
Order summary panel repeats line items and ends on "Pay on delivery".
Mobile uses a three-step progress row (Details / Payment / Confirm) and a fixed bottom
summary bar.

### 8. Order confirmation — `/order/[id]`
Full-width ink band with the order number, "Order placed. We'll message you on WhatsApp.",
and the customer's number. Below: a numbered four-step "What happens next" list with
timings (confirm on WhatsApp → prepared → dispatched → delivered), and an order panel
with items, total and delivery address.

### 9. Track order — `/track`
Order-number field, then a vertical timeline: dot, title, body, timestamp, with completed
steps in oxblood and the pending step in `#DAD5CB`. Ink side panel carries courier name,
tracking number, the cash amount to keep ready and the item thumbnails.

### 10. Condition guide — `/condition-guide`
Editorial page. Four tier columns with example photo, score range, name, description and
price band. Then a six-item "What we check" list (upper, midsole, outsole, inside,
structure, authenticity) and an ink returns panel.

### 11. About — `/about`
Large statement headline, wide photo band, problem/solution two-up, ink values grid of six,
closing statement with two CTAs.

### 12. Contact & FAQ — `/contact`
Three contact cards (WhatsApp primary in ink, Instagram, email) with response times, a short
message form, and an accordion of six FAQs in a `#FAF8F3` panel.

---

## Interactions & animation

Intensity is deliberately calm. Everything below respects
`prefers-reduced-motion: reduce` — when set, skip all of it and render final states.

| # | Interaction | Spec |
|---|---|---|
| 1 | **Product card hover** (pointer devices only) | Card lifts `translateY(-3px)`, border goes `rgba(22,19,15,0.12)` → `rgba(22,19,15,0.4)`, both `300ms ease`. An overlay inside the photo fades `opacity 0 → 1` over `350ms ease`, showing a second product angle and an ink "Add to cart" bar pinned to the bottom of the photo. Photo container is `overflow: hidden`. |
| 2 | **Grid reveal on scroll** | IntersectionObserver at `threshold: 0.15`, fires once. Each card animates `opacity 0 → 1` and `translateY(18px) → none` over `560ms`, easing `cubic-bezier(.2,.7,.2,1)`, staggered `45ms` by index **within its own grid** (reset the counter per container, don't stagger across the page). |
| 3 | **Condition bar fill** | IntersectionObserver on the **track** (`threshold: 0.5`), animating the child fill `width: 0 → score×10%` over `900ms` after a `180ms` delay, easing `cubic-bezier(.22,1,.36,1)`. Observe the track, not the fill — a zero-width element has zero area and never satisfies a non-zero threshold. |
| 4 | **Delivery marquee** | Header strip scrolls `translateX(0 → -50%)` over `46s linear infinite` with the content duplicated twice. Pauses on hover. Copy: free delivery / cash on delivery / every pair inspected by hand / one pair, one size, one price / not as described? we take it back. |
| 5 | **Add to cart** | A ghost rectangle sized to the product photo animates from the photo to the cart icon — `translate` to the delta plus `scale` down to 26px, `opacity .85 → .15`, `720ms`, easing `cubic-bezier(.5,0,.2,1)`. On finish the ghost is removed and the badge pops `scale 1 → 1.5 → 1` over `420ms`, then increments. |
| 6 | **Mobile filter sheet** | `translateY(100% → 0)` over `600ms`, easing `cubic-bezier(.22,1.15,.36,1)` (slight overshoot). Backdrop fades `rgba(22,19,15,0) → rgba(22,19,15,0.45)` over `450ms ease`. |
| 7 | **Sticky buy column** | `position: sticky; top: 0; align-self: start` at lg only. |

Not animated on purpose: page loads, headings, hero, form fields, section transitions.

---

## State

| State | Where | Notes |
|---|---|---|
| `cart: CartItem[]` | global | Max one of each item; no quantity field. Persist locally, 30-minute soft reservation. |
| `filters` | shop route | `{ brands: string[], sizes: string[], conditions: Tier[], priceRange: [number, number] }`. Mirror to the URL so filtered views are shareable — the WhatsApp channel depends on sending links. |
| `sheetOpen: boolean` | shop mobile | Filter sheet. |
| `sortBy` | shop route | Newest first (default), price asc/desc, condition. |
| `checkout` | checkout route | name, whatsapp, address, city, province, paymentMethod, conditionAcknowledged. |
| `sizeAlerts` | sold-out / empty states | `{ phone, brand?, size }` posted to the notify endpoint. |

**Data model for a product**

```ts
type Tier = "Like new" | "Excellent" | "Great" | "Good";

interface Product {
  code: string;          // "GS-0428", shown to customers and quoted on WhatsApp
  brand: string;
  model: string;
  colourway: string;
  sizeUK: string;        // single value — stock is one pair
  sizeUS: string;
  insoleCm: number;      // the only reliable fit signal on thrift stock
  score: number;         // 6.5–10, one decimal
  tier: Tier;
  conditionNotes: string;
  flaws: { photo: string; caption: string }[];
  price: number;         // PKR
  retailPrice: number;   // PKR, for the struck-through comparison
  photos: string[];      // main, sole, heel/insole, then extras
  boxIncluded: boolean;
  listedAt: string;      // drives "listed 3 days ago"
  status: "available" | "sold";
}
```

Validation: WhatsApp number must be a Pakistani mobile (`03XX XXXXXXX`). Address requires
a landmark — courier delivery in Pakistan depends on it. The pre-owned acknowledgement
checkbox is required before Place order enables.

---

## Copy rules

- English only, plain and factual. No exclamation marks.
- One Roman Urdu line is intentional and should stay: **"Quantity se zyada quality."**
- Prices are always `PKR 8,900` — space after PKR, comma thousands, no decimals.
- Never say "cheap". The framing is value: "At this price, this shoe is an amazing deal."
- Delivery is always stated as "Free home delivery — all over Pakistan".
- Never hide that stock is pre-owned. Condition language is direct.

---

## Assets

- **Fonts** — Bricolage Grotesque, Instrument Sans, DM Mono (Google Fonts). Self-host in
  production.
- **Icons** — inline SVG, 1.8–2px stroke, `currentColor`. Search, cart, WhatsApp only.
  No icon library needed.
- **Photography** — none supplied. Every image in the prototype is stand-in Pexels stock.
  Real product photography is the main outstanding dependency: each listing needs a side
  profile, a sole, a heel/insole and a close-up of every visible flaw, all on a plain
  neutral backdrop.
- **Logo** — wordmark only: `GITSOLE`, Bricolage Grotesque 800, `-0.035em` tracking.

## Files in this bundle

| File | What it is |
|---|---|
| `GitSole Website.dc.html` | All 12 screens, desktop and mobile, plus the animation logic |
| `GitsoleHeader.dc.html` | Shared header — marquee strip, nav, cart badge |
| `image-slot.js` | Photo placeholder component used by the prototype; do not port |
| `support.js` | Prototype runtime; do not port |
| `GitSole Brief.docx` | Original brand and business brief |

Open `GitSole Website.dc.html` in a browser to see everything running, including the
animations. Each screen is labelled with its number and viewport.
