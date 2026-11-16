const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');

// @desc    Get logged-in applicant's application and validation checklist
// @route   GET /api/applications/my
// @access  Private (Applicant)
exports.getMyApplication = async (req, res) => {
  try {
    let application = await Application.findOne({ user: req.user._id });

    if (!application) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      application = await Application.create({
        applicationId: `IEM-${randomSuffix}`,
        user: req.user._id,
        status: 'Draft',
        personalDetails: {
          fullName: req.user.name,
          email: req.user.email,
          mobile: req.user.contactNumber
        },
        timeline: [{
          status: 'Draft',
          timestamp: new Date(),
          note: 'Application initialized.',
          actor: req.user.name
        }]
      });
    }

    const missingChecklist = application.getMissingChecklist();

    res.status(200).json({
      success: true,
      application,
      missingChecklist,
      isSubmittable: missingChecklist.length === 0
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching application.'
    });
  }
};

// @desc    Save application draft
// @route   POST /api/applications/draft
// @access  Private (Applicant)
exports.saveDraft = async (req, res) => {
  try {
    let application = await Application.findOne({ user: req.user._id });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status} and cannot be modified.`
      });
    }

    const {
      personalDetails,
      class10,
      class12,
      entranceExam,
      coursePreferences
    } = req.body;

    // Validation & calculation for Class 10
    if (class10) {
      if (class10.totalMarks && class10.marksObtained !== null && class10.marksObtained !== undefined && class10.marksObtained !== '') {
        if (Number(class10.marksObtained) > Number(class10.totalMarks)) {
          return res.status(400).json({
            success: false,
            message: 'Class 10 Marks Obtained cannot be greater than Total Marks.'
          });
        }
        class10.percentage = Number(((class10.marksObtained / class10.totalMarks) * 100).toFixed(2));
      }
      application.class10 = { ...application.class10, ...class10 };
    }

    // Validation & calculation for Class 12
    if (class12) {
      if (class12.totalMarks && class12.marksObtained !== null && class12.marksObtained !== undefined && class12.marksObtained !== '') {
        if (Number(class12.marksObtained) > Number(class12.totalMarks)) {
          return res.status(400).json({
            success: false,
            message: 'Class 12 Marks Obtained cannot be greater than Total Marks.'
          });
        }
        class12.percentage = Number(((class12.marksObtained / class12.totalMarks) * 100).toFixed(2));
      }
      application.class12 = { ...application.class12, ...class12 };
    }

    // Validation: Class 12 passing year > Class 10 passing year
    const y10 = class10?.passingYear || application.class10?.passingYear;
    const y12 = class12?.passingYear || application.class12?.passingYear;
    if (y10 && y12 && Number(y12) <= Number(y10)) {
      return res.status(400).json({
        success: false,
        message: 'Class 12 Passing Year must be strictly greater than Class 10 Passing Year.'
      });
    }

    if (personalDetails) {
      // Ensure email and mobile cannot be overridden with arbitrary values
      personalDetails.email = req.user.email;
      personalDetails.mobile = req.user.contactNumber;
      application.personalDetails = { ...application.personalDetails, ...personalDetails };
    }

    if (entranceExam) {
      application.entranceExam = { ...application.entranceExam, ...entranceExam };
    }

    if (coursePreferences) {
      application.coursePreferences = { ...application.coursePreferences, ...coursePreferences };
    }

    await application.save();

    const missingChecklist = application.getMissingChecklist();

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully.',
      application,
      missingChecklist,
      isSubmittable: missingChecklist.length === 0
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error saving draft.'
    });
  }
};

// @desc    Submit payment reference for application fee
// @route   POST /api/fee/pay
// @access  Private (Applicant)
exports.submitFee = async (req, res) => {
  try {
    const { paymentReference } = req.body;

    if (!paymentReference || paymentReference.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid transaction reference ID or UTR number.'
      });
    }

    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.feePayment.paymentReference = paymentReference.trim();
    application.feePayment.status = 'Paid';
    application.feePayment.paidAt = new Date();

    application.timeline.push({
      status: application.status,
      timestamp: new Date(),
      note: `Application fee paid. Ref: ${paymentReference.trim()}`,
      actor: req.user.name
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Payment reference submitted successfully.',
      feePayment: application.feePayment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing fee payment.'
    });
  }
};

// @desc    Upload an application document
// @route   POST /api/documents/upload
// @access  Private (Applicant)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type is required.' });
    }

    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload documents after final submission.'
      });
    }

    // Replace if document of same type already exists
    const existingIndex = application.documents.findIndex(d => d.documentType === documentType);
    if (existingIndex !== -1) {
      application.documents.splice(existingIndex, 1);
    }

    const base64Data = req.file.buffer ? req.file.buffer.toString('base64') : '';
    const fileDataUrl = base64Data ? `data:${req.file.mimetype};base64,${base64Data}` : '';

    const newDoc = {
      documentType,
      originalName: req.file.originalname,
      fileName: req.file.filename || req.file.originalname,
      filePath: req.file.path || '',
      fileData: fileDataUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    application.documents.push(newDoc);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: newDoc,
      documents: application.documents
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error uploading document.'
    });
  }
};

// @desc    Final submit application
// @route   POST /api/applications/submit
// @access  Private (Applicant)
exports.submitApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been submitted.'
      });
    }

    const missingChecklist = application.getMissingChecklist();
    if (missingChecklist.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit application. Mandatory requirements are incomplete.',
        missingChecklist
      });
    }

    application.status = 'Submitted';
    application.submittedAt = new Date();
    application.timeline.push({
      status: 'Submitted',
      timestamp: new Date(),
      note: 'Application submitted for official verification.',
      actor: req.user.name
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Your application is now locked and under review.',
      application
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error submitting application.'
    });
  }
};
