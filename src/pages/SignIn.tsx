import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const SignIn: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await login(form.email, form.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-500 mb-6 text-center">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          {error && <div className="text-red-600 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account? <span className="text-blue-700 hover:underline cursor-pointer" onClick={() => navigate('/signup')}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 