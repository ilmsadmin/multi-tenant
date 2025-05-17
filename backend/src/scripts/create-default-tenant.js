// Script to create a default tenant
const { Client } = require('pg');

async function main() {
  // Connect to PostgreSQL
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'system_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if the tenants table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Tenants table does not exist. Creating...');
      await client.query(`
        CREATE TABLE tenants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          domain VARCHAR(100) UNIQUE,
          schema_name VARCHAR(63) NOT NULL UNIQUE,
          package_id INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tenants table created successfully');
    } else {
      console.log('Tenants table already exists');
    }

    // Check if tenant_modules table exists
    const moduleTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenant_modules'
      );
    `);

    if (!moduleTableCheck.rows[0].exists) {
      console.log('Creating tenant_modules table...');
      await client.query(`
        CREATE TABLE tenant_modules (
          id SERIAL PRIMARY KEY,
          tenant_id INTEGER NOT NULL,
          module_id INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          settings JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (tenant_id, module_id)
        );
      `);
      console.log('tenant_modules table created successfully');
    }

    // Check if default tenant exists
    const tenantCheck = await client.query(`
      SELECT * FROM tenants WHERE id = 1;
    `);

    // Define the default tenant schema name
    const defaultSchemaName = 'tenant_default';

    if (tenantCheck.rows.length === 0) {
      console.log('Creating default tenant...');
      await client.query(`
        INSERT INTO tenants (name, domain, schema_name, status) 
        VALUES ('Default', 'default', $1, 'active');
      `, [defaultSchemaName]);

      console.log('Default tenant created successfully');
    } else {
      console.log('Default tenant already exists');
    }

    // Check if the tenant schema exists
    const schemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = $1
      );
    `, [defaultSchemaName]);

    if (!schemaCheck.rows[0].exists) {
      console.log('Creating tenant schema...');
      
      // Create the schema
      await client.query(`CREATE SCHEMA ${defaultSchemaName}`);
      
      // Check if create_tenant_schema function exists
      const functionCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc 
          WHERE proname = 'create_tenant_schema'
        );
      `);
      
      if (functionCheck.rows[0].exists) {
        console.log('Using existing create_tenant_schema function');
        await client.query(`SELECT create_tenant_schema($1)`, [defaultSchemaName]);
      } else {
        console.log('Creating schema tables manually...');
        // Create necessary tables in the schema
        await client.query(`
          CREATE TABLE ${defaultSchemaName}.users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE ${defaultSchemaName}.roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description TEXT,
            permissions JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE ${defaultSchemaName}.user_roles (
            user_id INTEGER REFERENCES ${defaultSchemaName}.users(id) ON DELETE CASCADE,
            role_id INTEGER REFERENCES ${defaultSchemaName}.roles(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, role_id)
          )
        `);
      }
      
      console.log('Tenant schema created successfully');
    } else {
      console.log('Tenant schema already exists');
    }

    // Create tenant admin role if it doesn't exist
    const roleCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM ${defaultSchemaName}.roles WHERE name = 'tenant_admin'
      );
    `);

    if (!roleCheck.rows[0].exists) {
      console.log('Creating tenant_admin role...');
      await client.query(`
        INSERT INTO ${defaultSchemaName}.roles (name, description, permissions) 
        VALUES ('tenant_admin', 'Tenant Administrator', '{"tenant.admin": true}');
      `);
      console.log('tenant_admin role created successfully');
    }

    // Create a default admin user for the tenant
    const userCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM ${defaultSchemaName}.users WHERE username = 'admin'
      );
    `);

    if (!userCheck.rows[0].exists) {
      console.log('Creating tenant admin user...');
      
      // Create user with hashed password 'admin123'
      const hashedPassword = '$2b$10$rS.MG9k9Vt.PGKipUcGBVe7I97eLyR9cIP5LJ0XdcFdKw9F/qXxia'; // bcrypt hash for 'admin123'
      
      await client.query(`
        INSERT INTO ${defaultSchemaName}.users (username, email, password_hash, first_name, last_name, status) 
        VALUES ('admin', 'admin@default-tenant.com', $1, 'Tenant', 'Admin', 'active');
      `, [hashedPassword]);
      
      console.log('Tenant admin user created successfully');
      
      // Assign admin role to user
      await client.query(`
        INSERT INTO ${defaultSchemaName}.user_roles (user_id, role_id)
        VALUES (
          (SELECT id FROM ${defaultSchemaName}.users WHERE username = 'admin'),
          (SELECT id FROM ${defaultSchemaName}.roles WHERE name = 'tenant_admin')
        );
      `);
      
      console.log('Role assigned to tenant admin successfully');
    } else {
      console.log('Tenant admin user already exists');
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
