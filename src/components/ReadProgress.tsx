export default function ReadProgress({ readCount, totalCount }: { readCount: number; totalCount: number }) {
  const ratio = totalCount > 0 ? readCount / totalCount : 0
  const percent = Math.round(ratio * 100)
  const barColor = ratio >= 0.8 ? 'bg-mint-400' : ratio >= 0.5 ? 'bg-amber-400' : 'bg-coral-400'

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-200">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="whitespace-nowrap text-xs text-surface-500">
        已读 {readCount}/{totalCount} ({percent}%)
      </span>
    </div>
  )
}
