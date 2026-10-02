import { corsHeaders, createClient } from 'npm:@supabase/supabase-js@2';
import { extractImages, getDocumentProxy } from 'https://esm.sh/unpdf@0.12.2';
import { PNG } from 'npm:pngjs@7.0.0';

const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const password = Deno.env.get('ADMIN_PASSWORD');
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!password || !url || !key) return reply({ error: 'Server not configured' }, 500);
  if (req.headers.get('x-admin-password') !== password) return reply({ error: 'Forbidden' }, 403);
  let input: unknown;
  try { input = await req.json(); } catch { return reply({ error: 'Invalid JSON' }, 400); }
  const id = typeof input === 'object' && input !== null && 'itinerary_id' in input ? input.itinerary_id : null;
  if (typeof id !== 'string' || !UUID.test(id)) return reply({ error: 'Invalid itinerary ID' }, 400);

  const db = createClient(url, key);
  const { data: itinerary, error: lookupError } = await db.from('itineraries').select('file_path,destination_slug').eq('id', id).maybeSingle();
  if (lookupError || !itinerary) return reply({ error: 'Itinerary not found' }, 404);
  const { data: pdfFile, error: downloadError } = await db.storage.from('itineraries').download(itinerary.file_path);
  if (downloadError || !pdfFile) return reply({ error: 'PDF unavailable' }, 500);
  const { data: dayRows, error: daysError } = await db.from('itinerary_days').select('day_number,title').eq('itinerary_id', id).order('day_number');
  if (daysError) return reply({ error: 'Cannot read itinerary days' }, 500);
  const knownDays = new Set((dayRows ?? []).map((day) => day.day_number));
  if (!knownDays.size) return reply({ error: 'Parse this itinerary before extracting photos' }, 400);

  const staged: { day_number: number; position: number; file_path: string; alt_text: string }[] = [];
  const uploaded: string[] = [];
  const seen = new Set<string>();
  let pdf;
  try {
    pdf = await getDocumentProxy(new Uint8Array(await pdfFile.arrayBuffer()));
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => 'str' in item ? item.str : '').join(' ');
      const dayNumbers = [...pageText.matchAll(/\bday\s*[-:#.]?\s*(\d{1,2})\b/gi)]
        .map((match) => Number(match[1])).filter((num) => knownDays.has(num));
      const uniqueDays = [...new Set(dayNumbers)];
      if (!uniqueDays.length) continue;
      const raw = await extractImages(pdf, pageNum);
      const photos = raw.filter((image) => image.width >= 450 && image.height >= 300 &&
        image.width / image.height < 3.5 && image.width * image.height <= 8_000_000);
      if (uniqueDays.length > 1 && photos.length !== uniqueDays.length) continue;
      for (let i = 0; i < photos.length && staged.length < 80; i++) {
        const image = photos[i];
        const dayNumber = uniqueDays.length === 1 ? uniqueDays[0] : uniqueDays[i];
        const digest = await crypto.subtle.digest('SHA-256', image.data);
        const fingerprint = [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, '0')).join('');
        if (seen.has(fingerprint)) continue;
        seen.add(fingerprint);
        const png = new PNG({ width: image.width, height: image.height });
        for (let pixel = 0; pixel < image.width * image.height; pixel++) {
          const source = pixel * image.channels;
          const target = pixel * 4;
          png.data[target] = image.data[source];
          png.data[target + 1] = image.data[source + (image.channels === 1 ? 0 : 1)];
          png.data[target + 2] = image.data[source + (image.channels === 1 ? 0 : 2)];
          png.data[target + 3] = image.channels === 4 ? image.data[source + 3] : 255;
        }
        const bytes = PNG.sync.write(png);
        const position = staged.filter((entry) => entry.day_number === dayNumber).length;
        const path = `day-images/${id}/${crypto.randomUUID()}.png`;
        const { error: uploadError } = await db.storage.from('itineraries').upload(path, bytes, { contentType: 'image/png' });
        if (uploadError) throw new Error('Could not save extracted photo');
        uploaded.push(path);
        const title = dayRows?.find((day) => day.day_number === dayNumber)?.title ?? itinerary.destination_slug;
        staged.push({ day_number: dayNumber, position, file_path: path, alt_text: `${title} — day ${dayNumber} photo from itinerary PDF` });
      }
    }
    const { data: old, error: oldError } = await db.from('itinerary_day_images').select('file_path').eq('itinerary_id', id);
    if (oldError) throw new Error('Could not read current photos');
    const { error: removeError } = await db.from('itinerary_day_images').delete().eq('itinerary_id', id);
    if (removeError) throw new Error('Could not replace current photos');
    if (staged.length) {
      const { error: insertError } = await db.from('itinerary_day_images').insert(staged.map((entry) => ({ ...entry, itinerary_id: id })));
      if (insertError) throw new Error('Could not attach extracted photos');
    }
    if (old?.length) await db.storage.from('itineraries').remove(old.map((entry) => entry.file_path));
    return reply({ ok: true, images: staged.length });
  } catch (error) {
    if (uploaded.length) await db.storage.from('itineraries').remove(uploaded);
    console.error('PDF photo extraction failed', error);
    return reply({ error: 'Could not extract photos from this PDF. Existing itinerary content is unchanged.' }, 500);
  } finally {
    await pdf?.destroy();
  }
});
