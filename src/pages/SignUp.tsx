import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          profile: { firstName: form.firstName, lastName: form.lastName }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registration successful! Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-2 text-center">Create Account</h2>
        <p className="text-gray-500 mb-6 text-center">Sign up to start shopping premium suits!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="w-1/2 border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="w-1/2 border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" />
          </div>
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-400" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition" disabled={loading}>{loading ? 'Registering...' : 'Sign Up'}</button>
          {error && <div className="text-red-600 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <span className="text-blue-700 hover:underline cursor-pointer" onClick={() => navigate('/signin')}>Sign In</span>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 