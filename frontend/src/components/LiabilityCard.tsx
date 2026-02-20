/* eslint-disable @typescript-eslint/no-explicit-any */

interface LiabilityCardProps {
  scores: any
}

const PARTY_CONFIG = [
  { key: 'user', label: 'User', color: '#ef4444', bg: 'bg-red-500' },
  { key: 'platform', label: 'Platform', color: '#3b82f6', bg: 'bg-blue-500' },
  { key: 'architect', label: 'Architect', color: '#8b5cf6', bg: 'bg-purple-500' },
]

function formatFactorName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getPercentage(party: any): number {
  if (!party) return 0
  return party.percentage ?? 0
}

function getRawScore(party: any): number {
  if (!party) return 0
  return party.raw_score ?? 0
}

function getFactorDisplay(value: any): string {
  if (typeof value === 'number') return value.toFixed(2)
  if (typeof value === 'object' && value !== null) {
    const pts = value.points ?? value.score ?? 0
    const max = value.max ?? 1
    return `${pts.toFixed(2)} / ${max.toFixed(2)}`
  }
  return String(value)
}

function getFactorEntries(factors: any): [string, any][] {
  if (!factors || typeof factors !== 'object') return []
  return Object.entries(factors)
}

export default function LiabilityCard({ scores }: LiabilityCardProps) {
  if (!scores) return null

  const total = PARTY_CONFIG.reduce((sum, { key }) => sum + getPercentage(scores[key]), 0)

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Liability Distribution</h3>

      {/* Stacked bar */}
      <div className="flex rounded-lg overflow-hidden h-10 mb-4 w-full">
        {PARTY_CONFIG.map(({ key, label, bg }) => {
          const pct = total > 0 ? (getPercentage(scores[key]) / total) * 100 : 33.33
          return (
            <div
              key={key}
              className={`${bg} flex items-center justify-center transition-all`}
              style={{ width: `${pct}%`, minWidth: pct > 5 ? undefined : '0' }}
              title={`${label}: ${getPercentage(scores[key]).toFixed(1)}%`}
            >
              {pct > 8 && (
                <span className="text-white text-xs font-bold px-1 truncate">
                  {getPercentage(scores[key]).toFixed(0)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {PARTY_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-300 text-sm">
              {label}: <span className="text-white font-medium">{getPercentage(scores[key]).toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>

      {/* Per-party factor breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PARTY_CONFIG.map(({ key, label, color }) => {
          const party = scores[key]
          if (!party) return null
          const factors = getFactorEntries(party.factors)
          return (
            <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold mb-3" style={{ color }}>
                {label}
              </h4>
              <div className="space-y-1">
                {factors.map(([factor, value]) => (
                  <div key={factor} className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate mr-2">{formatFactorName(factor)}</span>
                    <span className="text-gray-200 font-medium whitespace-nowrap">
                      {getFactorDisplay(value)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-xs">
                <span className="text-gray-400">Raw Score</span>
                <span className="text-gray-200 font-medium">{getRawScore(party).toFixed(2)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      {scores.explanation && (
        <p className="mt-4 text-gray-400 text-sm leading-relaxed">{scores.explanation}</p>
      )}
    </div>
  )
}