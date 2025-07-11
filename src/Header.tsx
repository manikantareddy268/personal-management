import React from "react";

type Section = 'food' | 'workout' | 'planner';

interface HeaderProps {
  section: Section;
  setSection: (section: Section) => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ section, setSection, user, onLogout }) => (
  <header>
    <nav className="navbar navbar-expand bg-light border-bottom mb-3">
      <div className="container-fluid">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button className={`nav-link${section === 'food' ? ' active' : ''}`} onClick={() => setSection('food')}>Food Tracker</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link${section === 'workout' ? ' active' : ''}`} onClick={() => setSection('workout')}>Workout Tracker</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link${section === 'planner' ? ' active' : ''}`} onClick={() => setSection('planner')}>Day Planner</button>
          </li>
        </ul>
        {user && onLogout && (
          <div className="ms-auto d-flex align-items-center">
            <span className="me-3">Welcome, {user.name}!</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  </header>
);

export default Header; 