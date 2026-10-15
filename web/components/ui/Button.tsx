"use client";
import React from 'react';

type Variant = 'gold' | 'dark' | 'ghost' | 'danger' | 'success';

const styles: Record<Variant, string> = {
  gold: 'bg-gold text-void hover:bg-gold-soft disabled:opacity-50 font-semibold',
  dark: 'bg-surface text-white border border-white/10 hover:border-gold/60 disabled:opacity-50',
  ghost: 'text-muted hover:text-white disabled:opacity-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 font-semibold',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 font-semibold',
};

export function Button({
  variant = 'gold',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-[44px] px-4 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
