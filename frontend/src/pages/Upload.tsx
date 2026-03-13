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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[--text]' : 'bg-[--border]'
          }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-[2px]'
            }`}
        />
      </button>
      <span className="text-sm text-[--text-secondary] group-hover:text-[--text] transition-colors">{label}</span>
    </label>
  )
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

  const inputClass = 'w-full bg-[--bg-secondary] border border-[--border-light] text-[--text] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--text]/10 focus:border-[--border] transition-all placeholder:text-[--text-dim]'

  return (
    <div className="max-w-xl mx-auto py-16 animate-enter">
      <h1 className="text-3xl font-semibold text-[--text] tracking-tight mb-2">Submit a file</h1>
      <p className="text-base text-[--text-secondary] mb-10">
        Upload audio or video for deepfake analysis and blockchain certification.
      </p>

      <hr className="border-[--border-light] mb-8" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

        {selectedFile && (
          <>
            <div className="pt-2 animate-enter animate-enter-d1">
              <h2 className="text-sm font-semibold text-[--text] mb-4">About the content</h2>
              <div className="space-y-1">
                <Toggle checked={form.disclosure_stripped} onChange={(v) => setCheck('disclosure_stripped', v)} label="AI disclosure was stripped or hidden" />
                <Toggle checked={form.content_distributed} onChange={(v) => setCheck('content_distributed', v)} label="Content was widely distributed" />
                <Toggle checked={form.victim_impersonated} onChange={(v) => setCheck('victim_impersonated', v)} label="A real person is being impersonated" />
              </div>
            </div>

            <hr className="border-[--border-light]" />

            <div className="animate-enter animate-enter-d2">
              <h2 className="text-sm font-semibold text-[--text] mb-4">Platform details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[--text-dim] mb-1.5">Platform</label>
                  <select
                    value={form.platform_name}
                    onChange={(e) => setText('platform_name', e.target.value)}
                    className={inputClass}
                  >
                    {['YouTube', 'Instagram', 'WhatsApp', 'X', 'Telegram', 'Other'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <Toggle checked={form.takedown_requested} onChange={(v) => setCheck('takedown_requested', v)} label="Takedown was requested" />

                {form.takedown_requested && (
                  <div>
                    <label className="block text-xs text-[--text-dim] mb-1.5">Response time (hours)</label>
                    <input type="number" min="0" value={form.response_hours} onChange={(e) => setText('response_hours', e.target.value)} placeholder="e.g. 48" className={inputClass} />
                  </div>
                )}

                <Toggle checked={form.content_removed} onChange={(v) => setCheck('content_removed', v)} label="Content was eventually removed" />

                <div>
                  <label className="block text-xs text-[--text-dim] mb-1.5">Estimated reach (views)</label>
                  <input type="number" min="0" value={form.estimated_reach} onChange={(e) => setText('estimated_reach', e.target.value)} placeholder="e.g. 50000" className={inputClass} />
                </div>
              </div>
            </div>

            <hr className="border-[--border-light]" />

            <div className="animate-enter animate-enter-d3">
              <h2 className="text-sm font-semibold text-[--text] mb-1">AI model</h2>
              <p className="text-xs text-[--text-dim] mb-4">Optional — if you know which model created the content.</p>
              <input
                type="text"
                value={form.model_name}
                onChange={(e) => setText('model_name', e.target.value)}
                placeholder="e.g. Stable Diffusion, ElevenLabs, Midjourney…"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[--text] hover:bg-[#333336] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                'Submit for analysis'
              )}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
