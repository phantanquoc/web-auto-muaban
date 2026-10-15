export const fmtXu = (n: number | null | undefined): string =>
  `${new Intl.NumberFormat('vi-VN').format(Number(n ?? 0))} xu`;

export const fmtNum = (n: number | null | undefined): string =>
  new Intl.NumberFormat('vi-VN').format(Number(n ?? 0));

export function shortId(id: string | null | undefined, len = 8): string {
  if (!id) return '—';
  return id.length > len ? id.slice(0, len) : id;
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'vua xong';
  if (s < 60) return `${s} giay truoc`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phut truoc`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} gio truoc`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngay truoc`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function absoluteTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN');
}

export function rarityOf(maVp?: string, id?: number): { key: string; color: string } {
  const s = `${maVp ?? ''}${id ?? ''}`.toLowerCase();
  if (/than|myth|tt/.test(s)) return { key: 'Than thoai', color: '#F64E60' };
  if (/cuc|vip|cp/.test(s)) return { key: 'Cuc pham', color: '#FFC531' };
  if (/sieu|super|sp/.test(s)) return { key: 'Sieu', color: '#7C5CFF' };
  if (/hiem|rare|h/.test(s)) return { key: 'Hiem', color: '#3699FF' };
  return { key: 'Thuong', color: '#9CA3AF' };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'CANCELLED' | 'FROZEN';

export const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  PROCESSING: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  DONE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  FAILED: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  CANCELLED: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  FROZEN: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
};
