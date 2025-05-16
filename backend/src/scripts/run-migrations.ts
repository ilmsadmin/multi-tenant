#!/usr/bin/env ts-node

import { createConnection } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { config } from '../config/database.config';

// Đảm bảo rằng biến môi trường được load
dotenv.config();

async function runMigrations() {
  console.log('Running migrations for tenant user_data table...');
  
  try {
    const configService = new ConfigService();
    const connectionOptions = config(configService);
    
    const connection = await createConnection({
      ...connectionOptions,
      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [path.join(__dirname, '../**/migrations/*{.ts,.js}')],
    });

    console.log('Connected to database successfully!');
    console.log('Running migrations...');
    
    const migrations = await connection.runMigrations({ transaction: 'all' });
    
    console.log(`Applied ${migrations.length} migrations:`);
    migrations.forEach(migration => {
      console.log(`- ${migration.name}`);
    });
    
    await connection.close();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
