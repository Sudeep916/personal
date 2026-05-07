import { motion } from 'framer-motion';
import { sampleGifs } from '../utils/gifs';

interface GifPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

export default function GifPicker({ open, onClose, onSelect }: GifPickerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-soft backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Share a GIF</h2>
            <p className="text-sm text-slate-400">Tap to send a premium animated reaction.</p>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sampleGifs.map((gif) => (
            <button
              key={gif}
              onClick={() => onSelect(gif)}
              className="group overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 transition hover:border-sky-400/40"
            >
              <img src={gif} alt="gif preview" className="h-36 w-full object-cover transition duration-300 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
