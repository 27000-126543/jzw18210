import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, FileQuestion, ChevronDown, ChevronUp, Calendar, Eye } from 'lucide-react'
import { useNoticeStore } from '@/store'
import { formatDate } from '@/data/mockData'
import PriorityBadge from '@/components/PriorityBadge'
import type { Notice } from '@/types'

export default function ArchivePage() {
  const { notices } = useNoticeStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const archivedNotices = notices.filter((n) => n.status === 'archived')

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-card">
      <div className="mb-6 flex items-center gap-3">
        <Archive className="h-5 w-5 text-brand-500" />
        <h1 className="text-lg font-bold text-brand-500">存档公告</h1>
      </div>

      {archivedNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="mb-3 h-12 w-12 text-surface-300" />
          <p className="text-sm text-surface-400">暂无存档公告</p>
        </div>
      ) : (
        <div className="relative ml-4">
          <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-surface-200" />

          <div className="space-y-4">
            {archivedNotices.map((notice) => (
              <div key={notice.id} className="relative pl-8">
                <div className="absolute left-0 top-4 h-3 w-3 -translate-x-[5.5px] rounded-full bg-surface-300" />

                <motion.div
                  layout
                  className="cursor-pointer rounded-lg border border-surface-100 p-4 transition-colors hover:border-surface-200 hover:bg-surface-50"
                  onClick={() => toggleExpand(notice.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-surface-500">
                          {notice.title}
                        </h3>
                        <PriorityBadge priority={notice.priority} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notice.publishedAt)}
                        </span>
                        {notice.expiresAt && (
                          <span>到期：{formatDate(notice.expiresAt)}</span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {notice.readBy.length}人已读
                        </span>
                      </div>
                    </div>
                    {expandedId === notice.id ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-surface-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-surface-400" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedId === notice.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="notice-content mt-3 border-t border-surface-100 pt-3 text-sm leading-relaxed text-surface-500"
                          dangerouslySetInnerHTML={{ __html: notice.richContent }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
