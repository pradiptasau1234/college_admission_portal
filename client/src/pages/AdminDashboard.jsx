import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  Users, CheckCircle2, Clock, CheckCircle, XCircle, Search, Filter,
  Eye, FileSpreadsheet, DollarSign, Award, ChevronRight, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, courseFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/courses')
      ]);
      setStats(statsRes.data.stats);
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setTableLoading(true);
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (courseFilter !== 'ALL') params.course = courseFilter;

      const res = await API.get('/admin/applications', { params });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setTableLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="bg-gray-100 text-gray-700 border border-gray-300 px-2 py-0.5 rounded text-[11px] font-semibold">Draft</span>;
      case 'Submitted':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded text-[11px] font-semibold">Submitted</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">Under Review</span>;
      case 'Selected':
        return <span className="bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded text-[11px] font-bold">Selected</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded text-[11px] font-semibold">Rejected</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="w-10 h-10 border-4 border-[#0b4a8f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 font-medium">Loading admissions management console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083563]">Admissions Review Console</h1>
          <p className="text-xs text-[#5a6b7d] mt-1">
            Track student submissions, verify academic records, preview documents, and manage admission decisions
          </p>
        </div>
        <button
          onClick={() => {
            fetchInitialData();
            fetchApplications();
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Total</span>
            <Users className="w-4 h-4 text-[#0b4a8f]" />
          </div>
          <div className="text-xl font-black text-[#083563]">{stats?.totalApplications || 0}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase">Submitted</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-blue-900">{stats?.submittedCount || 0}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase">Under Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-amber-900">{stats?.underReviewCount || 0}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-green-600 mb-1">
            <span className="text-[11px] font-bold uppercase">Selected</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-green-900">{stats?.selectedCount || 0}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-bold uppercase">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-red-900">{stats?.rejectedCount || 0}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-line shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase">Fee Collected</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-emerald-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-line shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, application ID, email, or mobile..."
            className="form-input pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs w-40"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="form-input text-xs w-52"
          >
            <option value="ALL">All Course Preferences</option>
            {courses.map(c => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-line text-[11px] font-bold uppercase text-[#5a6b7d] tracking-wider">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Desired Course</th>
                <th className="py-3 px-4">12th PCM / Exam</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {tableLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#0b4a8f] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Searching records...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0b4a8f]">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{app.personalDetails?.fullName || app.user?.name || '—'}</div>
                      <div className="text-[11px] text-gray-500">{app.personalDetails?.email || app.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {app.coursePreferences?.course || 'Not selected'}
                    </td>
                    <td className="py-3 px-4">
                      {app.class12?.percentage ? (
                        <div className="font-medium text-gray-800">{app.class12.percentage}% (12th)</div>
                      ) : null}
                      <div className="text-[11px] text-gray-500">
                        {app.entranceExam?.examType === 'JEE_MAIN' ? `${app.entranceExam.jeeMainPercentile}%ile JEE` :
                         app.entranceExam?.examType === 'WBJEE' ? `Rank ${app.entranceExam.wbjeeRank} WBJEE` :
                         app.entranceExam?.examType || 'Pending exam'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4">
                      {app.feePayment?.status === 'Paid' ? (
                        <span className="text-green-700 font-semibold text-[11px]">Paid</span>
                      ) : (
                        <span className="text-red-600 font-medium text-[11px]">Unpaid</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#0b4a8f] hover:bg-[#083563] text-white rounded font-medium text-[11px] shadow-sm transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
