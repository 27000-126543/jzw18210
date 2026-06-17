import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, File, Download, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { useAuthStore, useNoticeStore } from '@/store'
import PriorityBadge from '@/components/PriorityBadge'
import { formatDate, getDepartmentName, formatFileSize, getInitials } from '@/data/mockData'

const scopeLabels: Record<string, string> = {
  all: '全员',
  department: '部门',
  person: '个人',
}

export default function NoticeDetail() {
  const { noticeId } = useParams<{ noticeId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { getNoticeById, markAsRead, addComment } = useNoticeStore()

  const [commentText, setCommentText] = useState('')
  const hasMarkedRead = useRef(false)

  const notice = noticeId ? getNoticeById(noticeId) : undefined

  useEffect(() => {
    if (!notice || !currentUser || hasMarkedRead.current) return
    const alreadyRead = notice.readBy.some((r) => r.userId === currentUser.id)
    if (alreadyRead) return

    hasMarkedRead.current = true
    const timer = setTimeout(() => {
      markAsRead(notice.id, currentUser.id)
    }, 1500)

    return () => clearTimeout(timer)
  }, [notice, currentUser, markAsRead])

  if (!notice) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="mb-4 text-lg text-surface-400">公告不存在</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white transition-colors hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
      </div>
    )
  }

  const isRead = notice.readBy.some((r) => r.userId === currentUser?.id)

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
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-surface-500 transition-colors hover:text-brand-500"
      >
        <ArrowLeft className="h-4 w-4" />
        返回公告中心
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h1 className="mb-4 text-2xl font-bold text-brand-500">{notice.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500">
            <PriorityBadge priority={notice.priority} />
            <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs">
              {scopeLabels[notice.scope]}
              {notice.scope === 'department' &&
                `：${notice.scopeDetail.map(getDepartmentName).join('、')}`}
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
            <div className="mt-3 flex items-center gap-3">
              {notice.emailNotified && (
                <span className="inline-flex items-center gap-1 text-xs text-surface-400">
                  <Mail className="h-3.5 w-3.5" />
                  邮件通知
                </span>
              )}
              {notice.smsNotified && (
                <span className="inline-flex items-center gap-1 text-xs text-surface-400">
                  <Smartphone className="h-3.5 w-3.5" />
                  短信通知
                </span>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
          <div
            className="notice-content"
            dangerouslySetInnerHTML={{ __html: notice.richContent }}
          />

          {notice.attachments.length > 0 && (
            <div className="mt-6 border-t border-surface-100 pt-4">
              <h3 className="mb-3 text-sm font-medium text-brand-500">附件</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    <button className="shrink-0 rounded-lg bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-200">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
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
                  {notice.comments.map((cmt) => (
                    <div key={cmt.id} className="flex gap-3">
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
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-surface-300">评论区已关闭</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
