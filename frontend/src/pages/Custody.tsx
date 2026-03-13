import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */

const VALID_ROLES = [
    'Investigating Officer',
    'Forensic Analyst',
    'Station House Officer',
    'Public Prosecutor',
    'Court Registrar',
    'Defense Counsel',
]

const ROLE_ICONS: Record<string, string> = {
    'Investigating Officer': '🔍',
    'Forensic Analyst': '🔬',
    'Station House Officer': '🏛️',
    'Public Prosecutor': '⚖️',
    'Court Registrar': '📋',
    'Defense Counsel': '🛡️',
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    registered: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    transfer: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
}

function TimelineEvent({ event, isLast }: { event: any; isLast: boolean }) {
    const actionStyle = ACTION_COLORS[event.action] || ACTION_COLORS.transfer

    return (
        <div className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[--text] border-2 border-white shadow-sm shrink-0 mt-1.5" />
                {!isLast && <div className="w-px flex-1 bg-[--border-light] min-h-[40px]" />}
            </div>

            {/* Event content */}
            <div className="pb-8 flex-1">
                <div className="bg-[--bg-secondary] rounded-2xl p-5 border border-[--border-light]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{ROLE_ICONS[event.custodian_role] || '👤'}</span>
                            <div>
                                <p className="text-sm font-semibold text-[--text]">{event.custodian_name}</p>
                                <p className="text-[10px] text-[--text-dim]">{event.custodian_role}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${actionStyle.bg} ${actionStyle.text}`}>
                            {event.action}
                        </span>
                    </div>

                    {event.custodian_badge && (
                        <p className="text-xs text-[--text-dim] mb-2">
                            Badge: <span className="font-mono">{event.custodian_badge}</span>
                        </p>
                    )}

                    {event.notes && (
                        <p className="text-xs text-[--text-secondary] mb-3">{event.notes}</p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[--text-dim]">
                        <span>{event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}</span>
                        <span className="font-mono truncate max-w-[180px]" title={event.signature}>
                            Sig: {event.signature?.slice(0, 14)}…
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Custody() {
    const { id } = useParams<{ id: string }>()
    const [chain, setChain] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Transfer form
    const [showForm, setShowForm] = useState(false)
    const [formName, setFormName] = useState('')
    const [formRole, setFormRole] = useState(VALID_ROLES[0])
    const [formBadge, setFormBadge] = useState('')
    const [formNotes, setFormNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    function fetchChain() {
        if (!id) return
        setLoading(true)
        axios
            .get(`/api/custody/${id}`)
            .then((res) => setChain(res.data.chain || []))
            .catch(() => setError('Failed to load custody chain.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchChain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    async function handleTransfer(e: React.FormEvent) {
        e.preventDefault()
        if (!formName.trim() || !id) return
        setSubmitting(true)
        try {
            const form = new FormData()
            form.append('custodian_name', formName)
            form.append('custodian_role', formRole)
            form.append('custodian_badge', formBadge)
            form.append('notes', formNotes)
            await axios.post(`/api/custody/${id}/transfer`, form)
            setFormName('')
            setFormBadge('')
            setFormNotes('')
            setShowForm(false)
            fetchChain()
        } catch {
            setError('Failed to log transfer.')
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass = 'w-full bg-white border border-[--border-light] text-[--text] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--text]/10 focus:border-[--border] transition-all placeholder:text-[--text-dim]'

    return (
        <div className="max-w-2xl mx-auto py-16 animate-enter">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-semibold text-[--text] tracking-tight">Chain of Custody</h1>
                <Link
                    to={`/results/${id}`}
                    className="text-xs text-[--link] hover:text-[--link-hover] font-medium transition-colors"
                >
                    ← Back to results
                </Link>
            </div>
            <p className="text-xs text-[--text-dim] font-mono mb-10">{id}</p>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex items-center gap-3 text-[--text-dim] text-sm">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading…
                    </div>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="flex gap-4 mb-10 animate-enter animate-enter-d1">
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 flex-1 text-center">
                            <div className="text-2xl font-semibold text-[--text]">{chain.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Total Custodians</div>
                        </div>
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 flex-1 text-center">
                            <div className="text-2xl font-semibold text-emerald-700">✓</div>
                            <div className="text-xs text-[--text-dim] mt-1">No Gaps</div>
                        </div>
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 flex-1 text-center">
                            <div className="text-2xl font-semibold text-[--text]">{chain.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Signatures</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-8 animate-enter animate-enter-d2">
                        <h2 className="text-sm font-semibold text-[--text] mb-6">Custody Timeline</h2>
                        {chain.map((event: any, i: number) => (
                            <TimelineEvent key={i} event={event} isLast={i === chain.length - 1} />
                        ))}
                    </div>

                    {/* Transfer button */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-3.5 bg-[--text] hover:bg-[#333336] text-white text-sm font-medium rounded-full transition-colors animate-enter animate-enter-d3"
                        >
                            Log custody transfer
                        </button>
                    ) : (
                        <form onSubmit={handleTransfer} className="space-y-4 animate-enter">
                            <h3 className="text-sm font-semibold text-[--text]">New Custody Transfer</h3>

                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Custodian name"
                                className={inputClass}
                                required
                            />

                            <select
                                value={formRole}
                                onChange={(e) => setFormRole(e.target.value)}
                                className={inputClass}
                            >
                                {VALID_ROLES.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={formBadge}
                                onChange={(e) => setFormBadge(e.target.value)}
                                placeholder="Badge number (optional)"
                                className={inputClass}
                            />

                            <textarea
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder="Transfer notes (optional)"
                                className={`${inputClass} min-h-[80px] resize-none`}
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !formName.trim()}
                                    className="flex-1 py-3 bg-[--text] hover:bg-[#333336] disabled:opacity-40 text-white text-sm font-medium rounded-full transition-colors"
                                >
                                    {submitting ? 'Submitting…' : 'Submit Transfer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-[--border] text-[--text] text-sm font-medium rounded-full transition-colors hover:bg-[--bg-secondary]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    )
}
