# Fix desktop special-offer banner fit

## Changes
- Keep the existing mobile banner aspect ratio, cropped presentation, swipe gestures, and 7-second rotation unchanged.
- On desktop, remove the fixed aspect ratio and absolute fill behavior that crops uploaded artwork.
- Render each desktop banner at full container width with automatic height and `object-fit: contain`, while preserving the existing crossfade between multiple offers.

## Verification
- Check the desktop banner displays the full artwork without distortion or clipped text.
- Confirm the mobile layout and carousel behavior remain unchanged.
