import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FoodTracker from "./FoodTracker";
import WorkoutTracker from "./WorkoutTracker";
import DayPlanner from "./DayPlanner";
import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  const [section, setSection] = useState<'food' | 'workout' | 'planner'>('food');
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'reset'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // In-memory user store for demo (replace with backend later)
  const [users, setUsers] = useState<{ name: string; email: string; password: string }[]>([]);

  const handleLogin = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ name: found.name, email: found.email });
    } else {
      alert('Invalid email or password');
    }
  };

  const handleSignup = (name: string, email: string, password: string) => {
    if (users.some(u => u.email === email)) {
      alert('Email already registered');
      return;
    }
    setUsers([...users, { name, email, password }]);
    setUser({ name, email });
  };

  const handleResetPassword = (email: string, newPassword: string) => {
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) {
      alert('Email not found');
      return false;
    }
    const updated = [...users];
    updated[idx] = { ...updated[idx], password: newPassword };
    setUsers(updated);
    alert('Password reset successful!');
    setAuthPage('login');
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    setAuthPage('login');
  };

  if (!user) {
    if (authPage === 'login') {
      return <Login onSwitch={setAuthPage} onLogin={handleLogin} />;
    } else if (authPage === 'signup') {
      return <Signup onSwitch={setAuthPage} onSignup={handleSignup} />;
    } else if (authPage === 'reset') {
      return <ResetPassword onSwitch={setAuthPage} onReset={handleResetPassword} />;
    }
  }

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 p-0">
      <Header section={section} setSection={setSection} user={user} onLogout={handleLogout} />
      <main className="flex-fill" style={{ padding: '2rem' }}>
        {section === 'food' && <FoodTracker />}
        {section === 'workout' && <WorkoutTracker />}
        {section === 'planner' && <DayPlanner />}
      </main>
      <Footer />
    </div>
  );
};

export default App;