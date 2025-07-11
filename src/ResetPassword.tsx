import React, { useState } from "react";

interface ResetPasswordProps {
  onSwitch: (form: 'login') => void;
  onReset: (email: string, newPassword: string) => boolean | void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSwitch, onReset }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    const result = onReset(email, newPassword);
    if (result === false) {
      setError("Email not found.");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <form className="p-4 bg-white rounded shadow" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center">Reset Password</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="resetEmail" className="form-label">Email address</label>
          <input type="email" className="form-control" id="resetEmail" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="resetPassword" className="form-label">New Password</label>
          <input type="password" className="form-control" id="resetPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">Reset Password</button>
        <div className="text-center">
          <button type="button" className="btn btn-link p-0" onClick={() => onSwitch('login')}>Back to Login</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword; 