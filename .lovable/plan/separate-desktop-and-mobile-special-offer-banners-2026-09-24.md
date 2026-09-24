# Separate desktop and mobile special-offer banners

## Changes
- Keep the existing mobile banner appearance, swipe gestures, and 7-second rotation unchanged.
- Add separate Desktop Banner and Mobile Banner upload areas in the admin panel, each with its own preview and delete action.
- Pair desktop and mobile images for each offer, with automatic fallback when only one version is uploaded.
- Display desktop banners as compact, full-width promotional strips inside the site container, with rounded corners and the complete artwork visible without cropping or distortion.
- Do not add carousel dots or change any other homepage or admin features.

## Technical details
- Store variants in separate desktop/mobile folders within the existing banner storage area.
- Preserve compatibility with existing banners by treating them as shared fallback images.
- Extend the existing upload action with a validated desktop/mobile variant while keeping deletion compatible.

## Verification
- Check desktop at 1280px and 1440px for compact sizing, side-to-side use of the container, complete uncropped artwork, and rounded borders.
- Check mobile at 360px, 390px, and 430px to confirm the current appearance, swipe behavior, and no horizontal overflow remain unchanged.
- Confirm admin upload, preview, deletion, fallback, and 7-second rotation work without carousel dots.
