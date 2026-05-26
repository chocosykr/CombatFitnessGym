import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Check } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_monthly", { ascending: true });

  if (error) {
    console.error(error);
    return <div className="p-4 text-red-500">Failed to load plans.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Membership Plans</h1>
        <p className="text-neutral-400">Choose the plan that fits your goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div key={plan.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-black text-red-500">₹{plan.price_monthly}</span>
              <span className="text-neutral-500 ml-1">/month</span>
            </div>
            
            <div className="text-neutral-400 text-sm mb-6 flex-grow">
              {plan.description || "Everything you need to get started with your fitness journey."}
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {/* Mocking features since they aren't in the schema, but makes it look nice */}
              <li className="flex items-start text-sm text-neutral-300">
                <Check className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                <span>Full gym access</span>
              </li>
              <li className="flex items-start text-sm text-neutral-300">
                <Check className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                <span>Locker room access</span>
              </li>
              {Number(plan.price_monthly) > 2000 && (
                <li className="flex items-start text-sm text-neutral-300">
                  <Check className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                  <span>Group classes included</span>
                </li>
              )}
            </ul>

            <Link
              href={`/subscribe/${plan.id}`}
              className="w-full bg-neutral-800 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center block"
            >
              Select Plan
            </Link>
          </div>
        ))}

        {(!plans || plans.length === 0) && (
          <div className="col-span-full text-center text-neutral-500 py-12">
            No plans available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}