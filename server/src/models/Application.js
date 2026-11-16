const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true,
    enum: [
      'class10Marksheet',
      'class12Marksheet',
      'entranceRankCard',
      'passportPhoto',
      'idProof'
    ]
  },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, default: '' },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  fileData: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  actor: { type: String, default: 'System' }
});

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Selected', 'Rejected'],
    default: 'Draft'
  },
  personalDetails: {
    fullName: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''],
      default: ''
    },
    state: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  class10: {
    board: { type: String, default: '' },
    school: { type: String, default: '' },
    passingYear: { type: Number, default: null },
    totalMarks: { type: Number, default: null },
    marksObtained: { type: Number, default: null },
    percentage: { type: Number, default: null }
  },
  class12: {
    board: { type: String, default: '' },
    school: { type: String, default: '' },
    passingYear: { type: Number, default: null },
    physics: { type: Number, default: null },
    chemistry: { type: Number, default: null },
    mathematics: { type: Number, default: null },
    totalMarks: { type: Number, default: null },
    marksObtained: { type: Number, default: null },
    percentage: { type: Number, default: null }
  },
  entranceExam: {
    examType: {
      type: String,
      enum: ['JEE_MAIN', 'WBJEE', 'IEMJEE', 'OTHER', ''],
      default: ''
    },
    examYear: { type: Number, default: null },
    rollNumber: { type: String, default: '' },
    jeeMainPercentile: { type: Number, default: null },
    wbjeeRank: { type: Number, default: null },
    iemjeeScore: { type: String, default: '' }
  },
  coursePreferences: {
    admissionSession: { type: String, default: '2025-2026' },
    course: { type: String, default: '' }, // Preference 1
    coursePreference2: { type: String, default: '' },
    coursePreference3: { type: String, default: '' }
  },
  documents: [documentSchema],
  feePayment: {
    amount: { type: Number, default: 100000 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid'
    },
    paymentReference: { type: String, default: '' },
    paidAt: { type: Date, default: null }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    remarks: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  timeline: [timelineSchema],
  submittedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Helper function to calculate missing items
applicationSchema.methods.getMissingChecklist = function () {
  const missing = [];
  const p = this.personalDetails || {};
  if (!p.fullName || p.fullName.trim().length < 2) missing.push('Full name is required (min 2 characters)');
  if (!p.dateOfBirth) missing.push('Date of birth is required');
  if (!p.gender) missing.push('Gender is required');
  if (!p.guardianName || p.guardianName.trim().length < 2) missing.push('Guardian name is required');
  if (!p.category) missing.push('Category selection is required');
  if (!p.state) missing.push('State of domicile is required');
  if (!p.address || p.address.trim().length < 5) missing.push('Full address is required (min 5 characters)');

  const c10 = this.class10 || {};
  if (!c10.board) missing.push('Class 10 Board is required');
  if (!c10.school) missing.push('Class 10 School name is required');
  if (!c10.passingYear) missing.push('Class 10 Passing Year is required');
  if (!c10.totalMarks || c10.marksObtained === null || c10.marksObtained === undefined || c10.marksObtained === '') {
    missing.push('Class 10 marks are required');
  } else if (Number(c10.marksObtained) > Number(c10.totalMarks)) {
    missing.push('Class 10 marks obtained cannot be greater than total marks');
  }

  const c12 = this.class12 || {};
  if (!c12.board) missing.push('Class 12 Board is required');
  if (!c12.school) missing.push('Class 12 School name is required');
  if (!c12.passingYear) missing.push('Class 12 Passing Year is required');
  if (c10.passingYear && c12.passingYear && Number(c12.passingYear) <= Number(c10.passingYear)) {
    missing.push('Class 12 passing year must be strictly greater than Class 10 passing year');
  }
  if (c12.physics === null || c12.physics === undefined || c12.physics === '') missing.push('Class 12 Physics score is required');
  if (c12.chemistry === null || c12.chemistry === undefined || c12.chemistry === '') missing.push('Class 12 Chemistry score is required');
  if (c12.mathematics === null || c12.mathematics === undefined || c12.mathematics === '') missing.push('Class 12 Mathematics score is required');
  if (!c12.totalMarks || c12.marksObtained === null || c12.marksObtained === undefined || c12.marksObtained === '') {
    missing.push('Class 12 marks are required');
  } else if (Number(c12.marksObtained) > Number(c12.totalMarks)) {
    missing.push('Class 12 marks obtained cannot be greater than total marks');
  }

  const exam = this.entranceExam || {};
  if (!exam.examType) missing.push('Entrance examination type is required');
  if (!exam.examYear) missing.push('Entrance exam year is required');
  if (!exam.rollNumber) missing.push('Entrance exam roll number is required');
  if (exam.examType === 'JEE_MAIN' && (exam.jeeMainPercentile === null || exam.jeeMainPercentile === undefined)) {
    missing.push('JEE Main percentile is required');
  }
  if (exam.examType === 'WBJEE' && !exam.wbjeeRank) {
    missing.push('WBJEE rank is required');
  }

  const cp = this.coursePreferences || {};
  if (!cp.course) missing.push('Primary course preference is required');

  const requiredDocs = ['class10Marksheet', 'class12Marksheet', 'passportPhoto', 'idProof'];
  const uploadedDocTypes = (this.documents || []).map(d => d.documentType);
  for (const docType of requiredDocs) {
    if (!uploadedDocTypes.includes(docType)) {
      const docLabel = docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      missing.push(`Document required: ${docLabel}`);
    }
  }

  if (this.feePayment?.status !== 'Paid') {
    missing.push('Application fee payment is pending');
  }

  return missing;
};

module.exports = mongoose.model('Application', applicationSchema);
