import { IsString } from 'class-validator';

export class PaymentSuccessDto {
  @IsString()
  stripeId: string;

  @IsString()
  orderId: string;

  @IsString()
  receiptUrl: string;
}
