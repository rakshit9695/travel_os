import type { SafetyCard } from '../types';

const commonEmergency = [
  { label: 'General emergency (EU)', number: '112' },
  { label: 'Police', number: '117' },
  { label: 'Ambulance', number: '144' },
  { label: 'Fire', number: '118' },
  { label: 'Rega air rescue (mountains)', number: '1414' },
];

const commonEtiquette = [
  'Tipping is modest — service is included. Rounding up or +5–10% for great service is plenty.',
  'Be punctual; Swiss trains and people run on time. Stand right on escalators.',
  'Greet shopkeepers (Grüezi / Bonjour) on entering — it\'s expected.',
  'Quiet hours are respected, especially Sundays — most shops close.',
  'Validate/keep your Swiss Travel Pass ready; fare inspections are common and fines are steep.',
];

export const safety: SafetyCard[] = [
  {
    city: 'Lausanne',
    emergency: commonEmergency,
    hospitals: [
      { name: 'CHUV — Centre Hospitalier Universitaire Vaudois', address: 'Rue du Bugnon 46, 1011 Lausanne', phone: '+41 21 314 11 11' },
    ],
    consular: 'Embassy of India, Bern — +41 31 350 11 30. Consular help: Geneva (Permanent Mission of India). Carry the 24×7 emergency line.',
    scams: [
      'Pickpockets near Lausanne station & Flon at busy times — keep bags zipped & front-facing.',
      'Decline unsolicited "petition" or charity clipboards in tourist areas.',
    ],
    etiquette: ['Lausanne is French-speaking — Bonjour / Merci go a long way.', ...commonEtiquette],
    phrases: [
      { phrase: 'Bonjour', meaning: 'Hello' },
      { phrase: 'Merci', meaning: 'Thank you' },
      { phrase: 'Végétarien(ne)', meaning: 'Vegetarian' },
      { phrase: 'Sans viande, sans poisson', meaning: 'Without meat, without fish' },
      { phrase: 'L\'addition, s\'il vous plaît', meaning: 'The bill, please' },
    ],
  },
  {
    city: 'Interlaken',
    emergency: commonEmergency,
    hospitals: [
      { name: 'Spital Interlaken (FMI)', address: 'Weissenaustrasse 27, 3800 Unterseen', phone: '+41 58 469 25 25' },
    ],
    consular: 'Embassy of India, Bern — +41 31 350 11 30 (Bern is ~1 hr away). Save the number before mountain days.',
    scams: [
      'Few scams here — main risk is weather & mountain safety, not crime.',
      'Buy mountain tickets only from official counters / apps (Jungfrau, SBB).',
    ],
    etiquette: ['Interlaken is German-speaking — Grüezi / Danke.', ...commonEtiquette],
    phrases: [
      { phrase: 'Grüezi', meaning: 'Hello (formal)' },
      { phrase: 'Danke', meaning: 'Thank you' },
      { phrase: 'Vegetarisch', meaning: 'Vegetarian' },
      { phrase: 'Ohne Fleisch', meaning: 'Without meat' },
      { phrase: 'Die Rechnung, bitte', meaning: 'The bill, please' },
    ],
  },
  {
    city: 'Lucerne',
    emergency: commonEmergency,
    hospitals: [
      { name: 'Luzerner Kantonsspital (LUKS)', address: 'Spitalstrasse, 6000 Luzern 16', phone: '+41 41 205 11 11' },
    ],
    consular: 'Embassy of India, Bern — +41 31 350 11 30 (~1 hr by train). Zurich consular services also nearby.',
    scams: [
      'Standard tourist-area pickpocketing around Chapel Bridge & the station — stay aware in crowds.',
      'Confirm boat/mountain prices against official Pilatus/Rigi sites.',
    ],
    etiquette: ['Lucerne is German-speaking — Grüezi / Danke.', ...commonEtiquette],
    phrases: [
      { phrase: 'Grüezi', meaning: 'Hello (formal)' },
      { phrase: 'Bitte', meaning: 'Please / you\'re welcome' },
      { phrase: 'Vegetarisch', meaning: 'Vegetarian' },
      { phrase: 'Kein Fleisch, kein Fisch', meaning: 'No meat, no fish' },
      { phrase: 'Entschuldigung', meaning: 'Excuse me / sorry' },
    ],
  },
];
