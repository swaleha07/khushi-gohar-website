import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { LogoLoader } from '@/components/common/LogoLoader';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Header } from '@/components/common/Header';
import { SearchModal } from '@/components/common/SearchModal';
import { CartDrawer } from '@/components/common/CartDrawer';
import { Footer } from '@/components/common/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Khushi & Gohar | Extra Whitening Cream & Luxury Skincare',
    template: '%s | Khushi & Gohar',
  },
  description:
    'Official store of Khushi & Gohar (Khushi Whitening Cream). 100% authentic whitening creams, night creams, face wash, and combos with Free Delivery across India.',
  keywords: [
    'Khushi Whitening Cream',
    'Khushi and Gohar',
    'The King Night Cream',
    'Extra Whitening Combo',
    'Bridal Night Cream',
    'Coffee Whitening Set',
    'Indian beauty ecommerce',
  ],
  authors: [{ name: 'Khushi & Gohar' }],
  creator: 'Khushi & Gohar',
  metadataBase: new URL('https://khushigohar.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://khushigohar.com',
    siteName: 'Khushi & Gohar',
    title: 'Khushi & Gohar | Luxury Whitening Cream & Skincare',
    description: 'Transform your skin with authentic 7-day visible glow creams and herbal formulations.',
    images: [
      {
        url: '/images/brand/kg_logo.jpg',
        width: 800,
        height: 800,
        alt: 'Khushi & Gohar Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#F8D7E3] selection:text-[#3A3034]">
        <StoreProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthProvider>
                <LogoLoader />
                <AnnouncementBar />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <SearchModal />
                <CartDrawer />
                <AuthModal />
              </AuthProvider>
            </WishlistProvider>
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
