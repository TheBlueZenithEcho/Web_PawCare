import Header from './Header';
import Footer from './Footer';

export default function CusLayout({ children, activePath }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header activePath={activePath} />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
