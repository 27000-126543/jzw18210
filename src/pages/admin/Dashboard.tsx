import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Send, Clock, Search, Plus } from 'lucide-react'
import { useNoticeStore } from '@/store'
import type { NoticeStatus, Priority } from '@/types'
import NoticeCard from '@/components/NoticeCard'

const statusOptions: { value: NoticeStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'scheduled', label: '定时' },
  { value: 'archived', label: '已存档' },
]

const priorityOptions: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '普通' },
  { value: 'important', label: '重要' },
  { value: 'urgent', label: '紧急' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { notices, archiveExpired, publishScheduled } = useNoticeStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<NoticeStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  useEffect(() => {
    archiveExpired()
    publishScheduled()
  }, [archiveExpired, publishScheduled])

  const totalCount = notices.length
  const publishedCount = notices.filter((n) => n.status === 'published').length
  const scheduledCount = notices.filter((n) => n.status === 'scheduled').length

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (search && !n.title.includes(search)) return false
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
      return true
    })
  }, [notices, search, statusFilter, priorityFilter])

  const statCards = [
    { label: '总公告数', value: totalCount, icon: Bell, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: '已发布', value: publishedCount, icon: Send, color: 'text-mint-400', bg: 'bg-mint-50' },
    { label: '待发布', value: scheduledCount, icon: Clock, color: 'text-coral-400', bg: 'bg-coral-50' },
  ]

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-card"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-surface-400">{card.label}</p>
              <p className="text-2xl font-bold text-brand-500">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="搜索公告标题..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as NoticeStatus | 'all')}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-coral-400"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-coral-400"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              isRead={false}
              variant="admin"
              onClick={() => navigate(`/admin/tracking/${notice.id}`)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400">
            <Bell className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">暂无匹配的公告</p>
            <p className="mt-1 text-sm">请尝试调整筛选条件</p>
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/admin/create')}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-coral-400 text-white shadow-lg transition-shadow hover:shadow-xl"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
