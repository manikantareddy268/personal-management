import React, { useState } from "react";

interface SignupProps {
  onSwitch: (form: 'login') => void;
  onSignup: (name: string, email: string, password: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitch, onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    onSignup(name, email, password);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <form className="p-4 bg-white rounded shadow" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center">Sign Up</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="signupName" className="form-label">Name</label>
          <input type="text" className="form-control" id="signupName" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="signupEmail" className="form-label">Email address</label>
          <input type="email" className="form-control" id="signupEmail" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="signupPassword" className="form-label">Password</label>
          <input type="password" className="form-control" id="signupPassword" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">Sign Up</button>
        <div className="text-center">
          <span>Already have an account? </span>
          <button type="button" className="btn btn-link p-0" onClick={() => onSwitch('login')}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default Signup; 