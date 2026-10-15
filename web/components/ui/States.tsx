"use client";
import React from 'react';

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-4xl mb-3" aria-hidden>◌</div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="text-sm opacity-60 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm">
      <p className="font-semibold text-rose-300">Co loi xay ra</p>
      <p className="opacity-80 mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 min-h-[44px] px-4 rounded-lg bg-rose-600 text-white text-sm font-semibold">
          Thu lai
        </button>
      )}
    </div>
  );
}

export function LightErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
      <p className="font-semibold">Co loi xay ra</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 min-h-[44px] px-4 rounded-lg bg-rose-600 text-white text-sm font-semibold">
          Thu lai
        </button>
      )}
    </div>
  );
}
