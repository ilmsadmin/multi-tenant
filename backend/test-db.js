const { Client } = require('pg');

// Configuration
const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'system_db',
  password: 'postgres',
  port: 5432,
};

async function testConnection() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    
    const res = await client.query('SELECT current_user, current_database()');
    console.log('Query result:', res.rows[0]);
    
    await client.end();
    console.log('Connection closed');
    
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

testConnection();
