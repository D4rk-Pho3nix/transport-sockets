import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriverTrack from './pages/DriverTrack';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/track/:truckToken" element={<DriverTrack />} />
      </Routes>
    </BrowserRouter>
  );
}
