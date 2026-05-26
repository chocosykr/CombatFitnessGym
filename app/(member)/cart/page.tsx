"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { createShopOrder } from "@/app/actions/razorpay";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load");

      const amountInPaise = Math.round(total * 100);
      const { success, order, mock } = await createShopOrder(amountInPaise);

      if (!success) throw new Error("Could not create order");

      if (mock) {
        toast.success("MOCK: Payment successful!");
        await handleSuccessfulPayment(order.id);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Combat Fitness Shop",
        description: `Order of ${items.length} items`,
        order_id: order.id,
        handler: async function (response: any) {
          toast.success("Payment successful! Processing order...");
          await handleSuccessfulPayment(order.id);
        },
        theme: { color: "#dc2626" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessfulPayment = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Create Order record
    const { data: dbOrder, error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: total,
      status: "paid"
    }).select().single();

    if (orderErr) {
      console.error(orderErr);
      return;
    }

    // 2. Create Order Items and decrement inventory
    for (const item of items) {
      await supabase.from("order_items").insert({
        order_id: dbOrder.id,
        product_id: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      });
      
      // Call a postgres function or just decrement (mocking decrement logic here)
      const { data: currentInv } = await supabase
        .from("inventory")
        .select("stock")
        .eq("product_id", item.productId)
        .eq("size", item.size)
        .single();
        
      if (currentInv) {
        await supabase
          .from("inventory")
          .update({ stock: Math.max(0, currentInv.stock - item.quantity) })
          .eq("product_id", item.productId)
          .eq("size", item.size);
      }
    }

    await supabase.from("payments").update({ status: 'captured', reference_id: dbOrder.id }).eq('razorpay_order_id', orderId);

    clearCart();
    router.push("/orders");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <ShoppingCart className="h-16 w-16 text-neutral-800 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-neutral-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => router.push("/shop")} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-32">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">Your Cart</h1>
      
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">{item.name}</h3>
              <p className="text-neutral-500 text-xs mt-1">Size: {item.size}</p>
              <p className="text-red-500 font-semibold mt-1">₹{item.price}</p>
            </div>
            
            <div className="flex items-center space-x-3 bg-neutral-950 rounded-lg p-1 border border-neutral-800 ml-4">
              <button 
                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                className="p-1 hover:text-white text-neutral-400"
              >
                <Minus size={16} />
              </button>
              <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                className="p-1 hover:text-white text-neutral-400"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              onClick={() => removeItem(item.productId, item.size)}
              className="ml-4 p-2 text-neutral-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-[4.5rem] md:bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 pb-safe z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-neutral-400 text-sm">Total</p>
            <p className="text-2xl font-black text-white">₹{total}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50"
          >
            {processing ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}