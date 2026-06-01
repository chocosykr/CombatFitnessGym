"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CreditCard, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";

export default function CoachPaymentsPage() {
  const [payments, setPayments] = useState<any[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPayments() {
      const { data } = await supabase
        .from("payments")
        .select(`
          *,
          users (name, email)
        `)
        .order("created_at", { ascending: false });
      setPayments(data);
    }
    fetchPayments();
  }, []);

  const handleExportCSV = () => {
    if (!payments || payments.length === 0) return;

    const headers = ["Transaction ID", "Date", "Customer", "Email", "Type", "Amount", "Status"];
    const rows = payments.map((p) => [
      p.razorpay_payment_id || p.razorpay_order_id || p.id.substring(0, 8),
      new Date(p.created_at).toLocaleString("en-IN"),
      p.users?.name || "Unknown",
      p.users?.email || "",
      p.payment_type || "",
      p.amount,
      p.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Payments
          </h1>
          <p className="text-neutral-400 text-sm">Full transaction ledger</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!payments || payments.length === 0}
          className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 hover:border-red-600 text-neutral-300 hover:text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4">Transaction ID</th>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4">Customer</th>
                <th scope="col" className="px-6 py-4">Type</th>
                <th scope="col" className="px-6 py-4">Amount</th>
                <th scope="col" className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                    {payment.razorpay_payment_id || payment.razorpay_order_id || payment.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(payment.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{payment.users?.name || "Unknown"}</div>
                    <div className="text-xs">{payment.users?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.payment_type === "subscription" ? (
                      <span className="flex items-center text-purple-400 font-semibold text-xs">
                        <ArrowUpRight size={14} className="mr-1" /> Subscription
                      </span>
                    ) : (
                      <span className="flex items-center text-blue-400 font-semibold text-xs">
                        <ArrowDownLeft size={14} className="mr-1" /> Shop
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">₹{payment.amount}</td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === "captured" ? (
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Success</span>
                    ) : payment.status === "failed" ? (
                      <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">Failed</span>
                    ) : (
                      <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold capitalize">{payment.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {payments && payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}