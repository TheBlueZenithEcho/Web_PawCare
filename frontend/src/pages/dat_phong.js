import Head from 'next/head';
import HotelBookingFlow from '../features/hotel/HotelBookingFlow';

export default function DatPhongHotelPage() {
  return (
    <>
      <Head>
        <title>Đặt phòng Pet Hotel | PawCare</title>
      </Head>
      <HotelBookingFlow />
    </>
  );
}