const express = require('express');
const router = express.Router();
const { getCourses, getDocumentTypes, getFormOptions } = require('../controllers/courseController');

router.get('/courses', getCourses);
router.get('/document-types', getDocumentTypes);
router.get('/form-options', getFormOptions);

module.exports = router;
