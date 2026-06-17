import { motion } from 'framer-motion'
import type { Notice } from '@/types'
import { departments, formatDate, getDepartmentName } from '@/data/mockData'
import PriorityBadge from '@/components/PriorityBadge'
import ReadProgress from '@/components/ReadProgress'

const stripColors: Record<string, string> = {
  normal: 'bg-surface-300',
  important: 'bg-amber-400',
  urgent: 'bg-coral-400',
}

function getScopeLabel(scope: Notice['scope'], scopeDetail: string[]): string {
  if (scope === 'all') return '全员'
  if (scope === 'department') return scopeDetail.map(getDepartmentName).join('、')
  return `${scopeDetail.length}人`
}

function getTotalTargetReaders(scope: Notice['scope'], scopeDetail: string[]): number {
  if (scope === 'all') return 10
  if (scope === 'department') {
    return scopeDetail.reduce((sum, deptId) => {
      const dept = departments.find(d => d.id === deptId)
      return sum + (dept ? dept.memberIds.length : 0)
    }, 0)
  }
  return scopeDetail.length
}

export default function NoticeCard({
  notice,
  isRead,
  onClick,
  variant = 'employee',
}: {
  notice: Notice
  isRead: boolean
  onClick: () => void
  variant?: 'admin' | 'employee'
}) {
  const totalReaders = getTotalTargetReaders(notice.scope, notice.scopeDetail)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="group relative flex cursor-pointer overflow-hidden rounded-xl bg-white shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className={`w-[3px] shrink-0 ${stripColors[notice.priority]}`} />

      <div className="flex flex-1 gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-coral-400" />
            )}
            <span className="truncate font-medium text-brand-500">
              {notice.title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-500">
            <PriorityBadge priority={notice.priority} />
            <span className="rounded-full bg-surface-100 px-2 py-0.5">
              {getScopeLabel(notice.scope, notice.scopeDetail)}
            </span>
            <span>{formatDate(notice.publishedAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {variant === 'admin' ? (
            <ReadProgress readCount={notice.readBy.length} totalCount={totalReaders} />
          ) : (
            !isRead && (
              <span className="rounded-full bg-coral-50 px-2 py-0.5 text-xs font-medium text-coral-400">
                未读
              </span>
            )
          )}
        </div>
      </div>
    </motion.div>
  )
}
