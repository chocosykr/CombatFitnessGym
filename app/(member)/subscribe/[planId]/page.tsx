"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import toast from "react-hot-toast";

export default function SubscribePage() {
  const { planId } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlan() {
      const { data } = await supabase.from("plans").select("*").eq("id", planId).single();
      if (data) {
        setPlan(data);
      } else {
        toast.error("Plan not found");
        router.push("/plans");
      }
      setLoading(false);
    }
    fetchPlan();
  }, [planId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load");
        setProcessing(false);
        return;
      }

      // 1. Create order
      const amountInPaise = Math.round(Number(plan.price_monthly) * 100);
      const { success, order, mock } = await createRazorpayOrder(amountInPaise, plan.id);

      if (!success) throw new Error("Could not create order");

      if (mock) {
        // Handle mock flow for development
        toast.success("MOCK: Payment successful!");
        // Manually trigger the subscription creation since we skip webhook
        const { data: { user } } = await supabase.auth.getUser();
        
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);
        
        await supabase.from("subscriptions").insert({
          user_id: user!.id,
          plan_id: plan.id,
          start_date: new Date().toISOString().split('T')[0],
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status: 'active'
        });
        
        await supabase.from("payments").update({ status: 'captured' }).eq('razorpay_order_id', order.id);
        
        router.push("/dashboard");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Combat Fitness",
        description: `Subscription to ${plan.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          toast.success("Payment successful! Processing...");
          // Wait for webhook or verify on client. We'll rely on webhook, but redirect user.
          router.push("/dashboard");
        },
        prefill: {
          name: "Member", // Could fetch from user profile
        },
        theme: {
          color: "#dc2626", // Red-600
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading plan details...</div>;
  if (!plan) return null;

  return (
    <div className="p-4 max-w-lg mx-auto mt-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-4">Checkout Summary</h1>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-neutral-400">Plan</span>
          <span className="text-lg font-semibold text-white">{plan.name}</span>
        </div>
        
        <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-6">
          <span className="text-neutral-400">Duration</span>
          <span className="text-white">1 Month</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-lg text-white font-bold">Total Pay</span>
          <span className="text-3xl font-black text-red-500">₹{plan.price_monthly}</span>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={processing}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}