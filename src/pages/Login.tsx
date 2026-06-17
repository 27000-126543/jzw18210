import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, User } from 'lucide-react'
import { useAuthStore } from '@/store'

const roles = [
  {
    role: 'admin' as const,
    label: '管理员登录',
    icon: Shield,
    to: '/admin',
    desc: '管理公告发布与审核',
    accent: 'text-coral-400',
    border: 'hover:border-coral-400',
  },
  {
    role: 'employee' as const,
    label: '员工登录',
    icon: User,
    to: '/employee',
    desc: '查看公告与通知',
    accent: 'text-mint-400',
    border: 'hover:border-mint-400',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleLogin = (role: 'admin' | 'employee', to: string) => {
    login(role)
    navigate(to)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-body">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-500 to-brand-700" />

      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-coral-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-mint-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl bg-white/95 p-10 shadow-modal backdrop-blur-sm">
          <h1 className="mb-2 text-center text-2xl font-bold text-brand-500">
            企业公告与通知系统
          </h1>
          <p className="mb-10 text-center text-sm text-surface-400">选择登录角色以继续</p>

          <div className="flex flex-col gap-4">
            {roles.map((item, index) => (
              <motion.button
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.12 }}
                whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(27,42,74,0.08), 0 4px 10px rgba(27,42,74,0.05)' }}
                onClick={() => handleLogin(item.role, item.to)}
                className={`group flex items-center gap-4 rounded-xl border-2 border-surface-100 bg-white p-5 text-left transition-colors ${item.border}`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-50 transition-colors group-hover:bg-surface-100`}>
                  <item.icon className={`h-6 w-6 ${item.accent}`} />
                </div>
                <div>
                  <p className="text-base font-semibold text-brand-500">{item.label}</p>
                  <p className="text-sm text-surface-400">{item.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-200/60">
          © 2026 企业公告与通知系统
        </p>
      </div>
    </div>
  )
}
