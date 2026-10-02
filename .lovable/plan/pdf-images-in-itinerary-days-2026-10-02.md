# PDF images in itinerary days

## What changes
- Keep the existing itinerary page and all enquiry, download, pricing, and day controls unchanged.
- For photos embedded in an itinerary PDF, show the first usable photo wide within its matching day; show any remaining photos in equal side-by-side pairs, including on mobile. No image area appears for a PDF or day without suitable photos.
- Ignore tiny, blurry, logo-like, or decorative images rather than substitute unrelated photos. Do not add a trip gallery or source photos from Google.
- Let existing PDFs gain images through a protected “Extract PDF images” action without re-uploading; new uploads process images automatically.

## Technical approach
- Extract embedded raster images on the server from the saved PDF, preserving the original document and text parsing flow. Use image positions and day headings on each page to assign photos conservatively; leave ambiguous images out rather than show the wrong day.
- Save eligible images in the existing itinerary media storage and their day/order references in the new public-read, server-write image records. Clean up old extracted images when reprocessing or deleting an itinerary.
- Render images only in expanded day content using stable aspect ratios, lazy loading, descriptive alt text, and a responsive wide-then-paired layout.

## Verification
- Check a photo-rich PDF and an image-free PDF, existing-PDF extraction, mobile and desktop widths, and that non-image features remain intact.
