
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Key, ShoppingBag, Wand2, Settings, Map, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const menu = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Opportunity Map', href: '/app/opportunity-map', icon: Map },
  { label: 'Keyword Explorer', href: '/app/keywords', icon: Key },
  { label: 'Shop Spy', href: '/app/shop-spy', icon: ShoppingBag }, // Placeholder route
  { label: 'Listing Optimizer', href: '/app/listing-optimizer', icon: Wand2 },
  { label: 'Integrations', href: '/app/integrations', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 flex flex-col z-10">
      <div className="p-6 border-b border-slate-50">
        <h1 className="text-xl font-bold tracking-tight">EtsySpyPro<span className="text-orange-500">X</span></h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive ? "bg-black text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.plan} PLAN</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
