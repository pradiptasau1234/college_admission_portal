const Application = require('../models/Application');
const path = require('path');
const fs = require('fs');

// @desc    Get dashboard metrics & aggregations
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const draftCount = await Application.countDocuments({ status: 'Draft' });
    const submittedCount = await Application.countDocuments({ status: 'Submitted' });
    const underReviewCount = await Application.countDocuments({ status: 'Under Review' });
    const selectedCount = await Application.countDocuments({ status: 'Selected' });
    const rejectedCount = await Application.countDocuments({ status: 'Rejected' });

    // Course distribution aggregation
    const courseDistribution = await Application.aggregate([
      { $match: { 'coursePreferences.course': { $ne: '' } } },
      { $group: { _id: '$coursePreferences.course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total fees paid
    const feesPaidCount = await Application.countDocuments({ 'feePayment.status': 'Paid' });
    const totalRevenue = feesPaidCount * 100000;

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        draftCount,
        submittedCount,
        underReviewCount,
        selectedCount,
        rejectedCount,
        feesPaidCount,
        totalRevenue,
        courseDistribution
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching dashboard stats.'
    });
  }
};

// @desc    Get paginated & filtered applications list
// @route   GET /api/admin/applications
// @access  Private (Admin)
exports.getApplications = async (req, res) => {
  try {
    const { q, status, course, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (course && course !== 'ALL') {
      query['coursePreferences.course'] = course;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { applicationId: searchRegex },
        { 'personalDetails.fullName': searchRegex },
        { 'personalDetails.email': searchRegex },
        { 'personalDetails.mobile': searchRegex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('user', 'name email contactNumber')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      applications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching applications list.'
    });
  }
};

// @desc    Get single application detail by ID
// @route   GET /api/admin/applications/:id
// @access  Private (Admin)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email contactNumber')
      .populate('verification.verifiedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching application details.'
    });
  }
};

// @desc    Update staff verification decision & remarks
// @route   POST /api/admin/applications/:id/verify
// @access  Private (Admin)
exports.verifyApplication = async (req, res) => {
  try {
    const { isVerified, remarks } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.verification = {
      isVerified: Boolean(isVerified),
      remarks: remarks || '',
      verifiedAt: new Date(),
      verifiedBy: req.user._id
    };

    application.timeline.push({
      status: application.status,
      timestamp: new Date(),
      note: `Academic review updated by Admin: ${isVerified ? 'Marked as Verified' : 'Marked as Pending/Incomplete'}. Remarks: ${remarks || 'None'}`,
      actor: req.user.name
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Verification recorded successfully.',
      verification: application.verification,
      timeline: application.timeline
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating verification.'
    });
  }
};

// @desc    Transition application status (Under Review, Selected, Rejected)
// @route   POST /api/admin/applications/:id/status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['Under Review', 'Selected', 'Rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const oldStatus = application.status;
    application.status = status;
    application.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status transitioned from ${oldStatus} to ${status}.`,
      actor: req.user.name
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status transitioned to ${status}.`,
      status: application.status,
      timeline: application.timeline
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating application status.'
    });
  }
};
