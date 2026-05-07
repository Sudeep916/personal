interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: string;
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
};

export default function Avatar({ src, name, size = 'md', status }: AvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative overflow-hidden rounded-full bg-slate-700 ${sizeMap[size]} flex items-center justify-center text-slate-100 shadow-soft`}>
        {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span>{name.slice(0, 2).toUpperCase()}</span>}
        {status ? <span className="absolute -bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" /> : null}
      </div>
      {status ? <div className="hidden sm:block">
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-slate-400">{status}</p>
      </div> : null}
    </div>
  );
}
