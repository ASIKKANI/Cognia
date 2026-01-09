import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { Plus, Trash2, Palette, Pin, Lock, Home, User } from "lucide-react"
import Link from "next/link"
import { cn, isColorDark, stripHtml } from "@/lib/utils"
import { useUser } from "@/hooks/journal/useUser"
import { Locker } from "./Locker"

// Reuse MOODS constant or define local
const BG_OPTIONS = [
    { id: "default", label: "Default", color: "" },
    { id: "calm", label: "Calm", color: "bg-[#BBDEFB]" },
    { id: "joy", label: "Joy", color: "bg-[#FFE0B2]" },
    { id: "focus", label: "Focus", color: "bg-[#E1BEE7]" },
    { id: "nature", label: "Nature", color: "bg-[#C8E6C9]" },
]

interface DashboardProps {
    userName: string;
    entries: any[];
    onCreate: () => void;
    onEdit: (entry: any) => void;
    onDelete: (id: string) => void;
    onPin: (id: string) => void;
    onBack: () => void;
    onProfile: () => void;
    toggleLock: (id: string) => void;
}

export function Dashboard({ userName, entries, onCreate, onEdit, onDelete, onPin, onBack, onProfile, toggleLock }: DashboardProps) {
    const [mounted, setMounted] = useState(false)
    const [bgColor, setBgColor] = useState("")
    const [customBg, setCustomBg] = useState("")
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)
    const [isLockerOpen, setIsLockerOpen] = useState(false)

    // User hooks for Locker
    const userHooks = useUser()

    useEffect(() => {
        setMounted(true)
        setBgColor(localStorage.getItem("mindful_dashboard_bg") || "")
        setCustomBg(localStorage.getItem("mindful_dashboard_custom_bg") || "")
    }, [])

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mindful_dashboard_bg", bgColor)
            localStorage.setItem("mindful_dashboard_custom_bg", customBg)
        }
    }, [bgColor, customBg])

    if (!mounted) return null

    const handleSelectBg = (id: string) => {
        setBgColor(id)
        setCustomBg("")
        setIsPaletteOpen(false)
    }

    const handleCustomBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomBg(e.target.value)
        setBgColor("custom")
    }

    const activeBgClass = BG_OPTIONS.find(b => b.id === bgColor)?.color || ""
    const activeStyle = bgColor === "custom" && customBg ? { backgroundColor: customBg } : {}

    const isDark = bgColor === "custom" && customBg ? isColorDark(customBg) : false

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
        })
    }

    const getMoodStyle = (moodId: string) => {
        switch (moodId) {
            case "calm": return "bg-[#E3F2FD]";
            case "joy": return "bg-[#FFF3E0]";
            case "focus": return "bg-[#F3E5F5]"
            case "nature": return "bg-[#E8F5E9]";
            case "melancholic": return "bg-[#E1F5FE]";
            case "intense": return "bg-[#FBE9E7]";
            case "stoic": return "bg-[#F5F5F5]";
            default: return "";
        }
    }

    const getCardTextColor = (entry: any) => {
        if (entry.customColor) {
            return isColorDark(entry.customColor) ? "text-white" : "text-black"
        }
        if (entry.mood && entry.mood !== "default") {
            return "text-black"
        }
        return "text-card-foreground"
    }

    const visibleEntries = entries.filter(e => !e.locked)

    return (
        <motion.div
            className={cn(
                "min-h-screen p-6 md:p-12 transition-colors duration-500",
                activeBgClass,
                isDark && "dark"
            )}
            style={activeStyle}
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-black/5 dark:border-white/10 pb-6 relative z-10 gap-6 md:gap-0">
                <div>
                    <h2 className="text-5xl md:text-6xl font-serif font-medium text-primary mb-2 dark:text-white transition-colors">
                        {userName ? `${userName}'s Journal` : "Blue Paper"}
                    </h2>
                    <p className="text-muted-foreground font-sans text-lg dark:text-white/60 transition-colors">
                        {visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'} written
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full w-12 h-12 shadow-sm bg-white/50 hover:bg-white/80 backdrop-blur-md transition-all hover:scale-105"
                            title="Back to Home"
                        >
                            <Home className="h-5 w-5 text-primary/80" />
                        </Button>
                    </Link>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onProfile}
                            className="rounded-full w-12 h-12 shadow-sm bg-white/50 hover:bg-white/80 backdrop-blur-md transition-all hover:scale-105"
                            title="Emotional Profile"
                        >
                            <User className="h-5 w-5 text-primary/80" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsLockerOpen(true)}
                            className="rounded-full w-12 h-12 shadow-sm bg-white/50 hover:bg-white/80 backdrop-blur-md transition-all hover:scale-105"
                            title="Notes Locker"
                        >
                            <Lock className="h-5 w-5 text-primary/80" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                            className="rounded-full w-12 h-12 shadow-sm bg-white/50 hover:bg-white/80 backdrop-blur-md transition-all hover:scale-105"
                            title="Page Background"
                        >
                            <Palette className="h-6 w-6 text-primary/80" />
                        </Button>

                        <AnimatePresence>
                            {isPaletteOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm md:absolute md:inset-auto md:top-full md:right-0 md:left-auto md:mt-2 md:block md:bg-white/90 md:backdrop-blur-xl md:p-4 md:rounded-3xl md:shadow-2xl md:border md:border-white/50 md:min-w-max md:origin-top-right"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) {
                                            setIsPaletteOpen(false);
                                        }
                                    }}
                                >
                                    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/50 flex flex-wrap justify-center items-center gap-3 w-[85vw] max-w-sm md:w-auto md:max-w-none md:p-0 md:bg-transparent md:shadow-none md:border-none relative">
                                        {BG_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleSelectBg(opt.id)}
                                                className={cn(
                                                    "w-10 h-10 md:w-8 md:h-8 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none ring-2 ring-offset-1 ring-offset-transparent shadow-sm border border-black/10",
                                                    opt.color || "bg-white",
                                                    bgColor === opt.id ? "ring-black/40 scale-125 shadow-md" : "ring-transparent opacity-80 hover:opacity-100"
                                                )}
                                                title={opt.label}
                                            />
                                        ))}

                                        <div className="w-px h-6 bg-black/10 mx-1"></div>

                                        <div className="relative group w-10 h-10 md:w-8 md:h-8">
                                            <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-offset-1 ring-transparent hover:scale-110 transition-transform shadow-sm border border-black/10 bg-gradient-to-tr from-blue-400 via-purple-400 to-orange-400 cursor-pointer">
                                                <input
                                                    type="color"
                                                    value={customBg || "#ffffff"}
                                                    onChange={handleCustomBgChange}
                                                    className="opacity-0 w-full h-full cursor-pointer absolute inset-0 z-50"
                                                    title="Pick custom page background"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button onClick={onCreate} className="rounded-full h-14 px-8 text-lg font-serif italic shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-1">
                        <Plus className="h-5 w-5 mr-2" />
                        New Entry
                    </Button>
                </div>
            </header>

            {visibleEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                    <h3 className="font-serif text-3xl mb-4 italic text-muted-foreground">
                        {entries.length > 0 ? "All entries are in the Locker." : "The page is blank..."}
                    </h3>
                    <p className="font-sans text-lg text-muted-foreground/80 max-w-md">
                        {entries.length > 0 ? "Unlock them to view." : "But your mind isn't. Begin your first entry today."}
                    </p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {visibleEntries.map((entry, index) => (
                        <motion.div
                            key={`entry-${entry.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.6 }}
                            onClick={() => onEdit(entry)}
                            className="break-inside-avoid relative group cursor-pointer"
                        >
                            <div
                                style={entry.customColor ? { backgroundColor: entry.customColor } : {}}
                                className={cn(
                                    "p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-transparent hover:border-border/50 break-words",
                                    !entry.customColor && getMoodStyle(entry.mood),
                                    (!entry.customColor && !getMoodStyle(entry.mood)) && "bg-card shadow-sm border-black/5 dark:border-white/5",
                                    getCardTextColor(entry),
                                    entry.pinned && "ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                                )}>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="font-sans text-xs tracking-wider uppercase opacity-50 font-bold flex items-center gap-2">
                                        {formatDate(entry.createdAt)}
                                        {entry.pinned && <Pin className="w-3 h-3 fill-current" />}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleLock(entry.id); }}
                                            className="p-2 hover:bg-black/5 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                                            title="Lock entry"
                                        >
                                            <Lock className="h-4 w-4 opacity-50 hover:opacity-100" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onPin(entry.id); }}
                                            className={cn(
                                                "p-2 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100",
                                                entry.pinned ? "opacity-100 bg-black/5" : "hover:bg-black/5"
                                            )}
                                            title={entry.pinned ? "Unpin entry" : "Pin entry"}
                                        >
                                            <Pin className={cn("h-4 w-4", entry.pinned && "fill-current text-primary")} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                                            className="p-2 hover:bg-black/5 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                                            title="Delete entry"
                                        >
                                            <Trash2 className="h-4 w-4 opacity-50 hover:opacity-100 hover:text-destructive" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-serif text-2xl md:text-3xl font-medium mb-4 text-inherit leading-tight break-words">
                                    {entry.title || <span className="opacity-30 italic">Untitled</span>}
                                </h3>

                                <p className="font-sans text-base opacity-90 line-clamp-[8] leading-relaxed text-inherit break-words">
                                    {stripHtml(entry.content)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isLockerOpen && (
                    <Locker
                        isOpen={isLockerOpen}
                        onClose={() => setIsLockerOpen(false)}
                        entries={entries}
                        toggleLock={toggleLock}
                        userHooks={userHooks as any}
                        onEdit={(entry) => {
                            setIsLockerOpen(false)
                            onEdit(entry)
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
