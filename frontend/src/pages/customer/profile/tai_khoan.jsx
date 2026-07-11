import Head from 'next/head';
import MyProfilePage from '../../../features/profile/CustomerProfile';

export default function TaiKhoanPage() {
  return (
    <>
      <Head>
        <title>Hồ sơ của tôi | PawCare</title>
      </Head>
      <MyProfilePage />
    </>
  );
}