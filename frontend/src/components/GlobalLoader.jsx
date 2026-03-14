import { useMemo } from 'react';

function LoaderMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-accent text-black font-poppins font-bold text-2xl flex items-center justify-center shadow-lg">
        C
      </div>
      <div>
        <p className="text-white text-base font-semibold tracking-wide">CoreInventory</p>
        <p className="text-slate-300 text-xs">Operations Platform</p>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5 mt-4">
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse [animation-delay:120ms]" />
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse [animation-delay:240ms]" />
    </div>
  );
}

export function FullScreenLoader({ visible, label = 'Preparing your workspace...' }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1c2452,_#0b1026_60%)] backdrop-blur-sm">
      <div className="w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-secondary/80 p-8 shadow-2xl">
        <LoaderMark />
        <p className="mt-6 text-sm text-slate-300">{label}</p>
        <Dots />
      </div>
    </div>
  );
}

export function ActivityLoader({ visible, label }) {
  const message = useMemo(() => label || 'Loading', [label]);
  if (!visible) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[90] h-1 overflow-hidden bg-white/10">
        <div className="activity-loader-bar h-full w-1/3 rounded-r-full bg-accent" />
      </div>
      <div className="fixed right-4 top-4 z-[90] rounded-full border border-white/10 bg-secondary/90 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg backdrop-blur">
        {message}...
      </div>
    </>
  );
}
