import { Circle, AlertCircle, AlertTriangle } from 'lucide-react'
import type { Priority } from '@/types'

const config: Record<Priority, { label: string; icon: typeof Circle; className: string }> = {
  normal: { label: '普通', icon: Circle, className: 'bg-surface-100 text-surface-400' },
  important: { label: '重要', icon: AlertCircle, className: 'bg-amber-50 text-amber-500' },
  urgent: { label: '紧急', icon: AlertTriangle, className: 'bg-coral-50 text-coral-400' },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, icon: Icon, className } = config[priority]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
