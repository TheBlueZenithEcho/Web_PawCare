import { Calendar, Clock as ClockIcon, Scissors } from 'lucide-react';
import { formatVND } from '../../utils/format';
import SlotLockBanner from './SlotLockBanner';

export default function BookingSummaryCard({
  packageInfo,
  petLabel,
  dateLabel,
  timeLabel,
  durationLabel,
  breakdown = [],
  total = 0,
  deposit = 0,
  ctaLabel,
  onCtaClick,
  ctaDisabled,
  secondaryAction,
  lock,
  note,
}) {
  return (
    <aside className="w-full max-w-sm rounded-3xl bg-white shadow-lg p-6 flex flex-col gap-5 sticky top-24 h-fit">
      <h3 className="text-lg font-bold text-wood-bark">Tóm tắt lịch đặt</h3>

      {lock && !lock.expired && (
        <SlotLockBanner formatted={lock.formatted} isCritical={lock.isCritical} />
      )}

      {packageInfo && (
        <div className="flex items-start gap-3 border-b border-wood-bark/10 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fresh-grown/50 text-understory shrink-0">
            <Scissors size={20} />
          </div>
          <div>
            <p className="font-semibold text-wood-bark">{packageInfo.name}</p>
            <p className="text-xs text-wood-bark/60">{packageInfo.description}</p>
            {petLabel && <p className="text-xs text-wood-bark/60 mt-1">Thú cưng: {petLabel}</p>}
          </div>
        </div>
      )}

      {(dateLabel || timeLabel) && (
        <div className="flex flex-col gap-2 text-sm text-wood-bark/80">
          {dateLabel && (
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-understory" />
              <span>{dateLabel}</span>
            </div>
          )}
          {timeLabel && (
            <div className="flex items-center gap-2">
              <ClockIcon size={15} className="text-understory" />
              <span>{timeLabel}</span>
              {durationLabel && <span className="text-wood-bark/50">· {durationLabel}</span>}
            </div>
          )}
        </div>
      )}

      {breakdown.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-wood-bark/10 pt-4 text-sm">
          {breakdown.map((line) => (
            <div key={line.label} className="flex justify-between text-wood-bark/80">
              <span>{line.label}</span>
              <span>{formatVND(line.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-wood-bark/10 pt-4 flex flex-col gap-1">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-wood-bark">Tổng tạm tính</span>
          <span className="text-xl font-bold text-understory">{formatVND(total)}</span>
        </div>
        {deposit > 0 && (
          <div className="flex justify-between text-xs text-wood-bark/60">
            <span>Đặt cọc yêu cầu (30%)</span>
            <span>{formatVND(deposit)}</span>
          </div>
        )}
      </div>

      {note && <p className="text-xs text-wood-bark/50 leading-relaxed">{note}</p>}

      <button
        onClick={onCtaClick}
        disabled={ctaDisabled}
        className="w-full rounded-full bg-understory py-3 text-sm font-bold text-white transition-all hover:bg-wood-bark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {ctaLabel}
      </button>

      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="text-sm font-semibold text-wood-bark/70 hover:text-understory transition-colors"
        >
          {secondaryAction.label}
        </button>
      )}
    </aside>
  );
}