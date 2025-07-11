import React, { useState } from "react";

interface LoginProps {
  onSwitch: (form: 'signup' | 'reset') => void;
  onLogin: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    onLogin(email, password);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <form className="p-4 bg-white rounded shadow" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="loginEmail" className="form-label">Email address</label>
          <input type="email" className="form-control" id="loginEmail" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="loginPassword" className="form-label">Password</label>
          <input type="password" className="form-control" id="loginPassword" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">Login</button>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button type="button" className="btn btn-link p-0" onClick={() => onSwitch('reset')}>Forgot password?</button>
          <button type="button" className="btn btn-link p-0" onClick={() => onSwitch('signup')}>Sign up</button>
        </div>
      </form>
    </div>
  );
};

export default Login; 