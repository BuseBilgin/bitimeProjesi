const express = require('express');
const medicationController = require('../controllers/medicationController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.use(authenticateToken);

// Arama endpoint'i
router.get('/search', medicationController.searchDrugs);

// Yaygın ilaçlar endpoint'i
router.get('/common', medicationController.getCommonDrugs);

// Tüm ilaçlar endpoint'i (OpenFDA'dan)
router.get('/all', medicationController.getAllDrugs);

// İlaç etkileşimleri endpoint'i
router.get('/interactions/all', medicationController.getDrugInteractions);

router.post('/', medicationController.addMedication);
router.get('/', medicationController.getMedications);
router.put('/:id', medicationController.updateMedication);
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;