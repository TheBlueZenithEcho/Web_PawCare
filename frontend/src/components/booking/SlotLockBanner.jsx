import { Clock } from 'lucide-react';

export default function SlotLockBanner({ formatted, isCritical }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
        isCritical
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-fresh-grown/40 text-wood-bark border border-fresh-grown'
      }`}
    >
      <Clock size={16} />
      <span>
        Đang giữ chỗ cho bạn — còn <span className="tabular-nums">{formatted}</span>
      </span>
    </div>
  );
}