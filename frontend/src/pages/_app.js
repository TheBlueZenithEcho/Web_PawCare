import "@/styles/globals.css";
import { Toaster } from "sonner";
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

