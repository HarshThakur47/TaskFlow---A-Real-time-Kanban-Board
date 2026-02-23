import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/userSlice';
import { addNotification } from '../store/slices/uiSlice';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { dispatch(addNotification({ type: 'error', message: error })); dispatch(clearError()); }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim() || formData.username.length < 3) newErrors.username = 'Username must be at least 3 chars';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 chars';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register(registerData));
    if (register.fulfilled.match(result)) dispatch(addNotification({ type: 'success', message: 'Registration successful!' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden animate-fade-in">
      <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-screen"></div>
      <div className="absolute bottom-[10%] left-[-5%] w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:mix-blend-screen"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="modal-content p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-bold transition-colors">Sign in</Link>
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {['username', 'email', 'password', 'confirmPassword'].map((field) => (
                <div key={field} className="form-group mb-0">
                  <label className="form-label capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input
                    name={field}
                    type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                    required
                    value={formData[field]}
                    onChange={handleChange}
                    className={`form-input ${errors[field] ? 'border border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  />
                  {errors[field] && <p className="mt-1 text-xs font-medium text-red-500">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-6">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;