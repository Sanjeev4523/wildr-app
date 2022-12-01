import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

type TWildrStoreItems = {
    id: string;
    name: string;
    priceInCents: number;
}

type TCartItem = {
    id: string,
    quantity: number;
};

export type TCart = TCartItem[];

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    private readonly storeItems: TWildrStoreItems[] = [
        {
            id: '1',
            name: 'Item 1',
            priceInCents: 10000
        },
        {
            id: '2',
            name: 'Item 2',
            priceInCents: 20000
        }
    ];

    constructor(private configService: ConfigService){
        this.stripe = new Stripe(configService.get<string>('STRIPE_KEY', 'default_key'), {
            apiVersion: '2022-11-15',
        });
    }

    async createCheckoutSessionUrl(cart: TCart){
        const lineItems: any[]= cart.map(cartItem => {
            const storeItem = this.storeItems.find(c => c.id === cartItem.id);
            if(storeItem){
                // todo: throw error on else
                const lineItem = {
                  quantity: cartItem.quantity,
                  price_data: {
                    currency: 'inr',
                    product_data: {
                        name: storeItem.name
                    },
                    unit_amount: storeItem.priceInCents,
                },
                }
                return lineItem;
            }
        })
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            cancel_url: 'http://localhost:3000', // todo: complete this
            success_url: 'http://localhost:3000', // todo: complete this
            line_items: lineItems,
        })
        return session.url;
    }
}
