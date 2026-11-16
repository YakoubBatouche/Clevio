import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const partBytes = 20 * 1024 * 1024
const maxBytes = 50 * 1024 * 1024
const filenamePattern = /^[a-f0-9]{64}\.(mp4|webm)$/
const videoPrefix = '/uploads/reels/'

export async function prepareReels(root = '.') {
  const gallery = JSON.parse(await readFile(join(root, 'src/content/portfolio/audiovisual-media.json'), 'utf8'))
  const videos = new Set()
  for (const item of gallery.items ?? []) {
    if (typeof item?.video !== 'string' || !item.video.startsWith(videoPrefix)) continue
    const filename = item.video.slice(videoPrefix.length)
    if (filenamePattern.test(filename)) videos.add(filename)
  }

  const outputDirectory = join(root, 'public/uploads/reels')
  await mkdir(outputDirectory, { recursive: true })

  for (const filename of videos) {
    const sourceDirectory = join(root, 'media/reels', filename)
    const entries = await readdir(sourceDirectory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name))
    if (!entries.length || entries.length > Math.ceil(maxBytes / partBytes)) {
      throw new Error(`Invalid number of parts for reel ${filename}`)
    }

    const parts = []
    let total = 0
    const digest = createHash('sha256')
    for (const [index, entry] of entries.entries()) {
      const expectedName = `part-${String(index).padStart(3, '0')}`
      if (!entry.isFile() || entry.name !== expectedName) {
        throw new Error(`Expected ${expectedName} for reel ${filename}, found ${entry.name}`)
      }

      const path = join(sourceDirectory, entry.name)
      const { size } = await stat(path)
      const last = index === entries.length - 1
      if (!size || size > partBytes || (!last && size !== partBytes) || total + size > maxBytes) {
        throw new Error(`Invalid size for reel ${filename}, ${entry.name}`)
      }

      const content = await readFile(path)
      if (content.length !== size) throw new Error(`Part changed while reading reel ${filename}, ${entry.name}`)
      parts.push(content)
      total += size
      digest.update(content)
    }

    if (digest.digest('hex') !== filename.split('.')[0]) {
      throw new Error(`SHA256 mismatch for reel ${filename}`)
    }

    const temporaryPath = join(outputDirectory, `.reel-${randomUUID()}.tmp`)
    try {
      await writeFile(temporaryPath, Buffer.concat(parts, total), { flag: 'wx' })
      await rename(temporaryPath, join(outputDirectory, filename))
    } finally {
      await rm(temporaryPath, { force: true })
    }
  }

  const outputs = await readdir(outputDirectory, { withFileTypes: true })
  for (const output of outputs) {
    if (output.isFile() && filenamePattern.test(output.name) && !videos.has(output.name)) {
      await rm(join(outputDirectory, output.name), { force: true })
    }
  }
}
