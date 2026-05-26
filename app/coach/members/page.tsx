import { createClient } from "@/utils/supabase/server";
import { markSubscriptionPaid } from "@/app/actions/coach";
import { CheckCircle } from "lucide-react";

export const revalidate = 0;

export default async function CoachMembersPage() {
  const supabase = await createClient();

  // Fetch all users with their subscriptions and plans
  const { data: members } = await supabase
    .from('users')
    .select(`
      *,
      subscriptions (
        *,
        plans (*)
      )
    `)
    .eq('role', 'member')
    .order('created_at', { ascending: false });

  // Fetch all plans for the manual override dropdown
  const { data: plans } = await supabase.from('plans').select('*');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Members</h1>
          <p className="text-neutral-400 text-sm">Manage gym members and subscriptions</p>
        </div>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4">Name</th>
                <th scope="col" className="px-6 py-4">Phone</th>
                <th scope="col" className="px-6 py-4">Current Plan</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members?.map((member) => {
                const sub = member.subscriptions?.[0];
                const isOverdue = sub?.status === 'overdue' || (!sub && member.created_at);
                
                return (
                  <tr key={member.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{member.name || 'Unnamed'}</td>
                    <td className="px-6 py-4">{member.phone}</td>
                    <td className="px-6 py-4">{sub?.plans?.name || 'None'}</td>
                    <td className="px-6 py-4">
                      {sub?.status === 'active' ? (
                        <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Active</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">
                          {sub?.status === 'overdue' ? 'Overdue' : 'No Plan'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {plans && plans.length > 0 && (
                        <form action={async () => {
                          "use server";
                          // Defaulting to the first plan if they don't have one, or their current plan
                          const planId = sub?.plan_id || plans[0].id;
                          await markSubscriptionPaid(member.id, planId);
                        }}>
                          <button
                            type="submit"
                            title="Mark as Paid (Cash)"
                            className="text-neutral-500 hover:text-green-500 transition-colors bg-neutral-950 p-2 rounded-lg border border-neutral-800 hover:border-green-500"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}