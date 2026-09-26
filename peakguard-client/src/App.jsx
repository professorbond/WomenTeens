import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AuditPage from './pages/AuditPage';
import MonitorPage from './pages/MonitorPage';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ConfiguratorPage />} />
            <Route path="/audit/:tripId" element={<AuditPage />} />
            <Route path="/monitor/:tripId" element={<MonitorPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <span>Mountain Safe Expedition Systems • High-Altitude Route Telemetry</span>
            <div className="footer-right">
              <span>GRID SYSTEM: 8PT WGS84</span>
              <span className="status">SYS_STATUS: NOMINAL</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
