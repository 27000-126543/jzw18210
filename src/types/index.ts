export type Priority = 'normal' | 'important' | 'urgent'
export type NoticeScope = 'all' | 'department' | 'person'
export type NoticeStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  data?: string
}

export interface Comment {
  id: string
  noticeId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface ReadRecord {
  userId: string
  userName: string
  avatar: string
  department: string
  readAt: string
}

export type NotificationChannel = 'email' | 'sms'
export type NotificationStatus = 'success' | 'failed' | 'pending'

export interface NotificationRecord {
  id: string
  userId: string
  userName: string
  department: string
  email: string
  phone: string
  channel: NotificationChannel
  status: NotificationStatus
  sentAt: string | null
  errorMessage?: string
}

export interface Notice {
  id: string
  title: string
  richContent: string
  attachments: Attachment[]
  priority: Priority
  scope: NoticeScope
  scopeDetail: string[]
  authorId: string
  authorName: string
  commentEnabled: boolean
  comments: Comment[]
  publishedAt: string | null
  scheduledAt: string | null
  expiresAt: string | null
  status: NoticeStatus
  createdAt: string
  updatedAt: string
  readBy: ReadRecord[]
  emailNotified: boolean
  smsNotified: boolean
  notificationRecords: NotificationRecord[]
}

export interface Employee {
  id: string
  name: string
  avatar: string
  department: string
  email: string
  phone: string
  role: 'admin' | 'employee'
}

export interface Department {
  id: string
  name: string
  memberIds: string[]
}
