import Head from 'next/head';
// Đảm bảo đường dẫn này trỏ đúng vào thư mục features của bạn
import BookingHistoryPage from '../../../features/profile/BookingHistory';

export default function LichSuDatPage() {
  return (
    <>
      <Head>
        <title>Lịch sử đặt lịch | PawCare</title>
      </Head>
      <BookingHistoryPage />
    </>
  );
}