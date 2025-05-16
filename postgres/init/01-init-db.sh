#!/bin/bash
set -e

# Create system_db if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create system tables
    CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        domain VARCHAR(100) UNIQUE,
        schema_name VARCHAR(63) NOT NULL UNIQUE,
        package_id INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        version VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tenant_modules (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (tenant_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS system_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role VARCHAR(20) DEFAULT 'admin',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create default system admin
    INSERT INTO system_users (username, email, password_hash, first_name, last_name, role)
    VALUES ('admin', 'admin@system.com', '$2b$10$rS.MG9k9Vt.PGKipUcGBVe7I97eLyR9cIP5LJ0XdcFdKw9F/qXxia', 'System', 'Admin', 'super_admin')
    ON CONFLICT (username) DO NOTHING;

    -- Create function for schema creation
    CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_schema VARCHAR)
    RETURNS VOID AS \$\$
    BEGIN
        EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || tenant_schema;
        
        -- Create tenant-specific tables in the new schema
        EXECUTE 'CREATE TABLE IF NOT EXISTS ' || tenant_schema || '.users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            status VARCHAR(20) DEFAULT ''active'',
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )';
        
        EXECUTE 'CREATE TABLE IF NOT EXISTS ' || tenant_schema || '.roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description TEXT,
            permissions JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )';
        
        EXECUTE 'CREATE TABLE IF NOT EXISTS ' || tenant_schema || '.user_roles (
            user_id INTEGER REFERENCES ' || tenant_schema || '.users(id) ON DELETE CASCADE,
            role_id INTEGER REFERENCES ' || tenant_schema || '.roles(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, role_id)
        )';
        
        EXECUTE 'CREATE TABLE IF NOT EXISTS ' || tenant_schema || '.user_data (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES ' || tenant_schema || '.users(id) ON DELETE CASCADE,
            data_key VARCHAR(100) NOT NULL,
            data_value JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, data_key)
        )';
    END;
    \$\$ LANGUAGE plpgsql;

    -- Add sample data
    INSERT INTO packages (name, description, price)
    VALUES 
        ('Basic', 'Basic package with limited features', 9.99),
        ('Standard', 'Standard package with most features', 29.99),
        ('Premium', 'Premium package with all features', 99.99)
    ON CONFLICT DO NOTHING;

    INSERT INTO modules (name, description, version)
    VALUES 
        ('CRM', 'Customer Relationship Management module', '1.0.0'),
        ('HRM', 'Human Resource Management module', '1.0.0'),
        ('Billing', 'Billing and invoicing module', '1.0.0'),
        ('Analytics', 'Business analytics and reporting', '1.0.0')
    ON CONFLICT DO NOTHING;
EOSQL
