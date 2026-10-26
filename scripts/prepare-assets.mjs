import fs from 'node:fs/promises'
import sharp from 'sharp'

await fs.mkdir('public/images', { recursive: true })
const scene = sharp('design/hero-scene.png')
await scene.clone().webp({ quality: 94, effort: 6 }).toFile('public/images/hero-scene.webp')
await scene.clone().resize({ width: 1000 }).webp({ quality: 92, effort: 6 }).toFile('public/images/hero-scene-1000.webp')
// The approved bitmap stays unchanged: the Brand SVG viewport displays only its exact logo.
await sharp('design/hero-approved.png').webp({ lossless: true, effort: 6 }).toFile('public/images/hero-approved.webp')
for (const file of await fs.readdir('public/images')) {
  const stat = await fs.stat('public/images/' + file)
  console.log(file + ': ' + Math.round(stat.size / 1024) + ' KB')
}
