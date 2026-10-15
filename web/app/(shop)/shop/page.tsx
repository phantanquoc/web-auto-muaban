"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, ArrowUpDown } from 'lucide-react';
import { apiFetch, getToken } from '../../../lib/api';
import { fmtXu, fmtNum, rarityOf, relativeTime, absoluteTime } from '../../../lib/format';
import { Badge, StatusDot } from '../../../components/ui/Badge';
import { DarkCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState, Skeleton, ErrorBlock } from '../../../components/ui/States';
import { useToast } from '../../../components/ui/Toast';

const SERVERS = ['all', 'sv1', 'sv2', 'sv3', 'sv4', 'sv5', 'sv6'];

export default function ShopPage() {
  const router = useRouter();
  const { push } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [ordersToday, setOrdersToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [server, setServer] = useState('all');
  const [sort, setSort] = useState('price-asc');
  const [stockOnly, setStockOnly] = useState(false);
  const [confirm, setConfirm] = useState<any | null>(null);
  const [buying, setBuying] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    Promise.all([
      apiFetch('/shop/products').catch(() => []),
      apiFetch('/bots').catch(() => []),
    ]).then(([p, b]) => {
      setProducts(Array.isArray(p) ? p : []);
      setBots(Array.isArray(b) ? b : []);
      setLoading(false);
    }).catch((e) => { setError(e.message || 'Khong tai duoc du lieu'); setLoading(false); });
    apiFetch('/orders').then((o: any[]) => {
      if (!Array.isArray(o)) return;
      const today = new Date().toDateString();
      setOrdersToday(o.filter((x) => new Date(x.createdAt).toDateString() === today).length);
    }).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q) list = list.filter((p) => `${p.maVp ?? ''} ${p.id}`.toLowerCase().includes(q.toLowerCase()));
    if (server !== 'all') list = list.filter((p) => (p.server ?? 'sv1').toLowerCase() === server);
    if (stockOnly) list = list.filter((p) => (p.totalBag ?? 0) > 0);
    list.sort((a, b) => {
      if (sort === 'price-asc') return (a.donGia ?? 0) - (b.donGia ?? 0);
      if (sort === 'price-desc') return (b.donGia ?? 0) - (a.donGia ?? 0);
      if (sort === 'stock-desc') return (b.totalBag ?? 0) - (a.totalBag ?? 0);
      return 0;
    });
    return list;
  }, [products, q, server, sort, stockOnly]);

  const onlineBots = bots.filter((b) => b.online);
  const rate = bots.find((b) => b.rateOverride)?.rateOverride ?? 495000;

  function handleBuyClick(p: any) {
    if (!getToken()) { router.push('/login?next=/shop'); return; }
    setConfirm(p);
  }

  async function buy() {
    if (!confirm) return;
    if (!getToken()) { router.push('/login?next=/shop'); return; }
    const bot = onlineBots[0] || bots[0];
    if (!bot) return;
    setBuying(true);
    try {
      const r = await apiFetch('/orders', { method: 'POST', body: JSON.stringify({ botId: bot.id, items: [{ productId: confirm.id, qty: 1 }] }) });
      setConfirm(null);
      push({ kind: 'success', text: `Dat hang thanh cong. Ma don: ${r.id?.slice(0, 8) ?? r.id}`, link: { href: '/wallet', label: 'Xem trong Vi' } });
    } catch (e: any) {
      push({ kind: 'error', text: e.data?.message || e.message || 'Dat hang that bai' });
    } finally {
      setBuying(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="rounded-xl2 bg-gradient-to-br from-charcoal via-navy-deep to-void border border-gold/20 p-6 mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Cho Dem Ngau Hanh</h1>
        <p className="text-muted text-sm mt-1">Bot giao dich tu dong 24/7 — nhanh, ro lich su, khong cho doi.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40"><StatusDot online={onlineBots.length > 0} /> {onlineBots.length}/{bots.length} bot online</Badge>
          <Badge className="bg-gold/10 text-gold border-gold/40">Ty gia {fmtNum(rate)} TT/KC</Badge>
          <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/40"><ShoppingBag size={14} /> {ordersToday ?? '…'} don hom nay</Badge>
        </div>
      </section>

      {/* Filter bar */}
      <section className="flex flex-col md:flex-row gap-2 mb-4" aria-label="Bo loc">
        <label className="flex items-center gap-2 bg-charcoal border border-white/10 rounded-lg px-3 flex-1 min-h-[44px]">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tim vat pham..." aria-label="Tim vat pham" className="bg-transparent outline-none text-sm w-full placeholder:text-muted" />
        </label>
        <Select value={server} onChange={(e) => setServer(e.target.value)} aria-label="May chu" className="md:w-32">
          {SERVERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'Tat ca sv' : s}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sap xep" className="md:w-44">
          <option value="price-asc">Gia tang dan</option>
          <option value="price-desc">Gia giam dan</option>
          <option value="stock-desc">Ton kho nhieu</option>
        </Select>
        <button onClick={() => setStockOnly((v) => !v)} aria-pressed={stockOnly} className={`min-h-[44px] px-4 rounded-lg text-sm border ${stockOnly ? 'bg-gold text-void font-semibold border-gold' : 'bg-charcoal border-white/10 text-white/70'}`}>
          Con hang
        </button>
      </section>

      {/* Bot cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" aria-label="Trang thai bot">
        {loading && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        {!loading && bots.map((b) => (
          <DarkCard key={b.id} className="p-3">
            <p className="text-sm font-semibold truncate">{b.name}</p>
            <p className="text-xs text-muted mt-0.5">{b.type}{b.server ? ` · ${b.server}` : ''}</p>
            <p className="text-xs mt-1 flex items-center gap-1.5">
              <StatusDot online={b.online} />
              <span className={b.online ? 'text-emerald-300' : 'text-muted'}>{b.online ? 'Online' : 'Offline'}</span>
              {b.stale && <span className="text-amber-300">· stale</span>}
            </p>
          </DarkCard>
        ))}
        {!loading && bots.length === 0 && <p className="text-sm text-muted col-span-full">Chua co bot nao online.</p>}
      </section>

      {/* Grid */}
      {error && <div className="mb-4"><ErrorBlock message={error} onRetry={load} /></div>}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-label="Dang tai">
          {[0, 1, 2, 3, 4, 5, 7, 6].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <DarkCard>
          <EmptyState
            title="Khong tim thay vat pham"
            hint="Thu doi tu khoa hoac xoa bo loc."
            action={<Button variant="dark" onClick={() => { setQ(''); setServer('all'); setStockOnly(false); }}>Xoa bo loc</Button>}
          />
        </DarkCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const stock = p.totalBag ?? 0;
            const out = stock <= 0;
            const rarity = rarityOf(p.maVp, p.id);
            const initial = (p.maVp ?? `#${p.id}`).charAt(0).toUpperCase();
            return (
              <DarkCard key={p.id} className="p-4 flex flex-col" >
                <div className="border-l-[3px] pl-3 -ml-4 flex flex-col flex-1" style={{ borderColor: rarity.color }}>
                  <div className="flex items-center gap-2">
                    <span className="h-10 w-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center font-display font-bold text-gold" aria-hidden>{initial}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{p.server ?? 'sv1'}</span>
                    <span className="text-[11px] text-muted ml-auto">{rarity.key}</span>
                  </div>
                  <p className="font-semibold mt-2 truncate" title={p.maVp ?? `#${p.id}`}>{p.maVp || `#${p.id}`}</p>
                  <p className="font-display text-gold font-bold tnum">{fmtXu(p.donGia)}</p>
                  <p className={`text-xs mt-1 ${out ? 'text-rose-300' : 'text-emerald-300'}`}>{out ? 'Het hang' : `Con ${fmtNum(stock)}`}</p>
                  <span className="flex-1" />
                  <Button disabled={out} onClick={() => handleBuyClick(p)} className="w-full mt-3" aria-label={out ? `${p.maVp} het hang` : `Mua ${p.maVp}`}>
                    {out ? 'Het hang' : 'Mua'}
                  </Button>
                </div>
              </DarkCard>
            );
          })}
        </div>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Xac nhan mua">
        {confirm && (
          <div className="text-sm">
            <p><span className="text-muted">Vat pham:</span> <strong>{confirm.maVp || `#${confirm.id}`}</strong></p>
            <p className="mt-1"><span className="text-muted">Gia:</span> <span className="font-display text-gold font-bold tnum">{fmtXu(confirm.donGia)}</span></p>
            <p className="mt-1"><span className="text-muted">Bot giao:</span> {(onlineBots[0] || bots[0])?.name ?? '—'}</p>
            <p className="mt-2 text-xs text-muted">Can lien ket nhan vat truoc khi mua (<a href="/link" className="text-gold underline">lien ket ngay</a>). TT se bi giu (frozen) cho toi khi bot giao hang.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="dark" onClick={() => setConfirm(null)} className="flex-1">Huy</Button>
              <Button onClick={buy} disabled={buying} className="flex-1">{buying ? 'Dang dat...' : 'Xac nhan'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <p className="text-xs text-muted mt-6 flex items-center gap-1"><ArrowUpDown size={12} /> Dang nhap + lien ket nhan vat de mua. Don hang qua POST /orders.</p>
    </div>
  );
}
