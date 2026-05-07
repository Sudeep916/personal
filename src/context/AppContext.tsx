import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { loadProfile, saveProfile as persistProfile } from '../services/storage';
import { derivePeerId } from '../utils/peerId';
import { ThemeMode, Profile, ToastItem } from '../types';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { useTheme } from '../hooks/useTheme';

const defaultProfile: Profile = {
  id: crypto.randomUUID(),
  peerId: derivePeerId(''),
  name: '',
  status: 'Ready to chat',
  avatar: '',
  lastActive: 'Now',
  wallpaper: '',
};

interface AppStateContextValue {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  peerState: ReturnType<typeof usePeerConnection>;
  toasts: ToastItem[];
  pushToast: (toast: ToastItem) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(() => loadProfile() || defaultProfile);
  const { theme, toggleTheme } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: ToastItem) => {
    setToasts((current) => [...current.filter((item) => item.id !== toast.id), toast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 4200);
  }, []);

  const setProfile = useCallback(
    (nextProfile: Profile) => {
      setProfileState(nextProfile);
      persistProfile(nextProfile);
    },
    []
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfileState((current) => {
        const updated = { ...current, ...patch };
        if (patch.name !== undefined) {
          updated.peerId = derivePeerId(patch.name || '');
        }
        persistProfile(updated);
        return updated;
      });
    },
    []
  );

  const peerState = usePeerConnection(profile, pushToast);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      updateProfile,
      theme,
      toggleTheme,
      peerState,
      toasts,
      pushToast,
    }),
    [profile, pushToast, peerState, setProfile, theme, toggleTheme, toasts, updateProfile]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }
  return context;
}
