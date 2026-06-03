import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { StoreProvider, useStore } from './lib/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Splash } from './components/Splash';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Itinerary from './pages/Itinerary';
import Bookings from './pages/Bookings';
import CityGuides from './pages/CityGuides';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import Concierge from './pages/Concierge';
import Documents from './pages/Documents';
import Family from './pages/Family';
import Memories from './pages/Memories';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/cities" element={<CityGuides />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/packing" element={<Packing />} />
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/family" element={<Family />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Gate() {
  const { ready } = useStore();
  const [minTime, setMinTime] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTime(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!ready || !minTime) return <Splash />;

  return (
    <AppShell>
      <AnimatedRoutes />
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <BrowserRouter>
            <Gate />
          </BrowserRouter>
        </StoreProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
