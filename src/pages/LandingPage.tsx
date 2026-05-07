import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import Avatar from '../components/Avatar';

export default function LandingPage() {
  const { profile } = useAppState();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-xl space-y-8"
        >
          <div className="inline-flex rounded-full bg-slate-800/80 px-4 py-2 text-sm text-sky-200 ring-1 ring-white/10 backdrop-blur-xl">
            Premium peer-to-peer messaging for two people
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              One-to-one chat, calls, and media — no backend required.
            </h1>
            <p className="max-w-2xl text-slate-300 sm:text-lg">
              Create your profile, choose a friend’s display name, and connect instantly through a secure browser-only WebRTC session.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to={profile.name ? '/chat' : '/setup'}
              className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Start connecting
            </Link>
            <Link
              to="/setup"
              className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-6 py-3 text-base text-slate-100 transition hover:border-slate-200/20"
            >
              Customize profile
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex w-full flex-col gap-6 rounded-[36px] border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Your peer portal</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Local profile preview</h2>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200">Secure • instant • direct</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <Avatar src={profile.avatar} name={profile.name || 'You'} size="lg" status={profile.name ? 'online' : ''} />
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{profile.name || 'Your name here'}</p>
                  <p className="text-sm text-slate-400">{profile.status || 'Set your status and join a call.'}</p>
                </div>
              </div>
              <div className="mt-4 rounded-3xl bg-slate-850/90 p-4 text-sm text-slate-300">
                <p className="font-medium text-slate-100">Your display name</p>
                <p className="mt-2 truncate text-slate-400">{profile.name || 'Set your name on setup'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Connect fast</p>
              <p className="mt-3 text-slate-300">Use your friend’s display name in the chat screen to connect through the browser.</p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200">
                  <p className="font-semibold">No backend</p>
                  <p className="mt-1 text-slate-400">Everything runs in your browser.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200">
                  <p className="font-semibold">Built for two</p>
                  <p className="mt-1 text-slate-400">Every screen is optimized for a single private connection.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
