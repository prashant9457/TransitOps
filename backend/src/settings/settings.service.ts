import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' }
    });
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { id: 'singleton' }
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    return this.prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        depotName: data.depotName,
        currency: data.currency,
        distanceUnit: data.distanceUnit
      },
      create: {
        id: 'singleton',
        depotName: data.depotName || 'Gandhinagar Depot GJ4',
        currency: data.currency || 'INR (Rs)',
        distanceUnit: data.distanceUnit || 'Kilometers'
      }
    });
  }
}
