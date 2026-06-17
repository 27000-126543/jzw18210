import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notice, Employee } from '@/types'
import { employees, initialNotices, departments } from '@/data/mockData'

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

interface NoticeState {
  notices: Notice[]
  addNotice: (notice: Notice) => void
  updateNotice: (id: string, updates: Partial<Notice>) => void
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

      addNotice: (notice) =>
        set((state) => ({ notices: [...state.notices, notice] })),

      updateNotice: (id, updates) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
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
              return { ...n, status: 'archived' as const }
            }
            return n
          }),
        })),

      publishScheduled: () =>
        set((state) => ({
          notices: state.notices.map((n) => {
            if (n.status !== 'scheduled' || !n.scheduledAt) return n
            if (new Date(n.scheduledAt) <= new Date()) {
              return { ...n, status: 'published' as const, publishedAt: new Date().toISOString() }
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
          if (n.scope === 'all') return true
          if (n.scope === 'department') return n.scopeDetail.includes(emp.department)
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
