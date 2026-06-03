// ─────────────────────────────────────────────────────────────
// Voyage — Core data model
// ─────────────────────────────────────────────────────────────

export type City = 'Lausanne' | 'Interlaken' | 'Lucerne' | 'Geneva' | 'Zurich';
export type BlockKey = 'morning' | 'afternoon' | 'evening' | 'night';

export type ActivityCategory =
  | 'sightseeing'
  | 'alpine'
  | 'culture'
  | 'nature'
  | 'food'
  | 'leisure'
  | 'transport'
  | 'science';

export type TravelMode =
  | 'walk'
  | 'train'
  | 'tram'
  | 'bus'
  | 'ferry'
  | 'cable-car'
  | 'cog-railway'
  | 'car'
  | 'flight';

export type PriceBand = '€' | '€€' | '€€€';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface DocAssignment {
  docType: string;
  note?: string;
}

export interface Traveler {
  id: string;
  name: string;
  role: 'Father' | 'Mother' | 'Son';
  age: number | 'adult';
  isMinor: boolean;
  dietary: string;
  allergies: string;
  meds: string[];
  emergencyContacts: EmergencyContact[];
  docAssignments: DocAssignment[];
  avatar: string; // initials-based color seed
  color: string;
}

export interface FlightLeg {
  from: string; // airport code
  fromCity: string;
  to: string;
  toCity: string;
  depart: string; // ISO local
  arrive: string; // ISO local
  flightNo?: string;
  terminal?: string;
  aircraft?: string;
  durationMin: number;
}

export interface Flight {
  id: string;
  direction: 'outbound' | 'return';
  carrier: 'Etihad';
  legs: FlightLeg[];
  layoverMin: number; // at AUH
  baggageAllowance: string;
  cabin: string;
  contact: string;
  bookingRef: string;
}

export interface Stay {
  id: string;
  city: City;
  name: string;
  type: 'hotel' | 'airbnb' | 'apartment';
  checkIn: string; // ISO date
  checkOut: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  mapUrl: string;
  amenities: string[];
  image: string;
  travelFromPrev?: string; // human description of travel from previous stop
  confirmed: boolean;
  pricePerNightCHF?: number;
}

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  city: City;
  image: string;
  why: string;
  costCHF: number;
  durationMin: number;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  weatherDependent: boolean;
  altitudeM?: number;
  onItinerary: boolean;
  tags?: string[];
  bookingNote?: string;
}

export interface TravelLeg {
  id: string;
  mode: TravelMode;
  from: string;
  to: string;
  durationMin: number;
  costCHF: number;
  sbbUrl?: string;
  note?: string;
}

export interface Meal {
  id: string;
  label: string; // e.g. "Breakfast at the apartment"
  placeId?: string;
}

export interface Block {
  activities: string[]; // activity ids
  travel: TravelLeg[];
  meals: Meal[];
  notes?: string;
}

export interface Day {
  id: string;
  dayNumber: number;
  date: string; // ISO date (yyyy-mm-dd)
  city: City;
  phase: 'Lausanne' | 'Interlaken' | 'Lucerne' | 'Travel';
  title: string;
  summary: string;
  blocks: Record<BlockKey, Block>;
}

export interface FoodPlace {
  id: string;
  name: string;
  city: City;
  cuisine: string;
  vegFriendly: boolean;
  pureVeg?: boolean;
  priceBand: PriceBand;
  area: string;
  mapUrl: string;
  note: string;
  image?: string;
}

export type BudgetCategory =
  | 'Activities'
  | 'Food'
  | 'Local transport'
  | 'Shopping'
  | 'Misc';

export interface BudgetEntry {
  id: string;
  date: string;
  category: BudgetCategory;
  label: string;
  plannedCHF: number;
  actualCHF: number;
  paidBy: string; // traveler id
  splitAmong: string[]; // traveler ids
  receiptImageId?: string;
}

export interface PackingItem {
  id: string;
  travelerId: string; // or 'shared'
  label: string;
  bagId?: string;
  packed: boolean;
  reason: string; // links to activity/altitude/weather rationale
  category: 'essentials' | 'clothing' | 'alpine' | 'tech' | 'documents' | 'health' | 'misc';
}

export interface Bag {
  id: string;
  label: string;
  owner: string; // traveler id or 'shared'
  color: string;
}

export interface TravelDoc {
  id: string;
  type: string;
  title: string;
  travelerId: string;
  fileBlobId?: string;
  carriedBy: string; // traveler id
  note?: string;
  status: 'verified' | 'pending';
}

export interface SafetyCard {
  city: City;
  emergency: { label: string; number: string }[];
  hospitals: { name: string; address: string; phone?: string }[];
  consular: string;
  scams: string[];
  etiquette: string[];
  phrases: { phrase: string; meaning: string }[];
}

export interface Budget {
  committedINR: number; // already spent (flights+hotels+visa)
  liveINR: number; // remaining managed budget
  fxRate: number; // 1 CHF = fxRate INR
  entries: BudgetEntry[];
}

export interface Trip {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  onGroundStart: string;
  onGroundEnd: string;
  baseCurrency: 'CHF';
  homeCurrency: 'INR';
  travelers: Traveler[];
  flights: Flight[];
  stays: Stay[];
  days: Day[];
  activities: Activity[];
  food: FoodPlace[];
  budget: Budget;
  packing: PackingItem[];
  bags: Bag[];
  docs: TravelDoc[];
  safety: SafetyCard[];
}

// Weather (Open-Meteo shape, normalised)
export interface DayWeather {
  date: string;
  city: City;
  tMax: number;
  tMin: number;
  code: number; // WMO code
  label: string;
  icon: string;
  precipProb: number;
  source: 'live' | 'seed';
}

export interface ConciergeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  source?: 'hf' | 'local';
}
