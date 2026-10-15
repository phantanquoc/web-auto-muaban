"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Swords, Wallet, ArrowLeftRight, Link2, LogOut, LogIn } from 'lucide-react';
import { getToken, clearSession, apiFetch } from '../../lib/api';
import { StatusDot } from '../../components/ui/Badge';
import { ToastProvider } from '../../components/ui/Toast';

const NAV = [
  { href: '/shop', label: 'Shop', icon: Swords },
  { href: '/wallet', label: 'Vi', icon: Wallet },
  { href: '/exchange', label: 'Doi KC', icon: ArrowLeftRight },
  { href: '/link', label: 'Lien ket', icon: Link2 },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [botsOnline, setBotsOnline] = useState<number | null>(null);

  useEffect(() => {
    const t = getToken();
    setLoggedIn(!!t);
    if (t) {
      try {
        const seg = t.split('.')[1];
        const p = JSON.parse(atob(seg.replace(/-/g, '+').replace(/_/g, '/')));
        if (typeof p?.email === 'string') setEmail(p.email);
      } catch { /* ignore */ }
    }
    apiFetch('/bots').then((b: any[]) => {
      if (Array.isArray(b)) setBotsOnline(b.filter((x) => x.online).length);
    }).catch(() => {});
  }, []);

  function logout() {
    clearSession();
    setLoggedIn(false);
    router.push('/shop');
  }

  return (
    <div className="min-h-screen bg-void text-white font-sans">
      <header className="sticky top-0 z-40 bg-void/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-2">
          <a href="/shop" className="flex items-center gap-2 font-display font-bold text-lg mr-4">
            <Swords size={20} className="text-gold" aria-hidden /> Cho Dem
          </a>
          <nav className="flex items-center gap-1 text-sm" aria-label="Chinh">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname?.startsWith(n.href + '/');
              return (
                <a
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative min-h-[44px] flex items-center gap-1.5 px-3 rounded-lg ${active ? 'text-gold font-semibold' : 'text-white/70 hover:text-white'}`}
                >
                  <n.icon size={16} />
                  {n.label}
                  {active && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gold rounded" aria-hidden />}
                </a>
              );
            })}
          </nav>
          <span className="flex-1" />
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted mr-2" title="Trang thai bot">
            <StatusDot online={(botsOnline ?? 0) > 0} />
            {botsOnline === null ? '…' : `${botsOnline} bot online`}
          </span>
          {loggedIn ? (
            <>
              {email && <span className="hidden md:block text-xs text-muted max-w-[160px] truncate">{email}</span>}
              <button onClick={logout} aria-label="Dang xuat" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white/70 hover:text-white">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <a href="/login" className="min-h-[44px] flex items-center gap-1.5 px-4 rounded-lg bg-gold text-void text-sm font-semibold">
              <LogIn size={16} /> Dang nhap
            </a>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-display font-semibold text-gold mb-2">Huong dan mua</p>
            <p className="text-muted">Dang nhap → lien ket nhan vat → chon vat pham → xac nhan. Don hang tu dong giao qua bot 24/7.</p>
          </div>
          <div>
            <p className="font-display font-semibold text-gold mb-2">Lien he</p>
            <p className="text-muted">Ho tro trong game qua bot trao doi. Ma giao dich luon co trong Vi cua ban.</p>
          </div>
          <div>
            <p className="font-display font-semibold text-gold mb-2">Dieu khoan</p>
            <p className="text-muted">Khong chia se ma lien ket. Kiem tra lich su don hang truoc khi xac nhan trong game.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Shell>{children}</Shell>
    </ToastProvider>
  );
}
