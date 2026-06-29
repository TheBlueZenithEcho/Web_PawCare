import "@/styles/globals.css";
import { Toaster } from "sonner";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <Component {...pageProps} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
