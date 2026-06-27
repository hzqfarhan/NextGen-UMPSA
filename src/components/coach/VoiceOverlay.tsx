import { motion, AnimatePresence } from "framer-motion"

interface VoiceOverlayProps {
  isListening: boolean;
  interimTranscript: string;
}

export function VoiceOverlay({ isListening, interimTranscript }: VoiceOverlayProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[99] flex flex-col justify-between p-6 text-center select-none overflow-hidden"
        >
          {/* Background bot.gif with soft light-mode gradient wash */}
          <img
            src={`${basePath}/assets/bot.gif`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-22 mix-blend-overlay pointer-events-none"
          />
          <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,rgba(223,0,89,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,233,242,0.92))]" />

          {/* Custom slow-spin styles */}
          <style>{`
            @keyframes spin-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-spin-slow {
              animation: spin-slow 15s linear infinite;
            }
          `}</style>

          {/* Top header */}
          <div className="flex justify-between items-center w-full mt-4 z-10">
            <span className="text-xs font-mono text-[#CC0D5A] uppercase tracking-widest font-black">Voice Assistant Mode</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFE9F2] text-[#DF0059] border border-[#F3C7D8] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#DF0059] animate-ping"></span>
              Recording
            </span>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 z-10">
            {/* Glowing animated orb (Aura style in light mode) */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer soft glow pulses */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF0059]/30 to-[#CC0D5A]/30 blur-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-[#FF6B6B]/20 blur-3xl"
              />
              
              {/* Rotating abstract shape */}
              <div className="absolute inset-2 animate-spin-slow opacity-80 mix-blend-multiply">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#DF0059]/40 drop-shadow-lg">
                  <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.3C90.4,-33.5,96,-18,95.3,-2.9C94.6,12.2,87.6,26.9,78.2,39.3C68.8,51.7,57,61.8,43.5,70.3C30,78.8,15,85.7,0.4,85.1C-14.2,84.5,-28.4,76.4,-41.8,67.6C-55.2,58.8,-67.8,49.3,-76.3,36.9C-84.8,24.5,-89.2,9.2,-87.3,-5.3C-85.4,-19.8,-77.2,-33.5,-66.6,-44C-56,-54.5,-43,-61.8,-30.1,-69.7C-17.2,-77.6,-4.4,-86.1,9.3,-84.9C23,-83.7,46,-72.8,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="absolute inset-4 animate-spin-slow [animation-direction:reverse] opacity-90 mix-blend-multiply">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#CC0D5A]/50 drop-shadow-md">
                  <path d="M49.2,-67.7C63.2,-58.5,73.4,-44.6,81.3,-28.6C89.2,-12.6,94.8,5.5,90.2,21.1C85.6,36.7,70.8,49.8,55.5,60.8C40.2,71.8,24.4,80.7,7.1,82.4C-10.2,84.1,-29,78.6,-43.8,68.2C-58.6,57.8,-69.4,42.5,-75.4,25.6C-81.4,8.7,-82.6,-9.8,-76.2,-25.9C-69.8,-42,-55.8,-55.7,-40.8,-64.5C-25.8,-73.3,-9.8,-77.2,4.1,-82.7C18,-88.2,35.2,-76.9,49.2,-67.7Z" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Core solid sphere */}
              <div className="absolute inset-14 rounded-full bg-gradient-to-br from-[#DF0059] to-[#CC0D5A] shadow-[0_0_40px_rgba(223,0,89,0.8)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_50%)]" />
                
                {/* Voice reactive wave simulator (just visual fluff) */}
                <motion.div 
                  animate={{ height: ["20%", "70%", "30%", "90%", "40%"] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
                  className="w-1.5 bg-white/80 rounded-full mx-1"
                />
                <motion.div 
                  animate={{ height: ["40%", "90%", "50%", "100%", "60%"] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror", delay: 0.1 }}
                  className="w-1.5 bg-white rounded-full mx-1"
                />
                <motion.div 
                  animate={{ height: ["30%", "60%", "20%", "80%", "30%"] }}
                  transition={{ duration: 0.9, repeat: Infinity, repeatType: "mirror", delay: 0.2 }}
                  className="w-1.5 bg-white/80 rounded-full mx-1"
                />
              </div>
            </div>

            {/* Transcription text */}
            <div className="w-full max-w-sm mt-8 relative min-h-[80px] flex items-center justify-center">
              <p className="text-2xl font-black text-[#221F20] tracking-tight leading-tight">
                {interimTranscript || "I'm listening..."}
              </p>
            </div>
            <p className="text-[10px] text-[#727272] uppercase tracking-widest font-bold mt-2">
              Speak naturally. Stop to send.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
