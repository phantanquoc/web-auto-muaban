"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ShieldAlert } from 'lucide-react';
import { apiFetch, getToken } from '../../../lib/api';
import { copyText } from '../../../lib/format';
import { DarkCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ErrorBlock } from '../../../components/ui/States';
import { useToast } from '../../../components/ui/Toast';

const TTL = 300;

export default function LinkPage() {
  const router = useRouter();
  const { push } = useToast();
  const [code, setCode] = useState<any>(null);
  const [left, setLeft] = useState(0);
  const [error, setError] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login?next=/link'); }
  }, [router]);

  async function gen() {
    if (!getToken()) { router.push('/login?next=/link'); return; }
    setGenLoading(true);
    setError('');
    try {
      const r = await apiFetch('/auth/link-code', { method: 'POST' });
      setCode(r);
      const exp = r.expiresAt ? Math.max(0, Math.round((new Date(r.expiresAt).getTime() - Date.now()) / 1000)) : TTL;
      setLeft(exp || TTL);
      setCopied(false);
    } catch (e: any) {
      setError(e.data?.message || e.message || 'Khong tao duoc ma');
    } finally {
      setGenLoading(false);
    }
  }

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function copy() {
    if (!code?.code) return;
    if (await copyText(code.code)) {
      setCopied(true);
      push({ kind: 'success', text: 'Da sao chep ma lien ket' });
    }
  }

  const urgent = left > 0 && left < 60;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-4 text-center">Lien ket nhan vat</h1>
      <DarkCard className="p-6 text-center">
        {!code ? (
          <>
            <p className="text-sm text-muted mb-4">Tao ma 6 ky tu, whisper cho bot trong game de lien ket nhan vat.</p>
            <Button onClick={gen} disabled={genLoading} className="w-full">{genLoading ? 'Dang tao...' : 'Tao ma 6 ky tu'}</Button>
          </>
        ) : (
          <>
            <div className="border-2 border-dashed border-gold/60 rounded-xl py-4 px-2" aria-live="polite">
              <p className="font-mono text-4xl font-bold tracking-[0.3em] text-gold tnum">{code.code}</p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button variant="dark" onClick={copy}>{copied ? <Check size={16} className="inline mr-1" /> : <Copy size={16} className="inline mr-1" />}{copied ? 'Da sao chep' : 'Sao chep'}</Button>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border min-h-[44px] ${urgent ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' : 'bg-white/10 text-white/80 border-white/20'}`} role="timer" aria-label={`Con lai ${mm} phut ${ss} giay`}>
                Con {mm}:{ss}
              </span>
            </div>
            {left <= 0 && <p className="text-rose-300 text-sm mt-2">Ma da het han — hay tao ma moi.</p>}
            <Button variant="dark" onClick={gen} disabled={genLoading} className="w-full mt-3">Tao ma moi</Button>
          </>
        )}
        {error && <div className="mt-3 text-left"><ErrorBlock message={error} onRetry={gen} /></div>}

        <ol className="text-left text-sm mt-6 space-y-2">
          <li><strong className="text-gold">1.</strong> Bam tao ma 6 ky tu o tren.</li>
          <li><strong className="text-gold">2.</strong> Vao game, whisper ma nay cho bot trao doi.</li>
          <li><strong className="text-gold">3.</strong> Cho bot xac nhan — tai khoan se duoc lien ket.</li>
        </ol>
        <p className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-4 text-left">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          Khong bao gio chia se ma nay cho nguoi khac. Ma chi dung mot lan va tu het han sau 5 phut.
        </p>
      </DarkCard>
    </div>
  );
}
