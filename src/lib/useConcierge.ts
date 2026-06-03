import { useCallback, useState } from 'react';
import type { ConciergeMessage, Trip } from '../types';
import { buildSnapshot, localConciergeAnswer } from './conciergeContext';

let _id = 0;
const mid = () => `msg-${Date.now()}-${++_id}`;

/** Client hook for the concierge.
 *  Tries the serverless proxy (HF-backed) first; on any failure or when the
 *  proxy reports no token, silently falls back to the local rules engine.
 *  The demo NEVER breaks. */
export function useConcierge(trip: Trip | null) {
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: mid(),
      role: 'assistant',
      content:
        'Hi! I\'m your Voyage concierge. Ask me what to pack today, where to eat veg nearby, what to do if it rains, or how the budget is looking. 🇨🇭',
      ts: Date.now(),
      source: 'local',
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'hf' | 'local'>('local');

  const send = useCallback(
    async (question: string) => {
      if (!trip || !question.trim()) return;
      const userMsg: ConciergeMessage = { id: mid(), role: 'user', content: question, ts: Date.now() };
      setMessages((m) => [...m, userMsg]);
      setBusy(true);

      const snapshot = buildSnapshot(trip);
      const localFallback = () => localConciergeAnswer(question, trip);

      let answer = '';
      let source: 'hf' | 'local' = 'local';

      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch('/api/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            context: snapshot.text,
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (res.ok) {
          const data = await res.json();
          if (data?.answer && data.source === 'hf') {
            answer = data.answer.trim();
            source = 'hf';
          } else {
            answer = localFallback();
            source = 'local';
          }
        } else {
          answer = localFallback();
        }
      } catch {
        // Offline, no proxy, no token, timeout — all degrade to local.
        answer = localFallback();
      }

      if (!answer) answer = localFallback();
      setMode(source);
      const aMsg: ConciergeMessage = { id: mid(), role: 'assistant', content: answer, ts: Date.now(), source };
      setMessages((m) => [...m, aMsg]);
      setBusy(false);
    },
    [trip, messages]
  );

  return { messages, send, busy, mode };
}
