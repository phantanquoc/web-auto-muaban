"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, LayoutDashboard, ShoppingBag, Percent, ChevronsLeft, ChevronsRight, Search, LogOut, Swords } from 'lucide-react';
import { getToken, getRoleFromToken, clearSession } from '../../lib/api';
import { ToastProvider } from '../../components/ui/Toast';

const TABS = [
  { href: '/admin', label: 'Tong quan', icon: LayoutDashboard, ready: false },
  { href: '/admin/bots', label: 'Bots', icon: Bot, ready: true },
  { href: '/admin/orders', label: 'Don hang', icon: ShoppingBag, ready: false },
  { href: '/admin/rates', label: 'Ty gia', icon: Percent, ready: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getRoleFromToken(token);
    if (!token) {
      router.replace('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (role !== 'ADMIN') {
      router.replace('/shop');
      return;
    }
    setReady(true);
  }, [router]);

  function logout() {
    clearSession();
    router.push('/login');
  }

  if (!ready) return <div className="min-h-screen bg-mist flex items-center justify-center text-sm text-slate-500">Dang kiem tra quyen admin...</div>;

  const crumbs = pathname?.split('/').filter(Boolean) ?? [];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-mist text-slate-900 font-sans flex">
        <aside className={`${collapsed ? 'w-16' : 'w-[220px]'} shrink-0 bg-navy text-white flex flex-col transition-all`} aria-label="Dieu huong admin">
          <div className="h-16 flex items-center gap-2 px-4 border-b border-white/10">
            {!collapsed && <span className="font-display font-bold">Admin</span>}
            <span className="flex-1" />
            <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Mo rong menu' : 'Thu gon menu'} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white/60 hover:text-white">
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
          </div>
          <nav className="p-2 flex flex-col gap-1 text-sm">
            {TABS.map((t) => {
              const active = pathname === t.href;
              return (
                <a
                  key={t.href}
                  href={t.ready ? t.href : '/admin/bots'}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? t.label : undefined}
                  className={`min-h-[44px] flex items-center gap-3 px-3 rounded-lg ${active ? 'bg-gold text-void font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <t.icon size={18} />
                  {!collapsed && <span>{t.label}</span>}
                  {!collapsed && !t.ready && t.href !== '/admin/bots' && <span className="ml-auto text-[10px] opacity-60">sap co</span>}
                </a>
              );
            })}
          </nav>
          <span className="flex-1" />
          <div className="p-2 border-t border-white/10">
            <a href="/shop" className="min-h-[44px] flex items-center gap-3 px-3 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white">
              <Swords size={18} aria-hidden />{!collapsed && 'Ve shop'}
            </a>
            <button onClick={logout} className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-lg text-sm text-rose-300 hover:bg-white/10">
              <LogOut size={18} />{!collapsed && 'Dang xuat'}
            </button>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sticky top-0 z-30">
            <nav className="text-sm text-slate-500 truncate" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={i}><span className="mx-1">/</span>{c}</span>
              ))}
            </nav>
            <span className="flex-1" />
            <label className="hidden md:flex items-center gap-2 bg-mist rounded-lg px-3 min-h-[44px] text-sm">
              <Search size={16} className="text-slate-400" />
              <input placeholder="Tim kiem..." aria-label="Tim kiem" className="bg-transparent outline-none w-40" />
            </label>
            <span className="h-9 w-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold" title="Admin">A</span>
          </header>
          <main className="p-4 md:p-6 max-w-6xl">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
