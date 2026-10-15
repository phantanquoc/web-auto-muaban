"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { apiFetch, getToken } from '../../../lib/api';
import { fmtXu, fmtNum, shortId, relativeTime, absoluteTime, copyText } from '../../../lib/format';
import { StatusPill } from '../../../components/ui/Badge';
import { DarkCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatCard } from '../../../components/ui/Data';
import { EmptyState, Skeleton, ErrorBlock } from '../../../components/ui/States';
import { useToast } from '../../../components/ui/Toast';

function displayStatus(s: string): string {
  if (s === 'FULFILLED') return 'DONE';
  if (s === 'EXPIRED') return 'FAILED';
  return s;
}

const FILTERS = ['all', 'PENDING', 'DONE', 'FAILED', 'FROZEN'] as const;

export default function WalletPage() {
  const router = useRouter();
  const { push } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError('');
    apiFetch('/orders')
      .then((o) => { setOrders(Array.isArray(o) ? o : []); setLoading(false); })
      .catch((e) => { setError(e.message || 'Khong tai duoc don hang'); setLoading(false); });
  }

  useEffect(() => {
    if (!getToken()) { router.replace('/login?next=/wallet'); return; }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => displayStatus(o.status) === filter);
  }, [orders, filter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    spent: orders.filter((o) => o.status === 'FULFILLED').reduce((s, o) => s + (o.totalTt ?? 0), 0),
  }), [orders]);

  async function copy(id: string) {
    const ok = await copyText(id);
    if (ok) {
      setCopied(id);
      push({ kind: 'success', text: 'Da sao chep ma don hang' });
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    }
  }

  async function retry(o: any) {
    const items = Array.isArray(o.items) ? o.items : [];
    if (items.length === 0 || !o.botId) {
      push({ kind: 'error', text: 'Khong the dat lai don nay (thieu thong tin)' });
      return;
    }
    setRetrying(o.id);
    try {
      const r = await apiFetch('/orders', { method: 'POST', body: JSON.stringify({ botId: o.botId, items }) });
      push({ kind: 'success', text: `Dat lai thanh cong. Ma don: ${shortId(r.id)}`, link: { href: '/wallet', label: 'Xem' } });
      load();
    } catch (e: any) {
      push({ kind: 'error', text: e.data?.message || e.message || 'Dat lai that bai' });
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Vi / Don hang</h1>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <StatCard label="Tong don" value={fmtNum(stats.total)} />
            <StatCard label="Dang cho" value={fmtNum(stats.pending)} sub="TT dang bi giu" />
            <StatCard label="Da chi" value={fmtXu(stats.spent)} />
          </>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Loc theo trang thai">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-[44px] px-4 rounded-full text-sm border ${filter === f ? 'bg-gold text-void font-semibold border-gold' : 'bg-charcoal border-white/10 text-white/70 hover:text-white'}`}
          >
            {f === 'all' ? 'Tat ca' : f}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorBlock message={error} onRetry={load} /></div>}

      {loading ? (
        <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <DarkCard>
          <EmptyState
            title={orders.length === 0 ? 'Chua co don hang nao' : 'Khong co don o trang thai nay'}
            hint="Ghe shop chon vat pham de bat dau."
            action={<Button onClick={() => router.push('/shop')}>Di toi Shop</Button>}
          />
        </DarkCard>
      ) : (
        <DarkCard className="divide-y divide-white/10">
          {filtered.map((o) => {
            const ds = displayStatus(o.status);
            const open = expanded === o.id;
            const failed = ds === 'FAILED';
            return (
              <div key={o.id}>
                <button
                  onClick={() => setExpanded(open ? null : o.id)}
                  aria-expanded={open}
                  className="w-full min-h-[44px] px-4 py-3 flex items-center gap-3 text-left text-sm hover:bg-white/5"
                >
                  <span className="font-mono text-xs text-white/80 tnum" title={o.id}>{shortId(o.id)}</span>
                  <span className="hidden sm:inline text-xs text-muted truncate flex-1">
                    {Array.isArray(o.items) ? o.items.map((it: any) => `#${it.productId}×${it.qty}`).join(', ') : '—'}
                  </span>
                  <span className="font-display font-semibold text-gold tnum text-sm">{fmtXu(o.totalTt)}</span>
                  <StatusPill status={ds} />
                  <span className="text-xs text-muted hidden md:inline" title={absoluteTime(o.createdAt)}>{relativeTime(o.createdAt)}</span>
                  <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-4 pb-4 text-sm text-white/80 grid gap-1.5">
                    <p className="flex items-center gap-2">
                      <span className="text-muted">Ma don:</span>
                      <span className="font-mono text-xs">{shortId(o.id)}</span>
                      <button onClick={() => copy(o.id)} aria-label="Sao chep ma don" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-gold">
                        {copied === o.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </p>
                    <p><span className="text-muted">Bot:</span> {o.botId ? shortId(o.botId) : '—'}</p>
                    <p><span className="text-muted">Vat pham:</span> {Array.isArray(o.items) ? o.items.map((it: any) => `#${it.productId} × ${it.qty}`).join('; ') : '—'}</p>
                    <p><span className="text-muted">Thoi gian:</span> <span title={absoluteTime(o.createdAt)}>{relativeTime(o.createdAt)} ({absoluteTime(o.createdAt)})</span></p>
                    {failed && (
                      <p className="text-rose-300 text-xs">Ly do: {o.reason || o.message || 'Don het han / that bai'}</p>
                    )}
                    {failed && (
                      <div>
                        <Button variant="dark" onClick={() => retry(o)} disabled={retrying === o.id} className="text-xs">
                          <RotateCcw size={14} className="inline mr-1" />{retrying === o.id ? 'Dang dat lai...' : 'Dat lai'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </DarkCard>
      )}
    </div>
  );
}
