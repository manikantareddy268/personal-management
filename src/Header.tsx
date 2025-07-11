import React from "react";

type Section = 'food' | 'workout' | 'planner';

interface HeaderProps {
  section: Section;
  setSection: (section: Section) => void;
}

const Header: React.FC<HeaderProps> = ({ section, setSection }) => (
  <header style={{ borderBottom: '1px solid #ccc', padding: '1rem 0', marginBottom: '2rem' }}>
    <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <button onClick={() => setSection('food')} style={{ fontWeight: section === 'food' ? 'bold' : 'normal' }}>Food Tracker</button>
      <button onClick={() => setSection('workout')} style={{ fontWeight: section === 'workout' ? 'bold' : 'normal' }}>Workout Tracker</button>
      <button onClick={() => setSection('planner')} style={{ fontWeight: section === 'planner' ? 'bold' : 'normal' }}>Day Planner</button>
    </nav>
  </header>
);

export default Header; 