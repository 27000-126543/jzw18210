import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, File, Download, Mail, Smartphone, MessageSquare, Lock, Clock, Archive, ShieldAlert, Users, UserCircle2 } from 'lucide-react'
import { useAuthStore, useNoticeStore } from '@/store'
import PriorityBadge from '@/components/PriorityBadge'
import { formatDate, formatFileSize, getInitials, getDepartmentName, isEmployeeInNoticeScope } from '@/data/mockData'
import type { Notice } from '@/types'

function getScopeLabel(notice: Notice): { text: string; IconComponent?: React.ElementType } {
  if (notice.scope === 'all') return { text: '全员', IconComponent: Users }
  if (notice.scope === 'department')
    return { text: notice.scopeDetail.map(getDepartmentName).join('、') }
  return { text: `${notice.scopeDetail.length}人`, IconComponent: UserCircle2 }
}

function AccessDeniedPage({
  icon: Icon,
  title,
  description,
  onBack,
}: {
  icon: React.ElementType
  title: string
  description?: string
  onBack: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-xl bg-white p-12 text-center shadow-card"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
          <Icon className="h-8 w-8 text-surface-400" />
        </div>
        <p className="mb-2 text-lg font-medium text-brand-500">{title}</p>
        {description && (
          <p className="mb-6 text-sm text-surface-400">{description}</p>
        )}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white transition-colors hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
      </motion.div>
    </div>
  )
}

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { getNoticeById, markAsRead, addComment } = useNoticeStore()

  const [commentText, setCommentText] = useState('')
  const hasMarkedRead = useRef(false)

  const noticeId = id
  const notice = noticeId ? getNoticeById(noticeId) : undefined

  const accessAllowed =
    notice !== undefined &&
    notice.status === 'published' &&
    (notice.expiresAt === null || new Date(notice.expiresAt) >= new Date()) &&
    currentUser !== null &&
    isEmployeeInNoticeScope(currentUser.id, notice.scope, notice.scopeDetail)

  useEffect(() => {
    if (!accessAllowed || !notice || !currentUser || hasMarkedRead.current) return
    hasMarkedRead.current = true
    markAsRead(notice.id, currentUser.id)
  }, [accessAllowed, notice, currentUser, markAsRead])

  if (notice === undefined) {
    return (
      <AccessDeniedPage
        icon={Lock}
        title="公告不存在"
        description="您访问的公告可能已被删除或不存在"
        onBack={() => navigate('/employee', { replace: true })}
      />
    )
  }

  if (notice.status !== 'published') {
    const statusText =
      notice.status === 'draft' ? '该公告还是草稿，暂未发布'
      : notice.status === 'scheduled' ? '该公告尚未到发布时间'
      : notice.status === 'archived' ? '该公告已归档'
      : '该公告尚未发布'
    return (
      <AccessDeniedPage
        icon={Clock}
        title="公告暂不可查看"
        description={statusText + '，请在发布后再查看'}
        onBack={() => navigate('/employee', { replace: true })}
      />
    )
  }

  if (notice.expiresAt !== null && new Date(notice.expiresAt) < new Date()) {
    return (
      <AccessDeniedPage
        icon={Archive}
        title="该公告已过有效期"
        description="公告已下线，您可在公告中心查看其他有效公告"
        onBack={() => navigate('/employee', { replace: true })}
      />
    )
  }

  if (
    currentUser === null ||
    !isEmployeeInNoticeScope(currentUser.id, notice.scope, notice.scopeDetail)
  ) {
    const scopeInfo = getScopeLabel(notice)
    return (
      <AccessDeniedPage
        icon={ShieldAlert}
        title="您不在该公告的接收范围内"
        description={`此公告仅限：${scopeInfo.text}`}
        onBack={() => navigate('/employee', { replace: true })}
      />
    )
  }

  const { text: scopeText, IconComponent: ScopeIcon } = getScopeLabel(notice)
  const isRead = notice.readBy.some((r) => r.userId === currentUser.id)

  const handleAddComment = () => {
    if (!commentText.trim() || !currentUser) return
    addComment(notice.id, {
      id: 'cmt-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    })
    setCommentText('')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <button
        onClick={() => navigate('/employee')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-surface-500 transition-colors hover:text-brand-500"
      >
        <ArrowLeft className="h-4 w-4" />
        返回公告中心
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex flex-col gap-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-white p-6 shadow-card"
          >
            <h1 className="mb-4 text-2xl font-bold text-brand-500">{notice.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500">
              <PriorityBadge priority={notice.priority} />
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs">
                {ScopeIcon && <ScopeIcon className="h-3 w-3" />}
                {scopeText}
              </span>
              <span>{formatDate(notice.publishedAt)}</span>
              <span>发布人：{notice.authorName}</span>
            </div>

            {notice.expiresAt && (
              <p className="mt-2 text-xs text-surface-400">
                有效期至 {formatDate(notice.expiresAt)}
              </p>
            )}

            {(notice.emailNotified || notice.smsNotified) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {notice.emailNotified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-500">
                    <Mail className="h-3 w-3" />
                    邮件已通知
                  </span>
                )}
                {notice.smsNotified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-0.5 text-xs text-mint-500">
                    <Smartphone className="h-3 w-3" />
                    短信已通知
                  </span>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-card"
          >
            <div
              className="notice-content"
              dangerouslySetInnerHTML={{ __html: notice.richContent }}
            />

            {notice.attachments.length > 0 && (
              <div className="mt-6 border-t border-surface-100 pt-4">
                <h3 className="mb-3 text-sm font-medium text-brand-500">附件</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {notice.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 rounded-lg border border-surface-100 bg-surface-50 p-3"
                    >
                      <File className="h-8 w-8 shrink-0 text-surface-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-500">
                          {att.name}
                        </p>
                        <p className="text-xs text-surface-400">
                          {formatFileSize(att.size)}
                        </p>
                      </div>
                      <a
                        href={att.data || att.url}
                        download={att.name}
                        className="shrink-0 rounded-lg bg-surface-100 p-2 transition-colors hover:bg-surface-200"
                      >
                        <Download className="h-3.5 w-3.5 text-surface-500" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl bg-white p-6 shadow-card"
          >
            {notice.commentEnabled ? (
              <>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-brand-500">
                  <MessageSquare className="h-4 w-4" />
                  评论
                  <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-400">
                    {notice.comments.length}
                  </span>
                </h3>

                <div className="mb-4 flex gap-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="发表评论..."
                    className="flex-1 resize-none rounded-lg border border-surface-200 p-3 text-sm placeholder:text-surface-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    rows={2}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="shrink-0 self-end rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
                  >
                    发表评论
                  </button>
                </div>

                {notice.comments.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {notice.comments.map((cmt, idx) => (
                      <motion.div
                        key={cmt.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.03 }}
                        className="flex gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-500">
                          {getInitials(cmt.userName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-500">
                              {cmt.userName}
                            </span>
                            <span className="text-xs text-surface-400">
                              {formatDate(cmt.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-surface-500">{cmt.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-surface-300">评论区已关闭</p>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
