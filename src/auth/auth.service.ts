
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TUserProfile, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, passwordHash: string): Promise<TUserProfile| null> {
    // Todo: compare encrypted password.
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash === passwordHash) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, passwordHash: string) {
    const validatedUser = await this.validateUser(email, passwordHash);
    if(validatedUser){
      const payload = { username: validatedUser.username, sub: validatedUser.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException();
  }

  async register(user: User): Promise<User>{
    const existingUser = await this.usersService.findByEmail(user.email);
    if(existingUser){
      throw new BadRequestException();
    }
    return this.usersService.createUser(user);
  }
}