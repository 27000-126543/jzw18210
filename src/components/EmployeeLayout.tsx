import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Bell } from 'lucide-react';
import { useAuthStore, useNoticeStore } from '@/store';
import UrgentNoticeModal from './UrgentNoticeModal';
import type { Notice } from '@/types';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { getUnreadUrgentNotices } = useNoticeStore();
  const [urgentNotices, setUrgentNotices] = useState<Notice[]>([]);
  const [showUrgent, setShowUrgent] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const notices = getUnreadUrgentNotices(currentUser.id);
      if (notices.length > 0) {
        setUrgentNotices(notices);
        setShowUrgent(true);
      }
    }
  }, [currentUser, getUnreadUrgentNotices]);

  const handleCloseUrgent = () => {
    setShowUrgent(false);
    const remaining = getUnreadUrgentNotices(currentUser!.id);
    if (remaining.length > 0) {
      setUrgentNotices(remaining);
      setShowUrgent(true);
    } else {
      setUrgentNotices([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
      <header className="bg-white shadow-card h-16 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-500" />
          <span className="text-xl font-bold text-brand-500">公告中心</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{currentUser?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-coral-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </header>

      <main className="flex-1 bg-surface-100">
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

      <AnimatePresence>
        {showUrgent && urgentNotices.length > 0 && (
          <UrgentNoticeModal
            notices={urgentNotices}
            onClose={handleCloseUrgent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
