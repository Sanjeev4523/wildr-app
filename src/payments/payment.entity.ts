import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  email: string; // userId, FK_Constraint...

  @Column()
  storeItemId: string;

  @Column()
  quantity: number;

  @Column()
  status: string;

  @Column()
  stipeSessionId: string;

  @Column()
  amount: number;
}
