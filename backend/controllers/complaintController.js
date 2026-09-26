const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// 1. Create a new complaint
const createComplaint = async (req, res) => {
    try {
        const { studentName, email, hostelBlock, category, description } = req.body;

        if (!studentName || !email || !hostelBlock || !category || !description) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newComplaint = {
            studentName,
            email,
            hostelBlock,
            category,
            description,
            status: 'Pending',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('complaints').add(newComplaint);
        
        // Optionally update the document with its own ID for easier frontend reference
        await docRef.update({ complaintId: docRef.id });

        res.status(201).json({ message: 'Complaint submitted successfully', id: docRef.id });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Failed to submit complaint.' });
    }
};

// 2. Get all complaints (Admin can filter by status)
const getAllComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        let snapshot;
        
        if (status) {
            snapshot = await db.collection('complaints').where('status', '==', status).get();
        } else {
            snapshot = await db.collection('complaints').get();
        }

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        let complaints = [];
        snapshot.forEach(doc => {
            complaints.push({ id: doc.id, ...doc.data() });
        });

        // Sort in memory to avoid Firebase composite index requirement
        complaints.sort((a, b) => {
            const timeA = a.createdAt ? (a.createdAt._seconds || a.createdAt.seconds || 0) : 0;
            const timeB = b.createdAt ? (b.createdAt._seconds || b.createdAt.seconds || 0) : 0;
            return timeB - timeA;
        });

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints.' });
    }
};

// 3. Get complaint by ID
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('complaints').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Failed to fetch complaint.' });
    }
};

// 4. Update complaint status
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        await db.collection('complaints').doc(id).update({
            status,
            updatedAt: FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Complaint status updated successfully.' });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ error: 'Failed to update complaint status.' });
    }
};

// 5. Delete a complaint
const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('complaints').doc(id).delete();
        res.status(200).json({ message: 'Complaint deleted successfully.' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ error: 'Failed to delete complaint.' });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    deleteComplaint
};
