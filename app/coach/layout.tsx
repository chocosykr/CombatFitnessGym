import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Package, ShoppingCart, Settings } from 'lucide-react';

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold tracking-wider text-red-500">COACH PORTAL</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link href="/coach/dashboard" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                <LayoutDashboard size={20} className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/coach/members" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                <Users size={20} className="mr-3" />
                Members
              </Link>
            </li>
            <li>
              <Link href="/coach/payments" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                <CreditCard size={20} className="mr-3" />
                Payments
              </Link>
            </li>
            <li>
              <Link href="/coach/inventory" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                <Package size={20} className="mr-3" />
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/coach/orders" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                <ShoppingCart size={20} className="mr-3" />
                Orders
              </Link>
            </li>
          </ul>
        </nav>
        {/* Settings at bottom of sidebar */}
        <div className="border-t border-neutral-800 px-3 py-4">
          <Link href="/coach/settings" className="flex items-center px-3 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
            <Settings size={20} className="mr-3" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (TODO: Add hamburger menu) */}
        <header className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 pt-safe flex items-center justify-between">
            <h1 className="text-lg font-bold text-red-500">COACH PORTAL</h1>
            {/* Hamburger Icon would go here */}
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-safe md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
