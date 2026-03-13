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
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver
          ? 'border-[--text] bg-[--bg-secondary]'
          : selectedFile
            ? 'border-[--border] bg-[--bg-secondary]'
            : 'border-[--border-light] bg-[--bg-secondary] hover:border-[--border]'
          }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp4,.avi,.mov,.mkv,.mp3,.wav,.flac,.m4a,.ogg,.jpg,.jpeg,.png,.webp,.bmp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-[--text] font-medium text-sm">{selectedFile.name}</p>
            <p className="text-[--text-dim] text-xs">{formatBytes(selectedFile.size)} · Click or drag to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[--text] font-medium text-sm">
              {dragOver ? 'Drop your file' : 'Drag & drop a file here'}
            </p>
            <p className="text-[--text-dim] text-xs">or click to browse</p>
            <p className="text-[--text-dim] text-xs mt-2 opacity-60">
              JPG · PNG · WEBP · BMP · MP4 · AVI · MOV · MKV · MP3 · WAV · FLAC
            </p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  )
}
