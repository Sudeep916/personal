import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';

const defaultWallpaper = 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=1000&q=80';

export default function ProfileSetupPage() {
  const { profile, updateProfile } = useAppState();
  const navigate = useNavigate();

  const [name, setName] = useState(profile.name);
  const [status, setStatus] = useState(profile.status);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [wallpaper, setWallpaper] = useState(profile.wallpaper || defaultWallpaper);

  const canSave = useMemo(() => name.trim().length > 1, [name]);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({ name: name.trim(), status: status.trim() || 'Ready to connect', avatar, wallpaper });
    navigate('/chat');
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-slate-800/80 bg-slate-900/90 p-6 shadow-soft backdrop-blur-xl sm:p-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Create your local profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Set up your identity for the peer session.</h1>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300">Saved in LocalStorage only.</div>
          </div>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="space-y-6 rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-6 shadow-soft">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/70"
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">Status message</label>
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/70"
                  placeholder="How are you feeling today?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">Profile photo</label>
                <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/60">
                  <span>{avatar ? 'Change photo' : 'Upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])} />
                </label>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Profile preview</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-700">
                    {avatar ? <img src={avatar} alt="profile preview" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-xl text-slate-200">{name?.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{name || 'Your name'}</p>
                    <p className="text-sm text-slate-400">{status || 'Write a short status'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-6 shadow-soft">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">Background wallpaper</label>
                <input
                  value={wallpaper}
                  onChange={(e) => setWallpaper(e.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/70"
                  placeholder="Paste an image URL for your chat background"
                />
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">Live preview</p>
                <div className="mt-4 h-44 overflow-hidden rounded-3xl bg-cover bg-center shadow-soft" style={{ backgroundImage: `url(${wallpaper})` }} />
              </div>
              <button
                type="submit"
                disabled={!canSave}
                className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save profile & continue
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
}
