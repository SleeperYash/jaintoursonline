import React from "react";

/**
 * ChatbotAtmosphericBackground
 * 
 * Recreates the travel concierge background from the Jain Tours & Travels
 * design reference:
 * - Scenic top sky with soft atmospheric clouds
 * - Soaring commercial airliner banking with dashed travel contrail
 * - Subtle watermark silhouettes of world travel monuments (pagodas, spires, palms)
 * - Seamless light mode (soft daylight sky) and dark mode (deep midnight navy with luminous sky)
 * - 100% vector SVG + CSS gradients for zero latency, crisp high-DPI scaling, and zero network bloat
 */
export const ChatbotAtmosphericBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* Base Canvas Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-300
          bg-gradient-to-b from-[#cfe3fa] via-[#e8f1fa] to-[#f4f8fb]
          dark:from-[#081524] dark:via-[#0c1f35] dark:to-[#071220]"
      />

      {/* Top Atmospheric Sky Radial Glow */}
      <div
        className="absolute -top-12 -right-8 w-80 h-72 rounded-full blur-3xl opacity-70 transition-opacity duration-300
          bg-gradient-to-br from-[#93c5fd] via-[#bfdbfe] to-transparent
          dark:from-[#1e3a8a]/40 dark:via-[#1e293b]/30 dark:to-transparent"
      />
      <div
        className="absolute -top-16 -left-12 w-72 h-64 rounded-full blur-2xl opacity-60 transition-opacity duration-300
          bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-transparent
          dark:from-[#0f172a]/60 dark:to-transparent"
      />

      {/* Vector Scene: Airliner, Flight Trail, Soft Clouds & World Monument Silhouettes */}
      <svg
        className="absolute inset-x-0 top-0 w-full h-[360px] opacity-95 dark:opacity-90 transition-opacity duration-300"
        viewBox="0 0 440 360"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cloud Soft Gradients */}
          <linearGradient id="cloud-grad-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="cloud-grad-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
          </linearGradient>

          {/* Fade Mask for Lower Half */}
          <linearGradient id="scrim-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          <mask id="monument-mask">
            <rect width="440" height="360" fill="url(#scrim-fade)" />
          </mask>

          {/* Plane Body Gradient */}
          <linearGradient id="plane-fuselage-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="plane-fuselage-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>

        {/* 1. Atmospheric Cloud Layers (Organic layered puffs behind airliner) */}
        <g className="transition-all duration-300">
          {/* Cloud cluster top right */}
          <path
            d="M 280 45 C 290 28, 315 25, 330 35 C 342 22, 370 20, 385 35 C 400 30, 420 38, 425 55 C 435 60, 440 75, 435 88 C 420 95, 270 95, 280 45 Z"
            className="fill-white/60 dark:fill-slate-800/30"
          />
          <path
            d="M 220 70 C 235 55, 260 52, 275 62 C 290 50, 318 48, 332 62 C 345 58, 365 65, 368 80 C 378 85, 380 98, 372 108 C 355 115, 210 115, 220 70 Z"
            className="fill-white/45 dark:fill-slate-800/20"
          />

          {/* Cloud cluster top left / mid sky */}
          <path
            d="M 10 50 C 25 35, 55 35, 70 48 C 85 38, 115 40, 125 55 C 140 50, 160 60, 162 75 C 170 82, 168 95, 155 102 C 140 108, 0 108, 10 50 Z"
            className="fill-white/50 dark:fill-slate-800/25"
          />
          <path
            d="M 90 75 C 105 62, 130 62, 142 72 C 155 65, 178 68, 188 80 C 198 85, 205 98, 198 108 C 185 115, 80 115, 90 75 Z"
            className="fill-white/35 dark:fill-slate-800/15"
          />
        </g>

        {/* 2. World Travel Silhouettes (Watermark style flanking left and right, with smooth vertical fade) */}
        <g mask="url(#monument-mask)">
          {/* Left Silhouettes: Pagoda / Asian Temple & Tropical Palms */}
          <g className="fill-[#1e3a5f]/14 dark:fill-[#93c5fd]/12 transition-colors duration-300">
            {/* Pagoda Spire & Tiered Roofs */}
            <path d="M 28 32 L 30 32 L 30 55 L 28 55 Z" />
            <path d="M 29 25 L 31 32 L 27 32 Z" />
            {/* Tier 1 */}
            <path d="M 12 68 C 16 66, 24 64, 29 60 C 34 64, 42 66, 46 68 C 42 71, 36 71, 29 70 C 22 71, 16 71, 12 68 Z" />
            <rect x="22" y="68" width="14" height="12" />
            {/* Tier 2 */}
            <path d="M 8 86 C 14 83, 22 81, 29 77 C 36 81, 44 83, 50 86 C 45 89, 37 90, 29 88 C 21 90, 13 89, 8 86 Z" />
            <rect x="18" y="86" width="22" height="15" />
            {/* Tier 3 / Base */}
            <path d="M 4 108 C 12 104, 21 102, 29 97 C 37 102, 46 104, 54 108 C 48 112, 38 113, 29 111 C 20 113, 10 112, 4 108 Z" />
            <rect x="14" y="108" width="30" height="25" />
            {/* Lower Base & Columns */}
            <rect x="10" y="133" width="38" height="50" />

            {/* Subtle Tropical Palm Silhouette */}
            <path d="M 68 180 C 65 140, 62 110, 58 85 C 60 85, 62 110, 66 180 Z" />
            {/* Palm Fronds */}
            <path d="M 58 85 C 50 78, 38 76, 28 80 C 38 83, 48 87, 58 85 Z" />
            <path d="M 58 85 C 52 72, 42 65, 30 65 C 40 72, 50 78, 58 85 Z" />
            <path d="M 58 85 C 62 70, 70 60, 82 58 C 76 68, 70 77, 58 85 Z" />
            <path d="M 58 85 C 68 76, 80 74, 92 78 C 82 82, 72 85, 58 85 Z" />
            <path d="M 58 85 C 65 92, 74 98, 86 100 C 76 96, 68 91, 58 85 Z" />

            {/* Classical Architecture Arch & Dome Watermark */}
            <path d="M 75 180 L 75 145 C 75 132, 85 125, 95 125 C 105 125, 115 132, 115 145 L 115 180 Z" />
            <path d="M 85 180 L 85 152 C 85 146, 89 142, 95 142 C 101 142, 105 146, 105 152 L 105 180 Z" />
          </g>

          {/* Right Silhouettes: European Spire / Eiffel Tower & Dome Monuments */}
          <g className="fill-[#1e3a5f]/13 dark:fill-[#93c5fd]/12 transition-colors duration-300">
            {/* Tower Spire */}
            <path d="M 408 30 L 410 30 L 409 65 Z" />
            {/* Top Deck */}
            <rect x="406" y="65" width="6" height="5" />
            {/* Upper Legs */}
            <path d="M 406 70 L 402 105 L 405 105 L 408 70 Z" />
            <path d="M 412 70 L 416 105 L 413 105 L 410 70 Z" />
            {/* Middle Deck */}
            <rect x="400" y="105" width="18" height="6" />
            {/* Middle Legs */}
            <path d="M 401 111 L 392 155 L 396 155 L 404 111 Z" />
            <path d="M 417 111 L 426 155 L 422 155 L 414 111 Z" />
            {/* Lower Arch */}
            <path d="M 396 155 C 402 142, 416 142, 422 155 L 428 180 L 390 180 Z" />

            {/* Adjacent Cathedral / Palace Dome */}
            <path d="M 345 180 L 345 145 C 345 130, 355 120, 368 120 C 381 120, 391 130, 391 145 L 391 180 Z" />
            <path d="M 368 108 L 370 108 L 370 120 L 368 120 Z" />
            <circle cx="369" cy="106" r="2.5" />
          </g>
        </g>

        {/* 3. Curved Flight Path (Dashed elegant contrail) */}
        <path
          d="M 120 105 C 180 115, 220 100, 260 76 C 290 58, 315 48, 342 42"
          stroke="url(#trail-gradient)"
          strokeWidth="1.8"
          strokeDasharray="4 4.5"
          strokeLinecap="round"
          className="opacity-75 dark:opacity-60"
        />
        <defs>
          <linearGradient id="trail-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="40%" stopColor="#2563eb" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* 4. Commercial Airliner (Banking right across the sky, matching the design reference) */}
        <g transform="translate(340, 36) rotate(-14) scale(0.95)">
          {/* Subtle plane shadow for atmospheric depth */}
          <path
            d="M -30 2 C -15 6, 10 7, 30 5 C 34 4, 38 2, 40 0 C 38 -2, 34 -4, 30 -5 C 10 -7, -15 -6, -30 -2 Z"
            fill="#0f172a"
            opacity="0.12"
            filter="blur(3px)"
            transform="translate(4, 6)"
          />

          {/* Fuselage / Main Body */}
          <path
            d="M -34 0 C -25 5, 0 6, 26 5 C 33 4.5, 38 3, 42 0 C 38 -3, 33 -4.5, 26 -5 C 0 -6, -25 -5, -34 0 Z"
            className="fill-[url(#plane-fuselage-light)] dark:fill-[url(#plane-fuselage-dark)] drop-shadow-xs"
          />

          {/* Cockpit Window Visor */}
          <path
            d="M 33 1.5 C 36 1, 38 0.5, 39 0 C 38 -0.5, 36 -1, 33 -1.5 C 34 -0.5, 34 0.5, 33 1.5 Z"
            className="fill-[#1e3a8a] dark:fill-[#38bdf8]"
          />

          {/* Passenger Cabin Window Line (Subtle dots) */}
          <line
            x1="-18"
            y1="-0.5"
            x2="24"
            y2="-0.5"
            stroke="#1e3a8a"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.8"
            className="opacity-60 dark:opacity-80"
          />

          {/* Left Wing (Foreground / Swept Back) */}
          <path
            d="M -2 1 L -16 28 C -15 29, -12 29, -10 28 L 12 3 Z"
            className="fill-[#cbd5e1] dark:fill-[#64748b]"
          />
          {/* Left Jet Engine */}
          <rect
            x="-5"
            y="11"
            width="10"
            height="4"
            rx="2"
            className="fill-[#94a3b8] dark:fill-[#475569]"
          />

          {/* Right Wing (Background / Top Angle) */}
          <path
            d="M 2 -1 L -10 -24 C -9 -25, -7 -25, -5 -24 L 14 -3 Z"
            className="fill-[#94a3b8] dark:fill-[#475569] opacity-85"
          />
          {/* Right Jet Engine */}
          <rect
            x="-3"
            y="-14"
            width="8"
            height="3.5"
            rx="1.75"
            className="fill-[#64748b] dark:fill-[#334155]"
          />

          {/* Tail Fin (Vertical Stabilizer) */}
          <path
            d="M -26 0 L -36 -14 C -37 -15, -35 -15, -33 -14 L -20 0 Z"
            className="fill-[#2563eb] dark:fill-[#3b82f6]"
          />
          {/* Jain Tours Gold Tail Accent Stripe */}
          <path
            d="M -28 -4 L -34 -12 L -32 -13 L -26 -5 Z"
            className="fill-[#f59e0b] dark:fill-[#fbbf24]"
          />

          {/* Horizontal Stabilizers */}
          <path
            d="M -28 0 L -34 7 L -31 8 L -24 1 Z"
            className="fill-[#cbd5e1] dark:fill-[#64748b]"
          />
          <path
            d="M -28 0 L -34 -7 L -31 -8 L -24 -1 Z"
            className="fill-[#94a3b8] dark:fill-[#475569] opacity-80"
          />
        </g>
      </svg>

      {/* Gentle Bottom Readability Scrim (Fades smoothly to solid card background for interactive sections) */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 pointer-events-none transition-colors duration-300
          bg-gradient-to-t from-[#f4f8fb] via-[#f4f8fb]/85 to-transparent
          dark:from-[#071220] dark:via-[#071220]/85 dark:to-transparent"
      />
    </div>
  );
};

export default ChatbotAtmosphericBackground;
