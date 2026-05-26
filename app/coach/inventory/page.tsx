import { createClient } from "@/utils/supabase/server";
import { createProduct } from "@/app/actions/coach";

export const revalidate = 0;

export default async function CoachInventoryPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, inventory(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Inventory</h1>
        <p className="text-neutral-400 text-sm">Manage shop products and stock</p>
      </header>

      {/* Add New Product Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add New Product</h2>
        <form action={createProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <input type="text" name="name" placeholder="Product Name" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="lg:col-span-1">
            <input type="number" name="price" placeholder="Price (₹)" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="lg:col-span-1">
            <input type="text" name="image_url" placeholder="Image URL (optional)" className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="lg:col-span-1">
            <input type="text" name="description" placeholder="Description" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="lg:col-span-1">
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Existing Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                 {product.image_url && <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />}
              </div>
              <div>
                <h3 className="font-bold text-white">{product.name}</h3>
                <p className="text-red-500 font-semibold">₹{product.price}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-auto">
              {product.inventory?.map((inv: any) => (
                <div key={inv.id} className={`text-center py-2 rounded border ${inv.stock > 0 ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-red-900/20 border-red-900/50 text-red-500'}`}>
                  <div className="text-xs font-bold">{inv.size}</div>
                  <div className="text-xs">{inv.stock}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}