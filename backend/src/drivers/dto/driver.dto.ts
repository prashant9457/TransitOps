import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsString()
  @IsNotEmpty()
  licenseCategory: string;

  @IsDateString()
  licenseExpiry: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsNumber()
  @IsOptional()
  safetyScore?: number;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsDateString()
  @IsOptional()
  licenseExpiry?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsNumber()
  @IsOptional()
  safetyScore?: number;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;
}
