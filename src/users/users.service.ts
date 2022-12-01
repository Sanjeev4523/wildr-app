import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export type TUserProfile = Omit<User, 'passwordHash'>

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({email});
    // return this.users.find(user => user.email === email);
  }

  async createUser(user: User): Promise<User>{
    return this.usersRepository.save(user);
  }
}