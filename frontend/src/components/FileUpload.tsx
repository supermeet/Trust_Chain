import { useRef, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

const ACCEPTED_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/x-msvideo': 'avi',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/flac': 'flac',
  'audio/x-m4a': 'm4a',
  'audio/ogg': 'ogg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    if (!ACCEPTED_TYPES[file.type]) {
      setError('Unsupported file type. Please upload video, audio, or image.')
      return
    }
    setError(null)
    onFileSelect(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          dragOver
            ? 'bg-[var(--accent-dim)] border-2 border-[var(--accent)] shadow-[0_0_30px_rgba(79,142,255,0.15)]'
            : selectedFile
              ? 'bg-[var(--surface-2)] border border-[var(--border-strong)]'
              : 'bg-[var(--surface-1)] border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
        }`}
        style={{
          transform: dragOver ? 'perspective(800px) rotateX(0deg) scale(1.01)' : 'perspective(800px) rotateX(2deg)',
          transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Shimmer background */}
        {!selectedFile && <div className="absolute inset-0 shimmer-bg" />}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp4,.avi,.mov,.mkv,.mp3,.wav,.flac,.m4a,.ogg,.jpg,.jpeg,.png,.webp,.bmp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-[--text] font-semibold text-sm">{selectedFile.name}</p>
            <p className="text-[--text-dim] text-xs">{formatBytes(selectedFile.size)} · Click or drag to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-[--text] font-semibold text-sm">
              {dragOver ? 'Drop your file' : 'Drag & drop a file here'}
            </p>
            <p className="text-[--text-dim] text-xs">or click to browse</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {['MP4', 'AVI', 'MOV', 'WAV', 'MP3', 'FLAC', 'JPG', 'PNG'].map((ext) => (
                <span key={ext} className="badge-accent text-[10px] px-2 py-0.5">{ext}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-[--danger] text-sm">{error}</p>}
    </div>
  )
}
