import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';
import { LOGO_URL } from '@/lib/constants';

export default function Hero() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <section className="relative overflow-hidden bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-electric/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
        <div className="animate-fadeUp">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-electric-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Ndagani, Chuka
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
            Dress the city.
            <br />
            <span className="text-electric-400">Wear</span> the <span className="text-emerald">boutique</span>.
          </h1>
          <p className="mt-6 max-w-md text-base text-navy-100">
            Curated dresses, skirts, jerseys, cocktail perfumes and more - hand-picked in Chuka,
            delivered with a message away on WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-electric px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-electric/30 transition-transform hover:-translate-y-0.5"
            >
              Shop Now
            </Link>
            <Link
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-emerald hover:text-emerald"
            >
              Order on WhatsApp
            </Link>
          </div>
        </div>

        <div className="relative animate-fadeUp [animation-delay:150ms]">
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
            <div className="col-span-2 flex h-40 items-center justify-center rounded-2xl border border-cream/10 bg-gradient-to-br from-electric/20 to-transparent p-6 text-center">
              <Image src={LOGO_URL} alt="Mecca City Boutique logo" width={120} height={120} className="h-24 w-24 object-contain" />
            </div>
            <div className="h-32 rounded-2xl bg-emerald/20" />
            <div className="h-32 rounded-2xl bg-electric/20" />
          </div>
          <div className="mt-4 rounded-2xl border border-cream/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-navy-200">Also stocking</p>
            <p className="mt-1 font-display text-lg text-cream">Cocktail Perfumes &amp; Fresheners</p>
          </div>
        </div>
      </div>

      <div className="tag-divider text-electric/40" />
    </section>
  );
}
