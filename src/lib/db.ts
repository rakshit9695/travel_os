import { openDB, type IDBPDatabase } from 'idb';
import type { Trip } from '../types';
import { seedTrip, SCHEMA_VERSION } from '../data/trip';

const DB_NAME = 'voyage-db';
const DB_VERSION = 1;
const STORE_TRIP = 'trip';
const STORE_BLOBS = 'blobs'; // receipt images, doc files
const TRIP_KEY = 'current';
const VERSION_KEY = 'schema-version';

let dbp: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbp) {
    dbp = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_TRIP)) db.createObjectStore(STORE_TRIP);
        if (!db.objectStoreNames.contains(STORE_BLOBS)) db.createObjectStore(STORE_BLOBS);
      },
    }).catch((e) => {
      console.warn('[voyage] IndexedDB unavailable, using in-memory only', e);
      throw e;
    });
  }
  return dbp;
}

/** Load the trip from IndexedDB, hydrating from the seed on first run.
 *  Falls back to the in-memory seed if IndexedDB is blocked (private mode etc.). */
export async function loadTrip(): Promise<Trip> {
  try {
    const db = await getDB();
    const storedVersion = await db.get(STORE_TRIP, VERSION_KEY);
    const stored = (await db.get(STORE_TRIP, TRIP_KEY)) as Trip | undefined;
    if (!stored || storedVersion !== SCHEMA_VERSION) {
      // First run, or seed schema bumped — (re)hydrate from fixtures.
      await db.put(STORE_TRIP, seedTrip, TRIP_KEY);
      await db.put(STORE_TRIP, SCHEMA_VERSION, VERSION_KEY);
      return structuredClone(seedTrip);
    }
    return stored;
  } catch {
    return structuredClone(seedTrip);
  }
}

export async function saveTrip(trip: Trip): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_TRIP, trip, TRIP_KEY);
    await db.put(STORE_TRIP, SCHEMA_VERSION, VERSION_KEY);
  } catch (e) {
    console.warn('[voyage] saveTrip failed (changes kept in memory)', e);
  }
}

export async function resetTrip(): Promise<Trip> {
  try {
    const db = await getDB();
    await db.put(STORE_TRIP, seedTrip, TRIP_KEY);
    await db.put(STORE_TRIP, SCHEMA_VERSION, VERSION_KEY);
  } catch {
    /* ignore */
  }
  return structuredClone(seedTrip);
}

// ── Blob storage (receipts, document scans) ──
export async function saveBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_BLOBS, blob, id);
  } catch (e) {
    console.warn('[voyage] saveBlob failed', e);
  }
}

export async function getBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await getDB();
    const blob = (await db.get(STORE_BLOBS, id)) as Blob | undefined;
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}
