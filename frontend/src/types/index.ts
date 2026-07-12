export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
  createdAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  driverAcceptedAt?: string;
  dispatchedAt?: string;
  maintenanceRequired?: boolean;
  reportsLogged?: boolean;
  isOpenToAll?: boolean;
  status: 'DRAFT' | 'ASSIGNED' | 'READY_TO_START' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  vehicle?: Vehicle;
  driver?: Driver;
  expenses?: Expense[];
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  issue: string;
  cost: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  openedAt?: string;
  closedAt?: string;
  vehicle?: Vehicle;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  odometer: number;
  createdAt?: string;
  vehicle?: Vehicle;
}

export interface Expense {
  id: string;
  vehicleId: string;
  tripId?: string;
  type: string;
  amount: number;
  description: string;
  createdAt?: string;
  vehicle?: Vehicle;
  trip?: Trip;
}

export interface Settings {
  id: string;
  depotName: string;
  currency: string;
  distanceUnit: string;
}
