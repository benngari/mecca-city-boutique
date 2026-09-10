export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductGrid from '@/components/ProductGrid';
import ProductOrderPanel from '@/components/ProductOrderPanel';
import ImageZoom from '@/components/ImageZoom';
import CompleteTheLook from '@/components/CompleteTheLook';
import { shimmerDataUrl } from '@/lib/shimmer';
import { CATEGORIES } from '@/lib/constants';

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

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

async function getBundleItems(bundleId, excludeId) {
  if (!bundleId) return [];
  await connectDB();
  const items = await Product.find({ bundleId, _id: { $ne: excludeId }, deletedAt: null }).lean();
  return JSON.parse(JSON.stringify(items));
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

  const [related, bundleItems] = await Promise.all([
    getRelated(product.category, product._id),
    getBundleItems(product.bundleId, product._id),
  ]);

  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name || product.category;
  const soldOut = product.stockStatus === 'sold_out';
  const isNew = product.createdAt && Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_MS;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 pb-24 md:px-8 md:pb-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <ImageZoom src={product.images?.[0]?.url} alt={product.name}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy-50 dark:bg-navy-800">
              {product.images?.[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(600, 750)}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-navy-300 dark:text-navy-400">No image</div>
              )}

              {isNew && !soldOut && (
                <span className="absolute left-3 top-3 rounded-full bg-electric px-3 py-1 text-xs font-bold text-navy-900">
                  New
                </span>
              )}
            </div>
          </ImageZoom>

          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <ImageZoom key={img.publicId} src={img.url} alt={product.name}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-navy-50 dark:bg-navy-800">
                    <Image
                      src={img.url}
                      alt={product.name}
                      fill
                      sizes="120px"
                      placeholder="blur"
                      blurDataURL={shimmerDataUrl(150, 150)}
                      className="object-cover"
                    />
                  </div>
                </ImageZoom>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-electric-600 dark:text-electric-400">{categoryName}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
                <span className="text-lg text-navy-300 line-through dark:text-navy-400">KSh {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-navy dark:text-cream">KSh {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold">
            {soldOut ? (
              <span className="text-red-600 dark:text-red-400">Sold Out</span>
            ) : product.stockStatus === 'low_stock' ? (
              <span className="text-gold">Low Stock - order soon</span>
            ) : (
              <span className="text-emerald">In Stock</span>
            )}
          </p>

          <div className="tag-divider my-6 text-navy-100 dark:text-navy-700" />

          <p className="whitespace-pre-line text-navy-500 dark:text-navy-200">{product.description}</p>

          <ProductOrderPanel
            productId={product._id}
            productName={product.name}
            sizes={product.sizes || []}
            soldOut={soldOut}
            sku={product.sku}
            imageUrl={product.images?.[0]?.url}
            price={product.discountPrice || product.price}
          />

          <p className="mt-3 text-xs text-navy-400 dark:text-navy-400">SKU: {product.sku}</p>

          <CompleteTheLook mainProduct={product} items={bundleItems} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold text-navy dark:text-cream">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
