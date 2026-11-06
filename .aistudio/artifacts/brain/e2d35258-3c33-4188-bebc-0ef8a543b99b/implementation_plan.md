# Chatbot Shimmer Loading, Typing Indicator & Low-Usage AI Concierge

Enhance the Jain Tours & Travels chatbot with shimmer skeleton cards during package loading, a natural 700ms 3-dot typing indicator before bot replies, an ultra-low-usage Gemini AI fallback for general travel questions, and comprehensive verification of all destination package photos.

## User Review & Critical Decisions

> [!IMPORTANT]
> The AI capability is strictly configured to operate as a low-usage fallback, keeping costs minimal while preserving all existing deterministic travel flows (destinations, visas, flights, estimator, plan trip).

- **AI Usage Strategy (Confirmed)**: AI is triggered **only** for open-ended customer questions (e.g. "What is the best month to visit Kashmir?", "Do you arrange pure veg food in Switzerland?") that do not match predefined menu topics. All standard clicks and primary topics remain zero-cost deterministic flows.
- **Typing Indicator Duration (Confirmed)**: Natural 700ms pause with three animated bouncing dots before the bot response is displayed, giving a genuine concierge conversational rhythm.
- **Package Card Layout & Photos (Confirmed)**: Retain the current card layout and verify every single destination photo in `destinations.ts` with error-fallback protection so cards never display broken image icons.

---

### 1. Overview & Core Concept

- **Shimmer Skeleton Cards**: While packages load or when switching destinations, display two polished skeleton cards with animated shimmer gradients to provide instant visual feedback.
- **Natural Typing Indicator**: Render a WhatsApp-style 3-dot bouncing bubble during the 700ms response window before bot messages appear.
- **Low-Usage AI Q&A Fallback**: A server-side `/api/chat/ask` route powered by `@google/genai` (`gemini-3.8-flash` with `ThinkingLevel.LOW`, strict 180-token output, and a system prompt grounded in Jain Tours & Travels' Mumbai office and pure veg/Jain holiday offerings).
- **Package Photo Safeguards**: Verify all 25+ destination photo IDs in `src/data/destinations.ts` and add an `onError` image fallback so every package card renders crisp imagery.

---

### 2. User Experience & Visual Design

- **Shimmer Skeleton Design**:
  - Rounded-2xl card matching WhatsApp card style (`w-[240px] sm:w-auto`).
  - Image block shimmer (`h-32 bg-muted/60 animate-pulse rounded-t-2xl`).
  - Dual title bars (`h-3.5 w-3/4 bg-muted/80 rounded animate-pulse`).
  - Price & duration placeholders (`h-2.5 w-1/3 bg-muted/50 rounded`).
  - Action button placeholder (`h-8 w-full bg-muted/70 rounded-lg`).
- **Typing Indicator Animation**:
  - Displays inside a genuine `BotBubble` with the travel concierge robot avatar.
  - Three distinct bouncing dots staggered with `-0.3s`, `-0.15s`, and `0s` animation delays.
  - Automatically transitions to the bot message bubble after 700ms with a smooth scroll to bottom.
- **AI Response Presentation**:
  - Answers general travel queries succinctly in 2–3 sentences.
  - Includes quick suggestion chips ("Estimate My Trip", "Talk to Our Team", "Explore Packages") below the answer to easily guide customers back to conversion funnels.

```
┌────────────────────────────────────────────────────────┐
│  [🤖 Concierge Avatar]                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ●  ●  ●  (Typing indicator · 700ms)             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Shimmer Skeleton ──┐   ┌─ Shimmer Skeleton ──┐    │
│  │ [▒▒▒▒ Image ▒▒▒▒▒]   │   │ [▒▒▒▒ Image ▒▒▒▒▒]   │    │
│  │ ▒▒▒▒ Title ▒▒▒▒▒▒    │   │ ▒▒▒▒ Title ▒▒▒▒▒▒    │    │
│  │ [▒▒ View Details ▒]  │   │ [▒▒ View Details ▒]  │    │
│  └──────────────────────┘   └──────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server for Server-Side AI API**
  - *Chosen Approach*: Mount Express with Vite middlewares in `server.ts` (`"dev": "tsx server.ts"`).
  - *Why*: Protects `process.env.GEMINI_API_KEY` entirely on the server per security guidelines, preventing any key exposure in client bundles.
- **Decision 2: Low-Usage AI Guardrails**
  - *Chosen Approach*: `ThinkingLevel.LOW`, 200 token cap, tight concierge prompt, only invoked when deterministic matching yields no pre-built view.
  - *Why*: Stays well within the user's free tier quotas with minimal token consumption.
- **Decision 3: Zero-Flicker Package Photos**
  - *Chosen Approach*: Verify Unsplash photo IDs and add an automatic fallback to `destObj.image` and high-res travel photography if any network CDN error occurs.

---

### 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React)                        │
│                                                             │
│  HolidayPlanner.tsx                                         │
│   ├── Typing Indicator state (isTyping: boolean)            │
│   ├── Package loading skeleton state (isPkgLoading: boolean)│
│   ├── Destination package card rendering with onError guard │
│   └── Fallback query handler -> calls POST /api/chat/ask   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Fetch POST /api/chat/ask
┌──────────────────────────────▼──────────────────────────────┐
│                  Server-Side Express (server.ts)            │
│                                                             │
│  @google/genai SDK (gemini-3.8-flash, ThinkingLevel.LOW)    │
│  HTTP User-Agent: 'aistudio-build'                          │
│  Grounded System Prompt: Jain Tours & Travels Concierge     │
└─────────────────────────────────────────────────────────────┘
```

- **Dependencies to Install**: `@google/genai`, `express`, `@types/express`.
- **Files Modified/Created**:
  - `server.ts`: Express backend handling Vite middleware and `/api/chat/ask` route.
  - `package.json`: Updated `"dev": "tsx server.ts"` and `"start": "node server.ts"`.
  - `src/components/site/HolidayPlanner.tsx`: Integrated shimmer skeleton cards, 700ms typing indicator, and AI fallback query handler.
  - `src/data/destinations.ts`: Verified photo URLs and image error resilience.
