import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Search } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function ShopPage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div className="p-4 text-red-500">Failed to load shop inventory.</div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto pb-20">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Combat Gear</h1>
          <p className="text-neutral-400 text-sm">Apparel & Supplements</p>
        </div>
        <Link href="/cart" className="bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-neutral-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        </Link>
      </header>

      {/* Search Bar Placeholder */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <Link href={`/shop/${product.id}`} key={product.id} className="group">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all hover:border-red-600">
              <div className="aspect-square bg-neutral-800 relative flex justify-center items-center overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-neutral-600 font-bold uppercase tracking-widest text-xl opacity-20 transform -rotate-45">COMBAT</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                <p className="text-red-500 font-semibold mt-1">₹{product.price}</p>
              </div>
            </div>
          </Link>
        ))}

        {(!products || products.length === 0) && (
          <div className="col-span-full text-center text-neutral-500 py-12">
            No products available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}