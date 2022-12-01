import { Controller, Get, Request, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import { User } from './users/user.entity';
import { PaymentsService, TCart } from './payments/payments.service';

type TLoginReq = {
  email: string;
  password: string;
};

type TCheckoutReq = {
  cart: TCart;
}
@Controller()
export class AppController {
  constructor(private authService: AuthService, private paymentService: PaymentsService) {}

  @Post('auth/login')
  async login(@Body() loginReq: TLoginReq) {
    // todo: hash password
    return this.authService.login(loginReq.email, loginReq.password);
  }

  @Post('auth/register')
  async register(@Body() registerUser: User) {
    // todo: hash password
    const newUser = await this.authService.register(registerUser);
    return this.authService.login(newUser.email, newUser.passwordHash);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) { //todo: type this / make infer work
    return req.user;
  }

  @Post('payments/checkout')
  @UseGuards(JwtAuthGuard)
  async paymentCheckout(@Request() req: any, @Body() checkoutReq: TCheckoutReq) {
    return this.paymentService.createCheckoutSessionUrl(checkoutReq.cart, req.user);
  }

  @Post('payments/webhook')
  async stripeWebhook(@Body() event: any) {
    // todo: check for stripe signature
    this.paymentService.handleEvent(event);
    return event;
  }
  
}
