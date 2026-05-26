import { createClient } from "@/utils/supabase/server";
import { markOrderShipped } from "@/app/actions/coach";
import { CheckCircle, Truck } from "lucide-react";

export const revalidate = 0;

export default async function CoachOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users (name, phone),
      order_items (
        *,
        products (name)
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Orders</h1>
          <p className="text-neutral-400 text-sm">Fulfill shop orders</p>
        </div>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4">Order ID</th>
                <th scope="col" className="px-6 py-4">Customer</th>
                <th scope="col" className="px-6 py-4">Items</th>
                <th scope="col" className="px-6 py-4">Total</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{order.id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{order.users?.name}</div>
                    <div className="text-xs">{order.users?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] truncate">
                      {order.order_items.map((i: any) => `${i.quantity}x ${i.products?.name} (${i.size})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">₹{order.total_amount}</td>
                  <td className="px-6 py-4">
                    {order.status === 'pending' && <span className="text-yellow-500 font-bold">Pending</span>}
                    {order.status === 'paid' && <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Paid / Processing</span>}
                    {order.status === 'shipped' && <span className="text-blue-500 font-bold">Shipped</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === 'paid' && (
                      <form action={async () => {
                        "use server";
                        await markOrderShipped(order.id);
                      }}>
                        <button
                          type="submit"
                          title="Mark as Shipped"
                          className="text-neutral-500 hover:text-blue-500 transition-colors bg-neutral-950 p-2 rounded-lg border border-neutral-800 hover:border-blue-500"
                        >
                          <Truck size={18} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}