import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: `mongodb://${process.env.MONGO_USERNAME || 'mongo'}:${process.env.MONGO_PASSWORD || 'mongo'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}`,
  dbName: process.env.MONGO_DATABASE || 'multi_tenant',
  options: {
    authSource: 'admin',
  },
}));