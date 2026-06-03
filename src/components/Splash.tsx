import { motion } from 'framer-motion';
import { LogoMark } from './Logo';

export function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-pine-gradient">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          <LogoMark size={72} />
        </motion.div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-white">Voyage</h1>
        <p className="mt-1 text-sm font-medium text-glacier-200">Mishra Family · Switzerland 2026</p>
        <motion.div
          className="mt-6 h-1 w-24 overflow-hidden rounded-full bg-white/20"
        >
          <motion.div
            className="h-full w-1/2 rounded-full bg-glacier-300"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
