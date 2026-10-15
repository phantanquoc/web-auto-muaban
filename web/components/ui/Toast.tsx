"use client";
import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type Toast = { id: number; kind: 'success' | 'error' | 'info'; text: string; link?: { href: string; label: string } };
const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void }>({ push: () => {} });

export const useToast = () => useContext(Ctx);

let seq = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = seq++;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 6000);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-start gap-2 rounded-xl bg-surface border border-gold/40 text-white px-4 py-3 shadow-pop text-sm">
            {t.kind === 'success' ? <CheckCircle2 size={18} className="text-emerald-400 mt-0.5" /> : t.kind === 'error' ? <AlertCircle size={18} className="text-rose-400 mt-0.5" /> : <Info size={18} className="text-sky-400 mt-0.5" />}
            <div>
              <div>{t.text}</div>
              {t.link && <a href={t.link.href} className="text-gold underline font-medium">{t.link.label}</a>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
