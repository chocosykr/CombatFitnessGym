"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Crown, CalendarDays, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({ ...userProfile, email: user.email });

      // Fetch active subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .in("status", ["active", "overdue"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(sub);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24 animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
        <div className="h-32 bg-neutral-800 rounded-2xl"></div>
        <div className="h-24 bg-neutral-800 rounded-2xl"></div>
        <div className="h-24 bg-neutral-800 rounded-2xl"></div>
      </div>
    );
  }

  const daysRemaining = subscription
    ? Math.ceil((new Date(subscription.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Profile</h1>
        <p className="text-neutral-400 text-sm">Account & subscription</p>
      </header>

      {/* User Info Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xl font-black">
            {profile?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.name || "Member"}</h2>
            <div className="flex items-center text-neutral-400 text-sm">
              <Mail size={14} className="mr-1.5" />
              {profile?.email || "No email"}
            </div>
          </div>
        </div>
        <div className="flex items-center text-neutral-500 text-xs">
          <Shield size={12} className="mr-1.5" />
          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Subscription</h3>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown size={20} className="text-red-500" />
                  <span className="text-white font-bold">{subscription.plans?.name}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${daysRemaining > 0 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {daysRemaining > 0 ? "Active" : "Overdue"}
                </span>
              </div>
              <div className="flex items-center text-neutral-400 text-sm">
                <CalendarDays size={14} className="mr-1.5" />
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : "Subscription expired"}
              </div>
              <div className="text-neutral-500 text-xs">
                Next due: {new Date(subscription.next_due_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          ) : (
            <div className="text-neutral-500">No active subscription</div>
          )}
        </div>
        <Link
          href="/plans"
          className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-t border-neutral-800 text-neutral-300 hover:text-white transition-colors"
        >
          <span className="text-sm font-medium">{subscription ? "Renew or Change Plan" : "View Available Plans"}</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full flex items-center justify-center space-x-2 bg-neutral-900 border border-neutral-800 hover:border-red-600 text-red-500 hover:text-red-400 font-semibold py-4 px-4 rounded-2xl transition-colors disabled:opacity-50"
      >
        <LogOut size={18} />
        <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
      </button>
    </div>
  );
}
