import { Injectable } from '@nestjs/common';

export interface MockBookingOption {
  id: string;
  provider: string;
  total: number;
}

interface TripSnapshot {
  id: string;
  budget: number;
}

@Injectable()
export class MockProviderClient {
  getOptionsForTrip(trip: TripSnapshot): MockBookingOption[] {
    const base = Number.isFinite(trip.budget) ? trip.budget : 1000;

    return [
      {
        id: trip.id + '-standard',
        provider: 'mock-air-standard',
        total: Number((base * 0.9).toFixed(2)),
      },
      {
        id: trip.id + '-flex',
        provider: 'mock-air-flex',
        total: Number((base * 1.15).toFixed(2)),
      },
    ];
  }
}
