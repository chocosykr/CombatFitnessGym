"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // MOCK MODE: Bypass real SMS
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // MOCK MODE: Hardcoded OTP check
    if (otp === "123456") {
      // Set mock cookie
      document.cookie = `mock_user_phone=${phone}; path=/; max-age=86400`;
      
      const isCoach = phone === process.env.NEXT_PUBLIC_COACH_PHONE_NUMBER;
      if (isCoach) {
        router.push("/coach/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid OTP. Use 123456 for testing.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-6 text-neutral-50 relative">
      {/* DEVELOPMENT WARNING */}
      <div className="absolute top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-bold text-sm tracking-widest z-50">
        DEVELOPMENT MODE - TESTING ONLY (MOCK OTP: 123456)
      </div>

      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-800 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-red-600 mb-2">Combat Fitness</h1>
          <p className="text-neutral-400">Log in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-neutral-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-300 mb-1">
                One-Time Password
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white text-center tracking-widest text-lg placeholder-neutral-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-neutral-400 hover:text-white text-sm py-2"
            >
              Back to Phone Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
