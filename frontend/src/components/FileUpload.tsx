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
      setError('Unsupported file type. Please upload a video (mp4, avi, mov, mkv) or audio (mp3, wav, flac, m4a, ogg) file.')
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-indigo-400 bg-indigo-950/40'
            : selectedFile
            ? 'border-green-500 bg-green-950/20'
            : 'border-gray-600 bg-gray-900 hover:border-indigo-500 hover:bg-gray-800'
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
          accept=".mp4,.avi,.mov,.mkv,.mp3,.wav,.flac,.m4a,.ogg"
          onChange={handleChange}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✅</span>
            <p className="text-green-400 font-semibold text-lg">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">{formatBytes(selectedFile.size)}</p>
            <p className="text-gray-500 text-xs mt-1">Click or drag to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">{dragOver ? '📂' : '📁'}</span>
            <p className="text-gray-200 font-medium text-lg">
              {dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-gray-400 text-sm">or click to browse</p>
            <p className="text-gray-500 text-xs mt-1">
              Supported: MP4, AVI, MOV, MKV, MP3, WAV, FLAC, M4A, OGG
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
