require('dotenv').config();
const express = require('express');
const cors = require('cors');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/complaints', complaintRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('Cloud Hostel Complaint System API is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
