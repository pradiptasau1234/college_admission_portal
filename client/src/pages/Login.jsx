import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/applicant');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-line p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-[#d5deea] shadow-xs mb-4">
              <img src="/iem-logo.jpg" alt="IEM Logo" className="h-10 w-auto object-contain" />
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <img src="/uem-logo.jpg" alt="UEM Logo" className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-[#083563]">IEM - UEM Admission Portal</h1>
            <p className="text-xs text-[#5a6b7d] mt-1">
              Sign in with your registered credentials to access your admission portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input transition-all ${email ? '!pl-3' : '!pl-10'}`}
                />
                {!email && (
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label mb-0">Password</label>
                <span className="text-[11px] text-[#0b4a8f] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={password ? '' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input transition-all ${password ? '!pl-3 !pr-10' : '!pl-10'}`}
                />
                {!password && (
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b4a8f] hover:bg-[#083563] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-line text-center text-xs text-[#5a6b7d]">
            Don't have an application account?{' '}
            <Link to="/register" className="text-[#0b4a8f] font-semibold hover:underline">
              Create an account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
