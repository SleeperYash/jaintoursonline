## Real 3D Interactive Globe Homepage

Replace the current CSS-sphere hero with a **true WebGL 3D globe** built on Three.js + React Three Fiber. Users can freely rotate/zoom with mouse or touch, click destination pins to fly the camera there, and view the destination's itineraries in a slide-in panel — all without leaving the homepage.

### The experience

```
┌──────────────────────────────────────────────────┐
│  ✦  ·    ·       ✦      ·    starfield   ·    ✦ │
│              ╭─────────────╮          ┌────────┐ │
│   ✦       ⊙  │   🌍 EARTH  │  ⊙       │ BALI   │ │
│              │  drag/zoom  │          │ 6-8 N  │ │
│              │   ⊙    ⊙    │          │ Itin:  │ │
│              ╰─────────────╯          │ • PDF1 │ │
│   [Search ▾]  [🎲 Fly random]         │ [View] │ │
│   08°24'S · 115°11'E — BALI           └────────┘ │
└──────────────────────────────────────────────────┘
```

A full-screen `Canvas` fills the hero. The globe sits center-stage with realistic Earth day texture, subtle cloud layer, atmospheric rim glow, and a star-field background. Gold pulsing pins mark each curated destination. Floating glass-panel UI overlays sit at the corners (search, controls, coordinate readout). Clicking a pin smoothly flies the camera to that location and slides in a destination panel showing tagline, region, duration, and the actual PDF itineraries from the database.

### What gets built

**Dependencies (exact versions, React 18 compatible):**
- `three@^0.160.0`
- `@react-three/fiber@^8.18.0`
- `@react-three/drei@^9.122.0`

**New files**

- `src/lib/latLngToVec3.ts` — converts (lat, lng, radius) → THREE.Vector3 on the sphere using standard spherical projection.
- `src/components/site/globe/Earth.tsx` — the sphere mesh: day texture, normal map, specular for oceans, slow auto-rotation that pauses while user interacts.
- `src/components/site/globe/Atmosphere.tsx` — additive shader rim-glow shell behind the globe (gold-tinted to match brand).
- `src/components/site/globe/Clouds.tsx` — semi-transparent cloud sphere rotating slightly faster than Earth.
- `src/components/site/globe/Pin.tsx` — small glowing gold marker mesh + pulsing halo, raycast-clickable, with hover label using `<Html>` from drei.
- `src/components/site/globe/CameraRig.tsx` — controls + smooth fly-to logic. Wraps `<OrbitControls enableDamping dampingFactor={0.08} minDistance={1.6} maxDistance={4} enablePan={false} />` and exposes a `flyTo(latLng)` that lerps both camera position and OrbitControls target over ~1.4s with `easeInOutCubic`.
- `src/components/site/globe/Globe3D.tsx` — top-level `<Canvas>` composer: lights, stars (`<Stars>` from drei), Earth + Clouds + Atmosphere, all pins, exposes `onSelect(slug)` callback.
- `src/components/site/globe/DestinationPanel.tsx` — right-side slide-in panel (mobile: bottom drawer). Shows destination metadata + fetches PDF itineraries from `itineraries` table filtered by `destination_slug`, with "Preview" (opens existing PDF dialog) and "Plan This Journey" CTA → `/destinations/{slug}`.
- `src/components/site/globe/GlobeControls.tsx` — overlay UI: search dropdown of all destinations, "Fly random" button, coordinate readout, mini-help tooltip ("Drag to rotate · Scroll to zoom · Click pins").
- `src/components/site/GlobeHeroV2.tsx` — full-screen section wrapping `Globe3D` + overlays + panel; manages active destination state.

**Edited files**

- `src/pages/Index.tsx` — swap `<GlobeHero />` for `<GlobeHeroV2 />`.
- `src/index.css` — add `.glass-panel` util (backdrop-blur + gold hairline) for overlays; reduced-motion rule disables auto-rotate and shortens fly duration.
- `package.json` — add the three dependencies above.

**Reused, unchanged**

- `src/data/globeDestinations.ts` (lat/lng + metadata already there).
- `src/data/destinations.ts`, `findDestination()`.
- `ItineraryViewer` logic patterns (we'll reuse the public-URL builder + enquiry-gate flow inside `DestinationPanel`).
- All other homepage sections below the hero.

### Interactions in detail

- **Free rotate / zoom / pan-locked**: OrbitControls with damping; `enablePan={false}` keeps the globe centered.
- **Auto-spin**: gentle 0.05 rad/s when idle; cancels the moment user touches it; resumes after 6s of inactivity.
- **Pin click**: `flyTo(lat, lng)` rotates the camera around the globe so the chosen point ends up facing the camera; the destination panel slides in from the right (or up on mobile).
- **Hover pin**: scale up 1.4×, gold halo brightens, floating label with destination name.
- **Search**: typeahead over destination names; selecting flies camera + opens panel.
- **Random**: picks a different destination, flies there.
- **Keyboard**: ←/→ cycle destinations, Esc closes panel.
- **Mobile (≤640px)**: panel becomes a bottom sheet with drag handle; pinch-to-zoom + one-finger drag rotates.

### Itinerary integration

The destination panel queries Supabase directly:
```ts
supabase.from("itineraries").select("*").eq("destination_slug", slug)
```
Each itinerary item shows title + size, with a "Preview" button. To honor the existing flow, preview opens the same enquiry-gate dialog used in `ItineraryViewer` (extracted into a small reusable hook to avoid duplication).

### Performance

- Earth texture: 2K equirectangular JPEG (~250 KB) from a free CDN (NASA Visible Earth / three.js examples). Lazy-loaded; show a soft pulsing placeholder sphere until ready.
- One `Canvas`, one geometry per layer (Earth/Clouds/Atmosphere share `SphereGeometry` instances via memo).
- Pins use a single shared geometry + per-instance position; max ~14 pins, negligible cost.
- `dpr={[1, 2]}` to cap pixel ratio on high-DPI mobile.
- Suspend the canvas via `IntersectionObserver` once the user scrolls past the hero (saves battery).
- Respects `prefers-reduced-motion` → no auto-spin, instant fly (300ms).

### Accessibility

- Each pin has an `<Html>` invisible button with `aria-label="Fly to {name}"` for keyboard/screen-reader users.
- Search dropdown is a real combobox.
- Panel is focus-trapped while open; Esc closes.
- `<Canvas>` has `role="application"` + `aria-label="Interactive 3D globe of destinations"`.

### Out of scope

- No backend/schema changes.
- No country borders / labels overlay (keeps the texture clean & luxurious).
- No new pages or routing changes — itinerary panel is in-page.
- Other homepage sections stay exactly as they are.

### Risk & rollback

- If the 3D bundle pushes load time too high, we can lazy-load `GlobeHeroV2` with `React.lazy` + a static fallback hero — easy follow-up if needed.
- The old `GlobeHero.tsx` and `GlobeSphere.tsx` stay in the repo (unimported) so we can revert with a one-line swap in `Index.tsx`.

Approve and I'll install the deps and build it.