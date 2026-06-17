import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore, useNoticeStore } from '@/store';
import type { Notice } from '@/types';

interface UrgentNoticeModalProps {
  notices: Notice[];
  onClose: () => void;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function UrgentNoticeModal({ notices, onClose }: UrgentNoticeModalProps) {
  const { currentUser } = useAuthStore();
  const { markAsRead } = useNoticeStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentNotice = notices[currentIndex];

  if (!currentNotice) {
    onClose();
    return null;
  }

  const snippet = stripHtml(currentNotice.richContent).slice(0, 200);

  const handleMarkRead = async () => {
    if (currentUser) {
      await markAsRead(currentNotice.id, currentUser.id);
    }
    if (currentIndex + 1 < notices.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8 border-2 border-coral-400 animate-pulse-glow"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-14 h-14 text-coral-400" />
          <span className="text-sm font-semibold tracking-wider text-coral-400 uppercase">
            紧急公告
          </span>
          <h2 className="text-xl font-bold text-brand-500 leading-snug">
            {currentNotice.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {snippet}
          </p>
          <button
            onClick={handleMarkRead}
            className="mt-2 bg-coral-400 hover:bg-coral-500 text-white font-bold text-lg px-10 py-3 rounded-xl transition-colors"
          >
            已阅
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
