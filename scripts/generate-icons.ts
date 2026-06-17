// Generate Windows .ico and Mac .icns from bnb-logo.png
// Run with: bun run scripts/generate-icons.ts

import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { execSync } from 'child_process'

const SRC = '/home/z/my-project/public/bnb-logo.png'
const OUT_DIR = '/home/z/my-project/build/icons'

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  console.log('Source PNG:', SRC)

  // 1. Generate multiple PNG sizes (electron-builder will compose .icns from these on Mac,
  //    but for cross-platform builds we provide a single 512x512 + 1024x1024 png)
  const sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024]
  console.log('Generating PNG sizes:', sizes.join(', '))
  for (const size of sizes) {
    const buf = await sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
    await writeFile(`${OUT_DIR}/${size}x${size}.png`, buf)
  }

  // Also write icon.png as a 512x512 (electron-builder convention)
  const iconPng = await sharp(SRC).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  await writeFile(`${OUT_DIR}/icon.png`, iconPng)

  // 2. Generate Windows .ico (multi-resolution)
  console.log('Generating icon.ico …')
  const icoSizes = [16, 32, 48, 64, 128, 256]
  const icoBuffers = await Promise.all(
    icoSizes.map((s) =>
      sharp(SRC).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
    )
  )
  const ico = await pngToIco(icoBuffers)
  await writeFile(`${OUT_DIR}/icon.ico`, ico)
  console.log('Wrote icon.ico (' + ico.length + ' bytes)')

  // 3. Generate Mac .icns using iconutil (requires macOS — skip on Linux, electron-builder
  //    will generate it from icon.png automatically on Mac runners)
  if (process.platform === 'darwin') {
    console.log('Generating icon.icns via iconutil …')
    const iconsetDir = `${OUT_DIR}/icon.iconset`
    if (!existsSync(iconsetDir)) mkdirSync(iconsetDir, { recursive: true })
    const macSizes = [
      [16, 'icon_16x16.png'],
      [32, 'icon_16x16@2x.png'],
      [32, 'icon_32x32.png'],
      [64, 'icon_32x32@2x.png'],
      [128, 'icon_128x128.png'],
      [256, 'icon_128x128@2x.png'],
      [256, 'icon_256x256.png'],
      [512, 'icon_256x256@2x.png'],
      [512, 'icon_512x512.png'],
      [1024, 'icon_512x512@2x.png'],
    ]
    for (const [size, name] of macSizes) {
      const buf = await sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
      await writeFile(`${iconsetDir}/${name}`, buf)
    }
    execSync(`iconutil -c icns "${iconsetDir}" -o "${OUT_DIR}/icon.icns"`)
    console.log('Wrote icon.icns')
  } else {
    console.log('Skipping icon.icns (not on macOS — electron-builder will generate from icon.png on Mac)')
  }

  console.log('Done. Icons in', OUT_DIR)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
