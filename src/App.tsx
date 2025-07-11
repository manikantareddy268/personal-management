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

const API_URL = 'http://localhost:4000/api';

const App: React.FC = () => {
  const [section, setSection] = useState<'food' | 'workout' | 'planner'>('food');
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'reset'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Check for JWT in localStorage on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      // Auto-login after signup
      await handleLogin(email, password);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (email: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      alert('Password reset successful!');
      setAuthPage('login');
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthPage('login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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