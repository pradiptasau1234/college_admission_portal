import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import DocumentModal from '../components/DocumentModal';
import {
  User, BookOpen, Award, CheckCircle, AlertCircle, FileUp, CreditCard,
  Send, Save, Clock, ShieldCheck, Eye, Trash2, CheckCircle2, AlertTriangle, Lock
} from 'lucide-react';

const ApplicantDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Reference options from API
  const [courses, setCourses] = useState([]);
  const [formOptions, setFormOptions] = useState({
    states: [],
    boards10: [],
    boards12: [],
    categories: [],
    entranceExams: [],
    sessions: []
  });
  const [documentTypes, setDocumentTypes] = useState([]);

  // Application State
  const [application, setApplication] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [isSubmittable, setIsSubmittable] = useState(false);

  // Form State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    mobile: '',
    guardianName: '',
    category: '',
    state: '',
    address: ''
  });

  const [class10, setClass10] = useState({
    board: '',
    school: '',
    passingYear: '',
    totalMarks: '',
    marksObtained: '',
    percentage: 0
  });

  const [class12, setClass12] = useState({
    board: '',
    school: '',
    passingYear: '',
    physics: '',
    chemistry: '',
    mathematics: '',
    totalMarks: '',
    marksObtained: '',
    percentage: 0
  });

  const [entranceExam, setEntranceExam] = useState({
    examType: '',
    examYear: '',
    rollNumber: '',
    jeeMainPercentile: '',
    wbjeeRank: '',
    iemjeeScore: ''
  });

  const [coursePreferences, setCoursePreferences] = useState({
    admissionSession: '2025-2026',
    course: '',
    coursePreference2: '',
    coursePreference3: ''
  });

  const [feeReference, setFeeReference] = useState('');
  const [payingFee, setPayingFee] = useState(false);

  // Document Modal state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cross-field validation errors
  const [yearError, setYearError] = useState('');
  const [marks10Error, setMarks10Error] = useState('');
  const [marks12Error, setMarks12Error] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [coursesRes, optionsRes, docsRes, appRes] = await Promise.all([
        API.get('/courses'),
        API.get('/form-options'),
        API.get('/document-types'),
        API.get('/applications/my')
      ]);

      setCourses(coursesRes.data.courses || []);
      setFormOptions(optionsRes.data || {});
      setDocumentTypes(docsRes.data.documentTypes || []);

      const app = appRes.data.application;
      setApplication(app);
      setChecklist(appRes.data.missingChecklist || []);
      setIsSubmittable(appRes.data.isSubmittable);

      if (app) {
        if (app.personalDetails) setPersonalDetails(prev => ({ ...prev, ...app.personalDetails }));
        if (app.class10) setClass10(prev => ({ ...prev, ...app.class10 }));
        if (app.class12) setClass12(prev => ({ ...prev, ...app.class12 }));
        if (app.entranceExam) setEntranceExam(prev => ({ ...prev, ...app.entranceExam }));
        if (app.coursePreferences) setCoursePreferences(prev => ({ ...prev, ...app.coursePreferences }));
        if (app.feePayment?.paymentReference) setFeeReference(app.feePayment.paymentReference);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage({ text: 'Failed to load application data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Auto calculate Class 10 percentage & validate marks obtained <= total marks
  useEffect(() => {
    const total = parseFloat(class10.totalMarks);
    const obtained = parseFloat(class10.marksObtained);
    if (!isNaN(total) && !isNaN(obtained)) {
      if (obtained > total) {
        setMarks10Error('Marks obtained cannot be greater than total marks.');
        setClass10(prev => ({ ...prev, percentage: 0 }));
      } else {
        setMarks10Error('');
        if (total > 0 && obtained >= 0) {
          const pct = parseFloat(((obtained / total) * 100).toFixed(2));
          setClass10(prev => ({ ...prev, percentage: pct }));
        }
      }
    } else {
      setMarks10Error('');
    }
  }, [class10.totalMarks, class10.marksObtained]);

  // Auto calculate Class 12 percentage & validate marks obtained <= total marks
  useEffect(() => {
    const total = parseFloat(class12.totalMarks);
    const obtained = parseFloat(class12.marksObtained);
    if (!isNaN(total) && !isNaN(obtained)) {
      if (obtained > total) {
        setMarks12Error('Marks obtained cannot be greater than total marks.');
        setClass12(prev => ({ ...prev, percentage: 0 }));
      } else {
        setMarks12Error('');
        if (total > 0 && obtained >= 0) {
          const pct = parseFloat(((obtained / total) * 100).toFixed(2));
          setClass12(prev => ({ ...prev, percentage: pct }));
        }
      }
    } else {
      setMarks12Error('');
    }
  }, [class12.totalMarks, class12.marksObtained]);

  // Validate year order: Class 12 passing year > Class 10 passing year
  useEffect(() => {
    const y10 = parseInt(class10.passingYear);
    const y12 = parseInt(class12.passingYear);
    if (!isNaN(y10) && !isNaN(y12) && y10 > 0 && y12 > 0) {
      if (y12 <= y10) {
        setYearError('Passing year of Class 12 must be greater than Class 10.');
      } else {
        setYearError('');
      }
    } else {
      setYearError('');
    }
  }, [class10.passingYear, class12.passingYear]);

  // Save Draft handler
  const handleSaveDraft = async () => {
    if (marks10Error || marks12Error || yearError) {
      return setMessage({ text: marks10Error || marks12Error || yearError, type: 'error' });
    }
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });

      const payload = {
        personalDetails,
        class10,
        class12,
        entranceExam,
        coursePreferences
      };

      const res = await API.post('/applications/draft', payload);
      setApplication(res.data.application);
      setChecklist(res.data.missingChecklist || []);
      setIsSubmittable(res.data.isSubmittable);
      setMessage({ text: 'Draft saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save draft.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Fee payment submission handler
  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!feeReference.trim()) {
      return setMessage({ text: 'Please enter transaction reference or UTR number.', type: 'error' });
    }

    try {
      setPayingFee(true);
      const res = await API.post('/applications/fee/pay', { paymentReference: feeReference });
      setApplication(prev => ({ ...prev, feePayment: res.data.feePayment }));
      setMessage({ text: 'Payment reference submitted successfully!', type: 'success' });
      // Refresh checklist
      const appRes = await API.get('/applications/my');
      setChecklist(appRes.data.missingChecklist || []);
      setIsSubmittable(appRes.data.isSubmittable);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Payment reference update failed.', type: 'error' });
    } finally {
      setPayingFee(false);
    }
  };

  // Document upload handler
  const handleFileUpload = async (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    try {
      setMessage({ text: `Uploading ${file.name}...`, type: 'info' });
      const res = await API.post('/applications/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setApplication(prev => ({ ...prev, documents: res.data.documents }));
      setMessage({ text: 'Document uploaded successfully!', type: 'success' });
      e.target.value = '';
      
      const appRes = await API.get('/applications/my');
      setChecklist(appRes.data.missingChecklist || []);
      setIsSubmittable(appRes.data.isSubmittable);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Document upload failed.', type: 'error' });
    }
  };

  // Final submit handler
  const handleSubmitApplication = async () => {
    if (marks10Error || marks12Error || yearError) {
      return setMessage({ text: marks10Error || marks12Error || yearError, type: 'error' });
    }

    if (!window.confirm('Are you sure you want to finalize and submit your application? Once submitted, the application will be locked for official verification.')) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/applications/submit');
      setApplication(res.data.application);
      setChecklist([]);
      setIsSubmittable(false);
      setMessage({ text: 'Application successfully submitted and locked for review!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = application && application.status !== 'Draft';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs font-semibold">Draft</span>;
      case 'Submitted':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full text-xs font-semibold">Submitted</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-semibold">Under Review</span>;
      case 'Selected':
        return <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded-full text-xs font-bold">Selected / Provisionally Admitted</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-xs font-semibold">Application Not Shortlisted</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-10 h-10 border-4 border-[#0b4a8f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 font-medium">Loading your admission application...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Top Banner / Application Status Bar */}
      <div className="bg-white border border-slate-line rounded-lg p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#083563] m-0">
              IEM - UEM Admission Portal
            </h1>
            <span className="text-xs font-mono font-bold bg-[#f0f4f9] text-[#0b4a8f] px-2.5 py-0.5 rounded border border-[#d5deea]">
              {application?.applicationId || 'NEW-APP'}
            </span>
          </div>
          <p className="text-xs text-[#5a6b7d] mt-1">
            Institute of Engineering & Management &bull; Academic Session 2025 - 2026
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block font-medium">Status</span>
            {getStatusBadge(application?.status)}
          </div>

          {!isLocked && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-[#0b4a8f] border border-[#0b4a8f] rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alert Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-xs font-medium flex items-center space-x-2 ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : message.type === 'info'
            ? 'bg-blue-50 border border-blue-200 text-blue-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Application Lock Banner if Submitted */}
      {isLocked && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center space-x-3">
          <Lock className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <div>
            <p className="font-bold">Application Locked</p>
            <p className="text-amber-800 mt-0.5">
              Your application was submitted on {new Date(application.submittedAt).toLocaleDateString()} and is currently under official review. Fields cannot be edited.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Dynamic Missing Items Checklist Alert Box */}
      {!isLocked && (
        <div className="portal-card border-l-4 border-l-[#0b4a8f]">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-[#0b4a8f]" />
              <h2 className="text-sm font-bold text-[#083563] m-0">
                Application Readiness Checklist
              </h2>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              checklist.length === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {checklist.length === 0 ? 'Ready for Final Submission' : `${checklist.length} Missing Requirements`}
            </span>
          </div>

          {checklist.length === 0 ? (
            <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded border border-green-200 mt-2">
              🎉 All mandatory fields, educational qualifications, documents, and application fee have been verified. You can now submit your application in Card H below!
            </p>
          ) : (
            <div className="mt-2 bg-[#f8fafc] p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Please complete the following checklist items before submitting:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5 text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Card A — Personal Details */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card A: Personal Details</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              disabled={isLocked}
              value={personalDetails.fullName}
              onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
              className="form-input"
              placeholder="Candidate full name"
            />
          </div>

          <div>
            <label className="form-label">Date of Birth *</label>
            <input
              type="date"
              disabled={isLocked}
              value={personalDetails.dateOfBirth}
              onChange={(e) => setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Gender *</label>
            <select
              disabled={isLocked}
              value={personalDetails.gender}
              onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
              className="form-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Email Address (Readonly)</label>
            <input
              type="email"
              readOnly
              value={personalDetails.email}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Contact / Mobile Number (Readonly)</label>
            <input
              type="tel"
              readOnly
              value={personalDetails.mobile}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Guardian / Father's Name *</label>
            <input
              type="text"
              disabled={isLocked}
              value={personalDetails.guardianName}
              onChange={(e) => setPersonalDetails({ ...personalDetails, guardianName: e.target.value })}
              className="form-input"
              placeholder="Guardian full name"
            />
          </div>

          <div>
            <label className="form-label">Social Category *</label>
            <select
              disabled={isLocked}
              value={personalDetails.category}
              onChange={(e) => setPersonalDetails({ ...personalDetails, category: e.target.value })}
              className="form-input"
            >
              <option value="">Select Category</option>
              {(formOptions.categories || []).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">State of Domicile *</label>
            <select
              disabled={isLocked}
              value={personalDetails.state}
              onChange={(e) => setPersonalDetails({ ...personalDetails, state: e.target.value })}
              className="form-input"
            >
              <option value="">Select State</option>
              {(formOptions.states || []).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="form-label">Full Residential Address *</label>
            <textarea
              rows={2}
              disabled={isLocked}
              value={personalDetails.address}
              onChange={(e) => setPersonalDetails({ ...personalDetails, address: e.target.value })}
              className="form-input"
              placeholder="House/Street, Locality, City, State, PIN code"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Card B — Class 10 (Secondary) Education */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card B: Class 10 (Secondary) Education</span>
          </div>
          {class10.percentage > 0 && (
            <span className="text-xs font-bold text-[#0b4a8f] bg-[#eaf2fb] px-2.5 py-1 rounded">
              Calculated: {class10.percentage}%
            </span>
          )}
        </div>

        {marks10Error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{marks10Error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Examination Board *</label>
            <select
              disabled={isLocked}
              value={class10.board}
              onChange={(e) => setClass10({ ...class10, board: e.target.value })}
              className="form-input"
            >
              <option value="">Select Board</option>
              {(formOptions.boards10 || []).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">School / Institution Name *</label>
            <input
              type="text"
              disabled={isLocked}
              value={class10.school}
              onChange={(e) => setClass10({ ...class10, school: e.target.value })}
              className="form-input"
              placeholder="e.g. St. Xavier's School"
            />
          </div>

          <div>
            <label className="form-label">Passing Year *</label>
            <input
              type="number"
              disabled={isLocked}
              min={1990}
              max={2026}
              value={class10.passingYear || ''}
              onChange={(e) => setClass10({ ...class10, passingYear: e.target.value })}
              className="form-input"
              placeholder="e.g. 2021"
            />
          </div>

          <div>
            <label className="form-label">Total Marks *</label>
            <input
              type="number"
              disabled={isLocked}
              min={1}
              value={class10.totalMarks || ''}
              onChange={(e) => setClass10({ ...class10, totalMarks: e.target.value })}
              className="form-input"
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label className="form-label">Marks Obtained *</label>
            <input
              type="number"
              disabled={isLocked}
              min={0}
              max={class10.totalMarks || undefined}
              value={class10.marksObtained || ''}
              onChange={(e) => setClass10({ ...class10, marksObtained: e.target.value })}
              className={`form-input ${marks10Error ? 'border-red-500 bg-red-50/30' : ''}`}
              placeholder="e.g. 450"
            />
          </div>

          <div>
            <label className="form-label">Percentage (%) [Auto-Calculated]</label>
            <input
              type="text"
              readOnly
              value={class10.percentage ? `${class10.percentage}%` : '—'}
              className="form-input font-bold text-[#0b4a8f]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Card C — Class 12 (Higher Secondary) Education */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card C: Class 12 (Higher Secondary) Education</span>
          </div>
          {class12.percentage > 0 && (
            <span className="text-xs font-bold text-[#0b4a8f] bg-[#eaf2fb] px-2.5 py-1 rounded">
              Calculated: {class12.percentage}%
            </span>
          )}
        </div>

        {yearError && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{yearError}</span>
          </div>
        )}

        {marks12Error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{marks12Error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Examination Board / Council *</label>
            <select
              disabled={isLocked}
              value={class12.board}
              onChange={(e) => setClass12({ ...class12, board: e.target.value })}
              className="form-input"
            >
              <option value="">Select Board</option>
              {(formOptions.boards12 || []).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">School / Junior College *</label>
            <input
              type="text"
              disabled={isLocked}
              value={class12.school}
              onChange={(e) => setClass12({ ...class12, school: e.target.value })}
              className="form-input"
              placeholder="School name"
            />
          </div>

          <div>
            <label className="form-label">Passing Year *</label>
            <input
              type="number"
              disabled={isLocked}
              min={1990}
              max={2026}
              value={class12.passingYear || ''}
              onChange={(e) => setClass12({ ...class12, passingYear: e.target.value })}
              className={`form-input ${yearError ? 'border-red-500 bg-red-50/30' : ''}`}
              placeholder="e.g. 2023"
            />
          </div>

          <div>
            <label className="form-label">Physics Marks (out of 100) *</label>
            <input
              type="number"
              disabled={isLocked}
              min={0}
              max={100}
              value={class12.physics !== null ? class12.physics : ''}
              onChange={(e) => setClass12({ ...class12, physics: e.target.value })}
              className="form-input"
              placeholder="0 - 100"
            />
          </div>

          <div>
            <label className="form-label">Chemistry Marks (out of 100) *</label>
            <input
              type="number"
              disabled={isLocked}
              min={0}
              max={100}
              value={class12.chemistry !== null ? class12.chemistry : ''}
              onChange={(e) => setClass12({ ...class12, chemistry: e.target.value })}
              className="form-input"
              placeholder="0 - 100"
            />
          </div>

          <div>
            <label className="form-label">Mathematics Marks (out of 100) *</label>
            <input
              type="number"
              disabled={isLocked}
              min={0}
              max={100}
              value={class12.mathematics !== null ? class12.mathematics : ''}
              onChange={(e) => setClass12({ ...class12, mathematics: e.target.value })}
              className="form-input"
              placeholder="0 - 100"
            />
          </div>

          <div>
            <label className="form-label">Total Marks *</label>
            <input
              type="number"
              disabled={isLocked}
              min={1}
              value={class12.totalMarks || ''}
              onChange={(e) => setClass12({ ...class12, totalMarks: e.target.value })}
              className="form-input"
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label className="form-label">Marks Obtained *</label>
            <input
              type="number"
              disabled={isLocked}
              min={0}
              max={class12.totalMarks || undefined}
              value={class12.marksObtained || ''}
              onChange={(e) => setClass12({ ...class12, marksObtained: e.target.value })}
              className={`form-input ${marks12Error ? 'border-red-500 bg-red-50/30' : ''}`}
              placeholder="e.g. 450"
            />
          </div>

          <div>
            <label className="form-label">Percentage (%) [Auto-Calculated]</label>
            <input
              type="text"
              readOnly
              value={class12.percentage ? `${class12.percentage}%` : '—'}
              className="form-input font-bold text-[#0b4a8f]"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Card D — Entrance Examination */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card D: Entrance Examination</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Entrance Examination *</label>
            <select
              disabled={isLocked}
              value={entranceExam.examType}
              onChange={(e) => setEntranceExam({ ...entranceExam, examType: e.target.value })}
              className="form-input"
            >
              <option value="">Select Exam</option>
              {(formOptions.entranceExams || []).map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Exam Year *</label>
            <input
              type="number"
              disabled={isLocked}
              min={2020}
              max={2026}
              value={entranceExam.examYear || ''}
              onChange={(e) => setEntranceExam({ ...entranceExam, examYear: e.target.value })}
              className="form-input"
              placeholder="e.g. 2024"
            />
          </div>

          <div>
            <label className="form-label">Examination Roll / Application No. *</label>
            <input
              type="text"
              disabled={isLocked}
              value={entranceExam.rollNumber}
              onChange={(e) => setEntranceExam({ ...entranceExam, rollNumber: e.target.value })}
              className="form-input"
              placeholder="Roll Number"
            />
          </div>

          {/* Conditional score inputs based on exam type */}
          {entranceExam.examType === 'JEE_MAIN' && (
            <div>
              <label className="form-label">JEE Main Percentile (NTA Score) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                disabled={isLocked}
                value={entranceExam.jeeMainPercentile || ''}
                onChange={(e) => setEntranceExam({ ...entranceExam, jeeMainPercentile: e.target.value })}
                className="form-input"
                placeholder="e.g. 96.75"
              />
            </div>
          )}

          {entranceExam.examType === 'WBJEE' && (
            <div>
              <label className="form-label">WBJEE General Merit Rank (GMR) *</label>
              <input
                type="number"
                min="1"
                disabled={isLocked}
                value={entranceExam.wbjeeRank || ''}
                onChange={(e) => setEntranceExam({ ...entranceExam, wbjeeRank: e.target.value })}
                className="form-input"
                placeholder="e.g. 1540"
              />
            </div>
          )}

          {entranceExam.examType === 'IEMJEE' && (
            <div>
              <label className="form-label">IEMJEE Score / Rank *</label>
              <input
                type="text"
                disabled={isLocked}
                value={entranceExam.iemjeeScore}
                onChange={(e) => setEntranceExam({ ...entranceExam, iemjeeScore: e.target.value })}
                className="form-input"
                placeholder="IEMJEE Result"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 6: Card E — Course Preferences & Admission Session */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card E: Academic Course Preferences</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Admission Session *</label>
            <select
              disabled={isLocked}
              value={coursePreferences.admissionSession}
              onChange={(e) => setCoursePreferences({ ...coursePreferences, admissionSession: e.target.value })}
              className="form-input"
            >
              {(formOptions.sessions || ['2025-2026']).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Course Preference 1 (Primary Choice) *</label>
            <select
              disabled={isLocked}
              value={coursePreferences.course}
              onChange={(e) => setCoursePreferences({ ...coursePreferences, course: e.target.value })}
              className="form-input font-medium text-[#083563]"
            >
              <option value="">Select Primary Branch</option>
              {courses.map(c => (
                <option key={c.code} value={c.name}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Course Preference 2</label>
            <select
              disabled={isLocked}
              value={coursePreferences.coursePreference2}
              onChange={(e) => setCoursePreferences({ ...coursePreferences, coursePreference2: e.target.value })}
              className="form-input"
            >
              <option value="">Select Second Choice</option>
              {courses.map(c => (
                <option key={c.code} value={c.name}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Course Preference 3</label>
            <select
              disabled={isLocked}
              value={coursePreferences.coursePreference3}
              onChange={(e) => setCoursePreferences({ ...coursePreferences, coursePreference3: e.target.value })}
              className="form-input"
            >
              <option value="">Select Third Choice</option>
              {courses.map(c => (
                <option key={c.code} value={c.name}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>

        {!isLocked && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-xs font-semibold transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Draft Progress'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 7: Card F — Document Uploads */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <FileUp className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card F: Document Uploads</span>
          </div>
          <span className="text-xs text-[#5a6b7d]">Accepted: PDF, JPG, PNG (Max 5MB)</span>
        </div>

        <div className="space-y-3">
          {documentTypes.map(docType => {
            const uploaded = (application?.documents || []).find(d => d.documentType === docType.type);

            return (
              <div
                key={docType.type}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#f8fafc] border border-gray-200 rounded-lg gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">{docType.label}</span>
                    {docType.required && <span className="text-red-500 font-bold text-xs">*</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {uploaded ? (
                      <span className="text-green-700 font-medium">
                        ✓ Uploaded: {uploaded.originalName} ({((uploaded.size || 0) / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <span>Formats: {docType.formats} &bull; Max: {docType.maxSize}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {uploaded && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoc(uploaded);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-[#0b4a8f] border border-gray-300 rounded text-xs font-semibold shadow-sm transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  )}

                  {!isLocked && (
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0b4a8f] hover:bg-[#083563] text-white rounded text-xs font-semibold shadow-sm transition">
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{uploaded ? 'Replace' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(docType.type, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 8: Card G — Application Fee Payment */}
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card G: Application Fee Payment</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            application?.feePayment?.status === 'Paid'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            Status: {application?.feePayment?.status || 'Unpaid'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="bg-[#f0f4f9] p-4 rounded-lg border border-[#d5deea]">
            <span className="text-xs text-gray-500 block">Registration Fee</span>
            <div className="text-2xl font-black text-[#083563] mt-0.5">₹{(application?.feePayment?.amount || 100000).toLocaleString('en-IN')} INR</div>
            <p className="text-[11px] text-gray-500 mt-1">Non-refundable admission processing fee</p>
          </div>

          <div className="md:col-span-2">
            {application?.feePayment?.status === 'Paid' ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-700" />
                  <span>Fee Payment Verified</span>
                </div>
                <div>Reference ID: <span className="font-mono font-bold">{application.feePayment.paymentReference}</span></div>
                <div className="text-[11px] text-green-700 mt-0.5">
                  Paid On: {new Date(application.feePayment.paidAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayFee} className="space-y-3">
                <div>
                  <label className="form-label">
                    Bank / UPI Transaction Reference (UTR) Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={feeReference}
                    onChange={(e) => setFeeReference(e.target.value)}
                    className="form-input font-mono"
                    placeholder="e.g. UPI/HDFC/202611/849201"
                  />
                </div>
                {!isLocked && (
                  <button
                    type="submit"
                    disabled={payingFee}
                    className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {payingFee ? 'Submitting...' : 'Submit Payment Reference'}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Section 9: Card H — Final Submission */}
      <div className="portal-card bg-gradient-to-r from-blue-50/50 to-white">
        <div className="portal-card-header">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-[#0b4a8f]" />
            <span>Card H: Declaration & Final Submission</span>
          </div>
        </div>

        {isLocked ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <span>
              Application #{application.applicationId} has been successfully submitted and locked for evaluation.
            </span>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              I hereby declare that all information furnished in this admission application is true, complete, and correct to the best of my knowledge. I understand that any false or misleading information will result in immediate disqualification and forfeiture of admission.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {isSubmittable ? (
                  <span className="text-green-700 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>All criteria met. Ready for submission.</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Complete the {checklist.length} checklist items to enable submission.</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={!isSubmittable || submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0b4a8f] hover:bg-[#083563] text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-App PDF / Document Viewer Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDoc}
        applicantName={personalDetails.fullName || user?.name}
      />

    </div>
  );
};

export default ApplicantDashboard;
