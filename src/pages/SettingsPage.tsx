import React from 'react';
import { User, Shield, Palette, Smartphone, Bell, Save } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useFleetStore } from '../stores/useFleetStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const trucks = useFleetStore((s) => s.trucks);

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111] transition-colors">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">Settings</h1>
          <p className="text-[#6B6B6B] dark:text-[#888888]">Manage your profile and platform preferences</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E]">
                <User className="w-5 h-5 text-black dark:text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Admin Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Principal Administrator"
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Phone Number</label>
                <input 
                  type="text" 
                  value={user?.mobile || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E]">
                <Palette className="w-5 h-5 text-black dark:text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Truck Color Management</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trucks.map(truck => (
                <div key={truck.id} className="p-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E] flex flex-col items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-[#2E2E2E] shadow-sm cursor-pointer"
                    style={{ backgroundColor: truck.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] dark:text-[#888888]">{truck.truck_number}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Preferences Panel */}
        <div className="space-y-6">
          <section className="bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-3xl border border-[#E0E0E0] dark:border-[#2E2E2E] p-8 space-y-8">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-black dark:text-white" />
              <h2 className="text-lg font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Preferences</h2>
            </div>

            <div className="space-y-6">


              <div className="flex items-center justify-between opacity-50">
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Push Notifications</p>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">Alerts for stopped trucks</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-[#E0E0E0] relative">
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#E0E0E0] dark:border-[#2E2E2E]">
               <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Security</span>
               </div>
               <button className="w-full py-3 bg-white dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#F5F5F5] dark:hover:bg-[#222222] transition-all">
                  Change Password
               </button>
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-black text-white dark:bg-white dark:text-black space-y-4">
             <Smartphone className="w-8 h-8" />
             <h3 className="text-lg font-display font-bold">Driver App</h3>
             <p className="text-xs opacity-70 leading-relaxed">Ensure all operators have downloaded the mobile bridge for real-time GPS broadcasting.</p>
             <button className="text-xs font-black uppercase tracking-widest border-b border-current pb-1">Download Guide</button>
          </div>
        </div>
      </div>
    </div>
  );
}
