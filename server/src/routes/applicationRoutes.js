const express = require('express');
const router = express.Router();
const {
  getMyApplication,
  saveDraft,
  submitFee,
  uploadDocument,
  submitApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Applicant routes
router.use(protect);
router.use(authorize('applicant'));

router.get('/my', getMyApplication);
router.post('/draft', saveDraft);
router.post('/fee/pay', submitFee);
router.post('/documents/upload', upload.single('file'), uploadDocument);
router.post('/submit', submitApplication);

module.exports = router;
