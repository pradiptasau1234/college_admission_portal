import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' || searchParams.get('tab') === 'admin' ? 'admin' : 'applicant';
  
  const [portalType, setPortalType] = useState(initialRole);
  const [email, setEmail] = useState(initialRole === 'admin' ? 'admin@iem.edu' : '');
  const [password, setPassword] = useState(initialRole === 'admin' ? 'Admin@123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'admin' || searchParams.get('tab') === 'admin') {
      setPortalType('admin');
      setEmail('admin@iem.edu');
      setPassword('Admin@123');
    }
  }, [searchParams]);

  const handlePortalSwitch = (type) => {
    setPortalType(type);
    setError('');
    if (type === 'admin') {
      setEmail('admin@iem.edu');
      setPassword('Admin@123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

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
            <h1 className="text-2xl font-bold text-[#083563]">
              {portalType === 'admin' ? 'IEM - UEM Admin Console' : 'IEM - UEM Admission Portal'}
            </h1>
            <p className="text-xs text-[#5a6b7d] mt-1">
              {portalType === 'admin' 
                ? 'Sign in as Admission Officer to review applicant dossiers and verify records'
                : 'Sign in with your registered credentials to access your admission application'}
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-5 border border-gray-200">
            <button
              type="button"
              onClick={() => handlePortalSwitch('applicant')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 ${
                portalType === 'applicant'
                  ? 'bg-white text-[#083563] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidate Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 ${
                portalType === 'admin'
                  ? 'bg-white text-purple-900 shadow-xs border border-purple-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Portal</span>
            </button>
          </div>

          {portalType === 'admin' && (
            <div className="mb-4 p-2.5 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span className="font-medium text-[11px]">Default Admin: <strong className="font-mono">admin@iem.edu</strong></span>
              </div>
              <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">Faculty / Staff</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                {portalType === 'admin' ? 'Admin Email Address' : 'Email Address'}
              </label>
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
                {portalType === 'applicant' && (
                  <span className="text-[11px] text-[#0b4a8f] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
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
              className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 ${
                portalType === 'admin'
                  ? 'bg-purple-800 hover:bg-purple-900'
                  : 'bg-[#0b4a8f] hover:bg-[#083563]'
              }`}
            >
              <span>{loading ? 'Authenticating...' : portalType === 'admin' ? 'Sign In to Admin Portal' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {portalType === 'applicant' ? (
            <div className="mt-6 pt-5 border-t border-slate-line text-center text-xs text-[#5a6b7d]">
              Don't have an application account?{' '}
              <Link to="/register" className="text-[#0b4a8f] font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-slate-line text-center text-xs text-[#5a6b7d]">
              Are you an applicant?{' '}
              <button
                type="button"
                onClick={() => handlePortalSwitch('applicant')}
                className="text-purple-700 font-semibold hover:underline"
              >
                Go to Candidate Portal
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;
