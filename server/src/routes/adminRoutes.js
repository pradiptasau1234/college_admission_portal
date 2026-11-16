const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getApplications,
  getApplicationById,
  verifyApplication,
  updateStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications/:id/verify', verifyApplication);
router.post('/applications/:id/status', updateStatus);

module.exports = router;
