export type TransportType = "CAR" | "BUS" | "TRAIN" | "FLIGHT";
export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type Role = "ADMIN" | "USER";
export type PermissionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PublicUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  canViewCompanyData: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  companyId: string;
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  co2eKg: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripInput {
  transportType: TransportType;
  fuelType?: FuelType | null;
  distanceKm: number;
  passengerCount?: number;
  date: string;
}

export interface MonthlySummary {
  totalCo2eKg: number;
  tripCount: number;
}

export interface TransportBreakdown {
  transportType: TransportType;
  co2eKg: number;
  tripCount: number;
}

export interface MonthlyTrend {
  month: string;
  co2eKg: number;
  tripCount: number;
}

export interface PermissionRequest {
  id: string;
  companyId: string;
  userId: string;
  status: PermissionRequestStatus;
  createdAt: string;
  updatedAt: string;
}
