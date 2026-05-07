import { FriendProfile, Profile, ThemeMode } from '../types';

const PROFILE_KEY = 'peerChat_profile';
const THEME_KEY = 'peerChat_theme';

export function loadProfile(): Profile | null {
  try {
    const item = localStorage.getItem(PROFILE_KEY);
    return item ? (JSON.parse(item) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadTheme(): ThemeMode {
  try {
    const item = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return item === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getDefaultFriend(): FriendProfile {
  return {
    name: 'Friend',
    status: 'Waiting to connect',
    avatar: '',
    lastActive: 'Never',
  };
}
