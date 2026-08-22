require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect, authorize } = require('./middleware/authMiddleware');
const propertyRoutes = require('./routes/propertyRoutes');
const agreementRoutes = require('./routes/agreementRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/properties', propertyRoutes);

app.use('/api/agreements', agreementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentalShield API is running' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});