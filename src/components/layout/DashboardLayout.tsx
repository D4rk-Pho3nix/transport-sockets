import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import KPIStrip from './KPIStrip';
import TruckList from '../sidebar/TruckList';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#111111] transition-colors duration-200">
      <Topbar />
      <div className="flex-1 flex overflow-hidden">
        <TruckList />
        <main className="flex-1 relative overflow-hidden">
          <Outlet />
        </main>
      </div>
      <KPIStrip />
    </div>
  );
}
