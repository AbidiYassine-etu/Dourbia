import { Injectable } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AppService {
  async getUsers(){
    return clerkClient.users.getUserList();
  }
}
