import Link from 'next/link';
import { SHOP_NAME, SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export default function Footer() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <footer className="mt-24 bg-navy text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-display text-2xl font-bold">
            Mecca <span className="text-electric-400">City</span> <span className="text-emerald">Boutique</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-navy-200">
            Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners — dressed with a Chuka attitude.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-navy-200">
            <li><Link href="/shop" className="hover:text-cream">Shop</Link></li>
            <li><Link href="/categories" className="hover:text-cream">Categories</Link></li>
            <li><Link href="/about" className="hover:text-cream">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Visit Us</p>
          <ul className="mt-4 space-y-2 text-sm text-navy-200">
            <li>{SHOP_LOCATION}</li>
            {SHOP_PHONES.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Order Fast</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-navy-600 px-5 py-5 text-center text-xs text-navy-300 md:px-8">
        &copy; {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
