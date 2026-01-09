import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { Lock, Unlock, X, ShieldAlert, KeyRound, Check } from "lucide-react"

interface LockerProps {
    isOpen: boolean;
    onClose: () => void;
    entries: any[];
    toggleLock: (id: string) => void;
    userHooks: {
        hasLockerPassword: () => boolean;
        saveLockerPassword: (password: string) => void;
        verifyLockerPassword: (password: string) => boolean;
    };
    onEdit: (entry: any) => void;
}

export function Locker({ isOpen, onClose, entries, toggleLock, userHooks, onEdit }: LockerProps) {
    const { hasLockerPassword, saveLockerPassword, verifyLockerPassword } = userHooks

    // Explicit view states: 'init' | 'setup' | 'unlock' | 'content' | 'change_password'
    const [view, setView] = useState("init")
    const [passwordInput, setPasswordInput] = useState("")
    const [setupState, setSetupState] = useState({ step: "create", firstInput: "" })

    // Change Password State
    const [changePwState, setChangePwState] = useState({ step: "old", oldPw: "", newPw: "" })
    const [error, setError] = useState("")

    // Initialize View
    useEffect(() => {
        if (isOpen) {
            setPasswordInput("")
            setError("")
            if (hasLockerPassword()) {
                setView("unlock")
            } else {
                setView("setup")
            }
        } else {
            // Reset
            setSetupState({ step: "create", firstInput: "" })
            setChangePwState({ step: "old", oldPw: "", newPw: "" })
        }
    }, [isOpen, hasLockerPassword])

    if (!isOpen) return null

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault()
        if (verifyLockerPassword(passwordInput)) {
            setView("content")
            setPasswordInput("")
            setError("")
        } else {
            setError("Incorrect password")
            setPasswordInput("")
        }
    }

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (changePwState.step === "old") {
            if (verifyLockerPassword(passwordInput)) {
                setChangePwState({ step: "new", oldPw: passwordInput, newPw: "" })
                setPasswordInput("")
                setError("")
            } else {
                setError("Incorrect old password")
                setPasswordInput("")
            }
        }
        else if (changePwState.step === "new") {
            if (passwordInput.length < 4) {
                setError("Password must be at least 4 characters")
                return
            }
            setChangePwState({ ...changePwState, step: "confirm", newPw: passwordInput })
            setPasswordInput("")
            setError("")
        }
        else if (changePwState.step === "confirm") {
            if (passwordInput === changePwState.newPw) {
                saveLockerPassword(passwordInput)
                setView("content")
                setPasswordInput("")
                setChangePwState({ step: "old", oldPw: "", newPw: "" })
                setError("")
                alert("Password changed successfully")
            } else {
                setError("Passwords do not match")
                setPasswordInput("")
                setChangePwState({ ...changePwState, step: "new", newPw: "" })
            }
        }
    }

    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault()
        if (setupState.step === "create") {
            if (passwordInput.length < 4) {
                setError("Password must be at least 4 characters")
                return
            }
            setSetupState({ step: "confirm", firstInput: passwordInput })
            setPasswordInput("")
            setError("")
        } else {
            if (passwordInput === setupState.firstInput) {
                try {
                    saveLockerPassword(passwordInput)
                    setView("content")
                    setPasswordInput("")
                    setError("")
                    setSetupState({ step: "create", firstInput: "" })
                } catch (err) {
                    console.error("Locker Setup Error:", err)
                    setError("Error saving password. Try again.")
                }
            } else {
                setError("Passwords do not match")
                setPasswordInput("")
                setSetupState({ step: "create", firstInput: "" })
            }
        }
    }

    const lockedEntries = entries.filter(e => e.locked)

    const renderContent = () => {
        if (view === "setup") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="bg-primary/5 p-4 rounded-full mb-6">
                        <ShieldAlert className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-3xl font-serif font-medium mb-2">Setup Notebook Locker</h3>
                    <p className="text-muted-foreground mb-8">Create a secure password to protect your private entries.</p>

                    <form onSubmit={handleSetup} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            autoFocus
                            placeholder={setupState.step === "create" ? "Create Password" : "Confirm Password"}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full p-4 text-center text-2xl tracking-[0.5em] font-serif border-b-2 border-primary/20 bg-transparent outline-none focus:border-primary transition-colors"
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        <Button type="submit" className="w-full py-6 text-lg mt-4 rounded-full">
                            {setupState.step === "create" ? "Next" : "Confirm & Lock"}
                        </Button>
                    </form>
                </div>
            )
        }

        if (view === "unlock") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="bg-primary/5 p-4 rounded-full mb-6">
                        <Lock className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-3xl font-serif font-medium mb-2">Locker Locked</h3>
                    <p className="text-muted-foreground mb-8">Enter your password to access private entries.</p>

                    <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            autoFocus
                            placeholder="Enter Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full p-4 text-center text-2xl tracking-[0.5em] font-serif border-b-2 border-primary/20 bg-transparent outline-none focus:border-primary transition-colors"
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        <Button type="submit" className="w-full py-6 text-lg mt-4 rounded-full">
                            Unlock
                        </Button>
                    </form>
                </div>
            )
        }

        if (view === "change_password") {
            const getPlaceholder = () => {
                switch (changePwState.step) {
                    case "old": return "Old Password";
                    case "new": return "New Password";
                    case "confirm": return "Confirm New Password";
                }
            }

            return (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="bg-primary/5 p-4 rounded-full mb-6">
                        <KeyRound className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-3xl font-serif font-medium mb-2">Change Password</h3>
                    <p className="text-muted-foreground mb-8">
                        {changePwState.step === "old" && "Enter your current password."}
                        {changePwState.step === "new" && "Enter your new password."}
                        {changePwState.step === "confirm" && "Type it one more time."}
                    </p>

                    <form onSubmit={handleChangePassword} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            autoFocus
                            placeholder={getPlaceholder()}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full p-4 text-center text-2xl tracking-[0.5em] font-serif border-b-2 border-primary/20 bg-transparent outline-none focus:border-primary transition-colors"
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        <Button type="submit" className="w-full py-6 text-lg mt-4 rounded-full">
                            {changePwState.step === "confirm" ? "Save New Password" : "Next"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => { setView("content"); setError(""); setPasswordInput(""); }}
                            className="text-sm text-muted-foreground hover:text-black mt-4"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )
        }

        if (view === "content") {
            return (
                <div className="w-full h-full flex flex-col pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                        <div>
                            <h2 className="text-3xl font-serif">Private Entries</h2>
                            <p className="text-muted-foreground">{lockedEntries.length} locked</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setView("change_password"); setChangePwState({ step: "old", oldPw: "", newPw: "" }) }} className="text-muted-foreground hover:text-primary">
                                <KeyRound className="w-4 h-4 mr-2" /> Pass
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setView("unlock")} className="text-muted-foreground hover:text-primary">
                                <Lock className="w-4 h-4 mr-2" /> Relock
                            </Button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto pr-2 pb-4">
                        {lockedEntries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic">
                                No locked entries yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lockedEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        onClick={() => onEdit(entry)}
                                        className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-serif text-xl line-clamp-1 group-hover:text-primary transition-colors">{entry.title || "Untitled"}</h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLock(entry.id); }}
                                                title="Unlock Entry"
                                                className="p-1 hover:bg-black/5 rounded-full"
                                            >
                                                <Unlock className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                            </button>
                                        </div>
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {entry.content.replace(/<[^>]+>/g, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12"
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-50 rounded-full w-10 h-10 hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="w-6 h-6" />
            </Button>

            {renderContent()}
        </motion.div>
    )
}
