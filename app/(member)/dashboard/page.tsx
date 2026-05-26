import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, CreditCard, Activity, QrCode } from "lucide-react";

export const revalidate = 0; // Don't cache the dashboard

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // If no name, force onboarding
  if (!profile?.name) {
    redirect("/onboarding");
  }

  // Fetch active subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .in("status", ["active", "overdue"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let daysRemaining = 0;
  if (sub) {
    const due = new Date(sub.next_due_date);
    const now = new Date();
    daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hello, {profile.name}</h1>
        <p className="text-neutral-400">Welcome back to Combat Fitness</p>
      </header>

      {/* ID Card / Access Pass */}
      <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-white">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-6 w-6" />
              <span className="font-black tracking-widest uppercase text-sm">Combat Fitness</span>
            </div>
            
            {sub ? (
              <>
                <p className="text-red-100 text-sm font-medium mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold mb-4">{sub.plans.name}</h2>
                <div className="flex items-center space-x-2 bg-black/20 rounded-full px-3 py-1 w-max backdrop-blur-sm border border-white/10">
                  <div className={`h-2 w-2 rounded-full ${daysRemaining > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-sm font-medium">
                    {daysRemaining > 0 ? 'Active' : 'Overdue'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">No Active Plan</h2>
                <a href="/plans" className="inline-block bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm">
                  View Plans
                </a>
              </>
            )}
          </div>

          {/* QR Code Placeholder for Gym Entry */}
          <div className="mt-6 md:mt-0 bg-white p-3 rounded-xl shadow-inner flex flex-col items-center">
            <QrCode className="h-24 w-24 text-neutral-900" />
            <span className="text-neutral-900 text-[10px] font-mono mt-2 font-bold tracking-widest">{user.id.substring(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      {sub && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col">
            <div className="text-neutral-400 mb-2 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" /> Days Left
            </div>
            <div className="text-2xl font-bold text-white">
              {daysRemaining > 0 ? daysRemaining : 0}
            </div>
            {daysRemaining <= 5 && daysRemaining > 0 && (
              <div className="text-xs text-red-400 mt-1">Renews soon!</div>
            )}
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col">
            <div className="text-neutral-400 mb-2 flex items-center text-sm">
              <CreditCard className="h-4 w-4 mr-2" /> Next Due
            </div>
            <div className="text-lg font-bold text-white">
              {new Date(sub.next_due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}