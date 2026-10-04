import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getDocumentProxy, getResolvedPDFJS } from 'https://esm.sh/unpdf@0.12.2';
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
  let previousDay: number | undefined;
  let pdf;
  try {
    const { OPS } = await getResolvedPDFJS();
    pdf = await getDocumentProxy(new Uint8Array(await pdfFile.arrayBuffer()));
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const headings = textContent.items.flatMap((item) => {
        if (!('str' in item) || !('transform' in item)) return [];
        const match = item.str.match(/\bday\s*[-:#.]?\s*(\d{1,2})\b/i);
        const number = match ? Number(match[1]) : 0;
        return knownDays.has(number) ? [{ number, y: item.transform[5] }] : [];
      }).sort((a, b) => b.y - a.y);
      // Photos on a continuation page belong to the last day heading on the previous page.
      const priorDay = headings.length ? headings[headings.length - 1].number : previousDay;
      if (!headings.length && !priorDay) continue;
      const ops = await page.getOperatorList();
      const photos: { data: Uint8ClampedArray; width: number; height: number; channels: number; y: number }[] = [];
      const base = ops.fnArray[0] === OPS.transform ? ops.argsArray[0] as number[] : null;
      for (let index = 0; index < ops.fnArray.length; index++) {
        if (ops.fnArray[index] !== OPS.paintImageXObject) continue;
        // The image's own transform precedes its dependency and paint operations.
        const transform = ops.fnArray[index - 2] === OPS.transform ? ops.argsArray[index - 2] as number[] : null;
        if (!base || !transform) continue;
        const y = base[1] * (transform[4] + transform[0] / 2) +
          base[3] * (transform[5] + transform[3] / 2) + base[5];
        const key = ops.argsArray[index][0];
        // A damaged or deferred image must not discard other usable day photos.
        let image;
        try { image = page.objs.get(key); } catch { continue; }
        if (!image?.data || !image.width || !image.height) continue;
        const channels = image.data.length / (image.width * image.height);
        if (![1, 3, 4].includes(channels)) continue;
        photos.push({ data: image.data, width: image.width, height: image.height, channels, y });
      }
      for (const image of photos) {
        if (staged.length >= 80) break;
        const y = image.y;
        if (!Number.isFinite(y) || image.width < 450 || image.height < 300 ||
          image.width / image.height >= 3.5 || image.width * image.height > 8_000_000) continue;
        // Reject the monochrome shadows and decorative overlays often embedded in brochures.
        let nearGray = 0;
        let samples = 0;
        for (let pixel = 0; pixel < image.width * image.height; pixel += Math.max(1, Math.floor(image.width * image.height / 500))) {
          const offset = pixel * image.channels;
          if (image.channels < 3 || Math.max(image.data[offset], image.data[offset + 1], image.data[offset + 2]) -
            Math.min(image.data[offset], image.data[offset + 1], image.data[offset + 2]) < 8) nearGray++;
          samples++;
        }
        if (nearGray / samples > 0.93) continue;
        const dayNumber = headings.filter((heading) => heading.y >= y - 16).at(-1)?.number ?? previousDay;
        if (!dayNumber) continue;
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
      if (headings.length) previousDay = priorDay;
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
