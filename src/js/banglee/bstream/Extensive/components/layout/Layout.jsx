import { useState } from 'react';
import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

export default function Layout() {
  const isSidebarOpen = true;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 transition-all duration-300 ease-in-out ml-56">
          <Outlet />
        </main>
      </div>
    </div>
  );
}