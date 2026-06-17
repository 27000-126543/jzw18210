import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notice, Employee, NotificationRecord } from '@/types'
import { employees, initialNotices, getTargetEmployees, getDepartmentName, departments } from '@/data/mockData'

interface AuthState {
  currentUser: Employee | null
  isAdmin: boolean
  login: (role: 'admin' | 'employee') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAdmin: false,
      login: (role) => {
        const user = role === 'admin' ? employees[0] : employees[1]
        set({ currentUser: user, isAdmin: role === 'admin' })
      },
      logout: () => set({ currentUser: null, isAdmin: false }),
    }),
    { name: 'notice-auth' }
  )
)

function generateNotificationRecords(
  scope: Notice['scope'],
  scopeDetail: string[],
  emailEnabled: boolean,
  smsEnabled: boolean
): NotificationRecord[] {
  const targets = getTargetEmployees(scope, scopeDetail)
  const records: NotificationRecord[] = []
  let idCounter = 0

  for (const emp of targets) {
    const deptName = departments.find((d) => d.id === emp.department)?.name ?? ''

    if (emailEnabled) {
      const failRate = Math.random()
      const isFailed = failRate < 0.08
      records.push({
        id: `nr-${Date.now()}-${idCounter++}`,
        userId: emp.id,
        userName: emp.name,
        department: deptName,
        email: emp.email,
        phone: emp.phone,
        channel: 'email',
        status: isFailed ? 'failed' : 'success',
        sentAt: isFailed ? null : new Date().toISOString(),
        errorMessage: isFailed ? '邮箱服务器连接超时' : undefined,
      })
    }

    if (smsEnabled) {
      const failRate = Math.random()
      const isFailed = failRate < 0.05
      records.push({
        id: `nr-${Date.now()}-${idCounter++}`,
        userId: emp.id,
        userName: emp.name,
        department: deptName,
        email: emp.email,
        phone: emp.phone,
        channel: 'sms',
        status: isFailed ? 'failed' : 'success',
        sentAt: isFailed ? null : new Date().toISOString(),
        errorMessage: isFailed ? '手机号格式异常或运营商延迟' : undefined,
      })
    }
  }
  return records
}

interface NoticeState {
  notices: Notice[]
  addNotice: (notice: Notice, sendEmail: boolean, sendSms: boolean) => void
  updateNotice: (id: string, updates: Partial<Notice>, sendEmail?: boolean, sendSms?: boolean) => void
  deleteNotice: (id: string) => void
  markAsRead: (noticeId: string, userId: string) => void
  addComment: (noticeId: string, comment: { id: string; userId: string; userName: string; content: string; createdAt: string }) => void
  toggleCommentEnabled: (noticeId: string) => void
  sendReminder: (noticeId: string, userIds: string[]) => void
  archiveExpired: () => void
  publishScheduled: () => void
  getNoticeById: (id: string) => Notice | undefined
  getNoticesForEmployee: (employeeId: string) => Notice[]
  getUnreadUrgentNotices: (employeeId: string) => Notice[]
}

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set, get) => ({
      notices: initialNotices,

      addNotice: (notice, sendEmail, sendSms) => {
        const now = new Date().toISOString()
        const shouldSendNotifications =
          notice.status === 'published' &&
          notice.priority === 'urgent' &&
          (sendEmail || sendSms)

        const notificationRecords: NotificationRecord[] = shouldSendNotifications
          ? generateNotificationRecords(notice.scope, notice.scopeDetail, sendEmail, sendSms)
          : []

        set((state) => ({
          notices: [...state.notices, { ...notice, notificationRecords, updatedAt: now }],
        }))
      },

      updateNotice: (id, updates, sendEmail, sendSms) =>
        set((state) => ({
          notices: state.notices.map((n) => {
            if (n.id !== id) return n
            const now = new Date().toISOString()

            let newNotificationRecords = n.notificationRecords
            const becomingPublished = updates.status === 'published' && n.status !== 'published'

            if (becomingPublished && n.priority === 'urgent' && (sendEmail || sendSms)) {
              const extra = generateNotificationRecords(
                updates.scope ?? n.scope,
                updates.scopeDetail ?? n.scopeDetail,
                !!sendEmail,
                !!sendSms
              )
              newNotificationRecords = [...newNotificationRecords, ...extra]
            }

            return {
              ...n,
              ...updates,
              updatedAt: now,
              notificationRecords: newNotificationRecords,
            }
          }),
        })),

      deleteNotice: (id) =>
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        })),

      markAsRead: (noticeId, userId) =>
        set((state) => ({
          notices: state.notices.map((n) => {
            if (n.id !== noticeId) return n
            if (n.readBy.some((r) => r.userId === userId)) return n
            const emp = employees.find((e) => e.id === userId)
            const dept = departments.find((d) => d.id === emp?.department)
            return {
              ...n,
              readBy: [
                ...n.readBy,
                {
                  userId,
                  userName: emp?.name ?? userId,
                  avatar: emp?.avatar ?? '',
                  department: dept?.name ?? '',
                  readAt: new Date().toISOString(),
                },
              ],
            }
          }),
        })),

      addComment: (noticeId, comment) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === noticeId
              ? { ...n, comments: [...n.comments, { ...comment, noticeId }] }
              : n
          ),
        })),

      toggleCommentEnabled: (noticeId) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === noticeId ? { ...n, commentEnabled: !n.commentEnabled } : n
          ),
        })),

      sendReminder: (noticeId, userIds) => {
        console.log(`催读提醒已发送: 公告${noticeId}, 用户${userIds.join(',')}`)
      },

      archiveExpired: () =>
        set((state) => ({
          notices: state.notices.map((n) => {
            if (n.status !== 'published' || !n.expiresAt) return n
            if (new Date(n.expiresAt) < new Date()) {
              return { ...n, status: 'archived' as const, updatedAt: new Date().toISOString() }
            }
            return n
          }),
        })),

      publishScheduled: () =>
        set((state) => ({
          notices: state.notices.map((n) => {
            if (n.status !== 'scheduled' || !n.scheduledAt) return n
            if (new Date(n.scheduledAt) <= new Date()) {
              const now = new Date().toISOString()
              const shouldSendNotifications =
                n.priority === 'urgent' && (n.emailNotified || n.smsNotified)
              const notificationRecords: NotificationRecord[] = shouldSendNotifications
                ? generateNotificationRecords(
                    n.scope,
                    n.scopeDetail,
                    n.emailNotified,
                    n.smsNotified
                  )
                : n.notificationRecords

              return {
                ...n,
                status: 'published' as const,
                publishedAt: now,
                updatedAt: now,
                notificationRecords,
              }
            }
            return n
          }),
        })),

      getNoticeById: (id) => get().notices.find((n) => n.id === id),

      getNoticesForEmployee: (employeeId) => {
        const emp = employees.find((e) => e.id === employeeId)
        if (!emp) return []
        return get().notices.filter((n) => {
          if (n.status !== 'published') return false
          if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false
          if (n.scope === 'all') return emp.role !== 'admin'
          if (n.scope === 'department') return emp.role !== 'admin' && n.scopeDetail.includes(emp.department)
          if (n.scope === 'person') return n.scopeDetail.includes(emp.id)
          return false
        })
      },

      getUnreadUrgentNotices: (employeeId) => {
        return get()
          .getNoticesForEmployee(employeeId)
          .filter(
            (n) =>
              (n.priority === 'urgent' || n.priority === 'important') &&
              !n.readBy.some((r) => r.userId === employeeId)
          )
      },
    }),
    { name: 'notice-data' }
  )
)

export { getDepartmentName }
