import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Bell, Clock, Calendar, Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useNoticeStore } from '@/store'
import { employees, departments, formatDate, getDepartmentName } from '@/data/mockData'
import PriorityBadge from '@/components/PriorityBadge'
import ReadProgress from '@/components/ReadProgress'
import type { Employee } from '@/types'

export default function TrackingDetail() {
  const { noticeId } = useParams<{ noticeId: string }>()
  const navigate = useNavigate()
  const { getNoticeById, sendReminder, toggleCommentEnabled } = useNoticeStore()
  const [activeTab, setActiveTab] = useState<'read' | 'unread'>('read')
  const [reminderSent, setReminderSent] = useState(false)

  const notice = getNoticeById(noticeId ?? '')

  const targetEmployees = useMemo(() => {
    if (!notice) return []
    if (notice.scope === 'all') {
      return employees.filter((e) => e.role !== 'admin')
    }
    if (notice.scope === 'department') {
      return employees.filter(
        (e) => notice.scopeDetail.includes(e.department) && e.role !== 'admin'
      )
    }
    if (notice.scope === 'person') {
      return employees.filter((e) => notice.scopeDetail.includes(e.id))
    }
    return []
  }, [notice])

  const readRecordMap = useMemo(() => {
    if (!notice) return new Map<string, string>()
    const map = new Map<string, string>()
    notice.readBy.forEach((r) => map.set(r.userId, r.readAt))
    return map
  }, [notice])

  const readEmployees = useMemo(
    () => targetEmployees.filter((e) => readRecordMap.has(e.id)),
    [targetEmployees, readRecordMap]
  )

  const unreadEmployees = useMemo(
    () => targetEmployees.filter((e) => !readRecordMap.has(e.id)),
    [targetEmployees, readRecordMap]
  )

  const readCount = readEmployees.length
  const totalCount = targetEmployees.length
  const unreadCount = unreadEmployees.length

  const pieData = useMemo(() => {
    if (totalCount === 0) return []
    return [
      { name: '已读', value: readCount },
      { name: '未读', value: unreadCount },
    ]
  }, [readCount, unreadCount, totalCount])

  const readPercent = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0

  const handleSendReminder = (userIds: string[]) => {
    if (!noticeId) return
    sendReminder(noticeId, userIds)
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 3000)
  }

  const handleReminderAll = () => {
    handleSendReminder(unreadEmployees.map((e) => e.id))
  }

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="mb-4 text-lg text-surface-500">公告不存在</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
      </div>
    )
  }

  const scopeLabel =
    notice.scope === 'all'
      ? '全员'
      : notice.scope === 'department'
        ? notice.scopeDetail.map(getDepartmentName).join('、')
        : notice.scopeDetail.length + '人'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {reminderSent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 right-6 z-50 rounded-lg bg-mint-400 px-5 py-3 text-sm font-medium text-white shadow-lg"
        >
          催读提醒已发送
        </motion.div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-brand-500">{notice.title}</h1>
              <PriorityBadge priority={notice.priority} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {scopeLabel}
              </span>
              {notice.publishedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  发布于 {formatDate(notice.publishedAt)}
                </span>
              )}
              <span>作者：{notice.authorName}</span>
            </div>
            {notice.expiresAt && (
              <p className="text-sm text-surface-400">
                到期时间：{formatDate(notice.expiresAt)}
              </p>
            )}
            {notice.status === 'scheduled' && notice.scheduledAt && (
              <p className="inline-flex items-center gap-1 text-sm text-amber-500">
                <Clock className="h-4 w-4" />
                定时发布：{formatDate(notice.scheduledAt)}
              </p>
            )}
          </div>
        </div>

        <ReadProgress readCount={readCount} totalCount={totalCount} />

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigate(`/admin/edit/${notice.id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Edit className="h-4 w-4" />
            编辑公告
          </button>
          <button
            onClick={handleReminderAll}
            className="inline-flex items-center gap-2 rounded-lg bg-coral-400 px-4 py-2 text-sm font-medium text-white hover:bg-coral-500"
          >
            <Bell className="h-4 w-4" />
            催读提醒
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-base font-semibold text-brand-500">阅读分布</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#2DD4A0" />
                  <Cell fill="#FF6B4A" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-500">{readPercent}%</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-mint-400" />
              已读 ({readCount})
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-coral-400" />
              未读 ({unreadCount})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
              <button
                onClick={() => setActiveTab('read')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'read'
                    ? 'bg-white text-brand-500 shadow-sm'
                    : 'text-surface-500 hover:text-brand-500'
                }`}
              >
                已读人员 ({readCount})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-white text-brand-500 shadow-sm'
                    : 'text-surface-500 hover:text-brand-500'
                }`}
              >
                未读人员 ({unreadCount})
              </button>
            </div>
            {activeTab === 'unread' && unreadCount > 0 && (
              <button
                onClick={handleReminderAll}
                className="animate-pulse-glow rounded-lg bg-coral-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-500"
              >
                一键催读全部未读
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {activeTab === 'read' &&
              readEmployees.map((emp) => {
                const readAt = readRecordMap.get(emp.id) ?? ''
                return (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-500">
                      {emp.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-500">{emp.name}</p>
                      <p className="text-xs text-surface-400">
                        {getDepartmentName(emp.department)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-surface-400">
                      {formatDate(readAt)}
                    </span>
                  </div>
                )
              })}
            {activeTab === 'unread' &&
              unreadEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-surface-500">
                    {emp.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-500">{emp.name}</p>
                    <p className="text-xs text-surface-400">
                      {getDepartmentName(emp.department)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendReminder([emp.id])}
                    className="shrink-0 rounded px-2 py-1 text-xs font-medium text-coral-400 hover:bg-coral-50"
                  >
                    催读
                  </button>
                </div>
              ))}
            {activeTab === 'read' && readCount === 0 && (
              <p className="py-6 text-center text-sm text-surface-400">暂无已读人员</p>
            )}
            {activeTab === 'unread' && unreadCount === 0 && (
              <p className="py-6 text-center text-sm text-mint-400">全部已读！</p>
            )}
          </div>
        </div>
      </div>

      {notice.commentEnabled && (
        <div className="rounded-xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-500">
              评论 ({notice.comments.length})
            </h2>
            <button
              onClick={() => toggleCommentEnabled(notice.id)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50"
            >
              关闭评论
            </button>
          </div>
          <div className="space-y-3">
            {notice.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-surface-50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-brand-500">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-surface-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-surface-600">{comment.content}</p>
              </div>
            ))}
            {notice.comments.length === 0 && (
              <p className="py-4 text-center text-sm text-surface-400">暂无评论</p>
            )}
          </div>
        </div>
      )}

      {!notice.commentEnabled && (
        <div className="rounded-xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-400">评论已关闭</h2>
            <button
              onClick={() => toggleCommentEnabled(notice.id)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50"
            >
              开启评论
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
