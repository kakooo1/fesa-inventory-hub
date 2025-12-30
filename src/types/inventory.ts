export type ItemCategory = 'material' | 'tool';
export type ItemStatus = 'available' | 'borrowed' | 'maintenance';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive';
export type UserRole = 'admin' | 'supervisor' | 'technician';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  availableQuantity: number;
  unit: string;
  minStock: number;
  location: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  borrowedBy: string;
  borrowedAt: Date;
  expectedReturn: Date;
  returnedAt?: Date;
  notes?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  status: VehicleStatus;
  assignedTo?: string;
  lastMaintenance?: Date;
  nextMaintenanceKm?: number;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  kmAtMaintenance: number;
  date: Date;
  cost: number;
  performedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}
