// Minimal, dependency-free Markdown → HTML renderer for the static tutorials.
// Supports: YAML-ish front-matter, headings, fenced code, GFM tables,
// ordered/unordered lists, links, images, bold and inline code.
// Input is our own trusted .md files, but everything is still HTML-escaped.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;')
}

/**
 * Split a raw .md file into { meta, body }. Front-matter is an optional
 * leading `---` … `---` block of `key: value` pairs.
 */
export function parseFrontMatter(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n')
  const meta = {}
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta, body: text }
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    meta[kv[1]] = v
  }
  return { meta, body: text.slice(m[0].length) }
}

/** Render the inline span syntax inside a single block of text. */
function inline(text, resolveImage) {
  let out = escapeHtml(text)

  // Protect inline code spans so their contents aren't re-processed.
  // The @@CODESPANn@@ sentinel cannot occur in real Markdown prose.
  const codes = []
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${code}</code>`)
    return `@@CODESPAN${codes.length - 1}@@`
  })

  // Images: ![alt](src)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
    `<img src="${escapeAttr(resolveImage(src))}" alt="${escapeAttr(alt)}" loading="lazy" />`)

  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:\/\//.test(href)
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${escapeAttr(href)}"${attrs}>${label}</a>`
  })

  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Restore protected code spans
  out = out.replace(/@@CODESPAN(\d+)@@/g, (_, i) => codes[Number(i)])
  return out
}

/** True if a line is a GFM table separator row, e.g. `| --- | :--: |`. */
function isTableSeparator(line) {
  if (!line.includes('|')) return false
  const cells = line.trim().replace(/^\||\|$/g, '').split('|')
  return cells.length > 0 && cells.every(c => /^\s*:?-+:?\s*$/.test(c))
}
function splitRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

/**
 * Render a Markdown body to an HTML string.
 * @param {string} body
 * @param {{ resolveImage?: (src: string) => string }} [options]
 */
export function renderMarkdown(body, options = {}) {
  const resolveImage = options.resolveImage || (s => s)
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const html = []
  let i = 0

  const isBlockStart = (l) =>
    /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (/^\s*$/.test(line)) { i++; continue }

    // Fenced code block
    const fence = line.match(/^```\s*(\S*)\s*$/)
    if (fence) {
      const buf = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++ }
      i++ // consume the closing fence
      const cls = fence[1] ? ` class="language-${escapeAttr(fence[1])}"` : ''
      html.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`)
      continue
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      html.push(`<h${level}>${inline(heading[2].trim(), resolveImage)}</h${level}>`)
      i++
      continue
    }

    // Table — a row with pipes immediately followed by a separator row
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitRow(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i])); i++
      }
      const thead = `<thead><tr>${headers.map(c => `<th>${inline(c, resolveImage)}</th>`).join('')}</tr></thead>`
      const tbody = `<tbody>${rows.map(r =>
        `<tr>${r.map(c => `<td>${inline(c, resolveImage)}</td>`).join('')}</tr>`).join('')}</tbody>`
      html.push(`<div class="tut-md-table-wrap"><table class="tut-md-table">${thead}${tbody}</table></div>`)
      continue
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++
      }
      html.push(`<ul>${items.map(it => `<li>${inline(it, resolveImage)}</li>`).join('')}</ul>`)
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++
      }
      html.push(`<ol>${items.map(it => `<li>${inline(it, resolveImage)}</li>`).join('')}</ol>`)
      continue
    }

    // Paragraph — collect until a blank line or the start of another block
    const para = []
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
      para.push(lines[i]); i++
    }
    const text = para.join('\n')

    // A paragraph that is nothing but one image becomes a figure
    const imgOnly = text.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (imgOnly) {
      const alt = imgOnly[1]
      const caption = alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ''
      html.push(
        `<figure class="tut-md-figure">` +
        `<img src="${escapeAttr(resolveImage(imgOnly[2]))}" alt="${escapeAttr(alt)}" loading="lazy" />` +
        `${caption}</figure>`)
    } else {
      html.push(`<p>${inline(text.replace(/\n/g, ' '), resolveImage)}</p>`)
    }
  }

  return html.join('\n')
}
