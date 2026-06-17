import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, PlusCircle, Archive, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store'

const navItems = [
  { label: '公告管理', icon: Bell, to: '/admin' },
  { label: '新建公告', icon: PlusCircle, to: '/admin/create' },
  { label: '存档公告', icon: Archive, to: '/admin/archive' },
]

export default function AdminLayout() {
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const currentUser = useAuthStore((s) => s.currentUser)

  return (
    <div className="flex h-screen overflow-hidden font-body">
      <aside className="flex w-64 shrink-0 flex-col bg-brand-500 text-white">
        <div className="flex h-16 items-center gap-2 px-6">
          <Bell className="h-6 w-6 text-coral-400" />
          <span className="text-lg font-semibold tracking-wide">公告管理系统</span>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-l-[3px] border-coral-400 bg-coral-50 text-brand-500'
                    : 'text-brand-200 hover:bg-brand-400/40 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-brand-400/30 px-6 py-4">
          <p className="truncate text-xs text-brand-300">{currentUser?.name ?? '管理员'}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden bg-surface-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-100 bg-white px-8 shadow-card">
          <h1 className="text-lg font-semibold text-brand-500">管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-500">{currentUser?.name ?? '管理员'}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-500"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
