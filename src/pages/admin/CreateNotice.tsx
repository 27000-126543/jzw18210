import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNoticeStore } from '@/store'
import { useAuthStore } from '@/store'
import { employees, departments, getDepartmentName } from '@/data/mockData'
import type { Priority, NoticeScope } from '@/types'

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

export default function CreateNotice() {
  const navigate = useNavigate()
  const { addNotice } = useNoticeStore()
  const { currentUser } = useAuthStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [scope, setScope] = useState<NoticeScope>('all')
  const [scopeDetail, setScopeDetail] = useState<string[]>([])
  const [scheduledEnabled, setScheduledEnabled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [commentEnabled, setCommentEnabled] = useState(true)
  const [emailNotified, setEmailNotified] = useState(false)
  const [smsNotified, setSmsNotified] = useState(false)

  const toggleDepartment = (deptId: string) => {
    setScopeDetail((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    )
  }

  const toggleEmployee = (empId: string) => {
    setScopeDetail((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
  }

  const handleSubmit = (isDraft: boolean) => {
    const now = new Date().toISOString()
    const id = 'notice-' + Date.now()

    const notice = {
      id,
      title,
      richContent: content,
      attachments: [],
      priority,
      scope,
      scopeDetail: scope === 'all' ? [] : scopeDetail,
      authorId: currentUser?.id ?? 'emp-1',
      authorName: currentUser?.name ?? '管理员',
      commentEnabled,
      comments: [],
      publishedAt: isDraft ? null : scheduledEnabled ? null : now,
      scheduledAt: scheduledEnabled ? scheduledAt : null,
      expiresAt: expiresAt || null,
      status: isDraft ? 'draft' as const : scheduledEnabled ? 'scheduled' as const : 'published' as const,
      createdAt: now,
      updatedAt: now,
      readBy: [],
      emailNotified: priority === 'urgent' ? emailNotified : false,
      smsNotified: priority === 'urgent' ? smsNotified : false,
    }

    addNotice(notice)
    navigate('/admin')
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-6 text-xl font-bold text-brand-500">新建公告</h2>

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
                value={content}
                onChange={setContent}
                className="rounded-lg border border-surface-200 [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-surface-200 [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-surface-200"
              />
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScheduledEnabled(!scheduledEnabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    scheduledEnabled ? 'bg-coral-400' : 'bg-surface-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: scheduledEnabled ? 20 : 2 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  />
                </button>
                {scheduledEnabled && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-colors focus:border-coral-400"
                  />
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
                      checked={emailNotified}
                      onChange={(e) => setEmailNotified(e.target.checked)}
                      className="accent-coral-400"
                    />
                    同步发送邮件通知
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-500">
                    <input
                      type="checkbox"
                      checked={smsNotified}
                      onChange={(e) => setSmsNotified(e.target.checked)}
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
            onClick={() => handleSubmit(true)}
            className="rounded-lg border border-surface-200 bg-white px-6 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-50"
          >
            保存草稿
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            立即发布
          </button>
        </div>
      </div>
    </div>
  )
}
