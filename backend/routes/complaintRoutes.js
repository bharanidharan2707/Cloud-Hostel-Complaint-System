const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// Create a new complaint
router.post('/', complaintController.createComplaint);

// Get all complaints (Admin)
router.get('/', complaintController.getAllComplaints);

// Get complaint by ID
router.get('/:id', complaintController.getComplaintById);

// Update a complaint status (Admin)
router.patch('/:id/status', complaintController.updateComplaintStatus);

// Delete a complaint (Admin)
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
