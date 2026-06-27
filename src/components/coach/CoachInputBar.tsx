import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoachInputBarProps {
  input: string;
  setInput: (val: string) => void;
  sendMessage: (overrideText?: string) => void;
  isThinking: boolean;
  isExecuting: boolean;
  isListening: boolean;
  toggleListening: () => void;
  messagesLength: number;
  strings: any;
}

export function CoachInputBar({
  input,
  setInput,
  sendMessage,
  isThinking,
  isExecuting,
  isListening,
  toggleListening,
  messagesLength,
  strings
}: CoachInputBarProps) {
  const suggestionChips = [
    strings.coachChipLimit, 
    strings.coachChipSafe, 
    strings.coachChipSave, 
    "Pay RM 50 to Aizat"
  ];

  return (
    <div className="bg-white/88 backdrop-blur-xl border-t border-pink-100 p-4 pb-safe space-y-3 shrink-0 z-20 shadow-[0_-12px_40px_rgba(204,13,90,0.08)]">
      <AnimatePresence>
        {messagesLength > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestionChips.map((suggestion) => (
                <button
                  key={suggestion}
                  disabled={isThinking}
                  onClick={() => sendMessage(suggestion)}
                  className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#555555] hover:bg-primary hover:text-white transition-colors border border-pink-100 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <Input
          placeholder={isThinking || isExecuting ? "Wait for the council..." : (isListening ? "Listening... Speak now!" : strings.coachInputPlaceholder)}
          disabled={isThinking || isExecuting}
          maxLength={500}
          className="pr-24 bg-white border-pink-100 h-12 rounded-2xl text-xs text-[#221F20] placeholder:text-[#727272] shadow-sm shadow-pink-100/60 focus:border-primary focus:ring-primary/20 disabled:bg-[#F8F8F8]"
          value={input}
          onChange={(e) => {
            // Strip simple HTML tags to prevent obvious injection on the client
            const sanitized = e.target.value.replace(/<[^>]*>?/gm, '');
            setInput(sanitized);
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button
          size="icon"
          type="button"
          onClick={toggleListening}
          disabled={isThinking || isExecuting}
          className={cn(
            "absolute right-12 top-1 w-10 h-10 rounded-xl transition-all active:scale-95 border",
            isListening 
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-600" 
              : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-pink-50/50"
          )}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          disabled={isThinking || isExecuting || !input.trim()}
          className="absolute right-1 top-1 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
          onClick={() => sendMessage()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
