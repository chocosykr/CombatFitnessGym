import { createClient } from "@/utils/supabase/server";
import { createPlan } from "@/app/actions/coach";

export const revalidate = 0;

export default async function CoachPlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Plans</h1>
        <p className="text-neutral-400 text-sm">Manage subscription tiers</p>
      </header>

      {/* Add New Plan Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Create New Plan</h2>
        <form action={createPlan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input type="text" name="name" placeholder="Plan Name (e.g. Pro)" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="md:col-span-1">
            <input type="number" name="price" placeholder="Monthly Price (₹)" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="md:col-span-1">
            <input type="text" name="description" placeholder="Short description" required className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Add Plan
            </button>
          </div>
        </form>
      </div>

      {/* Existing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans?.map((plan) => (
          <div key={plan.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="text-2xl font-black text-red-500 my-2">₹{plan.price_monthly}</p>
            <p className="text-sm text-neutral-400">{plan.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}