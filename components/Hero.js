import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';
import { HERO_IMAGE } from '@/lib/constants';

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
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-cream/10 bg-navy-800">
            {HERO_IMAGE && (
              <Image src={HERO_IMAGE} alt="Mecca City Boutique shop" fill sizes="500px" className="object-cover" />
            )}
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
