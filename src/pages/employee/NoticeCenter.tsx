import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { useAuthStore, useNoticeStore } from '@/store'
import NoticeCard from '@/components/NoticeCard'

type TabKey = 'all' | 'unread' | 'read'

export default function NoticeCenter() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { getNoticesForEmployee, archiveExpired, publishScheduled } = useNoticeStore()

  const [activeTab, setActiveTab] = useState<TabKey>('all')

  useEffect(() => {
    archiveExpired()
    publishScheduled()
  }, [archiveExpired, publishScheduled])

  const notices = useMemo(() => {
    if (!currentUser) return []
    return getNoticesForEmployee(currentUser.id)
  }, [currentUser, getNoticesForEmployee])

  const unreadNotices = useMemo(
    () => notices.filter((n) => !n.readBy.some((r) => r.userId === currentUser?.id)),
    [notices, currentUser]
  )

  const readNotices = useMemo(
    () => notices.filter((n) => n.readBy.some((r) => r.userId === currentUser?.id)),
    [notices, currentUser]
  )

  const filteredNotices = useMemo(() => {
    if (activeTab === 'unread') return unreadNotices
    if (activeTab === 'read') return readNotices
    return notices
  }, [activeTab, notices, unreadNotices, readNotices])

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: notices.length },
    { key: 'unread', label: '未读', count: unreadNotices.length },
    { key: 'read', label: '已读', count: readNotices.length },
  ]

  const emptyMessages: Record<TabKey, string> = {
    all: '暂无公告',
    unread: '没有未读公告',
    read: '没有已读公告',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-500 text-white'
                : 'bg-white text-surface-500 hover:bg-surface-50'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-100 text-surface-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {filteredNotices.length > 0 ? (
          <motion.div
            key={activeTab}
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {filteredNotices.map((notice, index) => {
              const isRead = notice.readBy.some((r) => r.userId === currentUser?.id)
              return (
                <motion.div
                  key={notice.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: index * 0.06 }}
                >
                  <NoticeCard
                    notice={notice}
                    isRead={isRead}
                    variant="employee"
                    onClick={() => navigate(`/employee/notice/${notice.id}`)}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key={`empty-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-surface-400"
          >
            <Inbox className="mb-3 h-12 w-12" />
            <p className="text-sm">{emptyMessages[activeTab]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
