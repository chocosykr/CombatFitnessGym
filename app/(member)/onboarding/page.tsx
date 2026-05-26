"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Not authenticated");
        router.push("/");
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (error) {
        // If row doesn't exist, maybe we should insert? 
        // Supabase creates the auth.user but not the public.users record automatically unless there's a trigger.
        // Let's assume we use an upsert instead.
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({ id: user.id, phone: user.phone, name: name.trim() });
            
        if (upsertError) throw upsertError;
      }

      toast.success("Welcome, " + name + "!");
      router.push("/plans");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-6 text-neutral-50">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-red-600 mb-2">Welcome</h1>
          <p className="text-neutral-400">What should we call you?</p>
        </div>

        <form onSubmit={handleSaveName} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-neutral-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}