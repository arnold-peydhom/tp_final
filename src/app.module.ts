import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { DatabaseModule } from "@database/database.module";

import { UsersModule } from "@users/users.module";

import { LecteurModule } from "./lecteur/lecteur.module";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LivreModule } from "./livre/livre.module";
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot(),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get("POSTGRES_HOST") || "localhost",
        port: configService.get("POSTGRES_PORT") || 5432,
        user: configService.get("POSTGRES_USER") || "postgres",
        password: configService.get("POSTGRES_PASSWORD") || "password",
        database: configService.get("POSTGRES_DB") || "tpfinal",
      }),
    }),
    LivreModule,
    LecteurModule,
    ReviewsModule,
  ],
  controllers: [
  ],
  providers: [AppService],
})
export class AppModule {}
