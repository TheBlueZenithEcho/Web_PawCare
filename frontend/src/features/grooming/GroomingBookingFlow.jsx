import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import useSlotLock from '../../hooks/useSlotLock';
import Step1_ServiceSelection from './Step1_ServiceSelection';
import Step2_CustomerDetails from './Step2_CustomerDetails';
import Step3_Payment from './Step3_Payment';

// Shape khớp trực tiếp bảng customer/pet/service/booking trong Supabase
// (xem utils/buildGroomingBookingPayload.js để biết cách map sang payload insert).
const INITIAL_BOOKING = {
  species: 'dog', // pet.species
  sizeId: '', // pet.size
  serviceId: '', // service.service_id
  date: '',
  time: '',
  groomer: null, // staff (role='groomer') được hệ thống tự gán cho slot
  table: null, // grooming_table được hệ thống tự gán cho slot
  paymentMethod: null, // booking_payment.method
  customer: {
    customerId: null, // customer.customer_id (null nếu là khách mới)
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    isReturning: false,
  },
  pet: {
    petId: null, // pet.pet_id (null nếu là pet mới)
    name: '', // pet.pet_name
    breed: '',
    weight: '',
    allergyNotes: '',
    behaviorNotes: '',
    specialNotes: '',
  },
};

export default function GroomingBookingFlow() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(INITIAL_BOOKING);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // BR (qtnv_new §5.1.1): tạm khóa slot 10 phút kể từ lúc khách chọn giờ.
  // Hook chỉ chạy đếm ngược khi đã có booking.time.
  const lock = useSlotLock(Boolean(booking.time) && step < 3 || (step === 3 && !booking.time));

  useEffect(() => {
    if (lock.expired && step < 3) {
      setShowExpiredModal(true);
    }
  }, [lock.expired, step]);

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleExpiredConfirm = () => {
    // BR: hết 10 phút -> giải phóng slot, đưa khách về bước chọn lại.
    setBooking((prev) => ({ ...prev, date: '', time: '' }));
    lock.reset();
    setStep(1);
    setShowExpiredModal(false);
  };

  const handleConfirmed = () => {
    lock.reset();
  };

  return (
    <div className="min-h-screen bg-[#F7F8E3] flex flex-col">
      <Header cartCount={0} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <BookingStepper currentStep={step} />

        {step === 1 && (
          <Step1_ServiceSelection
            booking={booking}
            setBooking={setBooking}
            onNext={goNext}
            lock={lock}
          />
        )}

        {step === 2 && (
          <Step2_CustomerDetails
            booking={booking}
            setBooking={setBooking}
            onNext={goNext}
            onBack={goBack}
            lock={lock}
          />
        )}

        {step === 3 && (
          <Step3_Payment
            booking={booking}
            setBooking={setBooking}
            onBack={goBack}
            onConfirmed={handleConfirmed}
            lock={lock}
          />
        )}
      </main>

      <Footer />

      {showExpiredModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center flex flex-col gap-4">
            <h3 className="text-lg font-bold text-wood-bark">Hết thời gian giữ chỗ</h3>
            <p className="text-sm text-wood-bark/60">
              Bạn đã vượt quá 10 phút giữ slot. Hệ thống đã giải phóng chỗ này, vui lòng chọn lại
              ngày giờ mong muốn.
            </p>
            <button
              onClick={handleExpiredConfirm}
              className="rounded-full bg-understory py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors"
            >
              Chọn lại lịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}