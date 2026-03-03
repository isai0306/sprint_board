import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Reset password</h1>
      {sent && (
        <div className="auth-success">
          If that email exists, a reset email (mock) has been logged on the server.
        </div>
      )}
      {error && <div className="auth-error">{error}</div>}
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button type="submit">Send reset link</button>
      <div className="auth-footer">
        <Link to="/login">Back to sign in</Link>
      </div>
    </form>
  );
};

