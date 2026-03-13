import { useState } from 'react'
import axios from 'axios'

type TabType = 'id' | 'file'
type VerifyStatus = 'verified' | 'mismatch' | 'not_found' | null

interface VerifyResult {
  status: VerifyStatus
  timestamp?: string
  message?: string
}

function StatusBanner({ result }: { result: VerifyResult }) {
  if (!result.status) return null

  const config = {
    verified: {
      cls: 'bg-[var(--success-glow)] border-[rgba(45,212,191,0.3)] text-[--success]',
      label: `Verified — unmodified since ${result.timestamp ? new Date(result.timestamp).toLocaleString() : 'recorded time'}`,
    },
    mismatch: {
      cls: 'bg-[var(--danger-glow)] border-[rgba(255,77,109,0.3)] text-[--danger]',
      label: 'Hash mismatch — possible tampering detected',
    },
    not_found: {
      cls: 'bg-[var(--warn-glow)] border-[rgba(245,158,11,0.3)] text-[--warn]',
      label: 'No record found on blockchain',
    },
  }

  const c = config[result.status]
  if (!c) return null

  return (
    <div className={`rounded-2xl px-5 py-4 border ${c.cls} animate-enter`}>
      <p className="font-semibold text-sm">{c.label}</p>
      {result.message && <p className="text-sm mt-1 opacity-70">{result.message}</p>}
    </div>
  )
}

function resolveStatus(data: Record<string, unknown>): VerifyResult {
  if (data.id || data.file_hash) {
    return {
      status: 'verified',
      timestamp: (data.timestamp ?? data.created_at) as string | undefined,
    }
  }

  const verified = data.verified ?? data.match ?? data.status === 'verified'
  const found = data.found ?? data.exists ?? data.registered_on_chain ?? data.status !== 'not_found'

  if (!found || data.status === 'not_found') {
    return { status: 'not_found' }
  }
  if (verified) {
    return {
      status: 'verified',
      timestamp: (data.timestamp ?? data.created_at) as string | undefined,
    }
  }
  return { status: 'mismatch' }
}

export default function Verify() {
  const [activeTab, setActiveTab] = useState<TabType>('id')

  const [eventId, setEventId] = useState('')
  const [idLoading, setIdLoading] = useState(false)
  const [idResult, setIdResult] = useState<VerifyResult | null>(null)
  const [idError, setIdError] = useState<string | null>(null)

  const [fileInput, setFileInput] = useState<File | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileResult, setFileResult] = useState<VerifyResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  async function lookupById() {
    if (!eventId.trim()) return
    setIdLoading(true)
    setIdError(null)
    setIdResult(null)
    try {
      const res = await axios.get(`/api/evidence/${eventId.trim()}`)
      setIdResult(resolveStatus(res.data as Record<string, unknown>))
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setIdResult({ status: 'not_found' })
      } else if (axios.isAxiosError(err)) {
        setIdError(err.response?.data?.detail ?? err.message)
      } else {
        setIdError('An unexpected error occurred.')
      }
    } finally {
      setIdLoading(false)
    }
  }

  async function verifyFile() {
    if (!fileInput) return
    setFileLoading(true)
    setFileError(null)
    setFileResult(null)
    try {
      const data = new FormData()
      data.append('file', fileInput)
      const res = await axios.post('/api/verify', data)
      setFileResult(resolveStatus(res.data as Record<string, unknown>))
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setFileResult({ status: 'not_found' })
      } else if (axios.isAxiosError(err)) {
        setFileError(err.response?.data?.detail ?? err.message)
      } else {
        setFileError('An unexpected error occurred.')
      }
    } finally {
      setFileLoading(false)
    }
  }

  const tabClass = (tab: TabType) =>
    `px-4 py-2 text-sm font-medium transition-all rounded-full ${activeTab === tab
      ? 'bg-[--accent] text-white shadow-[0_0_15px_rgba(79,142,255,0.3)]'
      : 'text-[--text-secondary] hover:text-[--text]'
    }`

  return (
    <div className="max-w-xl mx-auto py-16 animate-enter">
      <h1 className="font-display text-3xl font-bold text-[--text] tracking-tight mb-2">Verify evidence</h1>
      <p className="text-base text-[--text-secondary] mb-10">
        Check if a file or event is registered on the blockchain.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-[--surface-2] p-1 rounded-full w-fit border border-[--border-subtle]">
        <button className={tabClass('id')} onClick={() => setActiveTab('id')}>By Event ID</button>
        <button className={tabClass('file')} onClick={() => setActiveTab('file')}>By File</button>
      </div>

      {/* By Event ID */}
      {activeTab === 'id' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupById()}
              placeholder="Paste event ID…"
              className="input-dark flex-1"
            />
            <button
              onClick={lookupById}
              disabled={idLoading || !eventId.trim()}
              className="btn-glow !px-6 !py-3 shrink-0"
            >
              {idLoading ? '…' : 'Lookup'}
            </button>
          </div>
          {idError && <p className="text-[--danger] text-sm">{idError}</p>}
          {idResult && <StatusBanner result={idResult} />}
        </div>
      )}

      {/* By File */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              fileInput
                ? 'border-[--border-strong] bg-[--surface-2]'
                : 'border-[--border-strong] hover:border-[--accent] bg-[--surface-1]'
            }`}
            onClick={() => document.getElementById('verify-file')?.click()}
          >
            <input
              type="file"
              id="verify-file"
              className="hidden"
              onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
            />
            {fileInput ? (
              <div>
                <p className="text-[--text] font-medium text-sm">{fileInput.name}</p>
                <p className="text-[--text-dim] text-xs mt-1">Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-[--text] text-sm font-medium mb-1">Click to select a file</p>
                <p className="text-[--text-dim] text-xs">The file hash will be checked against the blockchain</p>
              </div>
            )}
          </div>

          <button
            onClick={verifyFile}
            disabled={fileLoading || !fileInput}
            className="btn-glow w-full"
          >
            {fileLoading ? 'Verifying…' : 'Verify file'}
          </button>

          {fileError && <p className="text-[--danger] text-sm">{fileError}</p>}
          {fileResult && <StatusBanner result={fileResult} />}
        </div>
      )}
    </div>
  )
}
