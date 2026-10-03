'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, returnFocus, className = '' }: { title: string; onClose: () => void; children: ReactNode; returnFocus?: HTMLElement | null; className?: string }) {
  const id = useId();
  const dialog = useRef<HTMLElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = returnFocus ?? document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = [...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select, summary, [tabindex="0"]')].filter(element => element.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; requestAnimationFrame(() => previous?.isConnected && previous.focus()); };
  }, []);
  return <div className="modal-backdrop" onClick={() => close.current()}><section ref={dialog} className={`app-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={id} onClick={event => event.stopPropagation()}><header><h2 id={id}>{title}</h2><button className="icon-button" aria-label={`${title} 닫기`} onClick={() => close.current()}><X size={22} /></button></header>{children}</section></div>;
}
