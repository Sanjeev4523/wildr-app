import { Injectable } from '@nestjs/common';

// Todo: Add User Type fields
export type TUser = {
  username: string;
  email: string;
  passwordHash: string;
};

export type TUserProfile = Omit<TUser, 'passwordHash'>

@Injectable()
export class UsersService {
  private readonly users: TUser[] = [
    {
      username: 'john',
      email: 'john.doe@example.com',
      passwordHash: 'changeMe',
    },
    {
      username: 'maria',
      email: 'maria.doe@example.com',
      passwordHash: 'guess',
    },
  ];

  async findByUsername(username: string): Promise<TUser | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findByEmail(email: string): Promise<TUser | undefined> {
    return this.users.find(user => user.email === email);
  }
}