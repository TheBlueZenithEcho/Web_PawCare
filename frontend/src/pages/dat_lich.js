import Head from 'next/head';
import GroomingBookingFlow from '../../src/features/grooming/GroomingBookingFlow';

export default function DatLichGroomingPage() {
  return (
    <>
      <Head>
        <title>Đặt lịch Grooming/Spa | PawCare</title>
      </Head>
      <GroomingBookingFlow />
    </>
  );
}