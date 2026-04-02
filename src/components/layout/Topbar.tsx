import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFleetStore } from '../../stores/useFleetStore';

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Live Map', path: '/dashboard', end: true },
    { label: 'Drivers', path: '/dashboard/drivers' },
    { label: 'Trucks', path: '/dashboard/trucks' },
    { label: 'Reports', path: '/dashboard/reports' },
    { label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <header className="h-16 border-b border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#111111] px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white dark:border-black rounded-sm" />
          </div>
          <span className="text-xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">FleetTrack</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'text-[#0A0A0A] dark:text-[#F0F0F0] bg-[#F5F5F5] dark:bg-[#1A1A1A]' 
                  : 'text-[#6B6B6B] dark:text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#F0F0F0] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
                }
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Admin</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555]">{user?.mobile}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#EBEBEB] dark:bg-[#222222] flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2E2E]">
            <User className="w-5 h-5 text-[#6B6B6B] dark:text-[#888888]" />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6B6B6B] dark:text-[#888888] hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
