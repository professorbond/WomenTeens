import { Link, useLocation } from 'react-router-dom';
import { Mountain } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" className="navbar-brand">
          <Mountain size={24} />
          <span>Mountain Safe</span>
        </Link>

        <nav className="navbar-nav" style={{ display: 'none' }}>
          {/* Hidden on mobile by default */}
        </nav>
        <nav className="navbar-nav">
          <Link to="/" className={path === '/' ? 'active' : ''}>
            1. Планирование маршрута
          </Link>
          <a href="#" className={path.startsWith('/audit') ? 'active' : ''}>
            2. Оценка рисков (AI Safety Score)
          </a>
          <a href="#" className={path.startsWith('/monitor') ? 'active' : ''}>
            3. Полетный план &amp; SOS
          </a>
          <a href="#">Офлайн-пакет (PDF)</a>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="navbar-status">
          <span className="pulse"></span>
          SATELLITE SYNC: ACTIVE
        </div>
      </div>
    </header>
  );
};

export default Navbar;
