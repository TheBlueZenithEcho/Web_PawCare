import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Landmark, Smartphone, AlertTriangle } from 'lucide-react';
import { getGroomingServices, getDurationRule, createGroomingBooking } from '../../../src/services/supabase/groomingService';
import { calculateDeposit, requiresDeposit, formatDuration } from '../../../src/utils/groomingRules';
import { formatVND } from '../../../src/utils/format';
import BookingSummaryCard from '../../../src/components/booking/BookingSummaryCard';

const PAYMENT_METHODS = [
  { id: 'momo', label: 'MoMo', icon: Smartphone },
  { id: 'vnpay', label: 'VNPay', icon: Smartphone },
  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: Landmark },
];

export default function Step3_Payment({ booking, setBooking, onBack, onConfirmed, lock }) {
  const [phase, setPhase] = useState('review'); // review | processing | done | error
  const [service, setService] = useState(null);
  const [rule, setRule] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState(() => `PC-${Math.floor(10000 + Math.random() * 89999)}`);

  useEffect(() => {
    Promise.all([
      getGroomingServices().then((list) => list.find((s) => s.service_id === booking.serviceId)),
      getDurationRule(booking.serviceId, booking.species, booking.sizeId),
    ]).then(([svc, r]) => {
      setService(svc || null);
      setRule(r || null);
    });
  }, [booking.serviceId, booking.species, booking.sizeId]);

  const total = rule ? rule.base_price : 0;
  const needsDeposit = requiresDeposit(total);
  const depositAmount = calculateDeposit(total);
  const amountDue = needsDeposit ? depositAmount : total;

  const finalize = async () => {
    setSubmitError('');
    try {
      await createGroomingBooking({
        booking: { ...booking, durationMinutes: rule?.estimated_minutes },
        totalBill: total,
        orderId,
      });
      setPhase('done');
      onConfirmed?.();
    } catch (e) {
      console.error(e);
      setSubmitError(e.message || 'Có lỗi khi lưu đơn đặt lịch. Vui lòng thử lại.');
      setOrderId(`PC-${Math.floor(10000 + Math.random() * 89999)}`);
      setPhase('review');
    }
  };

  const handleConfirmNoDeposit = () => {
    setPhase('processing');
    finalize();
  };

  const handlePay = () => {
    if (!booking.paymentMethod) return;
    setPhase('processing');
    setTimeout(finalize, 1000); // giả lập thời gian xử lý cổng thanh toán
  };

  if (phase === 'done') {
    return (
      <SuccessScreen
        orderId={orderId}
        total={total}
        amountDue={amountDue}
        needsDeposit={needsDeposit}
        method={booking.paymentMethod}
        petName={booking.pet.name}
        serviceName={service?.service_name}
        groomer={booking.groomer}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-wood-bark">Payment</h2>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={16} /> {submitError}
          </div>
        )}

        {!needsDeposit ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <p className="text-wood-bark/80 text-sm leading-relaxed">
              Tổng hóa đơn <strong>{formatVND(total)}</strong> nhỏ hơn 1.000.000đ nên lịch hẹn sẽ được{' '}
              <strong>xác nhận ngay</strong> mà không cần đặt cọc.
            </p>
            <button
              onClick={handleConfirmNoDeposit}
              disabled={phase === 'processing'}
              className="self-start rounded-full bg-understory px-6 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {phase === 'processing' && <Loader2 size={16} className="animate-spin" />}
              Xác nhận đặt lịch
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-5">
            <p className="text-wood-bark/80 text-sm leading-relaxed">
              Tổng hóa đơn <strong>{formatVND(total)}</strong> (≥ 1.000.000đ) nên cần đặt cọc{' '}
              <strong>30% = {formatVND(depositAmount)}</strong>.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = booking.paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setBooking((prev) => ({ ...prev, paymentMethod: m.id }))}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${isSelected ? 'border-understory bg-fresh-grown/30' : 'border-wood-bark/15 hover:border-understory/50'}`}
                  >
                    <Icon size={18} className="text-understory" />
                    <span className="text-sm font-semibold text-wood-bark">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handlePay}
              disabled={!booking.paymentMethod || phase === 'processing'}
              className="self-start rounded-full bg-understory px-6 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {phase === 'processing' && <Loader2 size={16} className="animate-spin" />}
              {phase === 'processing' ? 'Đang xử lý...' : `Thanh toán cọc ${formatVND(depositAmount)}`}
            </button>
          </div>
        )}

        <button onClick={onBack} className="self-start text-sm font-semibold text-wood-bark/70 hover:text-understory">
          ← Back to Info
        </button>
      </div>

      <div className="w-full lg:w-[360px]">
        <BookingSummaryCard
          packageInfo={service ? { name: service.service_name, description: service.description } : null}
          petLabel={booking.pet.name}
          timeLabel={booking.time}
          durationLabel={rule ? formatDuration(rule.estimated_minutes) : undefined}
          breakdown={[{ label: service?.service_name || 'Dịch vụ', amount: total }]}
          total={total}
          deposit={needsDeposit ? depositAmount : 0}
          ctaLabel="Xem chi tiết đơn"
          ctaDisabled
          lock={lock}
        />
      </div>
    </div>
  );
}

function SuccessScreen({ orderId, total, amountDue, needsDeposit, method, petName, serviceName, groomer }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-understory text-white">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="text-3xl font-bold text-wood-bark">Đặt lịch thành công!</h2>
      <p className="text-wood-bark/60 max-w-md">
        Lịch hẹn Grooming/Spa cho <strong>{petName}</strong> đã được lưu vào hệ thống. Chi tiết xác nhận đã gửi qua SMS/Email.
      </p>
      <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-md mt-4 text-left flex flex-col gap-3">
        <Row label="Mã đơn" value={`#${orderId}`} />
        <Row label="Dịch vụ" value={serviceName} />
        {groomer && <Row label="Groomer" value={`${groomer.first_name} ${groomer.last_name}`} />}
        <Row label="Tổng hóa đơn" value={formatVND(total)} />
        <Row label={needsDeposit ? 'Đã đặt cọc' : 'Trạng thái'} value={needsDeposit ? formatVND(amountDue) : 'Đã xác nhận'} />
        {needsDeposit && (
          <Row label="Phương thức" value={method === 'bank_transfer' ? 'Chuyển khoản' : method === 'momo' ? 'MoMo' : 'VNPay'} />
        )}
      </div>
      <a href="/dich-vu-cham-soc" className="mt-4 rounded-full bg-understory px-8 py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors">
        Về trang Dịch vụ
      </a>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-wood-bark/60">{label}</span>
      <span className="font-semibold text-wood-bark">{value}</span>
    </div>
  );
}