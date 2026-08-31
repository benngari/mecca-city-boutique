import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import { SHOP_NAME, LOGO_URL } from '@/lib/constants';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meccacityboutique.co.ke';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SHOP_NAME} â€” Fashion & Lifestyle, Chuka`,
    template: `%s | ${SHOP_NAME}`,
  },
  description:
    'Mecca City Boutique in Ndagani, Chuka â€” dresses, skirts, ladies tops, jerseys, cocktail perfumes and fresheners. Order easily on WhatsApp.',
  keywords: [
    'Mecca City Boutique',
    'Chuka boutique',
    'Kenyan fashion',
    'ladies dresses Chuka',
    'jerseys Kenya',
    'cocktail perfumes Kenya',
  ],
  openGraph: {
    title: `${SHOP_NAME} â€” Fashion & Lifestyle, Chuka`,
    description:
      'Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners â€” order on WhatsApp for fast delivery around Chuka.',
    url: siteUrl,
    siteName: SHOP_NAME,
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SHOP_NAME} â€” Fashion & Lifestyle, Chuka`,
    description: 'Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners in Chuka, Kenya.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('mcb-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
