import type { Trip } from '../types';
import { travelers } from './travelers';
import { flights } from './flights';
import { stays } from './stays';
import { activities } from './activities';
import { food } from './food';
import { days } from './itinerary';
import { budget } from './budget';
import { packing, bags } from './packing';
import { docs } from './docs';
import { safety } from './safety';

export const seedTrip: Trip = {
  id: 'mishra-switzerland-2026',
  title: 'Switzerland 2026',
  subtitle: 'The Mishra Family · First Family Visit',
  startDate: '2026-06-16',
  endDate: '2026-06-25',
  onGroundStart: '2026-06-17',
  onGroundEnd: '2026-06-24',
  baseCurrency: 'CHF',
  homeCurrency: 'INR',
  travelers,
  flights,
  stays,
  days,
  activities,
  food,
  budget,
  packing,
  bags,
  docs,
  safety,
};

export const SCHEMA_VERSION = 3;
