import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";

const App: React.FC = () => {
  const [section, setSection] = useState<'food' | 'workout' | 'planner'>('food');

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header section={section} setSection={setSection} />
      <main style={{ flex: 1, padding: '2rem' }}>
        {section === 'food' && <div>Food Tracker Section (coming soon)</div>}
        {section === 'workout' && <div>Workout Tracker Section (coming soon)</div>}
        {section === 'planner' && <div>Day Planner Section (coming soon)</div>}
      </main>
      <Footer />
    </div>
  );
};

export default App;