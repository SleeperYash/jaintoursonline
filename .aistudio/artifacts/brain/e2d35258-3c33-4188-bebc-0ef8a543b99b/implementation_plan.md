# Universal Zero-Crop Special Offers Banner & Streamlined Upload System

Resolve the banner size mismatch between mobile and desktop by replacing rigid fixed-aspect cropping (`aspect-[16/8] object-cover`) with a natural, zero-crop responsive container, and simplify the admin upload flow into a single smart upload that automatically adapts across all screens.

---

## 1. Root Cause Analysis

- **Mobile Viewport**: The banner container currently imposes a forced `aspect-[16/8]` (2:1 ratio) with `object-cover`. Any uploaded promotional banner (such as the 16:9 or 2.1:1 airfare deal card) has its left and right margins or text cropped off on phones.
- **Desktop Viewport**: The banner shifts to `md:aspect-auto md:w-fit md:object-contain md:max-h-[320px]`, causing the desktop view to display the full image uncropped while mobile aggressively slices the graphic.
- **Dual Upload Overhead**: The admin currently asks for two separate images (`desktop` and `mobile`), yet because mobile was forcing `object-cover`, uploading a custom mobile banner still suffered from clipping and sizing disparity.

---

## 2. Proposed Changes

### A. Responsive Zero-Crop Banner Component (`src/components/site/home/SpecialOffersBanner.tsx`)
- **Natural Aspect Ratio Grid Stack**:
  - Replace the forced `aspect-[16/8]` container with a CSS Grid stack where all slides share `col-start-1 row-start-1`.
  - Apply `w-full h-auto max-h-[260px] sm:max-h-[340px] md:max-h-[400px] object-contain rounded-xl md:rounded-[20px] mx-auto` to the image element.
  - This guarantees **100% of the graphic is always visible** on mobile and desktop without cutting off any text, badges, or contact details.
- **Seamless Universal Source Selection**:
  - Use the single uploaded banner source automatically for both mobile and desktop.
  - Gracefully preserve backward compatibility for any existing dual-variant offers (`desktop` or `mobile` or `legacy`).
- **Enhanced Polish**:
  - Keep 7-second auto-rotation with touch swipe support.
  - Add pause-on-hover/touch so readers can view offer details uninterrupted.
  - Add subtle navigation dots when multiple offers are uploaded.

### B. Simplified Single Admin Upload (`src/components/site/SpecialOffersAdminSection.tsx`)
- **Streamlined Single Dropzone**:
  - Replace the confusing dual "Desktop" vs "Mobile" upload boxes with a single primary upload zone:
    - **"Upload Special Offer Banner"** (Drag & drop or click).
    - Clear guideline: *"Upload your offer graphic (recommended 16:9 or 2:1 ratio, e.g. 1600 × 800) · Auto-adapts to both mobile & desktop without cropping."*
- **Single-Source Dispatch**:
  - When a banner is uploaded, upload it as the universal primary banner (dispatching to the backend as universal/desktop and mobile fallback), so you only upload once.
- **Live Device Preview**:
  - Show a clear card in the admin panel displaying the uploaded offer with a miniature preview of how it appears on mobile and desktop.
  - Allow quick deletion or replacement with one click.

---

## 3. Verification & Testing Plan

1. **Mobile Responsiveness**: Test at 360px, 390px, and 414px mobile widths to confirm that wide promotional graphics (like "FLY MORE. SPEND LESS.") show edge-to-edge with 100% text legibility and zero cropped edges.
2. **Desktop Layout**: Test on 1024px, 1280px, and 1440px+ viewports to verify crisp, centered rendering that matches site container bounds.
3. **Admin Upload**: Test uploading a banner in the admin panel and confirm it immediately reflects on both mobile and desktop views without requiring two files.
4. **Code Quality**: Verify via `lint_applet` and `compile_applet`.
