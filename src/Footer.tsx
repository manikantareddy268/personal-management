import React from "react";

const Footer: React.FC = () => (
  <footer style={{ borderTop: '1px solid #ccc', padding: '1rem 0', marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
    &copy; {new Date().getFullYear()} Food & Fitness Tracker
  </footer>
);

export default Footer; 