"use client";
import React from 'react';
import { STATUS_STYLE, type OrderStatus } from '../../lib/format';

export function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}

export function StatusDot({ online, className = '' }: { online?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-500'} ${className}`}
    />
  );
}

export function StatusPill({ status }: { status: string }) {
  const key = (status ?? '').toUpperCase() as OrderStatus;
  const cls = STATUS_STYLE[key] ?? 'bg-white/10 text-white/80 border-white/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}
