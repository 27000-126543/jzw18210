import type { Employee, Department, Notice } from '@/types'

export const departments: Department[] = [
  { id: 'dept-1', name: '技术部', memberIds: ['emp-1', 'emp-2', 'emp-3', 'emp-4'] },
  { id: 'dept-2', name: '市场部', memberIds: ['emp-5', 'emp-6', 'emp-7'] },
  { id: 'dept-3', name: '财务部', memberIds: ['emp-8', 'emp-9', 'emp-10'] },
]

export const employees: Employee[] = [
  { id: 'emp-1', name: '张明', avatar: '', department: 'dept-1', email: 'zhangming@corp.com', phone: '13800001001', role: 'admin' },
  { id: 'emp-2', name: '李华', avatar: '', department: 'dept-1', email: 'lihua@corp.com', phone: '13800001002', role: 'employee' },
  { id: 'emp-3', name: '王芳', avatar: '', department: 'dept-1', email: 'wangfang@corp.com', phone: '13800001003', role: 'employee' },
  { id: 'emp-4', name: '赵强', avatar: '', department: 'dept-1', email: 'zhaoqiang@corp.com', phone: '13800001004', role: 'employee' },
  { id: 'emp-5', name: '刘洋', avatar: '', department: 'dept-2', email: 'liuyang@corp.com', phone: '13800001005', role: 'employee' },
  { id: 'emp-6', name: '陈静', avatar: '', department: 'dept-2', email: 'chenjing@corp.com', phone: '13800001006', role: 'employee' },
  { id: 'emp-7', name: '杨帆', avatar: '', department: 'dept-2', email: 'yangfan@corp.com', phone: '13800001007', role: 'employee' },
  { id: 'emp-8', name: '周蕾', avatar: '', department: 'dept-3', email: 'zhoulei@corp.com', phone: '13800001008', role: 'employee' },
  { id: 'emp-9', name: '吴磊', avatar: '', department: 'dept-3', email: 'wulei@corp.com', phone: '13800001009', role: 'employee' },
  { id: 'emp-10', name: '郑瑶', avatar: '', department: 'dept-3', email: 'zhengyao@corp.com', phone: '13800001010', role: 'employee' },
]

const now = new Date()
const day = (offset: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() + offset)
  return d.toISOString()
}

