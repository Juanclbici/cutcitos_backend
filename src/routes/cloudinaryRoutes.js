const express = require('express');
const router = express.Router();
const cloudinaryController = require('../controllers/cloudinaryController');

router.post('/signature', cloudinaryController.obtenerFirma); 

module.exports = router;
