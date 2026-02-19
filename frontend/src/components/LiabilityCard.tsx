interface PartyScore {
  percentage: number
  raw_score: number
  factors: Record<string, number>
}

interface LiabilityScores {
  user: PartyScore
  platform: PartyScore
  architect: PartyScore
}

interface LiabilityCardProps {
  scores: LiabilityScores
}

const PARTY_CONFIG = [
  { key: 'user' as const, label: 'User', color: '#ef4444', bg: 'bg-red-500' },
  { key: 'platform' as const, label: 'Platform', color: '#3b82f6', bg: 'bg-blue-500' },
  { key: 'architect' as const, label: 'Architect', color: '#8b5cf6', bg: 'bg-purple-500' },
]

function formatFactorName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function LiabilityCard({ scores }: LiabilityCardProps) {
  const total =
    scores.user.percentage + scores.platform.percentage + scores.architect.percentage

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Liability Distribution</h3>

      {/* Stacked bar */}
      <div className="flex rounded-lg overflow-hidden h-10 mb-4 w-full">
        {PARTY_CONFIG.map(({ key, label, bg }) => {
          const pct = total > 0 ? (scores[key].percentage / total) * 100 : 33.33
          return (
            <div
              key={key}
              className={`${bg} flex items-center justify-center transition-all`}
              style={{ width: `${pct}%`, minWidth: pct > 5 ? undefined : '0' }}
              title={`${label}: ${scores[key].percentage.toFixed(1)}%`}
            >
              {pct > 8 && (
                <span className="text-white text-xs font-bold px-1 truncate">
                  {scores[key].percentage.toFixed(0)}%
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
              {label}: <span className="text-white font-medium">{scores[key].percentage.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>

      {/* Per-party factor breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PARTY_CONFIG.map(({ key, label, color }) => {
          const party = scores[key]
          return (
            <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold mb-3" style={{ color }}>
                {label}
              </h4>
              <div className="space-y-1">
                {Object.entries(party.factors).map(([factor, value]) => (
                  <div key={factor} className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate mr-2">{formatFactorName(factor)}</span>
                    <span className="text-gray-200 font-medium whitespace-nowrap">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-xs">
                <span className="text-gray-400">Raw Score</span>
                <span className="text-gray-200 font-medium">{party.raw_score.toFixed(2)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
