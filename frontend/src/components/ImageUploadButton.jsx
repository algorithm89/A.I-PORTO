import { useRef, useState } from 'react'

const API = import.meta.env.VITE_API_URL || ''

// Picks an image file, uploads it to /api/admin/upload, and hands the
// resulting URL back via onUploaded. Reusable across admin editors.
export default function ImageUploadButton({ token, onUploaded, onError }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so the same file can be picked again
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary
        body: fd,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || `Upload failed (${res.status})`)
      onUploaded(data.message) // data.message holds the image URL
    } catch (err) {
      onError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button className="ap-btn-preview" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? '⏳ Uploading…' : '📷 Upload image'}
      </button>
    </>
  )
}
