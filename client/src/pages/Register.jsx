import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, Phone, User, ShieldAlert, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (!/^\d{10}$/.test(formData.mobile.trim())) {
      return setError('Please enter a valid 10-digit mobile number.');
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
      navigate('/applicant');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-xl shadow-lg border border-slate-line p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-[#d5deea] shadow-xs mb-4">
              <img src="/iem-logo.jpg" alt="IEM Logo" className="h-10 w-auto object-contain" />
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <img src="/uem-logo.jpg" alt="UEM Logo" className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-[#083563]">Applicant Registration</h1>
            <p className="text-xs text-[#5a6b7d] mt-1">
              Create your profile to start your IEM & UEM admission application
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="form-label">Candidate Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input transition-all ${formData.fullName ? '!pl-3' : '!pl-10'}`}
                />
                {!formData.fullName && (
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input transition-all ${formData.email ? '!pl-3' : '!pl-10'}`}
                />
                {!formData.email && (
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`form-input transition-all ${formData.mobile ? '!pl-3' : '!pl-10'}`}
                />
                {!formData.mobile && (
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder={formData.password ? '' : 'At least 6 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input transition-all ${formData.password ? '!pl-3' : '!pl-10'}`}
                />
                {!formData.password && (
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder={formData.confirmPassword ? '' : 'Re-enter password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input transition-all ${formData.confirmPassword ? '!pl-3' : '!pl-10'}`}
                />
                {!formData.confirmPassword && (
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b4a8f] hover:bg-[#083563] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 pt-2.5"
            >
              <span>{loading ? 'Creating Account...' : 'Register as Applicant'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#5a6b7d]">
            Already registered?{' '}
            <Link to="/login" className="text-[#0b4a8f] font-semibold hover:underline">
              Sign in to your application
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
