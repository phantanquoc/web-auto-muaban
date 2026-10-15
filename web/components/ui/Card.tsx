"use client";
import React from 'react';

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl2 shadow-card ${className}`}>{children}</div>;
}

export function DarkCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-charcoal border border-white/10 rounded-xl2 shadow-card ${className}`}>{children}</div>;
}

export function LightCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white border border-slate-200 rounded-xl2 shadow-sm ${className}`}>{children}</div>;
}
