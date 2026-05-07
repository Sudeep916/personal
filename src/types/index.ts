export type ThemeMode = 'light' | 'dark';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface Profile {
  id: string;
  peerId: string;
  name: string;
  status: string;
  avatar: string;
  lastActive: string;
  wallpaper: string;
}

export interface FriendProfile {
  name: string;
  status: string;
  avatar: string;
  lastActive: string;
}

export type MessageType = 'text' | 'image' | 'gif';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'friend';
  text: string;
  type: MessageType;
  mediaUrl?: string;
  timestamp: number;
  status: 'sent' | 'received';
}

export interface CallState {
  active: boolean;
  incoming: boolean;
  type: 'audio' | 'video' | null;
  muted: boolean;
  cameraOff: boolean;
  startTime: number | null;
}

export interface PeerPayload {
  type: 'init' | 'chat' | 'typing' | 'media' | 'gif' | 'call-end' | 'presence';
  payload: any;
  timestamp: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: 'success' | 'info' | 'warning' | 'danger';
}
