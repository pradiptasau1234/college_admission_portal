import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import DocumentModal from '../components/DocumentModal';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Eye, FileText,
  User, BookOpen, Award, CheckCircle2, AlertTriangle, Send
} from 'lucide-react';

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Verification form state
  const [isVerified, setIsVerified] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Document modal state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/applications/${id}`);
      const app = res.data.application;
      setApplication(app);
      if (app.verification) {
        setIsVerified(app.verification.isVerified || false);
        setRemarks(app.verification.remarks || '');
      }
    } catch (err) {
      console.error('Error fetching application detail:', err);
      setMessage({ text: 'Failed to load candidate application.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Submit staff verification decision & remarks
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setMessage({ text: '', type: '' });
      const res = await API.post(`/admin/applications/${id}/verify`, {
        isVerified,
        remarks
      });
      setApplication(prev => ({
        ...prev,
        verification: res.data.verification,
        timeline: res.data.timeline
      }));
      setMessage({ text: 'Academic review & remarks saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update verification.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Transition application workflow status
  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change candidate status to '${newStatus}'?`)) {
      return;
    }

    try {
      setUpdating(true);
      setMessage({ text: '', type: '' });
      const res = await API.post(`/admin/applications/${id}/status`, {
        status: newStatus,
        note: `Status officially updated to ${newStatus} by Admission Officer.`
      });
      setApplication(prev => ({
        ...prev,
        status: res.data.status,
        timeline: res.data.timeline
      }));
      setMessage({ text: `Application status transitioned to ${newStatus}.`, type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update status.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs font-semibold">Draft</span>;
      case 'Submitted':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-semibold">Under Review</span>;
      case 'Selected':
        return <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded-full text-xs font-bold">Selected</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="w-10 h-10 border-4 border-[#0b4a8f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 font-medium">Loading candidate file...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 font-bold mb-4">Application not found.</p>
        <Link to="/admin" className="text-xs text-[#0b4a8f] font-semibold underline">
          &larr; Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0b4a8f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>

        <div>{getStatusBadge(application.status)}</div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-xs font-medium flex items-center space-x-2 ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Candidate Dossier Card */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div>
            <h2 className="text-lg font-bold text-[#083563] m-0">
              {application.personalDetails?.fullName || application.user?.name}
            </h2>
            <p className="text-xs text-[#5a6b7d] mt-0.5">
              Application ID: <span className="font-mono font-bold text-[#0b4a8f]">{application.applicationId}</span> &bull; Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'In Progress'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-400 block font-medium">Allotted Preference</span>
            <span className="text-xs font-bold text-[#083563]">{application.coursePreferences?.course || 'Unassigned'}</span>
          </div>
        </div>

        {/* 1. Personal Details */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <User className="w-4 h-4 text-[#0b4a8f]" />
            <span>Personal & Contact Profile</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-[#f8fafc] p-4 rounded-lg border border-gray-200">
            <div>
              <span className="text-gray-400 block">Date of Birth:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.dateOfBirth || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Gender:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.gender || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Category:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.category || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">State of Domicile:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.state || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Email Address:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.email || application.user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Mobile Number:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.mobile || application.user?.contactNumber}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 block">Residential Address:</span>
              <span className="font-semibold text-gray-800">{application.personalDetails?.address || '—'}</span>
            </div>
          </div>
        </div>

        {/* 2. Academic Record */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-[#0b4a8f]" />
            <span>Academic Qualifications</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class 10 */}
            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-gray-200 text-xs">
              <div className="font-bold text-[#083563] mb-2 border-b border-gray-200 pb-1">
                Class 10 (Secondary)
              </div>
              <div className="space-y-1 text-gray-700">
                <div>Board: <span className="font-semibold">{application.class10?.board || '—'}</span></div>
                <div>School: <span className="font-semibold">{application.class10?.school || '—'}</span></div>
                <div>Passing Year: <span className="font-semibold">{application.class10?.passingYear || '—'}</span></div>
                <div>Marks: <span className="font-semibold">{application.class10?.marksObtained} / {application.class10?.totalMarks}</span> ({application.class10?.percentage}%)</div>
              </div>
            </div>

            {/* Class 12 */}
            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-gray-200 text-xs">
              <div className="font-bold text-[#083563] mb-2 border-b border-gray-200 pb-1">
                Class 12 (Higher Secondary)
              </div>
              <div className="space-y-1 text-gray-700">
                <div>Board: <span className="font-semibold">{application.class12?.board || '—'}</span></div>
                <div>School: <span className="font-semibold">{application.class12?.school || '—'}</span></div>
                <div>Passing Year: <span className="font-semibold">{application.class12?.passingYear || '—'}</span></div>
                <div className="font-semibold text-[#0b4a8f]">
                  Physics: {application.class12?.physics ?? '—'} &bull; Chem: {application.class12?.chemistry ?? '—'} &bull; Math: {application.class12?.mathematics ?? '—'}
                </div>
                <div>Overall: <span className="font-bold">{application.class12?.percentage}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Entrance Exam & Course Preferences */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-[#0b4a8f]" />
            <span>Entrance Exam & Branch Preferences</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-gray-200">
              <div className="font-bold text-[#083563] mb-2 border-b border-gray-200 pb-1">
                Entrance Test Score
              </div>
              <div className="space-y-1 text-gray-700">
                <div>Exam: <span className="font-semibold">{application.entranceExam?.examType || '—'}</span></div>
                <div>Year & Roll: <span className="font-semibold">{application.entranceExam?.examYear || '—'} ({application.entranceExam?.rollNumber || '—'})</span></div>
                {application.entranceExam?.jeeMainPercentile && (
                  <div className="font-bold text-blue-900">JEE Percentile: {application.entranceExam.jeeMainPercentile}%</div>
                )}
                {application.entranceExam?.wbjeeRank && (
                  <div className="font-bold text-blue-900">WBJEE Rank: {application.entranceExam.wbjeeRank}</div>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-gray-200">
              <div className="font-bold text-[#083563] mb-2 border-b border-gray-200 pb-1">
                Course Preferences
              </div>
              <div className="space-y-1 text-gray-700">
                <div>1. <span className="font-bold text-[#0b4a8f]">{application.coursePreferences?.course || 'None'}</span></div>
                <div>2. <span className="font-medium">{application.coursePreferences?.coursePreference2 || 'None'}</span></div>
                <div>3. <span className="font-medium">{application.coursePreferences?.coursePreference3 || 'None'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Uploaded Documents with In-App Modal Previewer */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-[#0b4a8f]" />
            <span>Uploaded Verification Documents</span>
          </h3>

          <div className="space-y-2">
            {(application.documents || []).length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-xs text-gray-500">
                No documents uploaded yet.
              </div>
            ) : (
              (application.documents || []).map(doc => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-[#0b4a8f]" />
                    <div>
                      <span className="font-bold text-gray-900 block">{doc.documentType}</span>
                      <span className="text-[11px] text-gray-500">{doc.originalName} ({((doc.size || 0)/1024).toFixed(1)} KB)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#0b4a8f] hover:bg-[#083563] text-white rounded text-xs font-semibold shadow-sm transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>In-App Preview</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Staff Verification Decision Box */}
        <form onSubmit={handleVerifySubmit} className="mb-6 p-4 bg-blue-50/60 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#0b4a8f]" />
            <h3 className="text-sm font-bold text-[#083563] m-0">
              Staff Academic Verification Decision
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-[#0b4a8f] rounded focus:ring-0"
              />
              <span>Mark candidate academic credentials and marksheets as VERIFIED</span>
            </label>

            <div>
              <label className="form-label text-xs">Official Staff Remarks / Comments</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter verification notes or required correction remarks..."
                className="form-input text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-[#0b4a8f] hover:bg-[#083563] text-white rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Academic Decision'}
            </button>
          </div>
        </form>

        {/* 6. Application Workflow Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Application Status Workflow Transitions
          </h3>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={updating || application.status === 'Under Review'}
              onClick={() => handleStatusChange('Under Review')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-40"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mark as Under Review</span>
            </button>

            <button
              type="button"
              disabled={updating || application.status === 'Selected'}
              onClick={() => handleStatusChange('Selected')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md text-xs font-bold shadow-sm transition disabled:opacity-40"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark as Selected / Admitted</span>
            </button>

            <button
              type="button"
              disabled={updating || application.status === 'Rejected'}
              onClick={() => handleStatusChange('Rejected')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-40"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark as Rejected</span>
            </button>
          </div>
        </div>

        {/* 7. Audit Trail / Timeline */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Workflow Audit History Timeline
          </h3>

          <div className="space-y-3">
            {(application.timeline || []).map((t, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#0b4a8f] mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800">{t.status}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(t.timestamp).toLocaleString()} &bull; by {t.actor || 'System'}
                    </span>
                  </div>
                  {t.note && <p className="text-gray-600 mt-0.5">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* In-App PDF / Document Viewer Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDoc}
        applicantName={application.personalDetails?.fullName || application.user?.name}
      />

    </div>
  );
};

export default AdminApplicationDetail;
