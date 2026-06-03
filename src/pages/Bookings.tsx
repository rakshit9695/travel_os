import { useMemo } from 'react';
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Luggage,
  Phone,
  MapPin,
  ExternalLink,
  BedDouble,
  Check,
  CalendarCheck,
  Hourglass,
  Utensils,
  Ticket,
} from 'lucide-react';
import type { Flight, Stay } from '../types';
import { useTrip } from '../lib/store';
import { formatTime, formatDayMonth, minutesToHM, formatDateLong, daysBetween, countdownTo, now, parseISO } from '../lib/format';
import { PageHeader, Chip } from '../components/ui/primitives';
import { SmartImage } from '../components/SmartImage';

function FlightCard({ flight }: { flight: Flight }) {
  const first = flight.legs[0];
  const last = flight.legs[flight.legs.length - 1];
  const cd = countdownTo(parseISO(first.depart), now());
  const arriveAirport = first.from; // be at departure airport early
  const recommendedArrival = flight.direction === 'outbound' ? 'Be at BOM T2 by ~20:00 (3 hrs early)' : 'Be at ZRH by ~12:55 (3 hrs early)';

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-pine-gradient px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4" />
          <span className="font-display font-bold capitalize">{flight.direction}</span>
          <Chip className="!bg-white/15 !text-white">{flight.carrier}</Chip>
        </div>
        <div className="text-right text-xs text-glacier-100">
          {first.from} → {last.to}
          <div className="font-semibold text-white">{formatDayMonth(first.depart)}</div>
        </div>
      </div>

      <div className="p-5">
        {/* boarding countdown */}
        {!cd.past && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-pine-50 px-4 py-2.5 dark:bg-pine-700/40">
            <span className="flex items-center gap-2 text-sm font-semibold text-pine-700 dark:text-glacier-200">
              <Hourglass className="h-4 w-4" /> Departs in
            </span>
            <span className="font-display text-sm font-bold tabular-nums">
              {cd.days}d {cd.hours}h {cd.minutes}m
            </span>
          </div>
        )}

        {/* legs with layover */}
        <div className="relative space-y-1">
          {flight.legs.map((leg, i) => (
            <div key={i}>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col items-center pt-1">
                  <PlaneTakeoff className="h-4 w-4 text-glacier-500" />
                  <div className="my-1 w-px flex-1 border-l-2 border-dashed border-pine-200 dark:border-pine-600" />
                  <PlaneLanding className="h-4 w-4 text-pine-500" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display text-lg font-extrabold">{leg.from}</div>
                      <div className="text-xs text-ink-mute">{leg.fromCity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-extrabold tabular-nums">{formatTime(leg.depart)}</div>
                      <div className="text-xs text-ink-mute">{formatDayMonth(leg.depart)}</div>
                    </div>
                  </div>
                  <div className="my-1.5 flex items-center gap-2 text-xs text-ink-mute">
                    <span className="rounded-md bg-pine-50 px-2 py-0.5 font-semibold dark:bg-pine-700/50">{leg.flightNo}</span>
                    <Clock className="h-3 w-3" /> {minutesToHM(leg.durationMin)}
                    {leg.aircraft && <span>· {leg.aircraft}</span>}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display text-lg font-extrabold">{leg.to}</div>
                      <div className="text-xs text-ink-mute">{leg.toCity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-extrabold tabular-nums">{formatTime(leg.arrive)}</div>
                      <div className="text-xs text-ink-mute">{formatDayMonth(leg.arrive)}</div>
                    </div>
                  </div>
                  {leg.terminal && <div className="mt-1 text-[11px] text-ink-mute">Terminal: {leg.terminal}</div>}
                </div>
              </div>
              {i < flight.legs.length - 1 && (
                <div className="my-2 flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  <Clock className="h-3.5 w-3.5" />
                  Layover at {leg.to} · {minutesToHM(flight.layoverMin)} — connection, not a direct flight
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 border-t border-pine-100/70 pt-4 text-sm dark:border-pine-700/50">
          <div className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
            <Luggage className="h-4 w-4 text-glacier-500" /> {flight.baggageAllowance}
          </div>
          <div className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
            <Ticket className="h-4 w-4 text-glacier-500" /> {flight.cabin} · Ref {flight.bookingRef}
          </div>
          <div className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
            <Clock className="h-4 w-4 text-glacier-500" /> {recommendedArrival}
          </div>
          <a href={`tel:${flight.contact.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 text-pine-600 dark:text-glacier-300">
            <Phone className="h-4 w-4" /> {flight.contact}
          </a>
        </div>
      </div>
    </div>
  );
}

function StayCard({ stay, idx }: { stay: Stay; idx: number }) {
  const trip = useTrip();
  const nights = daysBetween(stay.checkIn, stay.checkOut);
  const nearbyFood = trip.food.filter((f) => f.city === stay.city && f.vegFriendly).slice(0, 2);
  const nearbyAct = trip.activities.filter((a) => a.city === stay.city && a.onItinerary).slice(0, 2);

  return (
    <div className="card overflow-hidden">
      <div className="relative h-40">
        <SmartImage imageKey={stay.image} rounded="rounded-none" className="h-full w-full" overlay />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Chip className="!bg-white/85 !text-pine-700">Stop {idx + 1}</Chip>
          {stay.confirmed && (
            <Chip className="!bg-glacier-500/90 !text-white">
              <Check className="h-3 w-3" /> Confirmed
            </Chip>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-glacier-200">{stay.city} · {stay.type}</div>
          <h3 className="font-display text-xl font-extrabold drop-shadow">{stay.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between rounded-2xl bg-pine-50 px-4 py-2.5 dark:bg-pine-700/40">
          <div className="text-center">
            <div className="label">Check-in</div>
            <div className="font-display font-bold">{formatDateLong(stay.checkIn)}</div>
          </div>
          <div className="flex flex-col items-center text-ink-mute">
            <BedDouble className="h-4 w-4" />
            <span className="text-[11px] font-semibold">{nights} nights</span>
          </div>
          <div className="text-center">
            <div className="label">Check-out</div>
            <div className="font-display font-bold">{formatDateLong(stay.checkOut)}</div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm text-ink-soft dark:text-glacier-100/80">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-glacier-500" /> {stay.address}
        </div>
        {stay.travelFromPrev && (
          <div className="mt-2 flex items-start gap-2 text-xs text-ink-mute">
            <CalendarCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-glacier-500" /> From previous stop: {stay.travelFromPrev}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {stay.amenities.map((a) => (
            <Chip key={a} tone="mute" className="!text-[11px]">
              {a}
            </Chip>
          ))}
        </div>

        {(nearbyFood.length > 0 || nearbyAct.length > 0) && (
          <div className="mt-3 grid gap-1.5 rounded-2xl bg-pine-50/60 p-3 text-xs dark:bg-pine-700/30">
            {nearbyAct.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
                <MapPin className="h-3 w-3 text-glacier-500" /> {a.title}
              </div>
            ))}
            {nearbyFood.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
                <Utensils className="h-3 w-3 text-glacier-500" /> {f.name} · 🌱 {f.cuisine}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <a href={stay.mapUrl} target="_blank" rel="noreferrer" className="btn-ghost flex-1">
            <MapPin className="h-4 w-4" /> Map <ExternalLink className="h-3 w-3" />
          </a>
          {stay.phone && (
            <a href={`tel:${stay.phone.replace(/[^+\d]/g, '')}`} className="btn-soft flex-1">
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Bookings() {
  const trip = useTrip();
  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Flights via Abu Dhabi & three stays — committed (₹6L locked)."
      />

      <h2 className="section-title mb-3">Flights · Etihad</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {trip.flights.map((f) => (
          <FlightCard key={f.id} flight={f} />
        ))}
      </div>

      <h2 className="section-title mb-3 mt-7">Stays</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {trip.stays.map((s, i) => (
          <StayCard key={s.id} stay={s} idx={i} />
        ))}
      </div>
    </div>
  );
}
