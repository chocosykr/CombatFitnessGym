import Link from 'next/link';
import { Home, ShoppingBag, ClipboardList, Info } from 'lucide-react';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-50 pb-20">
      <main className="flex-grow pt-safe overflow-y-auto">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 pb-safe z-50">
        <ul className="flex justify-around items-center h-16">
          <li>
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-neutral-400 hover:text-white">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/shop" className="flex flex-col items-center justify-center w-full h-full text-neutral-400 hover:text-white">
              <ShoppingBag size={24} />
              <span className="text-xs mt-1">Shop</span>
            </Link>
          </li>
          <li>
            <Link href="/orders" className="flex flex-col items-center justify-center w-full h-full text-neutral-400 hover:text-white">
              <ClipboardList size={24} />
              <span className="text-xs mt-1">Orders</span>
            </Link>
          </li>
          <li>
            <Link href="/gym-info" className="flex flex-col items-center justify-center w-full h-full text-neutral-400 hover:text-white">
              <Info size={24} />
              <span className="text-xs mt-1">Info</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
