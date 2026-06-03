import type { TravelDoc } from '../types';

export const docs: TravelDoc[] = [
  { id: 'doc-pp-nitin', type: 'Passport', title: 'Passport — Nitin Mishra', travelerId: 'nitin', carriedBy: 'nitin', status: 'verified', note: 'Valid until 2029' },
  { id: 'doc-pp-rachana', type: 'Passport', title: 'Passport — Rachana Mishra', travelerId: 'rachana', carriedBy: 'rachana', status: 'verified', note: 'Valid until 2030' },
  { id: 'doc-pp-rakshit', type: 'Passport', title: 'Passport — Rakshit Mishra', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'verified', note: 'Valid until 2031' },
  { id: 'doc-pp-ronit', type: 'Passport', title: 'Passport — Ronit Mishra (minor)', travelerId: 'ronit', carriedBy: 'nitin', status: 'verified', note: 'Carried by parent' },
  { id: 'doc-visa', type: 'Visa', title: 'Schengen Visa — all 4', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'verified', note: 'Printouts + scans' },
  { id: 'doc-flight-out', type: 'Ticket', title: 'Etihad e-ticket — Outbound (BOM→GVA)', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'verified' },
  { id: 'doc-flight-ret', type: 'Ticket', title: 'Etihad e-ticket — Return (ZRH→BOM)', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'verified' },
  { id: 'doc-hotel-laus', type: 'Hotel', title: 'Hôtel de la Paix — confirmation', travelerId: 'nitin', carriedBy: 'nitin', status: 'verified' },
  { id: 'doc-hotel-int', type: 'Hotel', title: 'apartment2lakes — booking & check-in code', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'pending', note: 'Add self check-in instructions' },
  { id: 'doc-hotel-luc', type: 'Hotel', title: 'Pilatus Apartments — booking', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'pending', note: 'Add check-in details' },
  { id: 'doc-stp', type: 'Pass', title: 'Swiss Travel Pass — 4 QR codes', travelerId: 'rakshit', carriedBy: 'rakshit', status: 'verified' },
  { id: 'doc-insurance', type: 'Insurance', title: 'Travel insurance — family policy', travelerId: 'nitin', carriedBy: 'nitin', status: 'pending', note: 'Upload policy PDF' },
];
