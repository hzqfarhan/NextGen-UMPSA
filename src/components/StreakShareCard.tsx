import React, { forwardRef } from 'react';
import { cn } from "@/lib/utils";
import { Pet } from "./ui/Pet";

interface StreakShareCardProps {
  currentStreak: number;
  highestStreak: number;
  membershipTier: 'Novice' | 'Pro' | 'Legend';
  streakShieldActive: boolean;
}

export const StreakShareCard = forwardRef<HTMLDivElement, StreakShareCardProps>(
  ({ currentStreak, highestStreak, membershipTier, streakShieldActive }, ref) => {
    
    const displayTier = membershipTier;
    
    // 9:16 aspect ratio share card: 360x640 in premium high-contrast light mode
    return (
      <div 
        ref={ref}
        className="w-[360px] h-[640px] flex flex-col items-center justify-between p-8 relative overflow-hidden bg-white text-slate-900 border border-slate-200/80 shadow-2xl rounded-[2.5rem]"
        style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f1f5f9 100%)'
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-[180px] h-[180px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 z-10 w-full mt-4">
          <div className={cn(
            "px-4 py-1.5 rounded-full border bg-white/60 backdrop-blur-md text-sm font-black shadow-sm flex items-center gap-2",
            membershipTier === 'Legend' ? "border-purple-300 bg-purple-50 text-purple-700 shadow-purple-100" :
            membershipTier === 'Pro' ? "border-blue-300 bg-blue-50 text-blue-700 shadow-blue-100" :
            "border-orange-300 bg-orange-50 text-orange-700 shadow-orange-100"
          )}>
            {membershipTier === 'Legend' ? '🏆' : membershipTier === 'Pro' ? '🥈' : '🥉'}
            {displayTier} Tier
          </div>
          {streakShieldActive && (
            <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              🛡️ Shield Active
            </div>
          )}
        </div>

        {/* Mascot & Streak */}
        <div className="flex flex-col items-center z-10 space-y-6">
          <div className="relative">
            <img
              src="/assets/API-streak.gif"
              alt="Streak Mascot"
              className="w-48 h-48 object-contain"
              style={{
                filter: currentStreak < 7
                  ? "hue-rotate(15deg) saturate(2.5) drop-shadow(0 0 16px rgba(249, 115, 22, 0.4))"
                  : currentStreak < 30
                  ? "hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 16px rgba(37, 99, 235, 0.4))"
                  : "hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 24px rgba(168, 85, 247, 0.5))"
              }}
            />
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-8xl font-black tabular-nums tracking-tighter text-slate-900 drop-shadow-sm">
              {currentStreak}
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Day Streak
            </p>
          </div>
        </div>

        {/* Companion Pet peaking */}
        <div className="absolute bottom-[75px] -right-2 pointer-events-none flex items-end justify-center z-10 opacity-95">
          <Pet 
            animation={currentStreak === 0 ? 'sad' : currentStreak >= 7 ? 'excited' : 'happy'} 
            size={112}
            className="drop-shadow-lg transform rotate-[-5deg] pointer-events-none"
          />
        </div>

        {/* Footer */}
        <div className="z-10 w-full flex flex-col items-center gap-4 mb-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="flex justify-between items-center w-full px-4 h-10">
             <div className="flex items-center gap-2.5 h-10">
               <img 
                 src="/assets/pfp/user.png" 
                 alt="User Profile" 
                 className="w-10 h-10 rounded-full border border-pink-500/20 object-cover shadow-md"
               />
               <div className="flex flex-col justify-center">
                 <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider leading-none mb-0.5">Highest</span>
                 <span className="text-xs font-black text-slate-800 leading-none">{highestStreak} Days</span>
               </div>
             </div>
             <div className="flex flex-col items-end justify-center h-10">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 leading-none">Powered by</span>
                <h1 className="text-2xl font-black tracking-tight leading-none" style={{
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
