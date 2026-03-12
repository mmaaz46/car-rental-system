import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import pool from './src/config/database.js';

const PORT = process.env.PORT || 5000;

// Test connection once
const startServer = async () => {
  try {
    // Test DB connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected to PostgreSQL database');
    console.log('📅 Database time:', result.rows[0].current_time);
    
    // Start server after successful connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Upload directory: ./uploads`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Starting server without database...');
    
    // Start server even if DB fails
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
    });
  }
};

startServer();