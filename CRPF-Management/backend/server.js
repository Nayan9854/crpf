const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;

const db = require('./config/db'); // Assuming you have a db.js file for MongoDB connection

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Initialize database connection
db();

const adminRoutes = require('./Routes/adminRoutes');
const subAdminRoutes = require('./Routes/subAdminRoutes');
const authRoutes = require('./Routes/authRoutes');
// Health check route
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subadmin', subAdminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});