import Head from 'next/head';
import MyPetsPage from '../../../features/profile/PetProfile';

export default function ThuCungPage() {
  return (
    <>
      <Head>
        <title>Thú cưng của tôi | PawCare</title>
      </Head>
      <MyPetsPage />
    </>
  );
}