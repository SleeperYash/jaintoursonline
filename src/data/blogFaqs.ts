// Per-blog-post FAQs. Powers on-page FAQ accordions and FAQPage JSON-LD
// for rich results in search. Keep answers concise (2-4 sentences) and
// specific to Indian travellers departing from Mumbai wherever relevant.

export interface BlogFaq {
  q: string;
  a: string;
}

export const BLOG_FAQS: Record<string, BlogFaq[]> = {
  "best-time-to-visit-kashmir": [
    { q: "Which month is best to visit Kashmir for the first time?", a: "For a first family trip, late May to early July is ideal — Srinagar, Pahalgam and Sonmarg are all pleasant (10–25°C), meadows are green, and Gulmarg still has patches of snow at the top." },
    { q: "When can I see snowfall in Kashmir?", a: "Reliable fresh snowfall happens between late December and mid-February, with Gulmarg being the most consistent. January is peak ski season on the Gulmarg gondola Phase 2 (3,980 m)." },
    { q: "How many days are enough for a Kashmir trip from Mumbai?", a: "A 6-night / 7-day itinerary comfortably covers Srinagar, Gulmarg, Pahalgam and Sonmarg with a Dal Lake shikara ride. Add 2 nights if you want to include Doodhpathri or Yusmarg." },
    { q: "Is Kashmir safe for tourists in 2026?", a: "Yes. Tourist zones — Srinagar, Gulmarg, Pahalgam, Sonmarg — have been safe and heavily travelled through 2024–26. Follow standard advisories and travel with a licensed operator." },
    { q: "What is the cost of a Kashmir package from Mumbai?", a: "Curated 6N/7D Kashmir packages from Mumbai start around ₹20,999 per person on twin sharing, including flights, 3-star hotels, transfers and sightseeing. Premium and houseboat variants go higher." },
  ],
  "maldives-honeymoon-from-india-cost-guide": [
    { q: "How much does a Maldives honeymoon from India actually cost?", a: "A real 5-night Maldives honeymoon from Mumbai ranges from ₹1.4–1.8 lakh per couple for 4-star beach villas to ₹3.2–4.5 lakh for 5-star overwater villas with half board, including flights and transfers." },
    { q: "Do Indians need a visa for Maldives?", a: "No. Indian passport holders get a 30-day free visa on arrival at Malé (Velana International). You just need a confirmed return ticket, hotel booking and a valid passport." },
    { q: "Which is the best month for a Maldives honeymoon?", a: "November to April is the dry season with the best weather, calm seas and clear visibility for snorkelling. December to February is peak (and priciest); shoulder months October and May offer 20–30% lower rates." },
    { q: "Overwater villa or beach villa — which should honeymooners pick?", a: "Split the stay: 2 nights in a beach villa and 2–3 nights in an overwater villa. You save 20–30% versus overwater-only and still get the iconic photos and stilt-hut experience." },
    { q: "Are meals included in Maldives resort packages?", a: "Most resorts sell room-only, half board (breakfast + dinner) or all-inclusive. On a private island, half board is almost always worth it — à la carte dinners can cost USD 80–150 per couple." },
  ],
  "dubai-vs-singapore-family-holiday": [
    { q: "Which is better for a family holiday — Dubai or Singapore?", a: "Dubai wins for desert experiences, theme parks and shopping on a tighter budget; Singapore wins for cleanliness, walkability, Universal Studios and food variety. Families with kids under 10 usually prefer Singapore." },
    { q: "Which is cheaper for an Indian family — Dubai or Singapore?", a: "Dubai is typically 15–25% cheaper per family of four for the same star category, especially in summer. Singapore hotel and food costs run higher, but visa and internal transport are simpler." },
    { q: "How many days should I plan for each destination?", a: "5 nights in Dubai (including Abu Dhabi day trip) or 5 nights in Singapore (with an optional 2-night Sentosa extension) are ideal for a first family visit." },
    { q: "Which is easier for visas — Dubai or Singapore?", a: "Both are straightforward. UAE offers 14/30/60-day tourist visas; Singapore issues an e-Visa in 3–5 working days. Neither is visa-on-arrival for Indian passports in 2026." },
  ],
  "bali-7-day-itinerary-from-mumbai": [
    { q: "Do Indians need a visa for Bali?", a: "Yes. Indian passport holders can get a Visa on Arrival (VoA) at Denpasar for IDR 500,000 (~₹2,800), valid 30 days and extendable once for another 30 days." },
    { q: "How much does a 7-day Bali trip cost from Mumbai?", a: "A mid-range 7-day Bali package from Mumbai typically costs ₹48,000–75,000 per person including return flights, 3–4 star stays across Ubud, Seminyak/Kuta and Nusa Dua, and daily transfers." },
    { q: "Which currency is used in Bali?", a: "Indonesian Rupiah (IDR). Cards are accepted at hotels and larger restaurants, but keep cash for warungs, temples and local markets. ATMs are widely available." },
    { q: "Is Bali safe for Indian tourists and solo female travellers?", a: "Yes — Bali is one of the safer Southeast Asian destinations. Standard precautions apply: use registered scooters or Grab/Blue Bird taxis, avoid isolated beaches after dark, and drink bottled water." },
    { q: "What are the must-visit places in Bali?", a: "Ubud (rice terraces, Monkey Forest), Tanah Lot and Uluwatu temples, Seminyak beaches, Nusa Penida day trip (Kelingking Beach), and Mount Batur sunrise trek are the classic highlights." },
  ],
  "char-dham-yatra-by-helicopter-2026": [
    { q: "How much does the Char Dham helicopter yatra cost in 2026?", a: "IRCTC and private operator packages range from ₹1.85 lakh to ₹2.5 lakh per person for a 5–6 day heli yatra covering Yamunotri, Gangotri, Kedarnath and Badrinath, including VIP darshan and stays." },
    { q: "When do Char Dham helicopter bookings open?", a: "Registration typically opens in February–March each year on the official Uttarakhand Tourism portal. Helicopter slots sell out within days — book through an authorised operator well in advance." },
    { q: "Is Char Dham by helicopter suitable for senior citizens?", a: "Yes — it's the most senior-friendly option, cutting a 12-day road trek to 5–6 days. Basic fitness and doctor clearance are advised due to altitudes above 3,500 m at Kedarnath and Badrinath." },
    { q: "What is included in a Char Dham heli package?", a: "Helicopter transfers between dhams, VIP darshan, 3–4 star hotel stays or dharamshalas, all meals, ground transfers, priest fees and pooja assistance. Personal expenses and offerings are extra." },
  ],
  "vietnam-8-days-itinerary": [
    { q: "Do Indians need a visa for Vietnam?", a: "Yes. Indians can apply for a Vietnam 90-day multiple-entry e-visa online at ~USD 50. Processing takes 3–5 working days. No visa-on-arrival for tourism as of 2026." },
    { q: "How much does an 8-day Vietnam trip cost from Mumbai?", a: "A mid-range 8-day Vietnam package (Hanoi, Halong Bay cruise, Da Nang, Ho Chi Minh) costs ₹55,000–85,000 per person from Mumbai including flights, 3–4 star hotels and internal flights." },
    { q: "What is the best time to visit Vietnam?", a: "November to April is the driest, most pleasant window across the country. North Vietnam can be chilly in December–January; central Vietnam is best February–May." },
    { q: "Is Vietnam vegetarian-friendly for Indians?", a: "Vietnamese cuisine is naturally vegetable and noodle heavy. Major cities (Hanoi, Ho Chi Minh, Hoi An, Da Nang) have dedicated Indian restaurants. Carry pickle/masala for cruise nights." },
  ],
  "schengen-visa-from-india-guide": [
    { q: "How long does a Schengen visa take from India in 2026?", a: "Standard processing is 15 working days; in peak summer months (April–July) it can stretch to 30–45 days. Apply at least 60 days before travel to be safe." },
    { q: "What is the Schengen visa fee for Indians?", a: "€90 (~₹8,300) for adults and €45 for children aged 6–12. VFS service charge (~₹1,900) and biometric fees apply separately." },
    { q: "Which country should I apply through for a Schengen visa?", a: "Apply through the country where you'll spend the most nights. If nights are equal, apply through your first port of entry. Wrong-jurisdiction filings are the top rejection reason." },
    { q: "What is the ideal bank balance for a Schengen visa?", a: "Show 6 months of statements with a maintained balance of roughly ₹1–1.5 lakh per traveller per week of trip, plus salary credits or business turnover. Sudden large deposits weaken your case." },
    { q: "Can I apply for a Schengen visa without an appointment?", a: "No. All Schengen applications from India require a VFS/BLS biometric appointment. Slots for summer travel open December–January and fill fast." },
  ],
  "europe-10-days-best-combinations": [
    { q: "Which is the best 10-day Europe itinerary for first-timers?", a: "The classic Paris–Switzerland–Italy 10-day combination remains the most popular first Europe trip for Indians — it balances icons (Eiffel, Jungfrau, Colosseum), scenery and comfortable travel times." },
    { q: "How much does a 10-day Europe trip from Mumbai cost?", a: "A comfortable 3–4 star 10-day Europe package from Mumbai runs ₹1.6–2.4 lakh per person including flights, hotels, breakfast, coach transfers and major sightseeing." },
    { q: "Is Eurail worth it for a 10-day Europe trip?", a: "For 3+ countries and long intercity legs, a Eurail Global Pass (5 days in 1 month, ~€350) usually beats point-to-point tickets. For 2 countries it rarely pays off — book advance tickets instead." },
    { q: "Best time for a 10-day Europe trip?", a: "May, September and early October offer the best weather-to-crowd ratio. July–August is peak (and priciest); December is magical for Christmas markets but shorter daylight hours." },
  ],
  "andaman-vs-maldives-comparison": [
    { q: "Andaman or Maldives — which is better for honeymoon?", a: "Maldives wins on privacy, overwater villas and pure resort experience; Andaman wins on affordability, snorkelling variety and no visa/forex hassle. Budget under ₹1.5 lakh/couple: pick Andaman." },
    { q: "Which is cheaper — Andaman or Maldives?", a: "Andaman is roughly 40–50% cheaper for a similar-length trip. A 6-night Andaman trip from Mumbai starts ~₹65,000/couple; a comparable Maldives trip starts ~₹1.4 lakh/couple." },
    { q: "Do I need a visa or passport for Andaman?", a: "No. Andaman is Indian territory — only a valid government photo ID is needed for flights. Foreign nationals need a Restricted Area Permit, but Indian citizens do not." },
    { q: "Is snorkelling better in Andaman or Maldives?", a: "Maldives has clearer visibility (30–40 m) and more consistent reef life around resorts. Andaman's North Bay, Elephant Beach and Neil Island offer excellent, cheaper snorkelling with sea walks." },
  ],
  "leh-ladakh-bike-trip-guide": [
    { q: "When is the best time for a Leh Ladakh bike trip?", a: "Mid-June to mid-September is the safe window — all high passes (Khardung La, Chang La, Baralacha La) are open and road conditions are best. July–August is peak." },
    { q: "Which bike is best for Leh Ladakh?", a: "The Royal Enfield Himalayan 450 and Classic 350 are the most rented and mechanic-friendly options. KTM 390 Adventure works for experienced riders. Book bikes 45+ days in advance." },
    { q: "How many days do I need for a Leh Ladakh bike trip?", a: "A comfortable Manali–Leh–Manali loop needs 10–12 days; Srinagar–Leh–Manali covers more but needs 12–14 days. Add 2 days in Leh to acclimatise before crossing 5,000+ m passes." },
    { q: "How to handle altitude sickness in Ladakh?", a: "Rest for 36–48 hours in Leh (3,500 m) before any high pass. Hydrate 4+ litres/day, avoid alcohol on arrival, carry Diamox after doctor consultation, and descend if symptoms worsen." },
  ],
  "japan-cherry-blossom-2026": [
    { q: "When is the best time to see cherry blossoms in Japan in 2026?", a: "Full bloom in Tokyo and Kyoto is forecast for late March to first week of April 2026. Northern Japan (Hirosaki, Sapporo) peaks late April to early May." },
    { q: "How much does a Japan cherry blossom trip cost from India?", a: "A 7–8 day sakura-season trip from Mumbai runs ₹1.5–2.2 lakh per person including flights, 3–4 star hotels, JR Pass and daily breakfasts. Peak dates are 20–30% pricier." },
    { q: "Do Indians need a visa for Japan?", a: "Yes. Indians need a short-term tourist visa through VFS Japan; processing takes 5–7 working days and costs ₹450. From 2025 an eVisa is available for select applicants." },
    { q: "Is the JR Pass still worth it in 2026?", a: "After the 2023 price hike, the 7-day JR Pass (~¥50,000) pays off only if you're doing Tokyo–Kyoto–Hiroshima or beyond. For a Tokyo–Kyoto–Osaka circuit, point-to-point Shinkansen is cheaper." },
  ],
  "thailand-visa-free-guide-2026": [
    { q: "Is Thailand visa-free for Indians in 2026?", a: "Yes. Indian passport holders get visa-free entry to Thailand for up to 60 days per visit, extended through the current bilateral arrangement. You still need a valid passport and return ticket." },
    { q: "What documents do I need at Thai immigration?", a: "Passport valid 6+ months, confirmed return/onward ticket, hotel booking, and proof of funds (~THB 20,000 per person or THB 40,000 per family). Immigration can check any of these." },
    { q: "How much does a Thailand trip from Mumbai cost?", a: "A 6-night Bangkok–Pattaya–Phuket package from Mumbai starts around ₹32,000–45,000 per person including flights, 3-star hotels, transfers and standard tours." },
    { q: "Best time to visit Thailand?", a: "November to February is cool and dry — ideal for beaches and cities. March–May is hot; June–October is the green (rainy) season with lower rates." },
  ],
  "malaysia-visa-free-for-indians": [
    { q: "Is Malaysia visa-free for Indians in 2026?", a: "Yes. Malaysia offers 30-day visa-free entry for Indian passport holders through 31 December 2026. Register your Malaysia Digital Arrival Card (MDAC) online within 3 days of travel." },
    { q: "What is MDAC and is it mandatory?", a: "The Malaysia Digital Arrival Card is a free online form all foreign visitors must submit within 3 days before arrival. It replaces the paper arrival card." },
    { q: "Kuala Lumpur, Langkawi or Genting — which combo is best?", a: "For a first 5–6 night trip: 2 nights KL, 2 nights Langkawi (beach + island hopping), 1 night Genting (theme park + cable car). Add Penang if you love street food." },
    { q: "How much does a Malaysia trip from Mumbai cost?", a: "Curated 5–6 night Malaysia packages from Mumbai start around ₹35,000–55,000 per person including flights, 3–4 star hotels, transfers and sightseeing." },
  ],
  "bhutan-sdf-2026-cost-guide": [
    { q: "What is the Bhutan SDF and how much is it in 2026?", a: "The Sustainable Development Fee is Bhutan's tourism levy — currently USD 100 per adult per night (USD 50 for children 6–12, free under 6) for international tourists. Indian nationals pay a reduced INR 1,200 per adult per night." },
    { q: "Do Indians need a visa for Bhutan?", a: "Indian passport holders don't need a traditional visa but must obtain an entry permit through a licensed Bhutanese operator before travel. Voter ID or Aadhaar is not accepted — a valid passport is required." },
    { q: "How many days should I plan for Bhutan?", a: "6 nights / 7 days is ideal for Paro, Thimphu, Punakha and the Tiger's Nest hike. Add 2 nights for Bumthang and central Bhutan." },
    { q: "What is included in the Bhutan SDF?", a: "The SDF funds free healthcare, education and conservation for Bhutanese citizens — it does not include your hotel, guide, transport or meals. Those are billed separately by your operator." },
  ],
  "uk-eta-for-indians-2026": [
    { q: "Do Indians need a UK ETA in 2026?", a: "No — as of 2026, Indian passport holders still require a full UK Standard Visitor visa, not an ETA. The UK ETA scheme currently applies to visa-exempt nationalities only." },
    { q: "How much does a UK visitor visa cost for Indians?", a: "The standard 6-month visitor visa is £127 (~₹13,500). Priority (5 working days) adds £500; super-priority (next working day) adds £1,000. Biometric fee (~₹1,900) is extra." },
    { q: "How long does a UK visitor visa take?", a: "Standard processing is 3 weeks after your VFS biometric appointment. Priority service is 5 working days. Apply at least 6–8 weeks before travel." },
    { q: "What is the ideal bank balance for a UK visa?", a: "Show 6 months of statements with a stable balance of ~₹2–3 lakh per traveller for a 10-day trip, plus salary/business income. Avoid large unexplained deposits in the last 90 days." },
  ],
  "vietnam-90-day-evisa-guide": [
    { q: "How does the Vietnam 90-day e-visa work?", a: "Indians can apply online at evisa.xuatnhapcanh.gov.vn for a 90-day single or multiple-entry e-visa costing USD 25 (single) or USD 50 (multiple). Processing takes 3–5 working days." },
    { q: "Documents required for the Vietnam e-visa?", a: "Passport bio-page scan, a recent 4x6 passport photo (white background), planned entry and exit dates, and entry/exit ports. No hotel booking or return ticket upload is required." },
    { q: "Can I extend the Vietnam e-visa?", a: "Yes — one extension of up to 90 days is possible through a Vietnamese travel agent after arrival. Costs vary between USD 65–120 depending on speed and agent." },
    { q: "Which entry ports accept the Vietnam e-visa?", a: "All major international airports (Hanoi, Ho Chi Minh, Da Nang, Nha Trang, Phu Quoc) and 13 land border crossings accept the e-visa. Print a copy — Vietnamese immigration still checks it manually." },
  ],
  "cordelia-cruise-mumbai-guide": [
    { q: "What does a Cordelia Cruise from Mumbai cost in 2026?", a: "A 2-night Mumbai–High Seas cruise starts from ₹18,999 per person on twin sharing; 4–5 night sailings to Goa, Lakshadweep or Sri Lanka range ₹34,000–68,000 per person including all meals." },
    { q: "Are meals and entertainment included on Cordelia?", a: "Yes — all main-restaurant meals, buffets, kids' club, pool, gym, live shows and most on-board activities are included. Speciality dining, spa, casino and alcoholic beverages are extra." },
    { q: "Do I need a passport for a Cordelia Cruise?", a: "Passport is mandatory for international itineraries (Sri Lanka, Lakshadweep is domestic but currently permit-based). For domestic-only sailings, a valid photo ID and cruise permit are enough — check at booking." },
    { q: "Is Cordelia Cruise suitable for families with kids?", a: "Yes — dedicated kids' club, age-appropriate activities, family cabins and Indian vegetarian/Jain menus make it one of the most family-friendly cruise options from India." },
  ],
  "ayodhya-ram-mandir-pilgrimage": [
    { q: "How do I book Ram Mandir darshan in Ayodhya?", a: "Regular darshan is free and requires no booking — reach the temple, deposit belongings and follow the queue. VIP/aarti passes are issued through the Shri Ram Janmabhoomi Teerth Kshetra Trust." },
    { q: "Which is the nearest airport to Ayodhya?", a: "Maharishi Valmiki International Airport, Ayodhya (AYJ) is the closest — 15 km from the temple. Lucknow (LKO, ~150 km) and Varanasi (VNS, ~200 km) are larger alternatives." },
    { q: "How many days do I need for Ayodhya?", a: "1 full day covers Ram Mandir, Hanuman Garhi, Kanak Bhawan and Sarayu ghat aarti. Add 1 day for Varanasi or Prayagraj as an extension." },
    { q: "Best time to visit Ayodhya?", a: "October to March offers the most comfortable weather. Ram Navami (March–April) and Deepotsav (October–November) are spectacular but extremely crowded — book stays 60+ days ahead." },
  ],
  "meghalaya-monsoon-living-root-bridges": [
    { q: "Is monsoon a good time to visit Meghalaya?", a: "Yes — June to September is when Meghalaya is at its most dramatic: waterfalls at full flow, living root bridges surrounded by mist, and Cherrapunji living up to its 'wettest place' reputation. Roads can be affected." },
    { q: "How to reach the double-decker living root bridge?", a: "From Tyrna village near Cherrapunji, it's a 3,500-step descent (2 hours down) into Nongriat. Stay overnight in a homestay for the best experience — the return climb is strenuous." },
    { q: "How much does a Meghalaya trip from Mumbai cost?", a: "A 6-night Guwahati–Shillong–Cherrapunji–Dawki package from Mumbai starts around ₹28,000–42,000 per person including flights, hotels, transfers and sightseeing." },
    { q: "Do I need an inner-line permit for Meghalaya?", a: "No inner-line permit is required for Indian tourists. Some border areas (Dawki, Mawlynnong) may require basic ID checks at village entry — carry Aadhaar or passport." },
  ],
  "etias-europe-2026-what-indians-need-to-know": [
    { q: "Does ETIAS apply to Indian passport holders?", a: "No. ETIAS is a travel authorisation for visa-exempt nationalities only. Indian passport holders will continue to need a Schengen visa for Europe even after ETIAS goes live in 2026." },
    { q: "What is EES and when does it start?", a: "The Entry/Exit System (EES) is a biometric border system replacing passport stamps in the Schengen area. It launches in late 2025/early 2026 and applies to Indian travellers too — expect first-entry queues to be longer." },
    { q: "Does EES change my Schengen visa process?", a: "The application process stays the same. Only the border-crossing step changes: fingerprints and a face scan are captured on your first EES entry, and stored for 3 years." },
    { q: "Will Schengen visa fees increase in 2026?", a: "The EU has raised the adult Schengen visa fee to €90 (from €80) with effect from June 2024. Further increases are proposed for 2026 but not yet finalised." },
  ],
};
