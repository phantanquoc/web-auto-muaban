"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Copy, Check } from 'lucide-react';
import { apiFetch, getToken } from '../../../lib/api';
import { fmtNum, fmtXu, copyText } from '../../../lib/format';
import { DarkCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select, Field } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton, ErrorBlock } from '../../../components/ui/States';
import { useToast } from '../../../components/ui/Toast';

const QUICK = [1, 5, 10, 50];
const DEFAULT_RATE = 495000;

export default function ExchangePage() {
  const router = useRouter();
  const { push } = useToast();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [botId, setBotId] = useState('');
  const [kc, setKc] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login?next=/exchange'); return; }
    apiFetch('/bots')
      .then((b) => {
        const list = Array.isArray(b) ? b : [];
        const sorted = [...list].sort((a, c) => Number(c.online ?? false) - Number(a.online ?? false));
        setBots(sorted);
        if (sorted.length > 0) setBotId(sorted[0].id);
        setLoading(false);
      })
      .catch((e) => { setError(e.message || 'Khong tai duoc bot'); setLoading(false); });
  }, [router]);

  const bot = useMemo(() => bots.find((b) => b.id === botId), [bots, botId]);
  const rate = bot?.rateOverride ?? DEFAULT_RATE;
  const total = kc * rate;
  const limit = bot?.dailyLimitTt ?? null;
  const used = bot?.usedTtToday ?? bot?.dailyUsedTt ?? 0;
  const limitPct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null;

  async function submit() {
    if (!getToken()) { router.push('/login?next=/exchange'); return; }
    setSubmitting(true);
    try {
      const r = await apiFetch('/exchange/tt-to-kc', { method: 'POST', body: JSON.stringify({ kcAmount: kc, botId }) });
      setConfirm(false);
      setResult(r);
      push({ kind: 'success', text: `Doi thanh cong. Ma GD: ${r.id?.slice(0, 8) ?? ''}` });
    } catch (e: any) {
      setConfirm(false);
      push({ kind: 'error', text: e.data?.message || e.message || 'Doi that bai' });
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(id: string) {
    if (await copyText(id)) { setCopied(true); push({ kind: 'success', text: 'Da sao chep ma giao dich' }); }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Doi TT → KC</h1>
      <p className="text-sm text-muted mb-5">TT bi giu (frozen) khi tao lenh, bot giao KC trong game. Chieu KC → TT do bot quan sat trong game.</p>

      {error && <div className="mb-4"><ErrorBlock message={error} onRetry={() => window.location.reload()} /></div>}

      <div className="grid md:grid-cols-2 gap-4">
        <DarkCard className="p-5">
          {loading ? (
            <div className="flex flex-col gap-3"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-11" /></div>
          ) : result ? (
            <div className="text-center py-4">
              <p className="text-emerald-300 font-semibold">Doi thanh cong</p>
              <p className="font-mono text-lg mt-2 tnum">{result.id?.slice(0, 8) ?? result.id}</p>
              <div className="flex gap-2 justify-center mt-3">
                <Button variant="dark" onClick={() => copy(result.id)}>{copied ? <Check size={16} className="inline mr-1" /> : <Copy size={16} className="inline mr-1" />}{copied ? 'Da sao chep' : 'Sao chep ma'}</Button>
                <Button onClick={() => router.push('/link')}>Sang trang Lien ket</Button>
              </div>
              <button onClick={() => { setResult(null); setKc(1); }} className="mt-4 text-sm text-muted underline min-h-[44px]">Tao lenh moi</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="Chon bot">
                <Select value={botId} onChange={(e) => setBotId(e.target.value)} aria-label="Chon bot doi">
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.online ? '● ' : '○ '}{b.name} — {fmtNum(b.rateOverride ?? DEFAULT_RATE)} TT/KC{b.dailyLimitTt ? ` — con ${fmtNum(b.dailyLimitTt - (b.usedTtToday ?? 0))} TT` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="So KC muon doi">
                <div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setKc((v) => Math.max(1, v - 1))} aria-label="Giam KC" className="min-h-[44px] min-w-[44px] rounded-lg bg-void/60 border border-white/15 text-lg">−</button>
                    <input type="number" min={1} value={kc} onChange={(e) => setKc(Math.max(1, parseInt(e.target.value) || 1))} aria-label="So KC" className="min-h-[44px] flex-1 rounded-lg bg-void/60 border border-white/15 px-3 text-center font-display font-bold tnum" />
                    <button onClick={() => setKc((v) => v + 1)} aria-label="Tang KC" className="min-h-[44px] min-w-[44px] rounded-lg bg-void/60 border border-white/15 text-lg">+</button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {QUICK.map((v) => (
                      <button key={v} onClick={() => setKc(v)} className={`min-h-[44px] flex-1 rounded-lg text-sm border ${kc === v ? 'bg-gold text-void font-semibold border-gold' : 'border-white/15 text-white/70'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </Field>
              <div className="rounded-lg bg-void/60 border border-gold/30 p-3 text-sm" aria-live="polite">
                <p><span className="text-muted">Xem truoc:</span></p>
                <p className="font-display font-bold text-gold tnum text-lg">{fmtNum(kc)} KC × {fmtNum(rate)} = {fmtXu(total)}</p>
              </div>
              <Button onClick={() => setConfirm(true)} disabled={!botId || bots.length === 0}>Xac nhan doi</Button>
            </div>
          )}
        </DarkCard>

        <DarkCard className="p-5 h-fit">
          <h2 className="font-display font-semibold mb-3">Thong tin ty gia</h2>
          {loading ? <Skeleton className="h-20" /> : bot ? (
            <div className="text-sm space-y-2">
              <p><span className="text-muted">Bot:</span> {bot.name} {bot.online ? <span className="text-emerald-300">● online</span> : <span className="text-muted">○ offline</span>}</p>
              <p><span className="text-muted">Ty gia:</span> <span className="font-display font-bold text-gold tnum">{fmtNum(rate)} TT / 1 KC</span></p>
              {limit ? (
                <div>
                  <p className="text-muted text-xs mb-1">Han muc hom nay: {fmtNum(used)} / {fmtNum(limit)} TT</p>
                  <div className="h-2 rounded bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={limitPct ?? 0} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-gold rounded" style={{ width: `${limitPct}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Bot nay khong gioi han han muc ngay.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Chua co bot doi nao.</p>
          )}
        </DarkCard>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Xac nhan doi KC">
        <div className="text-sm">
          <p>Doi <strong className="tnum">{fmtNum(kc)} KC</strong> qua bot <strong>{bot?.name}</strong>?</p>
          <p className="mt-1">Tong TT bi giu: <span className="font-display text-gold font-bold tnum">{fmtXu(total)}</span></p>
          <div className="flex gap-2 mt-4">
            <Button variant="dark" onClick={() => setConfirm(false)} className="flex-1">Huy</Button>
            <Button onClick={submit} disabled={submitting} className="flex-1">{submitting ? 'Dang tao...' : 'Xac nhan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
