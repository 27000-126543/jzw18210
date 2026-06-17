import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Upload, Trash2, X, CheckCircle, XCircle } from 'lucide-react'
import { useNoticeStore } from '@/store'
import { employees, departments, getDepartmentName, fileToBase64, formatFileSize } from '@/data/mockData'
import type { Priority, NoticeScope, Attachment } from '@/types'

const priorityConfig: { value: Priority; label: string; activeClass: string }[] = [
  { value: 'normal', label: '普通', activeClass: 'bg-surface-100 text-surface-500 border-surface-300' },
  { value: 'important', label: '重要', activeClass: 'bg-amber-50 text-amber-600 border-amber-400' },
  { value: 'urgent', label: '紧急', activeClass: 'bg-coral-50 text-coral-400 border-coral-400' },
]

const scopeOptions: { value: NoticeScope; label: string }[] = [
  { value: 'all', label: '全员' },
  { value: 'department', label: '指定部门' },
  { value: 'person', label: '指定人员' },
]

export default function EditNotice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getNoticeById, updateNotice } = useNoticeStore()
  const notice = id ? getNoticeById(id) : undefined
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [richContent, setRichContent] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [scope, setScope] = useState<NoticeScope>('all')
  const [scopeDetail, setScopeDetail] = useState<string[]>([])
  const [useScheduled, setUseScheduled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [commentEnabled, setCommentEnabled] = useState(true)
  const [sendEmail, setSendEmail] = useState(false)
  const [sendSms, setSendSms] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifySummary, setNotifySummary] = useState({ emailSuccess: 0, emailFail: 0, smsSuccess: 0, smsFail: 0 })

  useEffect(() => {
    if (notice) {
      setTitle(notice.title)
      setRichContent(notice.richContent)
      setPriority(notice.priority)
      setScope(notice.scope)
      setScopeDetail(notice.scopeDetail)
      setUseScheduled(!!notice.scheduledAt)
      setScheduledAt(notice.scheduledAt ?? '')
      setExpiresAt(notice.expiresAt ?? '')
      setCommentEnabled(notice.commentEnabled)
      setSendEmail(notice.emailNotified)
      setSendSms(notice.smsNotified)
      setAttachments(notice.attachments.map((a) => ({ ...a })))
    }
  }, [notice])

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-surface-400">
        <p className="text-2xl font-bold">404</p>
        <p className="mt-2">未找到该公告</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 rounded-lg bg-brand-500 px-5 py-2 text-sm text-white transition-colors hover:bg-brand-600"
        >
          返回管理页
        </button>
      </div>
    )
  }

  const isScheduledInvalid = useScheduled && (!scheduledAt || new Date(scheduledAt) <= new Date())
  const publishButtonDisabled = isScheduledInvalid

  const toggleDepartment = (deptId: string) => {
    setScopeDetail((prev) =>
      prev.includes(deptId) ? prev.filter((d) => d !== deptId) : [...prev, deptId]
    )
  }

  const toggleEmployee = (empId: string) => {
    setScopeDetail((prev) =>
      prev.includes(empId) ? prev.filter((e) => e !== empId) : [...prev, empId]
    )
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newAttachments: Attachment[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const base64 = await fileToBase64(file)
      newAttachments.push({
        id: 'att-' + Date.now() + '-' + i,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '#',
        data: base64,
      })
    }
    setAttachments((prev) => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId))
  }

  const handleSave = async (isDraft: boolean) => {
    if (useScheduled && !isDraft) {
      if (!scheduledAt) {
        alert('请选择定时发布时间')
        return
      }
      if (new Date(scheduledAt) <= new Date()) {
        alert('定时发布时间必须晚于当前时间')
        return
      }
    }

    const finalStatus = isDraft ? 'draft' as const : useScheduled ? 'scheduled' as const : 'published' as const
    const now = new Date().toISOString()

    const updates = {
      title,
      richContent,
      attachments,
      priority,
      scope,
      scopeDetail: scope === 'all' ? [] : scopeDetail,
      commentEnabled,
      publishedAt: isDraft ? null : useScheduled ? notice.publishedAt : (notice.publishedAt ?? now),
      scheduledAt: useScheduled ? scheduledAt : null,
      expiresAt: expiresAt || null,
      status: finalStatus,
      emailNotified: priority === 'urgent' ? sendEmail : false,
      smsNotified: priority === 'urgent' ? sendSms : false,
    }

    const finalSendEmail = priority === 'urgent' ? sendEmail : false
    const finalSendSms = priority === 'urgent' ? sendSms : false
    updateNotice(id!, updates, finalSendEmail, finalSendSms)

    const wasAlreadyPublished = notice.status === 'published'
    const becomingPublished = finalStatus === 'published' && notice.status !== 'published'
    const shouldShowSummary = (wasAlreadyPublished || becomingPublished) && priority === 'urgent' && (finalSendEmail || finalSendSms)

    if (shouldShowSummary) {
      setTimeout(() => {
        const store = useNoticeStore.getState()
        const savedNotice = store.getNoticeById(id!)
        const records = savedNotice?.notificationRecords ?? []
        const emailSuccess = records.filter((r) => r.channel === 'email' && r.status === 'success').length
        const emailFail = records.filter((r) => r.channel === 'email' && r.status === 'failed').length
        const smsSuccess = records.filter((r) => r.channel === 'sms' && r.status === 'success').length
        const smsFail = records.filter((r) => r.channel === 'sms' && r.status === 'failed').length
        setNotifySummary({ emailSuccess, emailFail, smsSuccess, smsFail })
        setShowNotifyModal(true)
      }, 50)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-6 text-xl font-bold text-brand-500">编辑公告</h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">公告标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入公告标题"
                className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-coral-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">公告内容</label>
              <ReactQuill
                theme="snow"
                value={richContent}
                onChange={setRichContent}
                className="rounded-lg border border-surface-200 [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-surface-200 [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-surface-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">附件</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-500 transition-colors hover:border-coral-400 hover:text-coral-400"
                  >
                    <Upload size={16} />
                    上传附件
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {attachments.length > 0 && (
                    <span className="text-xs text-surface-400">已上传 {attachments.length} 个文件</span>
                  )}
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg">📎</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-brand-500 truncate">{att.name}</p>
                            <p className="text-xs text-surface-400">{formatFileSize(att.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="shrink-0 p-1.5 rounded-md text-surface-400 hover:text-coral-400 hover:bg-coral-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">优先级</label>
              <div className="flex gap-3">
                {priorityConfig.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors ${
                      priority === p.value
                        ? p.activeClass
                        : 'border-surface-200 bg-white text-surface-400 hover:border-surface-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">发布范围</label>
              <div className="flex gap-3">
                {scopeOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setScope(s.value)
                      setScopeDetail([])
                    }}
                    className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors ${
                      scope === s.value
                        ? 'border-brand-500 bg-brand-50 text-brand-500'
                        : 'border-surface-200 bg-white text-surface-400 hover:border-surface-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {scope === 'department' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-500"
                    >
                      <input
                        type="checkbox"
                        checked={scopeDetail.includes(dept.id)}
                        onChange={() => toggleDepartment(dept.id)}
                        className="accent-brand-500"
                      />
                      {dept.name}
                    </label>
                  ))}
                </div>
              )}

              {scope === 'person' && (
                <div className="mt-3 flex flex-col gap-3">
                  {departments.map((dept) => (
                    <div key={dept.id}>
                      <p className="mb-1.5 text-xs font-medium text-surface-400">{getDepartmentName(dept.id)}</p>
                      <div className="flex flex-wrap gap-2">
                        {employees
                          .filter((e) => e.department === dept.id)
                          .map((emp) => (
                            <label
                              key={emp.id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-500"
                            >
                              <input
                                type="checkbox"
                                checked={scopeDetail.includes(emp.id)}
                                onChange={() => toggleEmployee(emp.id)}
                                className="accent-brand-500"
                              />
                              {emp.name}
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">定时发布</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setUseScheduled(!useScheduled)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    useScheduled ? 'bg-coral-400' : 'bg-surface-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: useScheduled ? 20 : 2 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  />
                </button>
                {useScheduled && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-colors focus:border-coral-400"
                    />
                    {isScheduledInvalid && (
                      <span className="text-xs text-coral-400">请选择未来时间</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">过期时间</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-colors focus:border-coral-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-500">允许评论</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCommentEnabled(!commentEnabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    commentEnabled ? 'bg-coral-400' : 'bg-surface-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: commentEnabled ? 20 : 2 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  />
                </button>
                <span className="text-sm text-surface-400">{commentEnabled ? '已开启' : '已关闭'}</span>
              </div>
            </div>

            {priority === 'urgent' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-500">紧急通知方式</label>
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-500">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="accent-coral-400"
                    />
                    同步发送邮件通知
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-500">
                    <input
                      type="checkbox"
                      checked={sendSms}
                      onChange={(e) => setSendSms(e.target.checked)}
                      className="accent-coral-400"
                    />
                    同步发送短信通知
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => handleSave(true)}
            className="rounded-lg border border-surface-200 bg-white px-6 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-50"
          >
            保存草稿
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={publishButtonDisabled}
            title={publishButtonDisabled ? '请设置有效的定时发布时间' : ''}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors ${
              publishButtonDisabled
                ? 'bg-surface-300 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {useScheduled ? '保存定时发布' : '立即发布'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNotifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => {
              setShowNotifyModal(false)
              navigate('/admin')
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-500">通知发送结果</h3>
                  <p className="mt-1 text-sm text-surface-400">已为所有目标用户发送通知</p>
                </div>
                <button
                  onClick={() => {
                    setShowNotifyModal(false)
                    navigate('/admin')
                  }}
                  className="p-1 rounded-md text-surface-400 hover:text-surface-500 hover:bg-surface-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {sendEmail && (
                  <div className="rounded-xl bg-surface-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-500">📧 邮件</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-mint-500">
                          <CheckCircle size={13} />
                          成功 {notifySummary.emailSuccess}
                        </span>
                        <span className="inline-flex items-center gap-1 text-coral-400">
                          <XCircle size={13} />
                          失败 {notifySummary.emailFail}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {sendSms && (
                  <div className="rounded-xl bg-surface-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-500">📱 短信</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-mint-500">
                          <CheckCircle size={13} />
                          成功 {notifySummary.smsSuccess}
                        </span>
                        <span className="inline-flex items-center gap-1 text-coral-400">
                          <XCircle size={13} />
                          失败 {notifySummary.smsFail}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowNotifyModal(false)
                  navigate('/admin')
                }}
                className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                确定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
