import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuthContext } from '../middleware/auth';
import * as tripService from '../services/tripService';

const transportTypeEnum = z.enum(['CAR', 'BUS', 'TRAIN', 'FLIGHT']);
const fuelTypeEnum = z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']);

export const tripInputSchema = z
  .object({
    transportType: transportTypeEnum,
    fuelType: fuelTypeEnum.nullish(),
    distanceKm: z.number().positive(),
    passengerCount: z.number().int().positive().default(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
      .refine((value) => value <= new Date().toISOString().slice(0, 10), {
        message: 'date cannot be in the future',
      }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.transportType === 'CAR' && !data.fuelType) {
      ctx.addIssue({
        code: 'custom',
        path: ['fuelType'],
        message: 'fuelType is required for CAR trips',
      });
    }
    if (data.transportType !== 'CAR' && data.fuelType) {
      ctx.addIssue({
        code: 'custom',
        path: ['fuelType'],
        message: 'fuelType must be omitted for non-CAR trips',
      });
    }
  })
  .transform((data) => ({ ...data, fuelType: data.fuelType ?? null }));

const tripIdParamSchema = z.uuid();

function requireTripId(req: Request): string {
  return tripIdParamSchema.parse(req.params.tripId);
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const trip = await tripService.createTrip(auth.companyId, auth, req.body);
    res.status(201).json({ data: trip });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const trips = await tripService.listTrips(auth.companyId, auth);
    res.status(200).json({ data: trips });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const trip = await tripService.getTrip(auth.companyId, auth, requireTripId(req));
    res.status(200).json({ data: trip });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const trip = await tripService.updateTrip(auth.companyId, auth, requireTripId(req), req.body);
    res.status(200).json({ data: trip });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    await tripService.removeTrip(auth.companyId, auth, requireTripId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
