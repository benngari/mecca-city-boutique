import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Add Product</h1>
      <p className="mt-1 text-sm text-navy-400">Create a new product listing.</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
