import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FileUpload from '../components/FileUpload'

interface ContextForm {
  disclosure_stripped: boolean
  content_distributed: boolean
  victim_impersonated: boolean
  platform_name: string
  takedown_requested: boolean
  response_hours: string
  content_removed: boolean
  estimated_reach: string
  model_name: string
}

const defaultForm: ContextForm = {
  disclosure_stripped: false,
  content_distributed: false,
  victim_impersonated: false,
  platform_name: 'YouTube',
  takedown_requested: false,
  response_hours: '',
  content_removed: false,
  estimated_reach: '',
  model_name: '',
}

export default function Upload() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState<ContextForm>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setCheck(field: keyof ContextForm, value: boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setText(field: keyof ContextForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('file', selectedFile)
      data.append('disclosure_stripped', String(form.disclosure_stripped))
      data.append('content_distributed', String(form.content_distributed))
      data.append('victim_impersonated', String(form.victim_impersonated))
      data.append('platform_name', form.platform_name)
      data.append('takedown_requested', String(form.takedown_requested))
      if (form.takedown_requested && form.response_hours) {
        data.append('response_hours', form.response_hours)
      }
      data.append('content_removed', String(form.content_removed))
      if (form.estimated_reach) {
        data.append('estimated_reach', form.estimated_reach)
      }
      if (form.model_name) {
        data.append('model_name', form.model_name)
      }

      const res = await axios.post('/api/upload', data)
      const id: string = res.data?.id ?? res.data?.event_id ?? res.data
      navigate(`/results/${id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submit Evidence</h1>
        <p className="text-gray-400">
          Upload a video or audio file for deepfake detection and blockchain-anchored integrity proof.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

        {/* Context form — shown after file selected */}
        {selectedFile && (
          <>
            {/* About the Content */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-base font-semibold text-gray-200 mb-4">About the Content</h2>
              <div className="space-y-3">
                {[
                  { field: 'disclosure_stripped' as const, label: 'AI disclosure was stripped or hidden' },
                  { field: 'content_distributed' as const, label: 'Content was widely distributed' },
                  { field: 'victim_impersonated' as const, label: 'A real person is being impersonated' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[field] as boolean}
                      onChange={(e) => setCheck(field, e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-gray-300 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* About the Platform */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-base font-semibold text-gray-200 mb-4">About the Platform</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Platform</label>
                  <select
                    value={form.platform_name}
                    onChange={(e) => setText('platform_name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {['YouTube', 'Instagram', 'WhatsApp', 'X', 'Telegram', 'Other'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.takedown_requested}
                    onChange={(e) => setCheck('takedown_requested', e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-gray-300 text-sm">Takedown was requested</span>
                </label>

                {form.takedown_requested && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Platform response time (hours)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.response_hours}
                      onChange={(e) => setText('response_hours', e.target.value)}
                      placeholder="e.g. 48"
                      className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.content_removed}
                    onChange={(e) => setCheck('content_removed', e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-gray-300 text-sm">Content was eventually removed</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estimated reach (views)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.estimated_reach}
                    onChange={(e) => setText('estimated_reach', e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* AI Model (Optional) */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-base font-semibold text-gray-200 mb-4">AI Model <span className="text-gray-500 font-normal">(Optional)</span></h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model name</label>
                <input
                  type="text"
                  value={form.model_name}
                  onChange={(e) => setText('model_name', e.target.value)}
                  placeholder="e.g. Stable Diffusion, Midjourney, ElevenLabs…"
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analysing &amp; anchoring to blockchain…
                </>
              ) : (
                'Submit for Analysis'
              )}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
