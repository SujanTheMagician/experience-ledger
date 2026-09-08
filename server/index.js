require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const experienceRoutes = require('./routes/experienceRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.get('/', (req, res) => {
  res.send('Experience Ledger API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));