import Head from 'next/head';
import GroomingBookingFlow from '../../../features/grooming/GroomingBookingFlow';

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