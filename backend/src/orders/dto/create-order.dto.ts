import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsString({ each: true })
  toppings: string[];
}

export class CreateOrderDto {
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;
}