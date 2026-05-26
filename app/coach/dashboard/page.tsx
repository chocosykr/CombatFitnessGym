import { createClient } from "@/utils/supabase/server";
import { Users, AlertTriangle, TrendingUp, Package } from "lucide-react";

export const revalidate = 0;

export default async function CoachDashboard() {
  const supabase = await createClient();

  // Fetch all users
  const { count: totalMembers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member');

  // Fetch active subscriptions
  const { count: activeSubs } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
    
  // Fetch overdue subscriptions
  const { count: overdueSubs } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'overdue');

  // Fetch recent payments for revenue (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'captured')
    .gte('created_at', thirtyDaysAgo.toISOString());
    
  const monthlyRevenue = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Fetch pending orders
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['paid', 'pending']);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Gym Overview</h1>
        <p className="text-neutral-400">Welcome back, Coach.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-neutral-800 rounded-lg text-neutral-300">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">{totalMembers || 0}</h3>
          <p className="text-neutral-400 text-sm">Total Members</p>
        </div>

        {/* Active vs Overdue */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-900/30 text-red-500 rounded-lg">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mb-1">
            <h3 className="text-3xl font-black text-green-500">{activeSubs || 0}</h3>
            <span className="text-neutral-500">/</span>
            <h3 className="text-xl font-bold text-red-500">{overdueSubs || 0}</h3>
          </div>
          <p className="text-neutral-400 text-sm">Active / Overdue Subs</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-900/30 text-green-500 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">₹{monthlyRevenue}</h3>
          <p className="text-neutral-400 text-sm">30-Day Revenue</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-900/30 text-blue-500 rounded-lg">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">{pendingOrders || 0}</h3>
          <p className="text-neutral-400 text-sm">Pending Shop Orders</p>
        </div>
      </div>
    </div>
  );
}