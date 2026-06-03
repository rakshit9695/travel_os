import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Wifi, WifiOff, User } from 'lucide-react';
import { useTrip } from '../lib/store';
import { useConcierge } from '../lib/useConcierge';
import { SUGGESTED_QUESTIONS, buildSnapshot } from '../lib/conciergeContext';
import { PageHeader } from '../components/ui/primitives';
import { LogoMark } from '../components/Logo';

export default function Concierge() {
  const trip = useTrip();
  const { messages, send, busy, mode } = useConcierge(trip);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const snapshot = buildSnapshot(trip);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const submit = (q: string) => {
    if (!q.trim() || busy) return;
    send(q);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col lg:h-[calc(100vh-7rem)]">
      <PageHeader
        title="AI Concierge"
        subtitle="Grounded in your live trip data — works offline."
        right={
          <span
            className={`chip ${
              mode === 'hf'
                ? 'bg-glacier-100 text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200'
                : 'bg-pine-50 text-ink-mute dark:bg-pine-700/40'
            }`}
            title={mode === 'hf' ? 'Hugging Face model' : 'Local rules engine (no key / offline)'}
          >
            {mode === 'hf' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {mode === 'hf' ? 'HF model' : 'Local engine'}
          </span>
        }
      />

      {/* context banner */}
      <div className="card mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 p-3 text-xs text-ink-mute">
        <span className="font-semibold text-pine-600 dark:text-glacier-300">Now:</span>
        <span>📍 {snapshot.city}</span>
        <span>{snapshot.weather}</span>
        {snapshot.alpine && <span className="text-glacier-600">❄ alpine day</span>}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="card flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                m.role === 'user' ? 'bg-pine-600 text-white' : 'bg-glacier-100 dark:bg-pine-700'
              }`}
            >
              {m.role === 'user' ? <User className="h-4 w-4" /> : <LogoMark size={20} />}
            </div>
            <div
              className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-pine-600 text-white'
                  : 'bg-pine-50 text-ink-soft dark:bg-pine-700/50 dark:text-glacier-100'
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-glacier-100 dark:bg-pine-700">
              <LogoMark size={20} />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-pine-50 px-4 py-3 dark:bg-pine-700/50">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-glacier-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* suggested chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => submit(q)}
            disabled={busy}
            className="shrink-0 rounded-full border border-pine-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-glacier-300 disabled:opacity-50 dark:border-pine-700/50 dark:bg-pine-800/50 dark:text-glacier-100/80"
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="mt-3 flex gap-2"
      >
        <div className="flex flex-1 items-center gap-2 rounded-full border border-pine-100 bg-white px-4 py-1 dark:border-pine-700/50 dark:bg-pine-800/50">
          <Sparkles className="h-4 w-4 text-glacier-500" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your trip…"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </div>
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary !px-4">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
