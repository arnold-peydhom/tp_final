import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Film catalog with reviews API')
  .setDescription('This is an API to manage a film catalog with reviews, only users with the role of admin can manage the catalog')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    description: 'The JWT retrieved from the login endpoint',
  })
  .addTag('users', 'Operations about users')
  .addTag('auth', 'Operations about authentication')
  .addTag('actors', 'Operations about Actors')
  .addTag('reviews', 'Operations about Reviews')
  .addTag('films', 'Operations about Films')
  .build();
