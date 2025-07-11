import React from "react";

const Footer: React.FC = () => (
  <footer className="border-top py-3 mt-4 text-center">
    <span className="text-muted">&copy; {new Date().getFullYear()} Food & Fitness Tracker</span>
  </footer>
);

export default Footer; 