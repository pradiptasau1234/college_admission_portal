import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, ShieldCheck, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-line sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand & Logos */}
        <div className="flex items-center space-x-3">
          <Link to={user?.role === 'admin' ? '/admin' : '/applicant'} className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-[#d5deea] shadow-xs">
              <img src="/iem-logo.jpg" alt="IEM Logo" className="h-8 md:h-9 w-auto object-contain" />
              <div className="h-6 w-[1px] bg-gray-200"></div>
              <img src="/uem-logo.jpg" alt="UEM Logo" className="h-8 md:h-9 w-auto object-contain" />
            </div>

            <div>
              <span className="font-bold text-base text-[#083563] block leading-tight group-hover:text-[#0b4a8f] transition">
                IEM - UEM Admission System
              </span>
              <span className="text-[11px] text-[#5a6b7d] hidden sm:block leading-none font-medium mt-0.5">
                Institute of Engineering & Management &bull; University of Engineering & Management
              </span>
            </div>
          </Link>
        </div>

        {/* User profile & Actions */}
        {user ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-[#1b2733] block">
                {user.name}
              </span>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {user.role}
              </span>
            </div>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden md:flex items-center space-x-1 text-xs font-medium text-[#0b4a8f] hover:text-[#083563] px-2.5 py-1 rounded bg-[#f0f4f9]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Review</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#0b4a8f] hover:underline px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-[#0b4a8f] hover:bg-[#083563] text-white px-3.5 py-1.5 rounded-md transition"
            >
              Register
            </Link>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
