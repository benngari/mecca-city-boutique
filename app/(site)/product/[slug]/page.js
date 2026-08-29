export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductGrid from '@/components/ProductGrid';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';
import { CATEGORIES } from '@/lib/constants';

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelated(category, excludeId) {
  await connectDB();
  const related = await Product.find({ category, _id: { $ne: excludeId } }).limit(4).lean();
  return JSON.parse(JSON.stringify(related));
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = await getRelated(product.category, product._id);
  const waHref = buildWhatsAppLink(productWhatsAppMessage(product.name));
  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name || product.category;
  const soldOut = product.stockStatus === 'sold_out';

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy-50">
            {product.images?.[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-navy-300">No image</div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-xl bg-navy-50">
                  <Image src={img.url} alt={product.name} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-electric-600">{categoryName}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
                <span className="text-lg text-navy-300 line-through">KSh {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-navy">KSh {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold">
            {soldOut ? (
              <span className="text-red-600">Sold Out</span>
            ) : product.stockStatus === 'low_stock' ? (
              <span className="text-gold">Low Stock — order soon</span>
            ) : (
              <span className="text-emerald">In Stock</span>
            )}
          </p>

          <div className="tag-divider my-6 text-navy-100" />

          <p className="whitespace-pre-line text-navy-500">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Available sizes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size} className="rounded-full border border-navy-200 px-3 py-1 text-sm text-navy">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-emerald px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald/90"
            >
              {soldOut ? 'Ask About Restock on WhatsApp' : 'Order on WhatsApp'}
            </a>
          </div>

          <p className="mt-3 text-xs text-navy-400">SKU: {product.sku}</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold text-navy">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
