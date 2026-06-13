import fs from 'fs-extra'
import sharp from 'sharp'
import path from 'path'

const SRC_IMAGE = path.join(process.cwd(), 'public/icon.png')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const BUILD_DIR = path.join(process.cwd(), 'build')

async function run() {
  await fs.ensureDir(PUBLIC_DIR)
  await fs.ensureDir(BUILD_DIR)

  // Create logo192.png
  await sharp(SRC_IMAGE)
    .resize(192, 192)
    .toFile(path.join(PUBLIC_DIR, 'logo192.png'))

  // Create logo512.png
  await sharp(SRC_IMAGE)
    .resize(512, 512)
    .toFile(path.join(PUBLIC_DIR, 'logo512.png'))

  // Create favicon-32x32.png
  await sharp(SRC_IMAGE)
    .resize(32, 32)
    .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'))

  // Create favicon-16x16.png
  await sharp(SRC_IMAGE)
    .resize(16, 16)
    .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'))

  // Create electron build icon (icon.png)
  await sharp(SRC_IMAGE)
    .resize(512, 512)
    .toFile(path.join(BUILD_DIR, 'icon.png'))

  console.log('Icons generated successfully.')
}

run().catch(console.error)
