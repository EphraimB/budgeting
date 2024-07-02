import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountsService {
  findAll(): string {
    return 'Testing accounts';
  }
}
