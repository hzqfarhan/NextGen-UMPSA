import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Pet } from "./ui/Pet";
import { useStore } from "@/store/useStore";

const getAbsoluteUrl = (path: string) => {
  if (typeof window === 'undefined') return path;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${window.location.origin}${basePath}${path}`;
};

interface StreakShareCardProps {
  currentStreak: number;
  highestStreak: number;
  membershipTier: 'Novice' | 'Pro' | 'Legend';
  streakShieldActive: boolean;
}

export const StreakShareCard = forwardRef<HTMLDivElement, StreakShareCardProps>(
  ({ currentStreak, highestStreak, membershipTier, streakShieldActive }, ref) => {
    const { user, selectedCompanion } = useStore();
    const displayTier = membershipTier;
    
    const avatarUrl = user?.avatar || "/assets/pfp/user.png";
    const mascotUrl = "/assets/API-streak.gif";
    const bgshareUrl = "/assets/bgshare.WEBP";
    
    const [avatarSrc, setAvatarSrc] = useState<string>("");
    const [mascotSrc, setMascotSrc] = useState<string>("");
    const [bgshareSrc, setBgshareSrc] = useState<string>("");

    useEffect(() => {
      let active = true;
      const loadAvatar = async () => {
        const absUrl = getAbsoluteUrl(avatarUrl);
        try {
          const res = await fetch(absUrl);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (active) setAvatarSrc(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          if (active) setAvatarSrc(absUrl);
        }
      };
      loadAvatar();
      return () => { active = false; };
    }, [avatarUrl]);

    useEffect(() => {
      let active = true;
      const loadMascot = async () => {
        const absUrl = getAbsoluteUrl(mascotUrl);
        try {
          const res = await fetch(absUrl);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (active) setMascotSrc(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          if (active) setMascotSrc(absUrl);
        }
      };
      loadMascot();
      return () => { active = false; };
    }, [mascotUrl]);

    useEffect(() => {
      let active = true;
      const loadBgshare = async () => {
        const absUrl = getAbsoluteUrl(bgshareUrl);
        try {
          const res = await fetch(absUrl);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (active) setBgshareSrc(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          if (active) setBgshareSrc(absUrl);
        }
      };
      loadBgshare();
      return () => { active = false; };
    }, [bgshareUrl]);
    
    // 4:5 aspect ratio share card: 360x450 in premium high-contrast light mode with bgshare.WEBP background
    return (
      <div 
        ref={ref}
        className="flex flex-col items-center justify-between p-6 relative overflow-hidden bg-white text-slate-900 border border-slate-200/80 shadow-2xl rounded-[2.5rem]"
        style={{
          width: '360px',
          height: '450px',
          backgroundImage: bgshareSrc ? `url(${bgshareSrc})` : `url(${getAbsoluteUrl(bgshareUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-[180px] h-[180px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col items-center gap-1.5 z-10 w-full mt-2">
          <div className={cn(
            "px-4 py-1 rounded-full border bg-white/80 backdrop-blur-md text-xs font-black shadow-sm flex items-center gap-2",
            membershipTier === 'Legend' ? "border-purple-300 bg-purple-50 text-purple-700 shadow-purple-100" :
            membershipTier === 'Pro' ? "border-blue-300 bg-blue-50 text-blue-700 shadow-blue-100" :
            "border-orange-300 bg-orange-50 text-orange-700 shadow-orange-100"
          )}>
            {membershipTier === 'Legend' ? '🏆' : membershipTier === 'Pro' ? '🥈' : '🥉'}
            {displayTier} Tier
          </div>
          {streakShieldActive && (
            <div className="px-3 py-0.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-600 text-[9px] font-bold flex items-center gap-1 shadow-sm">
              🛡️ Shield Active
            </div>
          )}
        </div>

        {/* Mascot & Streak */}
        <div className="flex flex-col items-center z-10 space-y-3">
          <div className="relative">
            <img
              src={mascotSrc || getAbsoluteUrl(mascotUrl)}
              alt="Streak Mascot"
              className="w-36 h-36 object-contain"
              style={{
                filter: currentStreak < 7
                  ? "hue-rotate(15deg) saturate(2.5) drop-shadow(0 0 16px rgba(249, 115, 22, 0.4))"
                  : currentStreak < 30
                  ? "hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 16px rgba(37, 99, 235, 0.4))"
                  : "hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 24px rgba(168, 85, 247, 0.5))"
              }}
            />
          </div>
          
          <div className="text-center space-y-0.5">
            <h1 className="text-6xl font-black tabular-nums tracking-tighter text-slate-900 drop-shadow-sm leading-none">
              {currentStreak}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Day Streak
            </p>
          </div>
        </div>

        {/* Companion Pet peaking */}
        <div className="absolute bottom-[65px] -right-2 pointer-events-none flex items-end justify-center z-10 opacity-95">
          <Pet 
            animation={currentStreak === 0 ? 'sad' : currentStreak >= 7 ? 'excited' : 'happy'} 
            size={96}
            className="drop-shadow-lg transform rotate-[-5deg] pointer-events-none"
            companionId={selectedCompanion}
          />
        </div>

        {/* Footer */}
        <div className="z-10 w-full flex flex-col items-center gap-3 mb-2">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="flex justify-between items-center w-full px-2 h-8">
             <div className="flex items-center gap-2 h-8">
               <img 
                 src={avatarSrc || getAbsoluteUrl(avatarUrl)} 
                 alt="User Profile" 
                 className="w-8 h-8 rounded-full border border-pink-500/20 object-cover shadow-md"
               />
               <div className="flex flex-col justify-center">
                 <span className="text-[7px] text-slate-400 uppercase font-extrabold tracking-wider leading-none mb-0.5">Highest</span>
                 <span className="text-[10px] font-black text-slate-800 leading-none">{highestStreak} Days</span>
               </div>
             </div>
             <div className="flex flex-col items-end justify-center h-8">
                 <span className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 leading-none">Powered by</span>
                 <h1 className="text-xl font-black tracking-tight leading-none" style={{
                   background: 'linear-gradient(135deg, rgb(223, 0, 89) 0%, rgb(204, 13, 90) 52%, rgb(34, 31, 32) 100%)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   backgroundClip: 'text',
                   textShadow: 'none',
                   filter: 'drop-shadow(rgba(223, 0, 89, 0.22) 0px 12px 30px)'
                 }}>NextGen</h1>
             </div>
          </div>
        </div>
      </div>
    );
  }
);
StreakShareCard.displayName = 'StreakShareCard';
