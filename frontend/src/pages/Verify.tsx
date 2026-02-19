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
      icon: '✅',
      color: 'bg-green-950 border-green-700 text-green-300',
      text: `Verified — unmodified since ${result.timestamp ? new Date(result.timestamp).toLocaleString() : 'recorded time'}`,
    },
    mismatch: {
      icon: '❌',
      color: 'bg-red-950 border-red-700 text-red-300',
      text: 'Hash mismatch — possible tampering detected',
    },
    not_found: {
      icon: '⚠️',
      color: 'bg-yellow-950 border-yellow-700 text-yellow-300',
      text: 'No record found on blockchain',
    },
  }

  const c = config[result.status]
  if (!c) return null

  return (
    <div className={`border rounded-xl px-5 py-4 flex items-start gap-3 ${c.color}`}>
      <span className="text-xl">{c.icon}</span>
      <div>
        <p className="font-semibold">{c.text}</p>
        {result.message && <p className="text-sm mt-1 opacity-80">{result.message}</p>}
      </div>
    </div>
  )
}

function resolveStatus(data: Record<string, unknown>): VerifyResult {
  const verified = data.verified ?? data.match ?? data.status === 'verified'
  const found = data.found ?? data.exists ?? data.status !== 'not_found'

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

  // By ID
  const [eventId, setEventId] = useState('')
  const [idLoading, setIdLoading] = useState(false)
  const [idResult, setIdResult] = useState<VerifyResult | null>(null)
  const [idError, setIdError] = useState<string | null>(null)

  // By File
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
    `px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
      activeTab === tab
        ? 'border-indigo-500 text-indigo-400 bg-gray-900'
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
    }`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verification Portal</h1>
        <p className="text-gray-400">
          Verify the integrity of evidence against the blockchain record.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button className={tabClass('id')} onClick={() => setActiveTab('id')}>
          By Event ID
        </button>
        <button className={tabClass('file')} onClick={() => setActiveTab('file')}>
          By File Upload
        </button>
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
              placeholder="Enter Event ID…"
              className="flex-1 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={lookupById}
              disabled={idLoading || !eventId.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {idLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                'Lookup'
              )}
            </button>
          </div>
          {idError && <p className="text-red-400 text-sm">{idError}</p>}
          {idResult && <StatusBanner result={idResult} />}
        </div>
      )}

      {/* By File Upload */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
            <input
              type="file"
              id="verify-file"
              className="hidden"
              onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="verify-file" className="cursor-pointer block">
              {fileInput ? (
                <div className="space-y-1">
                  <p className="text-green-400 font-medium">{fileInput.name}</p>
                  <p className="text-gray-500 text-sm">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl">📂</p>
                  <p className="text-gray-300">Click to select a file</p>
                  <p className="text-gray-500 text-sm">The file hash will be checked against the blockchain</p>
                </div>
              )}
            </label>
          </div>

          <button
            onClick={verifyFile}
            disabled={fileLoading || !fileInput}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {fileLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying…
              </>
            ) : (
              'Verify File'
            )}
          </button>

          {fileError && <p className="text-red-400 text-sm">{fileError}</p>}
          {fileResult && <StatusBanner result={fileResult} />}
        </div>
      )}
    </div>
  )
}
