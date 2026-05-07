import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { derivePeerId } from '../utils/peerId';
import { ChatMessage, ConnectionStatus, FriendProfile, Profile, CallState, PeerPayload, ToastItem } from '../types';

const buildMessage = (type: PeerPayload['type'], payload: any): PeerPayload => ({
  type,
  payload,
  timestamp: Date.now(),
});

export function usePeerConnection(profile: Profile, onToast: (toast: ToastItem) => void) {
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const incomingCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [peerId, setPeerId] = useState(profile.peerId);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    active: false,
    incoming: false,
    type: null,
    muted: false,
    cameraOff: false,
    startTime: null,
  });
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [friendId, setFriendId] = useState('');

  useEffect(() => {
    if (!profile.name) return;
    if (peerRef.current) return;

    const peer = new Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('open', () => {
      setPeerId(peer.id);
      onToast({
        id: `peer-open-${Date.now()}`,
        title: 'Connection ready',
        message: `Your connection handle is active. Share your friend name to connect.`,
        variant: 'success',
      });
    });

    peer.on('connection', (conn) => {
      setConnectionStatus('connecting');
      connectionRef.current = conn;

      conn.on('open', () => {
        setConnectionStatus('connected');
        sendInitProfile();
        onToast({
          id: `conn-open-${Date.now()}`,
          title: 'Connection received',
          message: 'A friend has connected with you.',
          variant: 'info',
        });
      });

      conn.on('data', (data) => handleRemotePayload(data as PeerPayload));
      conn.on('close', handleDisconnect);
      conn.on('error', handleDisconnect);
    });

    peer.on('call', (incomingCall) => {
      incomingCallRef.current = incomingCall;
      setCallState((current) => ({
        ...current,
        incoming: true,
        active: true,
        type: incomingCall.metadata?.type === 'audio' ? 'audio' : 'video',
        startTime: Date.now(),
      }));
      onToast({
        id: `incoming-${Date.now()}`,
        title: 'Incoming call',
        message: 'Accept to join a live peer call.',
        variant: 'info',
      });
    });

    peer.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    peer.on('error', () => {
      onToast({
        id: `peer-error-${Date.now()}`,
        title: 'Connection error',
        message: 'Peer connection failed. Try reconnecting.',
        variant: 'warning',
      });
      handleDisconnect();
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name]);

  const pushMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const handleDisconnect = useCallback(() => {
    connectionRef.current?.close();
    connectionRef.current = null;
    setConnectionStatus('disconnected');
    setFriendProfile(null);
    onToast({
      id: `disconnected-${Date.now()}`,
      title: 'Disconnected',
      message: 'Peer connection has ended.',
      variant: 'warning',
    });
  }, [onToast]);

  const hangupCall = useCallback(() => {
    callRef.current?.close();
    incomingCallRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState({
      active: false,
      incoming: false,
      type: null,
      muted: false,
      cameraOff: false,
      startTime: null,
    });
    if (connectionRef.current?.open) {
      connectionRef.current.send(buildMessage('call-end', true));
    }
  }, []);

  const handleRemotePayload = useCallback(
    (payload: PeerPayload) => {
      if (!payload) return;
      switch (payload.type) {
        case 'init': {
          const profileData = payload.payload as FriendProfile;
          setFriendProfile(profileData);
          onToast({
            id: `friend-profile-${Date.now()}`,
            title: `${profileData.name} joined`,
            message: 'Profile details synchronized.',
            variant: 'success',
          });
          break;
        }
        case 'chat': {
          const message = payload.payload as ChatMessage;
          pushMessage({ ...message, sender: 'friend', status: 'received' });
          break;
        }
        case 'typing': {
          setTyping(payload.payload === true);
          break;
        }
        case 'media': {
          const media = payload.payload as ChatMessage;
          pushMessage({ ...media, sender: 'friend', status: 'received' });
          break;
        }
        case 'gif': {
          const gif = payload.payload as ChatMessage;
          pushMessage({ ...gif, sender: 'friend', status: 'received' });
          break;
        }
        case 'call-end': {
          hangupCall();
          break;
        }
        case 'presence': {
          const { lastActive } = payload.payload;
          setFriendProfile((current) => (current ? { ...current, lastActive } : null));
          break;
        }
      }
    },
    [hangupCall, onToast, pushMessage]
  );

  const sendInitProfile = useCallback(() => {
    if (!connectionRef.current?.open) return;
    const payload = buildMessage('init', {
      name: profile.name,
      avatar: profile.avatar,
      status: profile.status,
      lastActive: 'Now',
    });
    connectionRef.current.send(payload);
  }, [profile.avatar, profile.name, profile.status]);

  const connectToPeer = useCallback(
    async (friendName: string) => {
      if (!peerRef.current || !friendName.trim()) return;
      const remoteId = derivePeerId(friendName);
      setConnectionStatus('connecting');
      setFriendId(friendName);
      const connection = peerRef.current.connect(remoteId, { reliable: true });
      connectionRef.current = connection;

      connection.on('open', () => {
        setConnectionStatus('connected');
        sendInitProfile();
        onToast({
          id: `connected-${Date.now()}`,
          title: 'Connected',
          message: `You are now connected to ${friendName}.`,
          variant: 'success',
        });
      });

      connection.on('data', (data) => handleRemotePayload(data as PeerPayload));
      connection.on('close', handleDisconnect);
      connection.on('error', handleDisconnect);
    },
    [handleDisconnect, handleRemotePayload, onToast, sendInitProfile]
  );

  const sendChat = useCallback(
    (text: string) => {
      if (!connectionRef.current?.open) return;
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        text,
        type: 'text',
        timestamp: Date.now(),
        status: 'sent',
      };
      connectionRef.current.send(buildMessage('chat', message));
      pushMessage(message);
    },
    [pushMessage]
  );

  const sendImage = useCallback(
    (mediaUrl: string) => {
      if (!connectionRef.current?.open) return;
      const message: ChatMessage = {
        id: `img-${Date.now()}`,
        sender: 'me',
        text: 'Shared an image',
        type: 'image',
        mediaUrl,
        timestamp: Date.now(),
        status: 'sent',
      };
      connectionRef.current.send(buildMessage('media', message));
      pushMessage(message);
    },
    [pushMessage]
  );

  const sendGif = useCallback(
    (gifUrl: string) => {
      if (!connectionRef.current?.open) return;
      const message: ChatMessage = {
        id: `gif-${Date.now()}`,
        sender: 'me',
        text: 'Sent a GIF',
        type: 'gif',
        mediaUrl: gifUrl,
        timestamp: Date.now(),
        status: 'sent',
      };
      connectionRef.current.send(buildMessage('gif', message));
      pushMessage(message);
    },
    [pushMessage]
  );

  const sendTyping = useCallback((active: boolean) => {
    if (!connectionRef.current?.open) return;
    connectionRef.current.send(buildMessage('typing', active));
  }, []);

  const startLocalMedia = useCallback(async (audio: boolean, video: boolean) => {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const startCall = useCallback(
    async (type: 'audio' | 'video') => {
      if (!peerRef.current || !connectionRef.current?.open || !friendId) return;
      const stream = await startLocalMedia(true, type === 'video');
      if (!stream) return;
      const call = peerRef.current.call(friendId, stream, { metadata: { type } });
      if (!call) return;
      callRef.current = call;
      setCallState({
        active: true,
        incoming: false,
        type,
        muted: false,
        cameraOff: false,
        startTime: Date.now(),
      });
      call.on('stream', setRemoteStream);
      call.on('close', hangupCall);
      call.on('error', hangupCall);
    },
    [friendId, hangupCall, startLocalMedia]
  );

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCallRef.current) return;
    const type = incomingCallRef.current.metadata?.type === 'audio' ? 'audio' : 'video';
    const stream = await startLocalMedia(true, type === 'video');
    if (!stream) return;
    incomingCallRef.current.answer(stream);
    const call = incomingCallRef.current;
    callRef.current = call;
    incomingCallRef.current = null;
    setCallState((current) => ({
      ...current,
      incoming: false,
      active: true,
      type,
      startTime: Date.now(),
    }));
    call.on('stream', setRemoteStream);
    call.on('close', hangupCall);
    call.on('error', hangupCall);
  }, [hangupCall, startLocalMedia]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCallState((current) => ({ ...current, muted: !current.muted }));
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCallState((current) => ({ ...current, cameraOff: !current.cameraOff }));
  }, []);

  const client = useMemo(
    () => ({
      peerId,
      connectionStatus,
      friendProfile,
      messages,
      typing,
      callState,
      remoteStream,
      localStream,
      friendId,
      setFriendId,
      connectToPeer,
      disconnect: handleDisconnect,
      sendChat,
      sendImage,
      sendGif,
      sendTyping,
      startCall,
      acceptIncomingCall,
      hangupCall,
      toggleMute,
      toggleCamera,
      peerReady: Boolean(peerRef.current),
    }),
    [callState, connectToPeer, friendId, friendProfile, handleDisconnect, messages, peerId, sendChat, sendGif, sendImage, sendTyping, startCall, typing, remoteStream, localStream, acceptIncomingCall, hangupCall, toggleMute, toggleCamera, connectionStatus]
  );

  return client;
}
