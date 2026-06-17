import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit, Bell, Clock, Calendar, Users, CheckCircle2, XCircle, RefreshCw, Mail, MessageSquare, Lock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useNoticeStore } from '@/store'
import { formatDate, getInitials, getTargetEmployees, getDepartmentName } from '@/data/mockData'
import PriorityBadge from '@/components/PriorityBadge'
import ReadProgress from '@/components/ReadProgress'
import type { Notice, NotificationRecord, NotificationChannel, NotificationStatus } from '@/types'

export default function TrackingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getNoticeById, sendReminder, toggleCommentEnabled, updateNotice } = useNoticeStore()
  const [activeTab, setActiveTab] = useState<'read' | 'unread' | 'reach'>('read')
  const [reachChannel, setReachChannel] = useState<NotificationChannel>('email')
  const [reminderToast, setReminderToast] = useState<{ show: boolean; count: number }>({ show: false, count: 0 })
  const [resendToast, setResendToast] = useState<{ show: boolean; count: number }>({ show: false, count: 0 })

  const noticeId = id
  const notice = getNoticeById(noticeId ?? '')

  const targetEmployees = useMemo(() => {
    if (!notice) return []
    return getTargetEmployees(notice.scope, notice.scopeDetail)
  }, [notice])

  const totalCount = targetEmployees.length
  const readCount = notice?.readBy.length ?? 0
  const unreadEmployees = useMemo(
    () => targetEmployees.filter((e) => !notice?.readBy.some((r) => r.userId === e.id)),
    [targetEmployees, notice]
  )
  const readEmployees = useMemo(
    () =>
      targetEmployees
        .filter((e) => notice?.readBy.some((r) => r.userId === e.id))
        .map((emp) => notice?.readBy.find((r) => r.userId === emp.id))
        .filter(Boolean) as NonNullable<Notice['readBy'][number]>[],
    [targetEmployees, notice]
  )
  const unreadCount = unreadEmployees.length

  const pieData = useMemo(() => {
    if (totalCount === 0) return []
    return [
      { name: '已读', value: readCount },
      { name: '未读', value: unreadCount },
    ]
  }, [readCount, unreadCount, totalCount])

  const readPercent = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0

  const notificationRecords = notice?.notificationRecords ?? []

  const emailRecords = useMemo(
    () => notificationRecords.filter((r) => r.channel === 'email'),
    [notificationRecords]
  )
  const smsRecords = useMemo(
    () => notificationRecords.filter((r) => r.channel === 'sms'),
    [notificationRecords]
  )

  const currentChannelRecords = reachChannel === 'email' ? emailRecords : smsRecords
  const currentChannelSuccess = currentChannelRecords.filter((r) => r.status === 'success').length
  const currentChannelFailed = currentChannelRecords.filter((r) => r.status === 'failed').length

  const hasFailedRecords = notificationRecords.some((r) => r.status === 'failed')
  const failedCount = notificationRecords.filter((r) => r.status === 'failed').length

  const handleSendReminder = (userIds: string[]) => {
    if (!noticeId) return
    sendReminder(noticeId, userIds)
    setReminderToast({ show: true, count: userIds.length })
    setTimeout(() => setReminderToast({ show: false, count: 0 }), 3000)
  }

  const handleReminderAll = () => {
    handleSendReminder(unreadEmployees.map((e) => e.id))
  }

  const handleResendAllFailed = () => {
    if (!noticeId || !notice) return
    const now = new Date().toISOString()
    const updatedRecords: NotificationRecord[] = notificationRecords.map((r) => {
      if (r.status === 'failed') {
        return { ...r, status: 'success' as NotificationStatus, sentAt: now, errorMessage: undefined }
      }
      return r
    })
    updateNotice(noticeId, { notificationRecords: updatedRecords })
    setResendToast({ show: true, count: failedCount })
    setTimeout(() => setResendToast({ show: false, count: 0 }), 3000)
  }

  const handleResendSingle = (recordId: string) => {
    if (!noticeId || !notice) return
    const now = new Date().toISOString()
    const updatedRecords: NotificationRecord[] = notificationRecords.map((r) => {
      if (r.id === recordId) {
        return { ...r, status: 'success' as NotificationStatus, sentAt: now, errorMessage: undefined }
      }
      return r
    })
    updateNotice(noticeId, { notificationRecords: updatedRecords })
  }

  if (!notice) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/admin', { replace: true })}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回公告管理
        </button>
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-16 text-center shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
            <Lock className="h-8 w-8 text-surface-400" />
          </div>
          <p className="mb-2 text-lg font-medium text-brand-500">公告不存在</p>
          <p className="mb-6 text-sm text-surface-400">您访问的公告可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/admin', { replace: true })}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回公告管理
          </button>
        </div>
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
    <div className="p-8 max-w-7xl mx-auto">
      <AnimatePresence>
        {reminderToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-50 rounded-lg bg-mint-400 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            催读提醒已成功发送给 {reminderToast.count} 人
          </motion.div>
        )}
        {resendToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 right-6 z-50 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            已重新发送 {resendToast.count} 条失败通知
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => navigate('/admin')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
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

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/admin/edit/${notice.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              编辑公告
            </button>
            <button
              onClick={handleReminderAll}
              className="inline-flex items-center gap-2 rounded-lg bg-coral-400 px-4 py-2 text-sm font-medium text-white hover:bg-coral-500 transition-colors"
            >
              <Bell className="h-4 w-4" />
              一键催读全部未读
            </button>
            {hasFailedRecords && (
              <button
                onClick={handleResendAllFailed}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                重新发送失败通知
              </button>
            )}
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
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
                <button
                  onClick={() => setActiveTab('read')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'read'
                      ? 'bg-white text-brand-500 shadow-sm'
                      : 'text-surface-500 hover:text-brand-500'
                  }`}
                >
                  已读人员 ({readCount})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-white text-brand-500 shadow-sm'
                      : 'text-surface-500 hover:text-brand-500'
                  }`}
                >
                  未读人员 ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('reach')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'reach'
                      ? 'bg-white text-brand-500 shadow-sm'
                      : 'text-surface-500 hover:text-brand-500'
                  }`}
                >
                  通知触达 ({notificationRecords.length})
                </button>
              </div>
              {activeTab === 'unread' && unreadCount > 0 && (
                <button
                  onClick={handleReminderAll}
                  className="animate-pulse rounded-lg bg-coral-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-500 transition-colors"
                >
                  一键催读全部未读
                </button>
              )}
            </div>

            {activeTab === 'read' && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {readEmployees.map((record) => (
                  <div
                    key={record.userId}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-500">
                      {getInitials(record.userName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-500">{record.userName}</p>
                      <p className="text-xs text-surface-400">{record.department}</p>
                    </div>
                    <span className="shrink-0 text-xs text-surface-400">
                      {formatDate(record.readAt)}
                    </span>
                  </div>
                ))}
                {readCount === 0 && (
                  <p className="py-6 text-center text-sm text-surface-400">暂无已读人员</p>
                )}
              </div>
            )}

            {activeTab === 'unread' && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {unreadEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-surface-500">
                      {getInitials(emp.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-500">{emp.name}</p>
                      <p className="text-xs text-surface-400">
                        {getDepartmentName(emp.department)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSendReminder([emp.id])}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium text-coral-400 hover:bg-coral-50 transition-colors"
                    >
                      催读
                    </button>
                  </div>
                ))}
                {unreadCount === 0 && (
                  <p className="py-6 text-center text-sm text-mint-400">全部已读！</p>
                )}
              </div>
            )}

            {activeTab === 'reach' && (
              <div className="space-y-4">
                <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
                  <button
                    onClick={() => setReachChannel('email')}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                      reachChannel === 'email'
                        ? 'bg-white text-brand-500 shadow-sm'
                        : 'text-surface-500 hover:text-brand-500'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    邮件
                  </button>
                  <button
                    onClick={() => setReachChannel('sms')}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                      reachChannel === 'sms'
                        ? 'bg-white text-brand-500 shadow-sm'
                        : 'text-surface-500 hover:text-brand-500'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    短信
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-mint-400/10 p-3 border border-mint-400/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-mint-400" />
                      <span className="text-2xl font-bold text-mint-400">{currentChannelSuccess}</span>
                    </div>
                    <p className="mt-1 text-xs text-mint-400/80">成功送达</p>
                  </div>
                  <div className="rounded-lg bg-coral-400/10 p-3 border border-coral-400/20">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-coral-400" />
                      <span className="text-2xl font-bold text-coral-400">{currentChannelFailed}</span>
                    </div>
                    <p className="mt-1 text-xs text-coral-400/80">发送失败</p>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {currentChannelRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        record.status === 'failed' ? 'bg-coral-400/5' : 'hover:bg-surface-50'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          record.status === 'success'
                            ? 'bg-brand-100 text-brand-500'
                            : 'bg-coral-100 text-coral-500'
                        }`}
                      >
                        {getInitials(record.userName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-brand-500">{record.userName}</p>
                        <p className="text-xs text-surface-400">{record.department}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {record.status === 'success' ? (
                          <div className="flex items-center gap-1 text-xs text-mint-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>已送达</span>
                            <span className="text-surface-400">·</span>
                            <span className="text-surface-400">{formatDate(record.sentAt)}</span>
                          </div>
                        ) : (
                          <>
                            <div
                              className="flex items-center gap-1 text-xs text-coral-400"
                              title={record.errorMessage}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>发送失败</span>
                            </div>
                            {record.errorMessage && (
                              <p className="text-[10px] text-coral-400/70 text-right max-w-[160px] truncate">
                                {record.errorMessage}
                              </p>
                            )}
                            <button
                              onClick={() => handleResendSingle(record.id)}
                              className="rounded border border-coral-400 px-2 py-0.5 text-[10px] font-medium text-coral-400 hover:bg-coral-50 transition-colors"
                            >
                              重新发送
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {currentChannelRecords.length === 0 && (
                    <p className="py-6 text-center text-sm text-surface-400">
                      暂无{reachChannel === 'email' ? '邮件' : '短信'}通知记录
                    </p>
                  )}
                </div>
              </div>
            )}
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
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50 transition-colors"
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
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50 transition-colors"
              >
                开启评论
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
