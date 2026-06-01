import { createClient } from "@/utils/supabase/server";
import { createPlan } from "@/app/actions/coach";

export const revalidate = 0;

export default async function CoachSettingsPage() {
  const supabase = await createClient();

  // Fetch plans
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price_monthly", { ascending: true });

  // Fetch gym info
  const { data: gymInfo } = await supabase
    .from("gym_info")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Check Razorpay configuration
  const razorpayConfigured = !!(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
          Settings
        </h1>
        <p className="text-neutral-400 text-sm">
          Manage plans, gym info, and integrations
        </p>
      </header>

      {/* ─── Subscription Plans ─── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
          Subscription Plans
        </h2>

        {/* Add New Plan Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Create New Plan
          </h3>
          <form
            action={createPlan}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-1">
              <input
                type="text"
                name="name"
                placeholder="Plan Name (e.g. Pro)"
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-neutral-600"
              />
            </div>
            <div className="md:col-span-1">
              <input
                type="number"
                name="price"
                placeholder="Monthly Price (₹)"
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-neutral-600"
              />
            </div>
            <div className="md:col-span-1">
              <input
                type="text"
                name="description"
                placeholder="Short description"
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-neutral-600"
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
              >
                Add Plan
              </button>
            </div>
          </form>
        </div>

        {/* Existing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-2xl font-black text-red-500 my-2">
                ₹{plan.price_monthly}
              </p>
              <p className="text-sm text-neutral-400">{plan.description}</p>
            </div>
          ))}
          {(!plans || plans.length === 0) && (
            <div className="col-span-full text-neutral-500 text-sm">
              No plans created yet. Use the form above to add your first plan.
            </div>
          )}
        </div>
      </section>

      {/* ─── Gym Info ─── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
          Gym Information
        </h2>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          {gymInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="text-white font-medium">{gymInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-white font-medium">{gymInfo.phone}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Address
                </p>
                <p className="text-white font-medium">{gymInfo.address}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Hours
                </p>
                <p className="text-white font-medium">{gymInfo.hours}</p>
              </div>
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">
              No gym info configured. Add a record to the{" "}
              <code className="text-red-400 bg-neutral-950 px-1.5 py-0.5 rounded text-xs">
                gym_info
              </code>{" "}
              table in your Supabase dashboard.
            </div>
          )}
        </div>
      </section>

      {/* ─── Razorpay ─── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
          Razorpay Account
        </h2>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div
              className={`h-3 w-3 rounded-full ${
                razorpayConfigured ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-white font-medium">
              {razorpayConfigured
                ? "Razorpay is configured"
                : "Razorpay not configured"}
            </span>
          </div>
          <p className="text-neutral-500 text-sm mt-2">
            {razorpayConfigured
              ? "Your API keys are set. Payments are ready to process."
              : "Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file to enable payments."}
          </p>
        </div>
      </section>
    </div>
  );
}
