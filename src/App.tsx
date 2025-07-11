import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FoodTracker from "./FoodTracker";
import WorkoutTracker from "./WorkoutTracker";
import DayPlanner from "./DayPlanner";
import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import 'bootstrap/dist/css/bootstrap.min.css';
import Fuse from 'fuse.js';

const FOOD_CALORIES: Record<string, number> = {
  rice: 130,
  chicken: 165,
  egg: 155,
  bread: 265,
  apple: 52,
  banana: 89,
  milk: 42,
  paneer: 265,
  dal: 116,
  potato: 77,
  // Add more as needed
};

const foodList = Object.keys(FOOD_CALORIES).map((name: string) => ({ name }));
const fuse = new Fuse<{ name: string }>(foodList, { keys: ['name'], threshold: 0.4 });

const API_URL = 'http://localhost:4000/api';

const App: React.FC = () => {
  const [section, setSection] = useState<'food' | 'workout' | 'planner'>('food');
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'reset'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Food and Workout log state
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  // Form state
  const [foodForm, setFoodForm] = useState({ meal: '', weight: '', calories: '', description: '', date: '' });
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [workoutForm, setWorkoutForm] = useState({ type: '', duration: '', caloriesBurned: '', notes: '', date: '' });
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mealInputRef = useRef<HTMLInputElement>(null);
  // Fuzzy meal suggestions
  const mealSuggestions = foodForm.meal.trim() === ''
    ? []
    : fuse.search(foodForm.meal.trim().toLowerCase()).map((result: Fuse.FuseResult<{ name: string }>) => result.item.name);

  // Calculate calories for food form
  const caloriesPer100g = FOOD_CALORIES[foodForm.meal.trim().toLowerCase()] || 0;
  const weight = Number(foodForm.weight);
  const calculatedCalories = weight && caloriesPer100g ? Math.round((caloriesPer100g * weight) / 100) : 0;
  const isKnownFood = !!FOOD_CALORIES[foodForm.meal.trim().toLowerCase()];

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
      meal: foodForm.meal,
      weight: Number(foodForm.weight),
      calories: isKnownFood ? calculatedCalories : Number(foodForm.calories),
      description: foodForm.description,
      date: foodForm.date || undefined,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setFoodForm({ meal: '', weight: '', calories: '', description: '', date: '' });
        setEditingFoodId(null);
        fetchFoodLogs(token);
      }
    } catch {}
  };

  // Edit food log
  const handleEditFood = (log: any) => {
    setFoodForm({
      meal: log.meal,
      weight: log.weight ? log.weight.toString() : '',
      calories: log.calories ? log.calories.toString() : '',
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
            <form className="mb-4" onSubmit={handleFoodSubmit} autoComplete="off">
              <div className="row g-2 mb-2 position-relative">
                <div className="col-md-3 position-relative">
                  <input
                    className="form-control"
                    placeholder="Meal (e.g. rice, chicken)"
                    value={foodForm.meal}
                    ref={mealInputRef}
                    onChange={e => {
                      setFoodForm(f => ({ ...f, meal: e.target.value }));
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    required
                  />
                  {showSuggestions && mealSuggestions.length > 0 && (
                    <ul className="list-group position-absolute w-100" style={{ zIndex: 10, top: '100%' }}>
                      {mealSuggestions.map((s: string) => (
                        <li
                          key={s}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: 'pointer' }}
                          onMouseDown={() => {
                            setFoodForm(f => ({ ...f, meal: s }));
                            setShowSuggestions(false);
                            mealInputRef.current?.blur();
                          }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-md-2"><input className="form-control" type="number" placeholder="Weight (g)" value={foodForm.weight} onChange={e => setFoodForm(f => ({ ...f, weight: e.target.value }))} required /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Description" value={foodForm.description} onChange={e => setFoodForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="col-md-2"><input className="form-control" type="date" value={foodForm.date} onChange={e => setFoodForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="col-md-2 d-flex align-items-center">
                  {isKnownFood ? (
                    <span className="ms-2">Calories: <strong>{calculatedCalories}</strong></span>
                  ) : (
                    <input className="form-control" type="number" placeholder="Calories" value={foodForm.calories} onChange={e => setFoodForm(f => ({ ...f, calories: e.target.value }))} required />
                  )}
                </div>
                <div className="col-md-1 d-grid"><button className="btn btn-success" type="submit">{editingFoodId ? 'Update' : 'Add'}</button></div>
              </div>
              {editingFoodId && <div className="mb-2"><button className="btn btn-secondary btn-sm" type="button" onClick={() => { setEditingFoodId(null); setFoodForm({ meal: '', weight: '', calories: '', description: '', date: '' }); }}>Cancel Edit</button></div>}
            </form>
            <ul className="list-group mb-4">
              {foodLogs.map(log => (
                <li key={log._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{log.meal}</strong> - {log.weight}g - {log.calories} cal - {log.description} <span className="text-muted">({new Date(log.date).toLocaleDateString()})</span>
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