import { motion } from 'framer-motion';
import { CalendarClock, Users, Building2, UserCircle2 } from 'lucide-react';
import PriorityBadge from '@/components/PriorityBadge';
import ReadProgress from '@/components/ReadProgress';
import type { Notice } from '@/types';
import { formatDate, getDepartmentName, getTotalTargetReaders } from '@/data/mockData';

interface NoticeCardProps {
  notice: Notice;
  isRead?: boolean;
  onClick?: () => void;
  variant?: 'admin' | 'employee';
}

export default function NoticeCard({ notice, isRead = false, onClick, variant = 'admin' }: NoticeCardProps) {
  const stripColor =
    notice.priority === 'urgent' ? 'bg-coral-400' :
    notice.priority === 'important' ? 'bg-amber-400' : 'bg-surface-300';

  const scopeLabel = () => {
    if (notice.scope === 'all') return { text: '全员', icon: Users };
    if (notice.scope === 'department') {
      const names = notice.scopeDetail.map(getDepartmentName).join('、');
      return { text: names || '指定部门', icon: Building2 };
    }
    return { text: `指定${notice.scopeDetail.length}人`, icon: UserCircle2 };
  };
  const scope = scopeLabel();
  const ScopeIcon = scope.icon;

  const totalReaders = getTotalTargetReaders(notice.scope, notice.scopeDetail);
  const readCount = notice.readBy.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="group relative bg-white rounded-xl shadow-card hover:shadow-cardHover transition-all duration-200 overflow-hidden cursor-pointer border border-transparent hover:border-brand-100"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${stripColor}`} />
      <div className="flex items-start p-5 pl-6 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {!isRead && variant === 'employee' && (
              <span className="w-2 h-2 rounded-full bg-coral-400 shrink-0" />
            )}
            <h3 className="font-medium text-brand-500 text-[15px] truncate flex-1 min-w-0 group-hover:text-coral-400 transition-colors">
              {notice.title}
            </h3>
            <PriorityBadge priority={notice.priority} />
            {variant === 'employee' && !isRead && (
              <span className="inline-flex items-center rounded-full bg-coral-50 px-2 py-0.5 text-xs font-medium text-coral-500">
                未读
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <ScopeIcon size={13} />
              {scope.text}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={13} />
              {formatDate(notice.publishedAt || notice.scheduledAt || notice.createdAt)}
            </span>
            {notice.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-brand-400">
                📎 {notice.attachments.length}个附件
              </span>
            )}
          </div>
        </div>
        {variant === 'admin' && (
          <div className="w-56 shrink-0">
            <ReadProgress readCount={readCount} totalCount={Math.max(totalReaders, 1)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