export const initialNotices: Notice[] = [
  {
    id: 'notice-1',
    title: '2026年端午节放假通知',
    richContent: '<p>各位同事：</p><p>根据国务院办公厅通知精神，现将2026年端午节放假安排通知如下：</p><p><strong>放假时间</strong>：6月19日（周五）至6月21日（周日），共3天。</p><p><strong>注意事项</strong>：</p><ol><li>请各部门提前做好工作交接</li><li>值班人员请保持手机畅通</li><li>祝大家端午安康！</li></ol>',
    attachments: [
      { id: 'att-1', name: '端午节值班表.pdf', size: 256000, type: 'application/pdf', url: '#' },
      { id: 'att-2', name: '假期安排详情.docx', size: 128000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '#' },
    ],
    priority: 'important',
    scope: 'all',
    scopeDetail: [],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: true,
    comments: [
      { id: 'cmt-1', noticeId: 'notice-1', userId: 'emp-2', userName: '李华', content: '收到，已安排好工作交接！', createdAt: day(-2) },
      { id: 'cmt-2', noticeId: 'notice-1', userId: 'emp-5', userName: '刘洋', content: '端午安康！', createdAt: day(-1) },
    ],
    publishedAt: day(-3),
    scheduledAt: null,
    expiresAt: day(10),
    status: 'published',
    createdAt: day(-4),
    updatedAt: day(-3),
    readBy: [
      { userId: 'emp-2', userName: '李华', avatar: '', department: '技术部', readAt: day(-2) },
      { userId: 'emp-3', userName: '王芳', avatar: '', department: '技术部', readAt: day(-2) },
      { userId: 'emp-5', userName: '刘洋', avatar: '', department: '市场部', readAt: day(-1) },
      { userId: 'emp-6', userName: '陈静', avatar: '', department: '市场部', readAt: day(-1) },
      { userId: 'emp-8', userName: '周蕾', avatar: '', department: '财务部', readAt: day(-1) },
    ],
    emailNotified: false,
    smsNotified: false,
  },
  {
    id: 'notice-2',
    title: '紧急：办公网络升级维护通知',
    richContent: '<p><strong style="color:#FF6B4A">【紧急通知】</strong></p><p>因办公网络核心交换机升级，以下时段网络将中断：</p><p><strong>影响时间</strong>：6月20日 22:00 - 次日02:00</p><p><strong>影响范围</strong>：全公司办公区域</p><p><strong>应对措施</strong>：</p><ul><li>请提前保存所有在线文档</li><li>VPN连接将暂时不可用</li><li>如有紧急事务请使用手机热点</li></ul><p>维护完成后将另行通知，感谢理解！</p>',
    attachments: [],
    priority: 'urgent',
    scope: 'all',
    scopeDetail: [],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: true,
    comments: [],
    publishedAt: day(-1),
    scheduledAt: null,
    expiresAt: day(5),
    status: 'published',
    createdAt: day(-1),
    updatedAt: day(-1),
    readBy: [
      { userId: 'emp-2', userName: '李华', avatar: '', department: '技术部', readAt: day(-1) },
    ],
    emailNotified: true,
    smsNotified: true,
  },
  {
    id: 'notice-3',
    title: '技术部第三季度OKR制定说明',
    richContent: '<p>技术部各位同事：</p><p>第三季度OKR制定工作即将开始，请注意以下安排：</p><ol><li>个人OKR提交截止日期：7月5日</li><li>团队OKR评审会议：7月8日</li><li>最终确认发布：7月10日</li></ol><p>请登录OKR系统填写，如有疑问请联系部门负责人。</p>',
    attachments: [
      { id: 'att-3', name: 'OKR填写指南.pdf', size: 512000, type: 'application/pdf', url: '#' },
    ],
    priority: 'normal',
    scope: 'department',
    scopeDetail: ['dept-1'],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: true,
    comments: [
      { id: 'cmt-3', noticeId: 'notice-3', userId: 'emp-4', userName: '赵强', content: '好的，已开始准备', createdAt: day(-1) },
    ],
    publishedAt: day(-1),
    scheduledAt: null,
    expiresAt: day(20),
    status: 'published',
    createdAt: day(-2),
    updatedAt: day(-1),
    readBy: [
      { userId: 'emp-2', userName: '李华', avatar: '', department: '技术部', readAt: day(-1) },
      { userId: 'emp-3', userName: '王芳', avatar: '', department: '技术部', readAt: day(-1) },
      { userId: 'emp-4', userName: '赵强', avatar: '', department: '技术部', readAt: day(-1) },
    ],
    emailNotified: false,
    smsNotified: false,
  },
  {
    id: 'notice-4',
    title: '全员体检预约开放通知',
    richContent: '<p>各位同事：</p><p>公司年度体检预约已开放，请注意以下信息：</p><ul><li>体检时间：7月15日-7月30日</li><li>体检机构：美年大健康（CBD店）</li><li>预约方式：登录HR系统选择时段</li><li>截止预约：7月10日</li></ul><p>请大家合理安排时间，按时参加体检。</p>',
    attachments: [],
    priority: 'normal',
    scope: 'all',
    scopeDetail: [],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: false,
    comments: [],
    publishedAt: null,
    scheduledAt: day(3),
    expiresAt: day(25),
    status: 'scheduled',
    createdAt: day(0),
    updatedAt: day(0),
    readBy: [],
    emailNotified: false,
    smsNotified: false,
  },
  {
    id: 'notice-5',
    title: '市场部Q2总结会议通知',
    richContent: '<p>市场部全体同事：</p><p>Q2总结会议安排如下：</p><p><strong>时间</strong>：6月25日 14:00-17:00</p><p><strong>地点</strong>：3楼大会议室</p><p><strong>议程</strong>：</p><ol><li>Q2业绩汇报</li><li>重点项目复盘</li><li>Q3规划讨论</li></ol><p>请各位提前准备好汇报材料。</p>',
    attachments: [],
    priority: 'important',
    scope: 'department',
    scopeDetail: ['dept-2'],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: true,
    comments: [],
    publishedAt: day(-2),
    scheduledAt: null,
    expiresAt: day(7),
    status: 'published',
    createdAt: day(-3),
    updatedAt: day(-2),
    readBy: [
      { userId: 'emp-5', userName: '刘洋', avatar: '', department: '市场部', readAt: day(-2) },
    ],
    emailNotified: false,
    smsNotified: false,
  },
  {
    id: 'notice-6',
    title: '年度财务审计配合通知',
    richContent: '<p>财务部各位同事：</p><p>外部审计将于7月1日开始，请配合以下工作：</p><ul><li>整理上半年财务凭证</li><li>准备银行对账单</li><li>确认应收应付账款</li></ul><p>审计期间请保持相关文件可随时调取。</p>',
    attachments: [
      { id: 'att-4', name: '审计清单.xlsx', size: 96000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', url: '#' },
    ],
    priority: 'important',
    scope: 'department',
    scopeDetail: ['dept-3'],
    authorId: 'emp-1',
    authorName: '张明',
    commentEnabled: false,
    comments: [],
    publishedAt: day(-5),
    scheduledAt: null,
    expiresAt: day(-1),
    status: 'archived',
    createdAt: day(-7),
    updatedAt: day(-5),
    readBy: [
      { userId: 'emp-8', userName: '周蕾', avatar: '', department: '财务部', readAt: day(-4) },
      { userId: 'emp-9', userName: '吴磊', avatar: '', department: '财务部', readAt: day(-4) },
      { userId: 'emp-10', userName: '郑瑶', avatar: '', department: '财务部', readAt: day(-3) },
    ],
    emailNotified: false,
    smsNotified: false,
  },
]

export function getInitials(name: string): string {
  return name.slice(0, 1)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function getDepartmentName(deptId: string): string {
  return departments.find(d => d.id === deptId)?.name ?? deptId
}

export function getEmployeeName(empId: string): string {
  return employees.find(e => e.id === empId)?.name ?? empId
}
