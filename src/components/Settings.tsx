"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Wallet, CircleHelp, LogOut, ChevronRight, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { t } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Pet, PetAnimation } from "./ui/Pet"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export function Settings() {
  const { user, language, setLanguage, petOffsets, updatePetOffset, resetStreak } = useStore()
  const router = useRouter()
  const strings = t[language]
  const [showLogout, setShowLogout] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedAnim, setSelectedAnim] = useState<PetAnimation>("idle")
  const [isSaved, setIsSaved] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const currentOffset = petOffsets[selectedAnim] || { offsetY: 0, scale: 800 }

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      // Simulation of secure logout clearing state
      router.push("/")
    }, 1500)
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex flex-col items-center space-y-3 pt-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary/20 p-1">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center text-slate-900">
            <User className="w-4 h-4" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{user.type} • {user.spendingPersonality}</p>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="space-y-4">
        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">{strings.settingsPreferences}</h3>
          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#237AF9]" />
                  <span className="text-xs font-medium">{strings.settingsLanguage}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('ms')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${language === 'ms' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    BM
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">{strings.settingsSmartNotif}</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">{strings.settingsDebtAuto}</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">Streak Controls</h3>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{language === 'en' ? 'Savings Streak' : 'Streak Simpanan'}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{language === 'en' ? 'Manage your gamification momentum records.' : 'Urus rekod momentum gamifikasi anda.'}</p>
              </div>
              <button
                onClick={() => resetStreak()}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600 rounded-xl hover:bg-rose-100 transition-colors uppercase tracking-wider flex items-center gap-1 active:scale-95"
              >
                ⚠️ {language === 'en' ? 'Reset Streak' : 'Set Semula Streak'}
              </button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">NextGen Companion Sprite Tuner</h3>
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-4 space-y-6">
              {/* Preview Area */}
              <div className="flex flex-col items-center gap-4 py-4 bg-slate-100/50 dark:bg-black/20 rounded-2xl border border-dashed border-primary/20">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <Pet animation={selectedAnim} size={80} className="relative" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedAnim}</p>
                  <p className="text-[8px] text-muted-foreground">Real-time Preview</p>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Select Animation</label>
                  <Select value={selectedAnim} onValueChange={(v) => setSelectedAnim(v as PetAnimation)}>
                    <SelectTrigger className="h-10 bg-white/5 border-white/10 text-xs font-bold rounded-xl">
                      <SelectValue placeholder="Select Animation" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(petOffsets).map((anim) => (
                        <SelectItem key={anim} value={anim} className="text-xs font-medium">
                          {anim.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Offset Y (Vertical)</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        value={currentOffset.offsetY}
                        onChange={(e) => updatePetOffset(selectedAnim, { offsetY: parseFloat(e.target.value) || 0 })}
                        className="w-14 h-6 bg-white/5 border border-white/10 rounded text-[10px] font-mono font-bold text-primary text-center focus:outline-none focus:border-primary/50"
                      />
                      <span className="text-[8px] text-muted-foreground font-bold uppercase">px</span>
                    </div>
                  </div>
                  <Slider 
                    value={[currentOffset.offsetY]} 
                    min={-50} 
                    max={50} 
                    step={0.1}
                    onValueChange={([val]) => updatePetOffset(selectedAnim, { offsetY: val })}
                    className="py-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Sprite Scale (%)</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        value={currentOffset.scale}
                        onChange={(e) => updatePetOffset(selectedAnim, { scale: parseFloat(e.target.value) || 100 })}
                        className="w-14 h-6 bg-white/5 border border-white/10 rounded text-[10px] font-mono font-bold text-primary text-center focus:outline-none focus:border-primary/50"
                      />
                      <span className="text-[8px] text-muted-foreground font-bold uppercase">%</span>
                    </div>
                  </div>
                  <Slider 
                    value={[currentOffset.scale]} 
                    min={100} 
                    max={1600} 
                    step={1}
                    onValueChange={([val]) => updatePetOffset(selectedAnim, { scale: val })}
                    className="py-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 h-10 bg-primary text-slate-900 font-black rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    onClick={() => {
                      setIsSaved(true)
                      setTimeout(() => setIsSaved(false), 2000)
                    }}
                  >
                    {isSaved ? "CONFIG SAVED! ✓" : "SAVE CONFIGURATION"}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-12 h-10 border-white/10 rounded-xl"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(petOffsets, null, 2))
                      setIsCopied(true)
                      setTimeout(() => setIsCopied(false), 2000)
                    }}
                  >
                    {isCopied ? "✓" : "📋"}
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] font-bold text-muted-foreground hover:text-white h-8"
                  onClick={() => updatePetOffset(selectedAnim, { offsetY: 0, scale: 800 })}
                >
                  Reset {selectedAnim} to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">{strings.settingsAccount}</h3>
          <Card className="glass-card">
            <CardContent className="p-0">
              {[
                { icon: Wallet, label: strings.settingsPaymentMethods, color: "text-primary" },
                { icon: User, label: strings.settingsProfile, color: "text-primary" },
                { icon: CircleHelp, label: strings.settingsHelp, color: "text-amber-500" },
              ].map((item, i) => (
                <div key={item.label} className={`p-4 flex items-center justify-between ${i !== 2 ? 'border-b border-slate-200' : ''}`}>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2 mt-8">
          <h3 className="text-[10px] uppercase font-bold text-rose-500/70 px-2 tracking-widest">{strings.settingsSecureSession}</h3>
          <Card className="border-rose-500/20 bg-rose-500/5 shadow-sm">
            <CardContent className="p-2">
              <Button 
                onClick={() => setShowLogout(true)}
                variant="ghost" 
                className="w-full flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-2 font-bold text-xs py-4 rounded-xl transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {strings.settingsSignOut}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground font-medium">NextGen Agent System v1.0.4-alpha</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🧬 in Malaysia</p>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogout(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50"
            >
              <Card className="liquid-glass border-rose-500/20 shadow-2xl max-w-sm mx-auto overflow-hidden">
                <CardContent className="p-6 text-center space-y-6">
                  <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <LogOut className="w-8 h-8 ml-1" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900">{strings.logoutReady}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">
                      {strings.logoutDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      disabled={isLoggingOut}
                      onClick={() => setShowLogout(false)}
                      className="py-6 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xs"
                    >
                      {strings.logoutCancel}
                    </Button>
                    <Button 
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="py-6 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 text-xs shadow-lg shadow-rose-500/20"
                    >
                      {isLoggingOut ? strings.logoutSecuring : strings.logoutConfirm}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
