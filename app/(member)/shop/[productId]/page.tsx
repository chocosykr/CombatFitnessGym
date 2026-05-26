"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/components/CartProvider";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  
  const { addItem } = useCart();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
        
      if (prodErr || !prodData) {
        toast.error("Product not found");
        router.push("/shop");
        return;
      }
      setProduct(prodData);

      const { data: invData } = await supabase
        .from("inventory")
        .select("*")
        .eq("product_id", productId);
        
      if (invData) {
        setInventory(invData);
        // Auto-select first available size
        const firstAvailable = invData.find(i => i.stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable.size);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1
    });
    
    toast.success("Added to cart");
    router.push("/cart");
  };

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading...</div>;
  if (!product) return null;

  const hasStock = inventory.some(i => i.stock > 0);

  return (
    <div className="bg-neutral-950 min-h-screen pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 pt-safe z-50 flex items-center justify-between">
        <button onClick={() => router.back()} className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white border border-white/10">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Product Image */}
      <div className="aspect-square w-full bg-neutral-900 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-neutral-800">
            <span className="text-neutral-600 font-bold uppercase tracking-widest text-4xl opacity-20 transform -rotate-45">COMBAT</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-6">
        <h1 className="text-3xl font-black uppercase text-white mb-2 leading-tight">{product.name}</h1>
        <p className="text-2xl font-bold text-red-500 mb-6">₹{product.price}</p>
        
        <p className="text-neutral-400 mb-8 leading-relaxed">
          {product.description || "Premium quality combat gear built for performance and durability. Tested by champions."}
        </p>

        {/* Size Selection */}
        {inventory.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Select Size</h3>
              <span className="text-neutral-500 text-sm">Size Guide</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {inventory.map((inv) => {
                const isAvailable = inv.stock > 0;
                const isSelected = selectedSize === inv.size;
                return (
                  <button
                    key={inv.size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(inv.size)}
                    className={`
                      py-3 rounded-lg font-bold text-sm transition-all
                      ${!isAvailable ? 'bg-neutral-900 text-neutral-600 border border-neutral-800 opacity-50 cursor-not-allowed line-through' : ''}
                      ${isAvailable && !isSelected ? 'bg-neutral-900 text-white border border-neutral-700 hover:border-neutral-500' : ''}
                      ${isSelected ? 'bg-red-600 text-white border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : ''}
                    `}
                  >
                    {inv.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-neutral-950 to-transparent border-t border-neutral-800/50 backdrop-blur-md">
        <button
          onClick={handleAddToCart}
          disabled={!hasStock || (inventory.length > 0 && !selectedSize)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {hasStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>
      </div>
    </div>
  );
}