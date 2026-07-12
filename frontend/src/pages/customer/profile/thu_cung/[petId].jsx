import Head from 'next/head';
import PetDetailPage from '../../../../features/profile/PetDetailPage';

export default function PetDetailRoute() {
  return (
    <>
      <Head>
        <title>Hồ sơ thú cưng | PawCare</title>
      </Head>
      <PetDetailPage />
    </>
  );
}