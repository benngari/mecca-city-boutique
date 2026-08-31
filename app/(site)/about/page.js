import Link from 'next/link';
import { SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'About Us',
  description: 'The story behind Mecca City Boutique in Ndagani, Chuka.',
};

export default function AboutPage() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Our story</p>
      <h1 className="font-display text-4xl font-bold text-navy dark:text-cream">About Mecca City Boutique</h1>

      <div className="mt-8 space-y-5 text-navy-600 dark:text-navy-200">
        <p>
          Mecca City Boutique started in Ndagani, Chuka, with a simple idea: dress the town well
          without the wait or the guesswork. What began as a small clothing rack has grown into a
          go-to stop for dresses, skirts, ladies tops, jerseys, cocktail perfumes and fresheners -
          picked piece by piece rather than ordered in bulk and hoped for.
        </p>
        <p>
          We know fashion in Chuka moves fast, from wedding season wine dresses to matchday jerseys,
          so we keep the catalogue changing and the WhatsApp line open. If you see it, you can have
          it - usually the same day.
        </p>
        <p>
          Every product on this site is something we'd genuinely wear or gift. That's the only
          filter we use when deciding what makes it onto the shelf.
        </p>
      </div>

      <div className="tag-divider my-10 text-navy-100 dark:text-navy-700" />

      <div className="grid gap-6 rounded-2xl border border-navy-100 bg-white p-8 dark:border-navy-700 dark:bg-navy-800 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Find us</p>
          <p className="mt-2 font-display text-lg font-semibold text-navy dark:text-cream">{SHOP_LOCATION}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Call or WhatsApp</p>
          {SHOP_PHONES.map((phone) => (
            <p key={phone} className="mt-1 text-navy-600 dark:text-navy-200">{phone}</p>
          ))}
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
