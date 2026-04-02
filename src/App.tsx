import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import FleetMap from './components/map/FleetMap';
import DriversPage from './pages/DriversPage';
import TrucksPage from './pages/TrucksPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import DriverMobilePage from './pages/DriverMobilePage';
import ProtectedRoute from './lib/ProtectedRoute';
import SimulationProvider from './lib/SimulationProvider';
import { useFleetStore } from './stores/useFleetStore';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/dashboard" element={
              <SimulationProvider>
                <DashboardLayout />
              </SimulationProvider>
            }>
              <Route index element={<FleetMap />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="trucks" element={<TrucksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="driver" />}>
            <Route path="/driver" element={<DriverMobilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
