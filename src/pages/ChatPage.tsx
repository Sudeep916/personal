import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import GifPicker from '../components/GifPicker';
import ToastList from '../components/ToastList';
import { useAppState } from '../context/AppContext';
import { formatTime } from '../utils/format';

export default function ChatPage() {
  const { profile, updateProfile, theme, toggleTheme, peerState, toasts } = useAppState();
  const {
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
    disconnect,
    sendChat,
    sendImage,
    sendGif,
    sendTyping,
    startCall,
    acceptIncomingCall,
    hangupCall,
    toggleMute,
    toggleCamera,
  } = peerState;

  const [draft, setDraft] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const connectionLabel = useMemo(() => {
    if (connectionStatus === 'connected') return 'Connected';
    if (connectionStatus === 'connecting') return 'Connecting...';
    return 'Disconnected';
  }, [connectionStatus]);

  const sendMessage = async () => {
    if (!draft.trim()) return;
    setIsSending(true);
    sendChat(draft.trim());
    setDraft('');
    setIsSending(false);
  };

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = () => {
    if (!imagePreview) return;
    sendImage(imagePreview);
    setImagePreview('');
  };

  const handleSaveProfile = () => {
    updateProfile({ lastActive: 'Now' });
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_24%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid flex-1 gap-6 xl:grid-cols-[360px_1fr_320px]">
          <section className="rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Your profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Connection dashboard</h2>
              </div>
              <button
                onClick={() => toggleTheme()}
                className="rounded-3xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-sky-400/50"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
            <div className="mt-6 space-y-4 rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <img src={profile.avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'} alt="profile" className="h-16 w-16 rounded-3xl object-cover" />
                <div>
                  <p className="text-lg font-semibold text-white">{profile.name}</p>
                  <p className="text-sm text-slate-400">{profile.status}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-medium text-slate-100">Your Peer ID</p>
                <p className="mt-2 break-all text-slate-400">{peerId}</p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">Connect with a friend</label>
                <div className="flex gap-3">
                  <input
                    value={friendId}
                    onChange={(event) => setFriendId(event.target.value)}
                    placeholder="Friend's Peer ID"
                    className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-400/70"
                  />
                  <button
                    onClick={() => connectToPeer(friendId)}
                    className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Connect
                  </button>
                </div>
                <button
                  onClick={disconnect}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-rose-400"
                >
                  Disconnect
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-semibold text-white">{connectionLabel}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{friendProfile?.name || 'No friend'}</span>
              </div>
              <div className="mt-5 grid gap-3">
                <button
                  onClick={() => startCall('video')}
                  className="rounded-3xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  Start video call
                </button>
                <button
                  onClick={() => startCall('audio')}
                  className="rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  Start audio call
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/10 bg-slate-900/80 p-5 shadow-soft backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={friendProfile?.avatar} name={friendProfile?.name || 'Friend'} size="md" status={connectionStatus === 'connected' ? 'online' : ''} />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Messaging room</p>
                  <h2 className="text-xl font-semibold text-white">{friendProfile?.name || 'Waiting for friend'}</h2>
                  <p className="text-sm text-slate-400">{friendProfile?.status || 'Share your Peer ID to connect.'}</p>
                </div>
              </div>
              <div className="flex gap-2 text-sm text-slate-300 sm:text-base">
                <span className="rounded-3xl bg-slate-950/80 px-3 py-2">Last active: {friendProfile?.lastActive || 'Unknown'}</span>
                <Link
                  to="/setup"
                  onClick={handleSaveProfile}
                  className="rounded-3xl border border-slate-700 px-3 py-2 transition hover:border-sky-400/50"
                >
                  Edit profile
                </Link>
              </div>
            </div>

            <div className="mt-6 flex h-[calc(100vh-420px)] flex-col overflow-hidden rounded-[30px] border border-slate-800/80 bg-slate-950/90 p-4 shadow-inner sm:h-[calc(100vh-500px)]">
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {messages.length === 0 && (
                  <div className="grid h-full place-items-center text-center text-slate-400">
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-slate-100">No chat yet</p>
                      <p className="max-w-xs text-sm">Type a message, drop an image, or send a fun GIF once your friend connects.</p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group max-w-[88%] ${message.sender === 'me' ? 'ml-auto rounded-3xl bg-sky-500/15 text-slate-100' : 'rounded-3xl bg-slate-800 text-slate-200'}`}
                  >
                    <div className="space-y-3 px-4 py-4">
                      {message.type === 'text' && <p className="whitespace-pre-line text-sm">{message.text}</p>}
                      {message.type === 'image' && message.mediaUrl && (
                        <img src={message.mediaUrl} alt="shared media" className="max-h-72 w-full rounded-3xl object-cover" />
                      )}
                      {message.type === 'gif' && message.mediaUrl && (
                        <img src={message.mediaUrl} alt="shared gif" className="w-full rounded-3xl object-cover" />
                      )}
                      <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        <span>{formatTime(message.timestamp)}</span>
                        <span>{message.sender === 'me' ? message.status : 'received'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <div className="flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200">
                    <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                    <span>{friendProfile?.name || 'Friend'} is typing...</span>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
              {imagePreview && (
                <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-slate-200">
                  <p className="text-sm text-slate-300">Image ready to send</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <img src={imagePreview} alt="preview" className="max-h-48 w-full rounded-3xl object-cover sm:max-w-[180px]" />
                    <div className="flex gap-3">
                      <button onClick={() => setImagePreview('')} className="rounded-3xl border border-rose-500/50 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10">
                        Cancel
                      </button>
                      <button onClick={handleSendImage} className="rounded-3xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                        Send image
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 shadow-soft sm:flex-row sm:items-center">
                <button
                  onClick={() => setGifModalOpen(true)}
                  className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/50"
                >
                  GIF
                </button>
                <label className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/50">
                  Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleImage(event.target.files[0])} />
                </label>
                <div className="flex-1">
                  <input
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      sendTyping(event.target.value.trim().length > 0);
                    }}
                    placeholder="Type your message..."
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400/70"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <button
                  disabled={!draft.trim()}
                  onClick={sendMessage}
                  className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </section>

          <section className="hidden rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-soft backdrop-blur-xl lg:block">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5 shadow-soft">
                <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Friend status</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-3xl bg-slate-700">
                      <img src={friendProfile?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'} alt="friend" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{friendProfile?.name || 'Friend'}</p>
                      <p className="text-sm text-slate-400">{friendProfile?.status || 'Connect to see status'}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p>Connection status</p>
                    <p className="mt-2 font-semibold text-white">{connectionLabel}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5 shadow-soft">
                <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Shared media</h3>
                <div className="mt-4 grid gap-3">
                  {messages.filter((item) => item.type !== 'text').slice(-6).map((message) => (
                    <img key={message.id} src={message.mediaUrl} alt="shared media" className="h-24 w-full rounded-3xl object-cover" />
                  ))}
                  {messages.filter((item) => item.type !== 'text').length === 0 && (
                    <p className="text-sm text-slate-500">Media will appear here after you share an image or GIF.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <GifPicker open={gifModalOpen} onClose={() => setGifModalOpen(false)} onSelect={(gif) => { sendGif(gif); setGifModalOpen(false); }} />
      <ToastList items={toasts} />

      {callState.active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-5xl rounded-[36px] border border-white/10 bg-slate-900/95 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Live call</p>
                <h2 className="text-2xl font-semibold text-white">{callState.incoming ? 'Incoming call' : `${callState.type === 'video' ? 'Video' : 'Audio'} call`}</h2>
              </div>
              <button onClick={hangupCall} className="rounded-3xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400">
                End call
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_280px]">
              <div className="rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-4">
                <div className="grid gap-4">
                  <div className="relative overflow-hidden rounded-[32px] bg-slate-800/80 shadow-soft">
                    {remoteStream ? (
                      <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-72 items-center justify-center text-slate-400">Waiting for remote stream…</div>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="flex items-center gap-3 rounded-3xl bg-slate-900/90 px-4 py-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
                      <span>{friendProfile?.name || 'Friend'} is {connectionStatus}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={toggleMute} className="rounded-3xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 transition hover:border-sky-400/50">
                        {callState.muted ? 'Unmute' : 'Mute'}
                      </button>
                      <button onClick={toggleCamera} className="rounded-3xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 transition hover:border-sky-400/50">
                        {callState.cameraOff ? 'Camera on' : 'Camera off'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-4 text-slate-200 shadow-soft">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-400">You</p>
                    <p className="mt-1 text-base font-semibold text-white">{profile.name}</p>
                  </div>
                  <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-700">
                    {profile.avatar ? <img src={profile.avatar} alt="me" className="h-full w-full object-cover" /> : null}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Local preview</p>
                  {localStream ? <video ref={localVideoRef} autoPlay muted playsInline className="mt-3 h-40 w-full rounded-3xl object-cover" /> : <p className="mt-3 text-sm text-slate-500">No local preview yet.</p>}
                </div>
                {callState.incoming && (
                  <div className="mt-5 space-y-3">
                    <button onClick={acceptIncomingCall} className="w-full rounded-3xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                      Accept call
                    </button>
                    <button onClick={hangupCall} className="w-full rounded-3xl border border-rose-500 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
