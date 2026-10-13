# Luxury Editorial Itinerary Experience & Performance Enhancements

An elevated, editorial-grade itinerary experience featuring a scroll-aware sticky Day Jumper, organized dossier tabs (Daily Schedule, Hotels, Inclusions & Info), and an ultra-lightweight high-resolution photo lightbox—delivering luxury travel aesthetics with zero performance lag.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed based on your selections:

- **Confirmed Layout & Navigation**:
  - **Sticky Day Jumper Bar**: A horizontal scroll-aware pill navigation bar (`Day 01`, `Day 02`, `Day 03`, etc.) that floats gently beneath the header as the traveler scrolls down the schedule, highlighting the currently viewed day in real time and supporting smooth 1-tap jumping.
  - **Tabbed Dossier Architecture**: Three clean, segmented views at the top level of the dossier:
    1. **Daily Schedule** (the day-by-day itinerary narrative, image pairings, and highlights).
    2. **Hotels & Accommodations** (curated stay cards with city, property name, nights, and stay tags).
    3. **Inclusions & Travel Info** (transparent split layout of Inclusions, Exclusions, Visa guidelines, and Terms).
- **Confirmed Visual & Media Feature**:
  - **Full-Screen Photo Lightbox**: Tapping any day photo opens a crisp, high-res photo viewer with backdrop dimming, image caption/day credit, keyboard navigation (Escape / Arrow keys), and zero third-party bundle weight.
- **Confirmed Action Scope**:
  - **Visual Polish Focus**: Keep interactions focused on effortless browsing and elegant luxury typography; avoid heavy multi-step calculators or complex state trees to ensure 60fps scrolling and instant page loads.
  - **Actions Alignment**: Maintain the streamlined action bar (Share itinerary with source PDF copy, instant WhatsApp inquiry, clean A4 print brochure).

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the existing flat list of card blocks into an editorial, magazine-grade itinerary dossier. Travelers can quickly jump across days, inspect high-resolution photography without page disruption, and switch between daily activities, accommodation details, and inclusions seamlessly.
- **Target Audience / Persona**: Discerning luxury travelers, couples, families, and travel planners reviewing bespoke tour itineraries on mobile or desktop.
- **Key Value**: Provides an organized, premium presentation matching high-end travel brochures while maintaining 100/100 performance: instant render times, zero jank, and seamless printability.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Arrival & Hero Overview**: The traveler lands on the itinerary with the branded emblem, destination title, duration, price, and luxury inclusions badges.
2. **Tabbed Dossier Switching**:
   - The user can select between **Daily Schedule**, **Hotels & Stays**, and **Inclusions & Info** using a clean segmented control.
   - Tab switching is instant (client-side state, zero network request).
3. **Day-by-Day Browsing with Sticky Jumper**:
   - In the **Daily Schedule** tab, as the user scrolls, a quiet, frosted day navigation bar sticks to the viewport with chips: `Day 01`, `Day 02`, `Day 03`...
   - An IntersectionObserver tracks which day is currently in view and automatically highlights the active day chip with smooth horizontal auto-scrolling.
   - Clicking any day chip smoothly scrolls the view directly to that day.
4. **Immersive Photo Lightbox**:
   - Clicking any day image opens the lightbox modal.
   - Shows the photo in its native aspect ratio with dark glassmorphism backdrop, day title caption, and clear close button (`×` or `Esc`).
5. **Print & Share Consistency**:
   - The print stylesheet automatically expands all tabs into a comprehensive, multi-page A4 document brochure, ensuring physical prints or saved PDFs include the complete itinerary regardless of which tab was active on screen.

### Visual Identity & Theme

- **Aesthetic Direction**: High-end travel monograph / editorial magazine aesthetic.
- **Color Palette**:
  - Dominant Neutral: Crisp alabaster canvas (`#FFFFFF` / `dark:bg-slate-950`).
  - Structural Surfaces: Soft stone/slate cards with hairline borders (`border-border`), subtle warm shadows.
  - Accents: Deep Forest Ink (`#1C2833`) and Warm Luxury Gold (`#D4AF37` / `text-gold` / `border-gold/40`).
- **Typography & Rhythm**:
  - Playfair/Merriweather serif display headings paired with high-legibility sans-serif body type.
  - Tabular numerals (`tabular-nums`) for day indicators and prices.
  - Micro-metadata rendered with clean typographic separators (`·`), avoiding clustered static pills.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Custom Zero-Dependency Lightbox vs. Heavy NPM Library**
  - *Chosen Approach*: A bespoke React portal modal with keyboard listeners and CSS backdrop blur.
  - *Why*: Eliminates 40KB–100KB of external npm dependencies, guarantees zero bundle bloat or hydration lag, and matches the app's exact design tokens.
  - *Alternatives Considered*: `yet-another-react-lightbox` or `photoswipe` (rejected to prevent package bloat and keep page ultra-lean).
- **Decision 2: Native IntersectionObserver for Sticky Day Jumper**
  - *Chosen Approach*: Lightweight `IntersectionObserver` with passive scroll listening.
  - *Why*: 60fps buttery-smooth tracking without main-thread scroll event throttling or layout thrashing.
- **Decision 3: Print Mode Auto-Expansion**
  - *Chosen Approach*: In `@media print`, display all tabs (`Schedule`, `Hotels`, `Inclusions`) sequentially.
  - *Why*: Ensures that guests who print or save the brochure receive the complete itinerary package without needing to print each tab individually.

---

## 4. Technical Architecture & Data Strategy

### Component Hierarchy & Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 ItineraryDetailView.tsx                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Hero Card (Title, Badges, Overview, Fast Info)        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Segmented Dossier Tabs: [Schedule] [Hotels] [Info]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Tab: Daily Schedule ────────────────────────────────┐  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Sticky Day Jumper Bar (Day 1 · Day 2 · Day 3)   │  │  │
│  │  │ (Active day tracked via IntersectionObserver)   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Day-by-Day Cards with 2-Column Photo Grid       │  │  │
│  │  │ [Image Click] ───► Opens Image Lightbox Modal   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Tab: Hotels & Stays ────────────────────────────────┐  │
│  │  Curated Accommodation Cards with City, Stay & Nights │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Tab: Inclusions & Travel Info ──────────────────────┐  │
│  │  Two-Column Inclusions/Exclusions + Visa & Guidelines │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Image Lightbox Modal (Portal, Esc key, Backdrop)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Floating / Sticky Actions (Share + WhatsApp Enquiry)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### State & Handler Strategy

- `activeTab`: `'schedule' | 'hotels' | 'info'` (default: `'schedule'`).
- `activeDay`: `number` (tracks visible day number for sticky navigation highlighting).
- `lightboxImage`: `{ url: string; caption: string } | null` (manages full-screen preview state).
- `handleDayJump(dayNum: number)`: Smoothly scrolls to `#day-${dayNum}` with header offset compensation.
