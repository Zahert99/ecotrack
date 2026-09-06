export type TransportType = "CAR" | "BUS" | "TRAIN" | "FLIGHT";
export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type Role = "ADMIN" | "USER";
export type PermissionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PermissionRequestType = "VIEW_COMPANY_DATA" | "ADMIN_ROLE";

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
  userId: string | null;
  deletedUserId: string | null;
  deletedUserName: string | null;
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
  distanceKm: number;
  passengerCount: number;
}

export interface FuelBreakdown {
  fuelType: FuelType;
  co2eKg: number;
  tripCount: number;
}

export interface MonthlyTrend {
  month: string;
  co2eKg: number;
  tripCount: number;
}

export interface QuarterlyComparison {
  quarter: string;
  currentYearCo2eKg: number;
  previousYearCo2eKg: number;
}

export interface CompanySummary {
  name: string;
  employeeCount: number;
}

export interface PermissionRequest {
  id: string;
  companyId: string;
  userId: string;
  requestType: PermissionRequestType;
  status: PermissionRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MyPermissionRequestStatus {
  viewCompanyData: PermissionRequest | null;
  adminRole: PermissionRequest | null;
}

export interface TripEditRequest {
  id: string;
  tripId: string;
  companyId: string;
  requestedBy: string;
  status: PermissionRequestStatus;
  proposedTransportType: TransportType;
  proposedFuelType: FuelType | null;
  proposedDistanceKm: number;
  proposedPassengerCount: number;
  proposedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripEditRequestWithTrip extends TripEditRequest {
  trip: Trip | null;
}
