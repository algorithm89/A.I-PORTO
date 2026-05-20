// Static tutorial registry, loaded at build time from /tuts.
//
// Conventions:
//   /tuts/<Folder>/<file>.md   — one Markdown file per part (sorted by `order`
//                                front-matter field, then by filename)
//   /tuts/<Folder>/<image>     — images referenced by relative filename inside
//                                the Markdown (![alt](pic.png))
//
// Per-part front-matter (the first part's metadata becomes the tutorial's):
//   title, track, level, excerpt, cover, partTitle, order, slug

import { parseFrontMatter } from './markdown'

const RAW = import.meta.glob('/tuts/**/*.{md,MD,markdown}', {
  query: '?raw', import: 'default', eager: true,
})
const IMAGES = import.meta.glob('/tuts/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,gif,GIF,svg,SVG}', {
  query: '?url', import: 'default', eager: true,
})

function folderOf(path) {
  const m = path.match(/^\/tuts\/([^/]+)\//)
  return m ? m[1] : null
}
function fileOf(path) {
  return path.slice(path.lastIndexOf('/') + 1)
}
function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function build() {
  const folders = {}

  for (const [path, raw] of Object.entries(RAW)) {
    const folder = folderOf(path)
    if (!folder) continue
    const { meta, body } = parseFrontMatter(raw)
    ;(folders[folder] ||= { folder, parts: [], images: {} })
    folders[folder].parts.push({ file: fileOf(path), meta, body })
  }

  for (const [path, url] of Object.entries(IMAGES)) {
    const folder = folderOf(path)
    if (!folder) continue
    ;(folders[folder] ||= { folder, parts: [], images: {} })
    const name = fileOf(path)
    folders[folder].images[name] = url
    folders[folder].images[name.toLowerCase()] = url
  }

  const tutorials = []
  for (const f of Object.values(folders)) {
    if (f.parts.length === 0) continue
    f.parts.sort((a, b) => {
      const oa = Number(a.meta.order ?? 9999)
      const ob = Number(b.meta.order ?? 9999)
      if (oa !== ob) return oa - ob
      return a.file.localeCompare(b.file)
    })
    const head = f.parts[0].meta
    const slug = slugify(head.slug || f.folder)

    // Resolve a relative image filename (e.g. "1st.png") to the hashed URL
    // produced by Vite for this tutorial's folder. Absolute / http URLs pass
    // through unchanged.
    const resolveImage = (src) => {
      if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src
      const key = src.slice(src.lastIndexOf('/') + 1)
      return f.images[key] || f.images[key.toLowerCase()] || src
    }

    tutorials.push({
      slug,
      title: head.title || f.folder,
      track: head.track || '',
      level: head.level || '',
      excerpt: head.excerpt || '',
      cover: head.cover ? resolveImage(head.cover) : null,
      resolveImage,
      parts: f.parts.map((p, idx) => ({
        partNumber: idx + 1,
        title: p.meta.partTitle || p.meta.title || `Part ${idx + 1}`,
        body: p.body,
      })),
    })
  }

  // Stable order: alphabetical by title.
  tutorials.sort((a, b) => a.title.localeCompare(b.title))
  return tutorials
}

const TUTORIALS = build()

export function getTutorials() {
  return TUTORIALS
}

export function getTutorial(slug) {
  return TUTORIALS.find(t => t.slug === slug) || null
}
