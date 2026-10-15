"use client";
import React from 'react';

export function StatCard({ label, value, sub, dark = true }: { label: string; value: string; sub?: string; dark?: boolean }) {
  return (
    <div className={`rounded-xl2 p-4 ${dark ? 'bg-charcoal border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
      <p className={`text-xs uppercase tracking-wide font-semibold ${dark ? 'text-muted' : 'text-slate-500'}`}>{label}</p>
      <p className="font-display text-2xl font-bold tnum mt-1">{value}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? 'text-muted' : 'text-slate-500'}`}>{sub}</p>}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  keyOf,
  empty,
  dark = true,
}: {
  columns: { header: string; cell: (row: T) => React.ReactNode; className?: string }[];
  rows: T[];
  keyOf: (row: T, i: number) => string;
  empty?: React.ReactNode;
  dark?: boolean;
}) {
  if (rows.length === 0) return <>{empty ?? null}</>;
  const head = dark ? 'text-muted border-white/10' : 'text-slate-500 border-slate-200';
  const row = dark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50';
  return (
    <div className="overflow-x-auto dark-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b text-left text-xs uppercase tracking-wide ${head}`}>
            {columns.map((c) => (
              <th key={c.header} className={`px-3 py-2 font-semibold ${c.className ?? ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={dark ? 'text-white/90' : 'text-slate-800'}>
          {rows.map((r, i) => (
            <tr key={keyOf(r, i)} className={`border-b last:border-0 ${row}`}>
              {columns.map((c) => (
                <td key={c.header} className={`px-3 py-3 align-top ${c.className ?? ''}`}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
