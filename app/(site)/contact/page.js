import { SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Mecca City Boutique in Ndagani, Chuka — call, WhatsApp, or visit us.',
};

export default function ContactPage() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Get in touch</p>
      <h1 className="font-display text-4xl font-bold text-navy">Contact Us</h1>
      <p className="mt-3 max-w-lg text-navy-500">
        The fastest way to reach us is WhatsApp — most orders get a reply within minutes.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600">Location</p>
          <p className="mt-2 font-display text-xl font-semibold text-navy">{SHOP_LOCATION}</p>
          <p className="mt-2 text-sm text-navy-500">Open daily, closes 9pm.</p>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600">Phone / WhatsApp</p>
          {SHOP_PHONES.map((phone) => (
            <p key={phone} className="mt-2 font-display text-xl font-semibold text-navy">{phone}</p>
          ))}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-navy-100">
        <iframe
          title="Mecca City Boutique location"
          src="https://www.google.com/maps?q=Mecca+City+Boutique+Ndagani+Chuka&output=embed"
          className="h-80 w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
