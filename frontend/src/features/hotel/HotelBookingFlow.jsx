import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import useSlotLock from '../../hooks/useSlotLock';
import Step1_RoomSelection from './Step1_RoomSelection';
import Step2_GuestDetails from './Step2_BookingDetails';
import Step3_Payment from './Step3_Payment';

const INITIAL_BOOKING = {
  roomId: '',
  checkIn: '',
  checkOut: '',
  paymentMethod: null,

  customer: {
    customerId: null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    isReturning: false,
  },

  // pet.* map trực tiếp cột bảng pet
  pet: {
    petId: null,
    name: '',
    species: 'dog',
    breed: '',
    weight: '',
    gender: 'male',
    ageYears: '',
    allergyNotes: '',
    behaviorNotes: '',
    specialNotes: '',
  },

  // Các field UI-only chưa có cột tương ứng trong schema hiện tại
  // (xem comment chi tiết trong Step2_GuestDetails.jsx và Step3_Payment.jsx)
  extra: {
    homeAddress: '',
    vaccinationUpToDate: true,
    medicalConditions: '',
    bringOwnFood: false,
    feedingSchedule: '',
    personalBelongings: [],
    walkingPreference: '',
    medicationSchedule: '',
    addonGrooming: false,
    addonDailyPhotos: false,
    addonWebcam: false,
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    emergencyAltPhone: '',
  },
};

export default function HotelBookingFlow() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(INITIAL_BOOKING);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // BR chung (qtnv_new §5.1.1): tạm khóa phòng 10 phút kể từ lúc chọn phòng.
  const lock = useSlotLock(Boolean(booking.roomId) && step < 3);

  useEffect(() => {
    if (lock.expired && step < 3) {
      setShowExpiredModal(true);
    }
  }, [lock.expired, step]);

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleExpiredConfirm = () => {
    setBooking((prev) => ({ ...prev, roomId: '' }));
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
          <Step1_RoomSelection booking={booking} setBooking={setBooking} onNext={goNext} lock={lock} />
        )}

        {step === 2 && (
          <Step2_GuestDetails
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
            <h3 className="text-lg font-bold text-wood-bark">Hết thời gian giữ phòng</h3>
            <p className="text-sm text-wood-bark/60">
              Bạn đã vượt quá 10 phút giữ phòng. Hệ thống đã giải phóng phòng này, vui lòng chọn lại.
            </p>
            <button
              onClick={handleExpiredConfirm}
              className="rounded-full bg-understory py-3 text-sm font-bold text-white hover:bg-wood-bark transition-colors"
            >
              Chọn lại phòng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}