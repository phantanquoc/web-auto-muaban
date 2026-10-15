"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swords, Bot, History, ShieldCheck } from 'lucide-react';
import { API_URL, saveSession, getRoleFromToken } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

function isSafeNext(v: string | null): v is string {
  return !!v && v.startsWith('/') && !v.startsWith('//') && !v.includes('://');
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function roleHome(role: string | null): string {
    return role === 'ADMIN' ? '/admin' : '/shop';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || (mode === 'login' ? 'Sai email hoac mat khau' : 'Dang ky that bai'));
      saveSession(data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      const role = data.user?.role ?? getRoleFromToken(data.accessToken);
      const next = params.get('next');
      if (isSafeNext(next) && (!next.startsWith('/admin') || role === 'ADMIN')) {
        router.push(next);
        return;
      }
      router.push(roleHome(role));
    } catch (err: any) {
      setError(err.message || 'Co loi xay ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-void text-white font-sans grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-gradient-to-br from-navy-deep via-charcoal to-void border-b md:border-b-0 md:border-r border-gold/20 p-6 md:p-12 flex flex-col justify-center">
        <p className="flex items-center gap-2 font-display text-2xl md:text-3xl font-bold"><Swords size={28} className="text-gold" aria-hidden /> Cho Dem Ngau Hanh</p>
        <p className="text-muted mt-2 text-sm md:text-base">Cho vat pham game tu dong — mua ban nhanh, doi KC minh bach.</p>
        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-2.5"><Bot size={18} className="text-gold" /> Bot giao dich 24/7, khong cho doi</li>
          <li className="flex items-center gap-2.5"><Swords size={18} className="text-gold" /> Mua ban tu dong trong game</li>
          <li className="flex items-center gap-2.5"><History size={18} className="text-gold" /> Lich su don hang ro rang</li>
          <li className="flex items-center gap-2.5"><ShieldCheck size={18} className="text-gold" /> Ma lien ket rieng, khong chia se</li>
        </ul>
      </div>
      {/* Form card */}
      <div className="p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="bg-charcoal border border-white/10 rounded-xl2 p-6 shadow-card" role="tabpanel" aria-label={mode === 'login' ? 'Dang nhap' : 'Dang ky'}>
            <div className="grid grid-cols-2 gap-1 bg-void/60 rounded-lg p-1 mb-5" role="tablist">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`min-h-[44px] rounded-md text-sm font-semibold ${mode === m ? 'bg-gold text-void' : 'text-muted hover:text-white'}`}
                >
                  {m === 'login' ? 'Dang nhap' : 'Dang ky'}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <label className="block">
                <span className="sr-only">Email</span>
                <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              <label className="block">
                <span className="sr-only">Mat khau</span>
                <Input type="password" required minLength={6} placeholder="Mat khau (toi thieu 6 ky tu)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </label>
              {error && (
                <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/40 rounded-lg px-3 py-2" role="alert">
                  {error}
                  <button type="submit" disabled={loading} className="ml-2 underline font-medium">Thu lai</button>
                </div>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Vui long doi...' : mode === 'login' ? 'Dang nhap' : 'Tao tai khoan'}
              </Button>
            </form>
          </div>
          <p className="text-xs text-muted text-center mt-4">Tai khoan moi co quyen USER va mo shop ngay.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void text-muted p-4 text-sm">Dang tai...</div>}>
      <LoginForm />
    </Suspense>
  );
}
