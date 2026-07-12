import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const role = registerDto.role || Role.DRIVER;

      if (role === Role.DRIVER) {
        if (!registerDto.licenseNumber || !registerDto.licenseCategory || !registerDto.licenseExpiry || !registerDto.contactNumber) {
          throw new ConflictException('Driver details (license, category, expiry, contact) are required for driver registration');
        }
        
        // check if driver license already exists
        const existingDriver = await tx.driver.findUnique({
          where: { licenseNumber: registerDto.licenseNumber }
        });
        if (existingDriver) {
          throw new ConflictException('License number is already registered');
        }

        await tx.driver.create({
          data: {
            name: registerDto.name,
            licenseNumber: registerDto.licenseNumber,
            licenseCategory: registerDto.licenseCategory,
            licenseExpiry: new Date(registerDto.licenseExpiry),
            contactNumber: registerDto.contactNumber,
            status: 'AVAILABLE',
            safetyScore: 100,
          }
        });
      }

      const user = await tx.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role,
        },
      });

      return this.generateToken(user);
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}
