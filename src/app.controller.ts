import { Controller, Get, Request, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import { TUser } from './users/users.service';

type TLoginReq = {
  email: string;
  password: string;
};
@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() loginReq: TLoginReq) {
    // todo: hash password
    return this.authService.login(loginReq.email, loginReq.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) { //todo: type this / make infer work
    return req.user;
  }
}
