import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isAuthPage = location === '/login' || location === '/signup' || location === '/forgot-password';
  if (isAuthPage) {
    return (
      <div className="bg-neutral-100 text-neutral-800 font-sans">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 text-neutral-800 font-sans flex ">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1  p-6 bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
