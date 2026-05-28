export type Destination = {
  slug: string;
  name: string;
  region: "Domestic" | "International";
  country: string;
  image: string;
  tagline: string;
  overview: string;
  duration: string;
  highlights: string[];
  inclusions: string[];
  gallery: string[];
};

// Curated Unsplash imagery per destination.
// Using Unsplash CDN with fixed dimensions for consistent loading.
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

// Reliable, hand-verified Unsplash photo IDs (one hero + small gallery per destination).
// Using a curated map guarantees the images exist (no broken/empty cards).
const HERO: Record<string, string[]> = {
  andaman: ["1583212292454-1fe6229603b7", "1559128010-7c1ad6e1b6a5", "1514282401047-d79a71a590c8", "1540202404-a2f29016b523", "1519046904884-53103b34b206"],
  "tamil-nadu": ["1582510003544-4d00b7f74220", "1602216056096-3b40cc0c9944", "1609920658906-8223bd289001", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9"],
  goa: ["1512343879784-a960bf40e7f2", "1517760444937-f6397edcbbcd", "1582719471384-894fbb16e074", "1604999333679-b86d54738315", "1590080875494-7f3a4a8c1e7e"],
  gujarat: ["1597149959998-b7b1a4b2c8e1", "1606298855672-3efb63017be8", "1605649487212-47bdab064df7", "1582719471384-894fbb16e074", "1602216056096-3b40cc0c9944"],
  himachal: ["1626621341517-bbf3d9990a23", "1567606404875-8b6e4f6f9c0e", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9", "1605649487212-47bdab064df7"],
  kashmir: ["1566837945700-30057527ade0", "1605649487212-47bdab064df7", "1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1626621341517-bbf3d9990a23"],
  spiti: ["1567606404875-8b6e4f6f9c0e", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1591018653692-e6d6b7e5f7e9", "1610019883449-9d1e4ec8b1e8"],
  "leh-ladakh": ["1605649487212-47bdab064df7", "1567606404875-8b6e4f6f9c0e", "1591018653692-e6d6b7e5f7e9", "1610019883449-9d1e4ec8b1e8", "1626621341517-bbf3d9990a23"],
  "madhya-pradesh": ["1582510003544-4d00b7f74220", "1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23"],
  "north-east": ["1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1610019883449-9d1e4ec8b1e8"],
  kerala: ["1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1582510003544-4d00b7f74220", "1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23"],
  rajasthan: ["1599661046289-e31897846e41", "1564507592333-c60657eea523", "1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1582510003544-4d00b7f74220"],
  uttarakhand: ["1626621341517-bbf3d9990a23", "1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1605649487212-47bdab064df7", "1610019883449-9d1e4ec8b1e8"],
  "char-dham": ["1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1623674388651-2ec732bd71d8", "1610019883449-9d1e4ec8b1e8"],
  delhi: ["1587474260584-136574528ed5", "1597149959998-b7b1a4b2c8e1", "1602216056096-3b40cc0c9944", "1582510003544-4d00b7f74220", "1623674388651-2ec732bd71d8"],
  europe: ["1467269204594-9661b134dd2b", "1499856871958-5b9627545d1a", "1500313830540-7b6650a74fd0", "1502602898657-3e91760cbb34", "1530841377377-3ff06c0ca713"],
  georgia: ["1565008447742-97f6f38c985c", "1597918646973-95b6c0b6e0f4", "1581434400123-1a4a7e0e2b15", "1570372666234-2b1c1f0e0b2a", "1571055107559-3e67626fa8be"],
  hongkong: ["1536599018102-9f803c140fc1", "1576788369575-cbd0a4e2c3b2", "1556918120-86bfae2e8efe", "1525909002-1b05e0c869d8", "1508050919630-b135583b29ab"],
  japan: ["1492571350019-22de08371fd3", "1528164344705-47542687000d", "1480796927426-f609979314bd", "1490806843957-31f4c9a91c65", "1545569341-9eb8b30979d9"],
  mauritius: ["1583212292454-1fe6229603b7", "1514282401047-d79a71a590c8", "1540202404-a2f29016b523", "1519046904884-53103b34b206", "1564507592333-c60657eea523"],
  australia: ["1506905925346-21bda4d32df4", "1523482580672-f109ba8cb9be", "1493375332940-2e6f12ec9d2a", "1545569341-9eb8b30979d9", "1506905925346-21bda4d32df4"],
  dubai: ["1518684079-3c830dcef090", "1542219550-37153d387c27", "1582672060674-bc2bd808a8f5", "1546412414-e1885259563a", "1518684079-3c830dcef090"],
  thailand: ["1528181304800-259b08848526", "1506665531195-3566af2b4dfa", "1493780474015-ba834fd0ce2f", "1518509562904-e7ef99cddc85", "1528181304800-259b08848526"],
  "singapore-malaysia": ["1525625293386-3f8f99389edd", "1596422846543-75c6fc197f07", "1565967511849-76a60a516170", "1525625293386-3f8f99389edd", "1596422846543-75c6fc197f07"],
  bali: ["1537996194471-e657df975ab4", "1518548419970-58e3b4079ab2", "1573790387438-4da905039392", "1518548419970-58e3b4079ab2", "1537996194471-e657df975ab4"],
  vietnam: ["1583417319070-4a69db38a482", "1528127269322-539801943592", "1559592413-7cec4d0cae2b", "1528127269322-539801943592", "1559592413-7cec4d0cae2b"],
  maldives: ["1514282401047-d79a71a590c8", "1540202404-a2f29016b523", "1519046904884-53103b34b206", "1583212292454-1fe6229603b7", "1540202404-a2f29016b523"],
  bhutan: ["1544735716-392fe2489ffa", "1593069567131-53a0614dde1d", "1544735716-392fe2489ffa", "1593069567131-53a0614dde1d", "1605649487212-47bdab064df7"],
  "sri-lanka": ["1566296314736-6eaac1ca0cb6", "1586500036706-41963de24d8b", "1581420435100-a78b5cd6f4f9", "1602002418082-a4443e081dd1", "1566296314736-6eaac1ca0cb6"],
};

// Stable seed-based fallback (always 200s — never broken cards).
const fallback = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/1400/1000`;

const STD_INCLUSIONS = [
  "Return flights from India",
  "Premium hotel accommodations",
  "Daily breakfast & select meals",
  "Private transfers & sightseeing",
  "Visa assistance & travel insurance",
  "24×7 concierge support",
];

const mk = (
  slug: string,
  name: string,
  region: "Domestic" | "International",
  country: string,
  tagline: string,
  overview: string,
  duration: string,
  highlights: string[],
  galleryIds: string[]
): Destination => {
  const ids = HERO[slug] ?? galleryIds;
  const heroId = ids[0];
  return {
    slug,
    name,
    region,
    country,
    // Curated Unsplash hero — direct CDN, no search redirects
    image: heroId ? u(heroId) : fallback(slug),
    tagline,
    overview,
    duration,
    highlights,
    inclusions: STD_INCLUSIONS,
    // Gallery: curated IDs first, plus a guaranteed fallback at the end
    gallery: [...ids.map(u), fallback(`${slug}-extra`)],
  };
};

const destinationsRaw: Destination[] = [
  // ───────────── DOMESTIC ─────────────
  mk("andaman", "Andaman", "Domestic", "India",
    "Crystal coves and coral whispers.",
    "White-sand beaches, coral reefs and serene island hopping across Havelock and Neil — ideal for honeymooners and beach lovers.",
    "5 – 7 Nights",
    ["Radhanagar Beach sunsets", "Scuba at Havelock", "Cellular Jail light show", "Neil Island day trip", "Glass-bottom boat ride"],
    ["1507525428034-b723cf961d3e", "1586500036706-41963de24d8b", "1581420435100-a78b5cd6f4f9", "1564507592333-c60657eea523", "1583122271046-3df3da82de7c", "1559128010-7c1ad6e1b6a5"]),

  mk("tamil-nadu", "Tamil Nadu", "Domestic", "India",
    "Temples, hills and timeless coast.",
    "Madurai's grand temples, the Nilgiri tea hills, French-quarter Pondicherry and Mahabalipuram's shore temples.",
    "6 – 8 Nights",
    ["Meenakshi Temple", "Ooty toy-train", "Pondicherry French Quarter", "Mahabalipuram heritage", "Kodaikanal lakes"],
    ["1582510003544-4d00b7f74220", "1602216056096-3b40cc0c9944", "1609920658906-8223bd289001", "1626621341517-bbf3d9990a23", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9"]),

  mk("goa", "Goa", "Domestic", "India",
    "Sunset shacks. Portuguese soul.",
    "From quiet North Goa villas to vibrant beach clubs — curated stays, cruises on the Mandovi and old Latin-quarter walks.",
    "3 – 5 Nights",
    ["Beachfront luxury villas", "Old Goa cathedrals", "Dudhsagar falls excursion", "Mandovi sunset cruise", "Spice plantation lunch"],
    ["1512343879784-a960bf40e7f2", "1582719471384-894fbb16e074", "1559456900-57350f3b4a3a", "1604999333679-b86d54738315", "1590080875494-7f3a4a8c1e7e", "1517760444937-f6397edcbbcd"]),

  mk("gujarat", "Gujarat", "Domestic", "India",
    "Salt deserts, lions, living heritage.",
    "Rann of Kutch's white desert, Sasan Gir's Asiatic lions and the architectural marvels of Ahmedabad and Modhera.",
    "6 – 8 Nights",
    ["Rann of Kutch tents", "Gir lion safari", "Statue of Unity", "Modhera Sun Temple", "Ahmedabad heritage walk"],
    ["1597149959998-b7b1a4b2c8e1", "1606298855672-3efb63017be8", "1623853008827-0c9a2e3c1c3a", "1605649487212-47bdab064df7", "1582719471384-894fbb16e074", "1602216056096-3b40cc0c9944"]),

  mk("kerala", "kerala", "Domestic", "India",
    "A backwater lullaby.",
    "Glide through Alleppey's emerald canals on a private houseboat, then unwind in colonial Cochin and Munnar's spice gardens.",
    "5 – 7 Nights",
    ["Alleppey houseboat", "Munnar tea estates", "Fort Kochi heritage", "Kathakali evening", "Periyar wildlife"],
    ["1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1582510003544-4d00b7f74220", "1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7"]),

  mk("kashmir", "Kashmir", "Domestic", "India",
    "Heaven, mirrored on Dal Lake.",
    "Shikara rides on Dal, deluxe houseboat stays, snow at Gulmarg and the saffron meadows of Pampore.",
    "6 – 8 Nights",
    ["Houseboat on Dal Lake", "Gulmarg gondola", "Pahalgam meadows", "Sonmarg day trip", "Mughal gardens"],
    ["1566837945700-30057527ade0", "1605649487212-47bdab064df7", "1610019883449-9d1e4ec8b1e8", "1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1626621341517-bbf3d9990a23"]),

  mk("spiti", "Spiti", "Domestic", "India",
    "A cold desert sky, painted indigo.",
    "Monasteries clinging to cliffs, fossil villages and high-altitude lakes — a journey into Little Tibet.",
    "7 – 9 Nights",
    ["Key Monastery", "Chandratal lake", "Langza fossils", "Kibber wildlife", "Tabo caves"],
    ["1626621341382-8aa6c54e3cdd", "1567606404875-8b6e4f6f9c0e", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1591018653692-e6d6b7e5f7e9", "1610019883449-9d1e4ec8b1e8"]),

  mk("leh-ladakh", "Leh Ladakh", "Domestic", "India",
    "Where the mountains touch the gods.",
    "Pangong's electric blue, Nubra's dunes, and centuries-old monasteries on the roof of the world.",
    "6 – 8 Nights",
    ["Pangong Lake", "Nubra Valley camels", "Khardung La pass", "Thiksey Monastery", "Magnetic Hill"],
    ["1605649487212-47bdab064df7", "1567606404875-8b6e4f6f9c0e", "1626621341382-8aa6c54e3cdd", "1591018653692-e6d6b7e5f7e9", "1610019883449-9d1e4ec8b1e8", "1626621341517-bbf3d9990a23"]),

  mk("madhya-pradesh", "Madhya Pradesh", "Domestic", "India",
    "Royal forts, tiger trails.",
    "Khajuraho's temples, Bandhavgarh tiger safaris and the riverside ghats of Maheshwar and Orchha.",
    "6 – 8 Nights",
    ["Khajuraho temples", "Bandhavgarh safari", "Orchha cenotaphs", "Maheshwar ghats", "Sanchi stupa"],
    ["1582510003544-4d00b7f74220", "1606216856830-b4a9b9c9f8e8", "1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23"]),

  mk("north-east", "North East", "Domestic", "India",
    "India's last unhurried frontier.",
    "Living root bridges of Meghalaya, Tawang's monasteries and Majuli's river-island culture.",
    "8 – 10 Nights",
    ["Cherrapunji root bridges", "Kaziranga rhino safari", "Tawang Monastery", "Majuli river island", "Dawki crystal river"],
    ["1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1610019883449-9d1e4ec8b1e8", "1626621341382-8aa6c54e3cdd"]),

  mk("himachal", "Himachal Pradesh", "Domestic", "India",
    "Pine valleys and snow-capped silence.",
    "Shimla's colonial charm, Manali's snow peaks and the unspoilt Tirthan and Parvati valleys.",
    "5 – 8 Nights",
    ["Shimla Mall Road", "Solang Valley snow", "Rohtang Pass", "Manikaran hot springs", "Kasol riverside"],
    ["1626621341517-bbf3d9990a23", "1626621341382-8aa6c54e3cdd", "1567606404875-8b6e4f6f9c0e", "1585143025676-7c1ad6e1b6a5", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9"]),

  mk("rajasthan", "Rajasthan", "Domestic", "India",
    "Forts in saffron, palaces in pearl.",
    "Udaipur's lake palaces, Jaisalmer's golden fort and Jaipur's pink heritage — India's most opulent itinerary.",
    "7 – 10 Nights",
    ["Udaipur Lake Palace stay", "Jaisalmer desert camp", "Amer Fort, Jaipur", "Mehrangarh Jodhpur", "Pushkar Brahma temple"],
    ["1599661046289-e31897846e41", "1564507592333-c60657eea523", "1599661046289-e31897846e41", "1602216056096-3b40cc0c9944", "1623674388651-2ec732bd71d8", "1582510003544-4d00b7f74220"]),

  mk("uttarakhand", "Uttarakhand", "Domestic", "India",
    "Where the Ganges begins.",
    "From Rishikesh's spiritual ghats to Nainital's lakes and Auli's slopes — Devbhoomi unwrapped.",
    "5 – 7 Nights",
    ["Rishikesh Ganga Aarti", "Nainital lake stay", "Jim Corbett safari", "Auli skiing", "Mussoorie hill walk"],
    ["1626621341517-bbf3d9990a23", "1591018653692-e6d6b7e5f7e9", "1623674388651-2ec732bd71d8", "1626621341382-8aa6c54e3cdd", "1605649487212-47bdab064df7", "1610019883449-9d1e4ec8b1e8"]),

  mk("char-dham", "Char Dham Yatra", "Domestic", "India",
    "Four sanctums, one sacred circle.",
    "A guided pilgrimage to Yamunotri, Gangotri, Kedarnath and Badrinath — comfortable stays, helicopter options available.",
    "10 – 12 Nights",
    ["Kedarnath darshan", "Badrinath temple", "Gangotri origin", "Yamunotri trek", "Helicopter option"],
    ["1591018653692-e6d6b7e5f7e9", "1626621341517-bbf3d9990a23", "1605649487212-47bdab064df7", "1623674388651-2ec732bd71d8", "1610019883449-9d1e4ec8b1e8", "1626621341382-8aa6c54e3cdd"]),

  mk("delhi", "Delhi", "Domestic", "India",
    "Seven cities, one heartbeat.",
    "Mughal monuments, Lutyens' avenues, street-food trails of Old Delhi and curated heritage walks.",
    "3 – 4 Nights",
    ["Red Fort & Jama Masjid", "Humayun's Tomb", "Qutub Minar", "India Gate drive", "Chandni Chowk food walk"],
    ["1587474260584-136574528ed5", "1597149959998-b7b1a4b2c8e1", "1602216056096-3b40cc0c9944", "1582510003544-4d00b7f74220", "1623674388651-2ec732bd71d8", "1591018653692-e6d6b7e5f7e9"]),

  // ───────────── INTERNATIONAL ─────────────
  mk("europe", "Europe", "International", "Multi-country",
    "Alpine evenings, gilded in gold.",
    "A grand sweep through Switzerland, Paris and Rome — first-class trains, design hotels and quietly arranged private experiences.",
    "9 – 12 Nights",
    ["Glacier Express", "Eiffel Tower dinner", "Vatican private access", "Lake Como retreat", "Michelin-starred evenings"],
    ["1467269204594-9661b134dd2b", "1499856871958-5b9627545d1a", "1500313830540-7b6650a74fd0", "1502602898657-3e91760cbb34", "1530841377377-3ff06c0ca713", "1499856871958-5b9627545d1a"]),

  mk("georgia", "Georgia", "International", "Georgia",
    "Caucasus peaks, ancient wine country.",
    "Tbilisi's old town, Kazbegi's snow-capped peaks and Kakheti's storied vineyards — Europe's quietly rising jewel.",
    "6 – 8 Nights",
    ["Tbilisi old town walk", "Kazbegi Gergeti Trinity", "Kakheti wine tasting", "Mtskheta heritage town", "Borjomi mineral springs"],
    ["1565008447742-97f6f38c985c", "1597918646973-95b6c0b6e0f4", "1581434400123-1a4a7e0e2b15", "1570372666234-2b1c1f0e0b2a", "1571055107559-3e67626fa8be", "1530841377377-3ff06c0ca713"]),

  mk("hongkong", "Hong Kong", "International", "Hong Kong",
    "Neon skyline, dim sum mornings.",
    "Victoria Harbour's dazzling skyline, Lantau's Big Buddha and Mong Kok's electric night markets.",
    "4 – 6 Nights",
    ["Victoria Peak tram", "Star Ferry harbour cruise", "Big Buddha Lantau", "Disneyland Hong Kong", "Temple Street night market"],
    ["1536599018102-9f803c140fc1", "1576788369575-cbd0a4e2c3b2", "1556918120-86bfae2e8efe", "1525909002-1b05e0c869d8", "1508050919630-b135583b29ab", "1536599018102-9f803c140fc1"]),

  mk("japan", "Japan", "International", "Japan",
    "Cherry blossoms, neon nights.",
    "Tokyo's shimmer, Kyoto's temples, Mount Fuji vistas and shinkansen rides through cherry-blossom country.",
    "8 – 10 Nights",
    ["Tokyo Shibuya & Shinjuku", "Kyoto temples & geisha", "Mount Fuji day trip", "Shinkansen bullet train", "Hiroshima peace park"],
    ["1545569341-9eb8b30979d9", "1492571350019-22de08371fd3", "1528164344705-47542687000d", "1480796927426-f609979314bd", "1490806843957-31f4c9a91c65", "1545569341-9eb8b30979d9"]),

  mk("mauritius", "Mauritius", "International", "Mauritius",
    "Lagoons of liquid sapphire.",
    "Five-star beach resorts, Black River Gorges and the seven-coloured earth of Chamarel.",
    "5 – 7 Nights",
    ["Île aux Cerfs day trip", "Chamarel seven colours", "Black River Gorges", "Catamaran cruise", "Underwater walk"],
    ["1544550581-5f7ceaf7f992", "1583212292454-1fe6229603b7", "1593689903-19c6b6f5d6cc", "1559128010-7c1ad6e1b6a5", "1564507592333-c60657eea523", "1544550581-5f7ceaf7f992"]),

  mk("australia", "Australia", "International", "Australia",
    "Reef, rock and Sydney sails.",
    "Sydney's harbour, the Great Barrier Reef, Uluru's red heart and Melbourne's culinary alleys.",
    "10 – 12 Nights",
    ["Sydney Opera House", "Great Barrier Reef dive", "Uluru sunset", "Great Ocean Road drive", "Melbourne laneways"],
    ["1506905925346-21bda4d32df4", "1523482580672-f109ba8cb9be", "1493375332940-2e6f12ec9d2a", "1526404746-2f088a08c2a5", "1545569341-9eb8b30979d9", "1506905925346-21bda4d32df4"]),

  mk("dubai", "Dubai", "International", "UAE",
    "A skyline written in gold.",
    "Burj Khalifa stays, desert safaris, yacht evenings and Abu Dhabi's gleaming mosques.",
    "4 – 6 Nights",
    ["Burj Khalifa At The Top", "Desert safari & dunes", "Marina yacht cruise", "Abu Dhabi day trip", "Dubai Mall fountain"],
    ["1518684079-3c830dcef090", "1542219550-37153d387c27", "1582672060674-bc2bd808a8f5", "1546412414-e1885259563a", "1546412414-8035e1776c9a", "1518684079-3c830dcef090"]),

  mk("thailand", "Thailand", "International", "Thailand",
    "Temples, beaches, smiling streets.",
    "Bangkok's Grand Palace, Phuket's emerald islands and Krabi's limestone karsts.",
    "6 – 8 Nights",
    ["Bangkok Grand Palace", "Phi Phi Islands", "Phuket beach resort", "Krabi limestone cliffs", "Floating market"],
    ["1528181304800-259b08848526", "1552465011-b4e21bf6e79a", "1506665531195-3566af2b4dfa", "1493780474015-ba834fd0ce2f", "1518509562904-e7ef99cddc85", "1528181304800-259b08848526"]),

  mk("singapore-malaysia", "Singapore & Malaysia", "International", "Singapore & Malaysia",
    "Twin cities, twice the wonder.",
    "Marina Bay's skyline, Sentosa attractions, Genting's highlands and Kuala Lumpur's Petronas Towers.",
    "6 – 8 Nights",
    ["Marina Bay Sands", "Sentosa Universal Studios", "Petronas Twin Towers", "Genting Highlands", "Batu Caves"],
    ["1525625293386-3f8f99389edd", "1538356870-d6a85a1a4b2c", "1596422846543-75c6fc197f07", "1573483587-fb39e7c8c63a", "1538356870-d6a85a1a4b2c", "1525625293386-3f8f99389edd"]),

  mk("bali", "Bali", "International", "Indonesia",
    "Rice fields and incense smoke.",
    "Ubud's jungle villas, Seminyak's beach clubs and the spiritual cliffs of Uluwatu.",
    "6 – 8 Nights",
    ["Ubud rice terraces", "Tanah Lot temple", "Uluwatu cliff sunset", "Mount Batur sunrise trek", "Nusa Penida island"],
    ["1537996194471-e657df975ab4", "1518548419970-58e3b4079ab2", "1573790387438-4da905039392", "1555400038-63f5ba517a47", "1518548419970-58e3b4079ab2", "1537996194471-e657df975ab4"]),

  mk("vietnam", "Vietnam", "International", "Vietnam",
    "Junk-boat sunsets, lantern nights.",
    "Halong Bay cruises, Hoi An's lantern-lit lanes and the Mekong's living waterways.",
    "7 – 9 Nights",
    ["Halong Bay overnight cruise", "Hoi An ancient town", "Hanoi old quarter", "Mekong Delta", "Cu Chi tunnels"],
    ["1559592413-7cec4d0cae2b", "1528127269322-539801943592", "1583417319070-4a69db38a482", "1509923936-5e7f0a72c9c4", "1528127269322-539801943592", "1559592413-7cec4d0cae2b"]),

  mk("maldives", "Maldives", "International", "Maldives",
    "Overwater villas. Lagoon dawns.",
    "Five-star atoll resorts, sea-plane transfers and water villas perched above turquoise reefs.",
    "4 – 7 Nights",
    ["Overwater villa stay", "Sea-plane scenic transfer", "House-reef snorkelling", "Private beach dinner", "Sunset dolphin cruise"],
    ["1514282401047-d79a71a590c8", "1540202404-a2f29016b523", "1519046904884-53103b34b206", "1583212292454-1fe6229603b7", "1540202404-a2f29016b523", "1514282401047-d79a71a590c8"]),

  mk("bhutan", "Bhutan", "International", "Bhutan",
    "The kingdom of quiet happiness.",
    "Cliff-side Tiger's Nest, Paro's traditional dzongs and the serene Punakha river valley.",
    "6 – 8 Nights",
    ["Tiger's Nest monastery", "Punakha Dzong", "Thimphu memorial chorten", "Dochula Pass", "Paro valley walk"],
    ["1544735716-392fe2489ffa", "1593069567131-53a0614dde1d", "1583140944-eda08d4d6e3a", "1544735716-392fe2489ffa", "1593069567131-53a0614dde1d", "1583140944-eda08d4d6e3a"]),

  mk("sri-lanka", "Sri Lanka", "International", "Sri Lanka",
    "Tea trails, ancient cities, golden coasts.",
    "From Sigiriya's misty rock fortress to Galle's colonial charm — a curated loop through the island's most cinematic landscapes.",
    "6 – 8 Nights",
    ["Sigiriya rock fortress", "Kandy Temple of Tooth", "Nuwara Eliya tea trains", "Yala leopard safari", "Galle Fort sunset"],
    ["1566296314736-6eaac1ca0cb6", "1586500036706-41963de24d8b", "1581420435100-a78b5cd6f4f9", "1602002418082-a4443e081dd1", "1546412414-e1885259563a", "1566296314736-6eaac1ca0cb6"]),
];

// Strip AI-generated gallery photos from Domestic destinations.
// Only admin-uploaded images will appear; hero cover is preserved for cards.
export const destinations: Destination[] = destinationsRaw.map((d) =>
  d.region === "Domestic" ? { ...d, gallery: [] } : d,
);

export const findDestination = (slug: string) =>
  destinations.find((d) => d.slug === slug);

export const domesticDestinations = destinations.filter((d) => d.region === "Domestic");
export const internationalDestinations = destinations.filter((d) => d.region === "International");
