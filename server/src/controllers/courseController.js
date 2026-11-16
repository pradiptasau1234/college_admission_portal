const Course = require('../models/Course');

// Standard Indian States & Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const BOARDS_10 = ['CBSE', 'ICSE', 'West Bengal Board (WBBSE)', 'Other State Board', 'Other'];
const BOARDS_12 = ['CBSE', 'ISC', 'West Bengal Council (WBCHSE)', 'Other State Council', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const ENTRANCE_EXAMS = [
  { id: 'JEE_MAIN', name: 'JEE (Main)', scoreType: 'percentile', scoreLabel: 'Percentile' },
  { id: 'WBJEE', name: 'WBJEE', scoreType: 'rank', scoreLabel: 'General Merit Rank (GMR)' },
  { id: 'IEMJEE', name: 'IEMJEE', scoreType: 'score', scoreLabel: 'IEMJEE Score / Rank' },
  { id: 'OTHER', name: 'Other Recognized State / National Entrance Exam', scoreType: 'score', scoreLabel: 'Score / Rank' }
];

const DOCUMENT_TYPES = [
  {
    type: 'class10Marksheet',
    label: 'Class 10 Marksheet / Passing Certificate',
    required: true,
    formats: '.pdf, .jpg, .png',
    maxSize: '5 MB'
  },
  {
    type: 'class12Marksheet',
    label: 'Class 12 Marksheet',
    required: true,
    formats: '.pdf, .jpg, .png',
    maxSize: '5 MB'
  },
  {
    type: 'entranceRankCard',
    label: 'Entrance Examination Rank Card',
    required: false,
    formats: '.pdf, .jpg, .png',
    maxSize: '5 MB'
  },
  {
    type: 'passportPhoto',
    label: 'Recent Passport Size Photograph',
    required: true,
    formats: '.jpg, .jpeg, .png',
    maxSize: '2 MB'
  },
  {
    type: 'idProof',
    label: 'Government ID Proof (Aadhaar / Passport / Voter ID)',
    required: true,
    formats: '.pdf, .jpg, .png',
    maxSize: '5 MB'
  }
];

// @desc    Get all active courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    let courses = await Course.find({ isActive: true });
    // If database is empty, return default engineering programs
    if (!courses || courses.length === 0) {
      courses = [
        { code: 'CSE', name: 'Computer Science & Engineering', department: 'Computer Science', intakeSeats: 180 },
        { code: 'CSE-AIML', name: 'CSE (Artificial Intelligence & Machine Learning)', department: 'Computer Science', intakeSeats: 120 },
        { code: 'CSE-DS', name: 'CSE (Data Science)', department: 'Computer Science', intakeSeats: 120 },
        { code: 'IT', name: 'Information Technology', department: 'Information Technology', intakeSeats: 120 },
        { code: 'ECE', name: 'Electronics & Communication Engineering', department: 'Electronics', intakeSeats: 120 },
        { code: 'EE', name: 'Electrical Engineering', department: 'Electrical', intakeSeats: 60 },
        { code: 'ME', name: 'Mechanical Engineering', department: 'Mechanical', intakeSeats: 60 }
      ];
    }
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
};

// @desc    Get document type specifications
// @route   GET /api/document-types
// @access  Public
exports.getDocumentTypes = (req, res) => {
  res.status(200).json({ success: true, documentTypes: DOCUMENT_TYPES });
};

// @desc    Get dropdown options and form reference data
// @route   GET /api/form-options
// @access  Public
exports.getFormOptions = (req, res) => {
  res.status(200).json({
    success: true,
    states: INDIAN_STATES,
    boards10: BOARDS_10,
    boards12: BOARDS_12,
    categories: CATEGORIES,
    entranceExams: ENTRANCE_EXAMS,
    sessions: ['2025-2026', '2026-2027']
  });
};
