import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // Default TTL: 1 hour
  max: parseInt(process.env.REDIS_MAX_ITEMS || '10000', 10), // Max items in cache
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
}));