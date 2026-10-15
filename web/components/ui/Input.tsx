"use client";
import React from 'react';

const base = 'min-h-[44px] w-full rounded-lg px-3 py-2 text-sm focus-visible:outline-none';

export function Input({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} bg-void/60 border border-white/15 text-white placeholder:text-muted focus:border-gold ${className}`} {...rest} />;
}

export function LightInput({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-navy ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${base} bg-void/60 border border-white/15 text-white focus:border-gold ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function LightSelect({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${base} bg-white border border-slate-300 text-slate-900 focus:border-navy ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide mb-1.5 opacity-70">{label}</span>
      {children}
      {hint && <span className="block text-xs mt-1 opacity-60">{hint}</span>}
    </label>
  );
}
