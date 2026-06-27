'use client';

import { useToast } from '@/contexts/toast-context';

export default function ToastDisplay() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 left-5 right-5 z-[9999] pointer-events-none">
      <div className="flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`
              pointer-events-auto px-4 py-3 rounded-lg text-sm font-medium text-white
              flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300
              cursor-pointer
              ${
                toast.type === 'success'
                  ? 'bg-[#00D632]'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }
            `}
          >
            {toast.type === 'success' && <span>✓</span>}
            {toast.type === 'error' && <span>✕</span>}
            {toast.type === 'warning' && <span>!</span>}
            {toast.type === 'info' && <span>ℹ</span>}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
