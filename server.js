import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import pool from './src/config/database.js';

const PORT = process.env.PORT || 5000;

// Test connection only ONCE here
const startServer = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected to PostgreSQL database');
    console.log('📅 Database time:', result.rows[0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }

  // Start server regardless
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Upload directory: ./uploads`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  });
};

startServer();