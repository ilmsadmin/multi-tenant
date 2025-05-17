// Script để tạo bảng system_users và user admin
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function main() {  // Kết nối đến PostgreSQL
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'system_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres', // Thay đổi theo mật khẩu PostgreSQL của bạn
  });

  try {
    console.log('Trying to connect to PostgreSQL...');
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Kiểm tra xem bảng system_users đã tồn tại chưa
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_users'
      );
    `);

    // Nếu bảng chưa tồn tại, tạo bảng
    if (!tableCheck.rows[0].exists) {
      console.log('Creating system_users table...');      await client.query(`
        CREATE TABLE system_users (
          id SERIAL PRIMARY KEY, 
          username VARCHAR(50) UNIQUE NOT NULL, 
          password VARCHAR(255) NOT NULL, 
          roles TEXT DEFAULT '["system_admin"]',
          permissions TEXT DEFAULT '[]',
          status VARCHAR(20) DEFAULT 'active', 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('system_users table created successfully');
    } else {
      console.log('system_users table already exists');
    }

    // Tạo hash cho mật khẩu "admin123"
    const saltRounds = 10;
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Kiểm tra xem user admin đã tồn tại chưa
    const userCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM system_users 
        WHERE username = 'admin'
      );
    `);    // Nếu user chưa tồn tại, tạo user
    if (!userCheck.rows[0].exists) {      console.log('Creating admin user...');
      await client.query(`
        INSERT INTO system_users (username, password, roles, status) 
        VALUES ('admin', $1, '["system_admin"]', 'active');
      `, [passwordHash]);
      console.log('Admin user created successfully');
    } else {      // Nếu user đã tồn tại, cập nhật mật khẩu
      console.log('Updating admin password...');
      await client.query(`
        UPDATE system_users 
        SET password = $1, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE username = 'admin';
      `, [passwordHash]);
      console.log('Admin password updated successfully');
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL');
  }
}

main();
