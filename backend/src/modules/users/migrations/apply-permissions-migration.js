/**
 * Script để áp dụng migration cho bảng permissions trên tất cả các schema của tenant
 * 
 * Cách sử dụng:
 * 1. Cài đặt thư viện pg: npm install pg
 * 2. Chạy script: node apply-permissions-migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cấu hình kết nối database
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

async function applyMigration() {
  const pool = new Pool(config);
  
  try {
    console.log('Đang kết nối đến database...');
    
    // Lấy danh sách tất cả schema của tenant
    const { rows } = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
    `);
    
    if (rows.length === 0) {
      console.log('Không tìm thấy schema nào cho tenant.');
      return;
    }
    
    // Đọc file migration SQL
    const migrationFilePath = path.join(__dirname, 'create-permissions-tables.sql');
    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Áp dụng migration cho từng schema
    for (const { schema_name } of rows) {
      console.log(`Đang áp dụng migration cho schema ${schema_name}...`);
      
      // Set search_path to the current tenant schema
      await pool.query(`SET search_path TO ${schema_name}`);
      
      // Apply the migration
      await pool.query(migrationSql);
      
      console.log(`- Hoàn thành schema ${schema_name}`);
    }
    
    console.log('Áp dụng migration thành công!');
  } catch (error) {
    console.error('Lỗi khi áp dụng migration:', error);
  } finally {
    await pool.end();
  }
}

applyMigration();
