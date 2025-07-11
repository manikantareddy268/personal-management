import React, { useState, useEffect } from "react";
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

  // Food and Workout log state
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  // Form state
  const [foodForm, setFoodForm] = useState({ meal: '', calories: '', description: '', date: '' });
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [workoutForm, setWorkoutForm] = useState({ type: '', duration: '', caloriesBurned: '', notes: '', date: '' });
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // Check for JWT in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchFoodLogs(token);
      fetchWorkoutLogs(token);
    }
  }, []);

  // Fetch food logs
  const fetchFoodLogs = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/food`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) setFoodLogs(data);
    } catch {}
  };

  // Fetch workout logs
  const fetchWorkoutLogs = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/workout`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) setWorkoutLogs(data);
    } catch {}
  };

  // Refresh logs after login
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        fetchFoodLogs(token);
        fetchWorkoutLogs(token);
      }
    }
  }, [user]);

  // Add or update food log
  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const method = editingFoodId ? 'PUT' : 'POST';
    const url = editingFoodId ? `${API_URL}/food/${editingFoodId}` : `${API_URL}/food`;
    const body = {
      ...foodForm,
      calories: Number(foodForm.calories),
      date: foodForm.date || undefined,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setFoodForm({ meal: '', calories: '', description: '', date: '' });
        setEditingFoodId(null);
        fetchFoodLogs(token);
      }
    } catch {}
  };

  // Edit food log
  const handleEditFood = (log: any) => {
    setFoodForm({
      meal: log.meal,
      calories: log.calories.toString(),
      description: log.description || '',
      date: log.date ? log.date.slice(0, 10) : '',
    });
    setEditingFoodId(log._id);
  };

  // Delete food log
  const handleDeleteFood = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/food/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    fetchFoodLogs(token);
  };

  // Add or update workout log
  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const method = editingWorkoutId ? 'PUT' : 'POST';
    const url = editingWorkoutId ? `${API_URL}/workout/${editingWorkoutId}` : `${API_URL}/workout`;
    const body = {
      ...workoutForm,
      duration: Number(workoutForm.duration),
      caloriesBurned: Number(workoutForm.caloriesBurned),
      date: workoutForm.date || undefined,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setWorkoutForm({ type: '', duration: '', caloriesBurned: '', notes: '', date: '' });
        setEditingWorkoutId(null);
        fetchWorkoutLogs(token);
      }
    } catch {}
  };

  // Edit workout log
  const handleEditWorkout = (log: any) => {
    setWorkoutForm({
      type: log.type,
      duration: log.duration.toString(),
      caloriesBurned: log.caloriesBurned.toString(),
      notes: log.notes || '',
      date: log.date ? log.date.slice(0, 10) : '',
    });
    setEditingWorkoutId(log._id);
  };

  // Delete workout log
  const handleDeleteWorkout = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/workout/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    fetchWorkoutLogs(token);
  };

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
        {section === 'food' && (
          <div>
            <h3>Food Logs</h3>
            <form className="mb-4" onSubmit={handleFoodSubmit}>
              <div className="row g-2 mb-2">
                <div className="col-md-3"><input className="form-control" placeholder="Meal" value={foodForm.meal} onChange={e => setFoodForm(f => ({ ...f, meal: e.target.value }))} required /></div>
                <div className="col-md-2"><input className="form-control" type="number" placeholder="Calories" value={foodForm.calories} onChange={e => setFoodForm(f => ({ ...f, calories: e.target.value }))} required /></div>
                <div className="col-md-4"><input className="form-control" placeholder="Description" value={foodForm.description} onChange={e => setFoodForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="col-md-2"><input className="form-control" type="date" value={foodForm.date} onChange={e => setFoodForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="col-md-1 d-grid"><button className="btn btn-success" type="submit">{editingFoodId ? 'Update' : 'Add'}</button></div>
              </div>
              {editingFoodId && <div className="mb-2"><button className="btn btn-secondary btn-sm" type="button" onClick={() => { setEditingFoodId(null); setFoodForm({ meal: '', calories: '', description: '', date: '' }); }}>Cancel Edit</button></div>}
            </form>
            <ul className="list-group mb-4">
              {foodLogs.map(log => (
                <li key={log._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{log.meal}</strong> - {log.calories} cal - {log.description} <span className="text-muted">({new Date(log.date).toLocaleDateString()})</span>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditFood(log)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFood(log._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {section === 'workout' && (
          <div>
            <h3>Workout Logs</h3>
            <form className="mb-4" onSubmit={handleWorkoutSubmit}>
              <div className="row g-2 mb-2">
                <div className="col-md-3"><input className="form-control" placeholder="Type" value={workoutForm.type} onChange={e => setWorkoutForm(f => ({ ...f, type: e.target.value }))} required /></div>
                <div className="col-md-2"><input className="form-control" type="number" placeholder="Duration (min)" value={workoutForm.duration} onChange={e => setWorkoutForm(f => ({ ...f, duration: e.target.value }))} required /></div>
                <div className="col-md-2"><input className="form-control" type="number" placeholder="Calories Burned" value={workoutForm.caloriesBurned} onChange={e => setWorkoutForm(f => ({ ...f, caloriesBurned: e.target.value }))} required /></div>
                <div className="col-md-3"><input className="form-control" placeholder="Notes" value={workoutForm.notes} onChange={e => setWorkoutForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <div className="col-md-1"><input className="form-control" type="date" value={workoutForm.date} onChange={e => setWorkoutForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="col-md-1 d-grid"><button className="btn btn-success" type="submit">{editingWorkoutId ? 'Update' : 'Add'}</button></div>
              </div>
              {editingWorkoutId && <div className="mb-2"><button className="btn btn-secondary btn-sm" type="button" onClick={() => { setEditingWorkoutId(null); setWorkoutForm({ type: '', duration: '', caloriesBurned: '', notes: '', date: '' }); }}>Cancel Edit</button></div>}
            </form>
            <ul className="list-group mb-4">
              {workoutLogs.map(log => (
                <li key={log._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{log.type}</strong> - {log.duration} min - {log.caloriesBurned} cal <span className="text-muted">({new Date(log.date).toLocaleDateString()})</span>
                    {log.notes && <div className="small">{log.notes}</div>}
                  </div>
                  <div>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditWorkout(log)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteWorkout(log._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {section === 'planner' && <DayPlanner />}
      </main>
      <Footer />
    </div>
  );
};

export default App;