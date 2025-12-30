/* eslint-disable @typescript-eslint/no-require-imports */

const sharp = require('sharp');

const files = [
  { name: 'logo', width: 120 },
  { name: 'logo-dark', width: 120 },
  { name: 'logo-glow', width: 200 },
  { name: 'favicon', width: 32 },
  { name: 'banner-linkedin', width: 1584 },
  { name: 'banner-x', width: 1500 },
];

async function convert() {
  for (const file of files) {
    try {
      await sharp(`public/${file.name}.svg`)
        .resize(file.width)
        .png()
        .toFile(`public/${file.name}.png`);
      console.log(`✓ Created: ${file.name}.png`);
    } catch (e) {
      console.log(`✗ Failed: ${file.name} - ${e.message}`);
    }
  }
  console.log('\nDone! PNGs are in public/ folder');
}

convert();
