import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/userSlice';
import { addNotification } from '../store/slices/uiSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (error) { dispatch(addNotification({ type: 'error', message: error })); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return dispatch(addNotification({ type: 'error', message: 'Please fill in all fields' }));
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) dispatch(addNotification({ type: 'success', message: 'Login successful!' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden animate-fade-in">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:mix-blend-screen"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="modal-content p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-bold transition-colors">Sign up</Link>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="form-input" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="form-input" placeholder="Enter your password" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;