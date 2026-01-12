# PWA Icons

This folder should contain the following icons for full PWA support.

## Required Icons

You can generate these from the `icon.svg` file using a tool like:
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/nickytonline/pwa-asset-generator)
- [Maskable.app Editor](https://maskable.app/editor)

### Standard Icons
- `icon-72x72.png` (72x72)
- `icon-96x96.png` (96x96)
- `icon-128x128.png` (128x128)
- `icon-144x144.png` (144x144)
- `icon-152x152.png` (152x152)
- `icon-167x167.png` (167x167) - iPad Pro
- `icon-192x192.png` (192x192)
- `icon-384x384.png` (384x384)
- `icon-512x512.png` (512x512)

### Apple Touch Icons
- `apple-touch-icon.png` (180x180)

### Favicons
- `favicon.ico` (16x16, 32x32, 48x48 multi-resolution)
- `favicon-16x16.png` (16x16)
- `favicon-32x32.png` (32x32)

### Shortcut Icons (Optional)
- `chat-icon.png` (96x96)
- `journal-icon.png` (96x96)
- `mood-icon.png` (96x96)

### Notification Icons (Optional)
- `badge-72x72.png` (72x72) - Monochrome badge for notifications
- `checkin.png` (96x96)
- `dismiss.png` (96x96)

## Quick Generation with Sharp (Node.js)

If you have Node.js installed, you can generate icons using this script:

```bash
npm install sharp
```

```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 167, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('icon.svg')
      .resize(size, size)
      .png()
      .toFile(`icon-${size}x${size}.png`);
    console.log(`Generated icon-${size}x${size}.png`);
  }
  
  // Apple touch icon
  await sharp('icon.svg')
    .resize(180, 180)
    .png()
    .toFile('apple-touch-icon.png');
    
  // Favicons
  await sharp('icon.svg')
    .resize(32, 32)
    .png()
    .toFile('favicon-32x32.png');
    
  await sharp('icon.svg')
    .resize(16, 16)
    .png()
    .toFile('favicon-16x16.png');
}

generateIcons();
```

## Splash Screens (Optional - iOS)

For iOS splash screens, create images in the `/public/splash/` folder:
- `apple-splash-2048-2732.png` (iPad Pro 12.9")
- `apple-splash-1668-2388.png` (iPad Pro 11")
- `apple-splash-1536-2048.png` (iPad 10.2", iPad Air)
- `apple-splash-1290-2796.png` (iPhone 15 Pro Max)
- `apple-splash-1179-2556.png` (iPhone 15 Pro)
- `apple-splash-1170-2532.png` (iPhone 15, 14 Pro)

These should have your logo centered on the app's background color (#0a0e17).
