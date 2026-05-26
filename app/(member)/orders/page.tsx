import { createClient } from "@/utils/supabase/server";
import { Package, Clock, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, image_url)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 max-w-3xl mx-auto pb-24">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">Order History</h1>

      {(!orders || orders.length === 0) ? (
        <div className="text-center text-neutral-500 py-12">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              {/* Order Header */}
              <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
                <div>
                  <p className="text-neutral-500 text-xs font-mono mb-1">Order #{order.id.substring(0, 8)}</p>
                  <p className="text-white text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {order.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full font-bold">Pending</span>}
                  {order.status === 'paid' && <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full font-bold">Processing</span>}
                  {order.status === 'shipped' && <span className="bg-blue-500/20 text-blue-500 text-xs px-2 py-1 rounded-full font-bold">Shipped</span>}
                  <span className="text-lg font-black text-red-500 ml-4">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt={item.products.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-600 font-bold uppercase text-[8px] transform -rotate-45">GEAR</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.products?.name || 'Unknown Product'}</p>
                      <div className="text-xs text-neutral-400 mt-1 flex items-center space-x-2">
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}