import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant API')
    .setDescription('API documentation for Multi-Tenant system')
    .setVersion('1.0')
    .addTag('tenants', 'Tenant management operations')
    .addTag('packages', 'Package management operations')
    .addTag('modules', 'Module management operations')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);  
    // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Tenant-ID,X-Schema-Name'
  });

  // Set up global guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new RolesGuard(reflector),
    new PermissionsGuard(reflector)
  );
  // Get port from configuration
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  
  try {
    await app.listen(port);
    Logger.log(`Application is running on: http://localhost:${port}`);
    Logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      const alternativePort = 3001;
      Logger.warn(`Port ${port} is already in use, trying alternative port ${alternativePort}`);
      await app.listen(alternativePort);
      Logger.log(`Application is running on: http://localhost:${alternativePort}`);
      Logger.log(`Swagger documentation available at: http://localhost:${alternativePort}/api/docs`);
    } else {
      throw error;
    }
  }
}
bootstrap();
