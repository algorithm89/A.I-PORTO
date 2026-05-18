#!/usr/bin/env node
/**
 * Image Compression Script
 * Converts PNG/JPG to WebP, resizes to max 1200px, removes originals
 *
 * Usage: npm run compress-images
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ASSETS_DIR = path.join(__dirname, '../src/assets')
const MAX_WIDTH = 1200
const WEBP_QUALITY = 90

async function compressImages() {
  try {
    console.log('🖼️  Starting image compression...\n')
    console.log(`📁 Assets directory: ${ASSETS_DIR}`)
    console.log(`📐 Max width: ${MAX_WIDTH}px`)
    console.log(`⚙️  WebP quality: ${WEBP_QUALITY}\n`)

    const files = fs.readdirSync(ASSETS_DIR)
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f))

    if (imageFiles.length === 0) {
      console.log('❌ No PNG/JPG files found in assets directory')
      return
    }

    console.log(`Found ${imageFiles.length} images to compress:\n`)

    let totalOriginal = 0
    let totalCompressed = 0

    for (const file of imageFiles) {
      const fullPath = path.join(ASSETS_DIR, file)
      const stat = fs.statSync(fullPath)
      const sizeKB = (stat.size / 1024).toFixed(1)

      totalOriginal += stat.size

      const metadata = await sharp(fullPath).metadata()
      const newWidth = Math.min(metadata.width, MAX_WIDTH)

      const nameWithoutExt = path.parse(file).name
      const outputFile = path.join(ASSETS_DIR, `${nameWithoutExt}.webp`)

      await sharp(fullPath)
        .resize(newWidth, Math.round((newWidth * metadata.height) / metadata.width), {
          withoutEnlargement: true,
          fit: 'contain',
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputFile)

      const newStat = fs.statSync(outputFile)
      const newSizeKB = (newStat.size / 1024).toFixed(1)
      totalCompressed += newStat.size

      const ratio = ((1 - newStat.size / stat.size) * 100).toFixed(0)

      console.log(`✅ ${file.padEnd(25)} ${sizeKB.padStart(8)} KB → ${newSizeKB.padStart(8)} KB (${ratio}% smaller)`)

      fs.unlinkSync(fullPath)
    }

    console.log(`\n${'─'.repeat(70)}`)
    console.log(`📊 Total: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB → ${(totalCompressed / 1024 / 1024).toFixed(1)} MB`)
    console.log(`✨ Saved: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(0)}% reduction!\n`)

    console.log('⚠️  Next steps:')
    console.log('  1. Update imports: change .png/.jpg to .webp')
    console.log('  2. Run: npm run build')
    console.log('  3. Commit & push changes\n')

  } catch (error) {
    console.error('❌ Compression failed:', error.message)
    process.exit(1)
  }
}

compressImages()
