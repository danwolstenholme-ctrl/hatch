/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * SVG to PNG Converter
 * 
 * Converts all SVGs in public/assets to PNGs
 * Automatically detects dimensions from filename (e.g., og-1200x630.svg)
 * 
 * Usage: node scripts/convert-svg.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

async function convertSvgToPng() {
  const files = fs.readdirSync(ASSETS_DIR);
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  if (svgFiles.length === 0) {
    console.log('No SVG files found in public/assets');
    return;
  }

  console.log(`Found ${svgFiles.length} SVG file(s) to convert:\n`);

  for (const svgFile of svgFiles) {
    const svgPath = path.join(ASSETS_DIR, svgFile);
    const baseName = svgFile.replace('.svg', '');
    const pngPath = path.join(ASSETS_DIR, `${baseName}.png`);

    // Try to extract dimensions from filename (e.g., og-1200x630.svg)
    const dimMatch = baseName.match(/(\d+)x(\d+)/);
    
    try {
      let sharpInstance = sharp(svgPath);
      
      if (dimMatch) {
        const width = parseInt(dimMatch[1]);
        const height = parseInt(dimMatch[2]);
        sharpInstance = sharpInstance.resize(width, height);
        console.log(`📐 ${svgFile} → ${width}x${height}`);
      } else {
        console.log(`📐 ${svgFile} → native size`);
      }

      await sharpInstance.png().toFile(pngPath);
      console.log(`✅ Created: ${baseName}.png\n`);
    } catch (err) {
      console.error(`❌ Failed: ${svgFile}`, err.message, '\n');
    }
  }

  console.log('Done! 🐣');
}

convertSvgToPng();
