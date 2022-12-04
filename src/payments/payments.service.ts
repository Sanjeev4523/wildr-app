import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

type TWildrStoreItems = {
  id: string;
  name: string;
  priceInCents: number;
};

type TCartItem = {
  id: string;
  quantity: number;
};

export type TCart = TCartItem[];

const PAYMENT_STATUS = {
    CHECKOUT: 'CHECKOUT',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  private readonly storeItems: TWildrStoreItems[] = [
    {
      id: '1',
      name: 'Item 1',
      priceInCents: 10000, // Stripe requires price to be sent in Cents
    },
    {
      id: '2',
      name: 'Item 2',
      priceInCents: 20000,
    },
  ];

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_KEY', 'default_key'),
      {
        apiVersion: '2022-11-15', // todo: check significance for this.
      },
    );
  }

  async createCheckoutSessionUrl(cart: TCart, user: User) {
    let payments: Payment[] = [];
    // Todo: Stripe.LineItem misses the price_data types. Check once again with stripe docs, then extend the type itself to remove any.
    const lineItems: any[] = cart.map((cartItem) => { 
      const storeItem = this.storeItems.find((c) => c.id === cartItem.id);
      if (storeItem) {
        // todo: throw error on else
        const lineItem = {
          quantity: cartItem.quantity,
          price_data: {
            currency: 'inr',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
        };
        payments.push({
            storeItemId: storeItem.id,
            quantity: cartItem.quantity,
            status: PAYMENT_STATUS.CHECKOUT,
            email: user.email,
            amount: cartItem.quantity * storeItem.priceInCents,
            stipeSessionId: "-1",
        })
        return lineItem;
      }
    });
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      cancel_url: 'http://localhost:3000', // todo: complete this (redirects to UI)
      success_url: 'http://localhost:3000', // todo: complete this (redirects to UI)
      line_items: lineItems,
    });
    // todo: This will be asynchronous using queues. If not then wrap this in transactions
    payments = payments.map(p => ({...p, stipeSessionId: session.id}))
    payments.forEach((p) => this.paymentRepository.save(p));
    return session.url;
  }

  async handleEvent(event: any) {
    switch (event.type) {
      case 'checkout.session.async_payment_failed':
        // todo: same as checkout.session.complete , create helper function and pass payment status. 
        console.log('checkout.session.async_payment_failed');
        break;
      case 'checkout.session.async_payment_succeeded':
        console.log('checkout.session.async_payment_succeeded');
        break;
      case 'checkout.session.completed':
        console.log('checkout.session.completed');
        const {id} = event.data.object;
        let payments = await this.paymentRepository.find({where: {
          stipeSessionId: id,
        }})
        payments = payments.map(p => ({...p, status: PAYMENT_STATUS.COMPLETED}));
        // this will be asynchronous using queues.
        payments.forEach(p => this.paymentRepository.save(p));
        break;
      case 'checkout.session.expired':
        console.log('checkout.session.expired');
        // this can trigger notifications for user to nudge them to make the payment.
        break;
      default:
        // also sends alerts to dev team.
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
