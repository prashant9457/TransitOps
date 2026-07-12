import type { Role } from '@/types/auth';

export interface SidebarItem {
  label: string;
  path: string;
  roles: Role[];
}

export const sidebarConfig: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
  { label: 'Users', path: '/users', roles: ['ADMIN'] },
  { label: 'Vehicles', path: '/vehicles', roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'] },
  { label: 'Drivers', path: '/drivers', roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'] },
  { label: 'Trips', path: '/trips', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { label: 'My Trips', path: '/my-trips', roles: ['DRIVER'] },
  { label: 'Maintenance', path: '/maintenance', roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'] },
  { label: 'Maintenance Requests', path: '/maintenance-requests', roles: ['DRIVER'] },
  { label: 'Fuel Logs', path: '/fuel', roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST'] },
  { label: 'Expenses', path: '/expenses', roles: ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { label: 'Reports', path: '/reports', roles: ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { label: 'Safety Reports', path: '/safety-reports', roles: ['SAFETY_OFFICER'] },
  { label: 'Profile', path: '/profile', roles: ['DRIVER'] },
  { label: 'Settings', path: '/settings', roles: ['ADMIN'] },
];
