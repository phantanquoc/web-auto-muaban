"use client";
import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Power, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { fmtNum, fmtXu, shortId, relativeTime, absoluteTime, copyText } from '../../../lib/format';
import { LightCard } from '../../../components/ui/Card';
import { LightInput, LightSelect, Field } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { StatCard, DataTable } from '../../../components/ui/Data';
import { EmptyState, Skeleton, LightErrorBlock } from '../../../components/ui/States';
import { useToast } from '../../../components/ui/Toast';

const TABS = ['Tong quan', 'Bots', 'Don hang', 'Ty gia'];

export default function AdminBots() {
  const { push } = useToast();
  const [tab, setTab] = useState('Bots');
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({ name: '', server: '', type: 'SELL', mapHint: '', posHint: '', enabled: true });
  const [creating, setCreating] = useState(false);
  const [tokenModal, setTokenModal] = useState<{ name: string; token: string } | null>(null);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');

  function load() {
    setLoading(true);
    setError('');
    apiFetch('/admin/bots')
      .then((b) => { setBots(Array.isArray(b) ? b : []); setLoading(false); })
      .catch((e) => { setError(e.message || 'Khong tai duoc bot'); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.name?.trim()) { push({ kind: 'error', text: 'Nhap ten bot' }); return; }
    setCreating(true);
    try {
      const payload: any = { ...form };
      if (!payload.server) delete payload.server;
      if (!payload.mapHint) delete payload.mapHint;
      if (!payload.posHint) delete payload.posHint;
      if (payload.rateOverride === '' || payload.rateOverride === undefined) delete payload.rateOverride;
      if (payload.dailyLimitTt === '' || payload.dailyLimitTt === undefined) delete payload.dailyLimitTt;
      const r = await apiFetch('/admin/bots', { method: 'POST', body: JSON.stringify(payload) });
      setTokenModal({ name: r.name ?? form.name, token: r.plainToken ?? r.token ?? '' });
      setSavedConfirm(false);
      setForm({ name: '', server: '', type: 'SELL', mapHint: '', posHint: '', enabled: true });
      load();
    } catch (e: any) {
      push({ kind: 'error', text: e.data?.message || e.message || 'Tao bot that bai' });
    } finally {
      setCreating(false);
    }
  }

  async function toggle(b: any) {
    try {
      await apiFetch(`/admin/bots/${b.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !b.enabled }) });
      load();
    } catch (e: any) {
      push({ kind: 'error', text: e.data?.message || e.message || 'Doi trang thai that bai' });
    }
  }

  async function rotate(b: any) {
    try {
      const r = await apiFetch(`/admin/bots/${b.id}/rotate-token`, { method: 'POST' });
      setTokenModal({ name: b.name, token: r.token ?? r.plainToken ?? '' });
      setSavedConfirm(false);
    } catch (e: any) {
      push({ kind: 'error', text: e.data?.message || e.message || 'Xoay token that bai' });
    }
  }

  async function copy(text: string, key: string) {
    if (await copyText(text)) {
      setCopied(key);
      push({ kind: 'success', text: 'Da sao chep' });
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    }
  }

  const rows = useMemo(() => {
    let list = [...bots];
    if (filter) list = list.filter((b) => `${b.name} ${b.type} ${b.server ?? ''}`.toLowerCase().includes(filter.toLowerCase()));
    list.sort((a, b) => {
      if (sort === 'rate') return (b.rateOverride ?? 495000) - (a.rateOverride ?? 495000);
      if (sort === 'heartbeat') return new Date(b.lastHeartbeatAt ?? 0).getTime() - new Date(a.lastHeartbeatAt ?? 0).getTime();
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
    return list;
  }, [bots, filter, sort]);

  const stats = useMemo(() => ({
    online: bots.filter((b) => b.lastHeartbeatAt && Date.now() - new Date(b.lastHeartbeatAt).getTime() < 90000).length,
    total: bots.length,
    frozen: 0,
  }), [bots]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Quan ly Bots</h1>

      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4 w-fit" role="tablist" aria-label="Dieu huong admin">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-[44px] px-4 rounded-lg text-sm ${tab === t ? 'bg-navy text-white font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t}{t !== 'Bots' && <span className="ml-1 text-[10px] opacity-60">sap co</span>}
          </button>
        ))}
      </div>

      {tab !== 'Bots' ? (
        <LightCard className="p-6"><EmptyState title={`Muc ${tab} sap co`} hint="Hien tai chi co quan ly Bots. Cac muc khac se bo sung sau." /></LightCard>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 !bg-slate-200" />) : (
              <>
                <StatCard dark={false} label="Bot online" value={`${stats.online}/${stats.total}`} />
                <StatCard dark={false} label="Don hom nay" value="—" sub="xem Don hang" />
                <StatCard dark={false} label="Khoi luong xu" value="—" />
                <StatCard dark={false} label="Don frozen" value={fmtNum(stats.frozen)} />
              </>
            )}
          </div>

          <LightCard className="p-4 mb-4">
            <h2 className="font-semibold text-sm mb-3">Tao bot moi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Field label="Ten bot"><LightInput placeholder="vd. bot-ban-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Loai"><LightSelect value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="SELL">SELL</option><option value="EXCHANGE">EXCHANGE</option></LightSelect></Field>
              <Field label="May chu"><LightInput placeholder="sv1" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} /></Field>
              <Field label="Ban do"><LightInput placeholder="map hint" value={form.mapHint} onChange={(e) => setForm({ ...form, mapHint: e.target.value })} /></Field>
              <Field label="Ty gia (TT/KC)"><LightInput type="number" placeholder="495000" value={form.rateOverride ?? ''} onChange={(e) => setForm({ ...form, rateOverride: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })} /></Field>
              <Field label="Han muc ngay (TT)"><LightInput type="number" placeholder="khong gioi han" value={form.dailyLimitTt ?? ''} onChange={(e) => setForm({ ...form, dailyLimitTt: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })} /></Field>
            </div>
            <button onClick={create} disabled={creating} className="mt-3 min-h-[44px] px-5 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-50">
              {creating ? 'Dang tao...' : 'Tao bot'}
            </button>
          </LightCard>

          <LightCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <LightInput placeholder="Loc theo ten, loai, server..." value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Loc bot" className="sm:max-w-xs" />
              <LightSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sap xep bot" className="sm:w-48">
                <option value="name">Sap xep: Ten</option>
                <option value="rate">Sap xep: Ty gia</option>
                <option value="heartbeat">Sap xep: Moi hoat dong</option>
              </LightSelect>
            </div>
            {error && <div className="mb-3"><LightErrorBlock message={error} onRetry={load} /></div>}
            {loading ? (
              <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 !bg-slate-200" />)}</div>
            ) : (
              <DataTable
                dark={false}
                rows={rows}
                keyOf={(b) => b.id}
                empty={<EmptyState title="Chua co bot nao" hint="Tao bot dau tien bang form o tren." />}
                columns={[
                  { header: 'Bot', cell: (b) => (<div><p className="font-semibold">{b.name}</p><p className="text-xs text-slate-500">{b.type}{b.server ? ` · ${b.server}` : ''}</p></div>) },
                  {
                    header: 'Bat/Tat', cell: (b) => (
                      <button role="switch" aria-checked={!!b.enabled} aria-label={`${b.enabled ? 'Tat' : 'Bat'} bot ${b.name}`} onClick={() => toggle(b)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${b.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${b.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    ),
                  },
                  { header: 'Ty gia', cell: (b) => <span className="tnum">{fmtNum(b.rateOverride ?? 495000)}</span> },
                  {
                    header: 'Dung / Han muc', cell: (b) => b.dailyLimitTt ? (
                      <div className="min-w-[120px]"><p className="text-xs tnum">{fmtNum(b.usedTtToday ?? 0)} / {fmtNum(b.dailyLimitTt)}</p>
                        <div className="h-1.5 rounded bg-slate-200 overflow-hidden mt-1"><div className="h-full bg-navy rounded" style={{ width: `${Math.min(100, Math.round(((b.usedTtToday ?? 0) / b.dailyLimitTt) * 100))}%` }} /></div></div>
                    ) : <span className="text-xs text-slate-400">khong gioi han</span>,
                  },
                  { header: 'Heartbeat', cell: (b) => <span className="text-xs" title={absoluteTime(b.lastHeartbeatAt)}>{relativeTime(b.lastHeartbeatAt)}</span> },
                  {
                    header: 'Thao tac', cell: (b) => (
                      <div className="flex gap-1">
                        <button onClick={() => copy(b.id, b.id)} aria-label={`Sao chep ID bot ${b.name}`} title={b.id} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                          {copied === b.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button onClick={() => toggle(b)} aria-label={`${b.enabled ? 'Tat' : 'Bat'} bot ${b.name}`} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                          <Power size={16} />
                        </button>
                        <button onClick={() => rotate(b)} aria-label={`Xoay token bot ${b.name}`} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
            {!loading && rows.length > 0 && <p className="text-xs text-slate-400 mt-2">ID rut gon 8 ky tu — bam icon sao chep de lay full ID.</p>}
          </LightCard>
        </>
      )}

      <Modal open={!!tokenModal} onClose={() => { if (savedConfirm) setTokenModal(null); }} title={`Token bot ${tokenModal?.name ?? ''}`} dark={false}>
        {tokenModal && (
          <div className="text-sm">
            <p className="text-slate-600 mb-2">Token chi hien <strong>mot lan</strong>. Luu ngay vao cau hinh bot.</p>
            <p className="font-mono text-sm break-all bg-mist rounded-lg p-3 tnum">{tokenModal.token}</p>
            <button onClick={() => copy(tokenModal.token, 'token')} className="mt-2 min-h-[44px] px-4 rounded-lg bg-navy text-white text-sm font-semibold">
              {copied === 'token' ? 'Da sao chep' : 'Sao chep token'}
            </button>
            <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
              <input type="checkbox" checked={savedConfirm} onChange={(e) => setSavedConfirm(e.target.checked)} className="h-5 w-5" />
              Toi da luu token an toan
            </label>
            <button onClick={() => setTokenModal(null)} disabled={!savedConfirm} className="mt-3 w-full min-h-[44px] rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">
              Xac nhan & dong
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
