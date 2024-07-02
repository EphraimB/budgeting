import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
