import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useThemeStore } from '../store/themeStore';

export default function Layout({ children }) {
  useRealtimeSync();
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex bg-primary min-h-screen font-inter">
      <Sidebar />
      <div className="flex-1 min-w-0 ml-[260px] flex flex-col min-h-screen relative">
        <Navbar />
        <main className="p-8 flex-1 min-w-0 overflow-auto bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
