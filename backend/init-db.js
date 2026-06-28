import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  // Connect without database first to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // allow executing multiple queries at once
  });

  try {
    console.log('Connecting to MySQL...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    console.log('Executing schema.sql...');
    await connection.query(schemaSql);
    
    console.log('Database and tables created successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await connection.end();
  }
}

initDB();
