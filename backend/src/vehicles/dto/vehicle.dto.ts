import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  capacity: number;

  @IsNumber()
  odometer: number;

  @IsNumber()
  acquisitionCost: number;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @IsOptional()
  odometer?: number;

  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}
