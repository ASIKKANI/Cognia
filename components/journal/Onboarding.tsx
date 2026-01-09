import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { ArrowRight } from "lucide-react"

interface OnboardingProps {
    onComplete: (name: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [mounted, setMounted] = useState(false)
    const [name, setName] = useState("")
    const [step, setStep] = useState(0) // 0: Intro, 1: Name

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleNext = () => {
        if (step === 0) setStep(1)
        else if (name.trim()) onComplete(name.trim())
    }

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6">
            <div className="max-w-md w-full text-center">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="font-serif text-4xl md:text-5xl font-medium">Welcome</h2>
                            <p className="font-sans text-xl text-muted-foreground leading-relaxed">
                                This is a safe space for your mind. Let's make it yours.
                            </p>
                            <Button onClick={handleNext} size="lg" className="rounded-full px-10 py-6 text-lg font-serif italic shadow-xl">
                                Begin <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="name"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="space-y-8"
                        >
                            <h2 className="font-serif text-3xl md:text-4xl font-medium">What should we call you?</h2>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                                className="w-full bg-transparent border-b-2 border-primary/20 text-center text-4xl font-serif py-4 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                            />
                            <Button onClick={handleNext} disabled={!name.trim()} size="lg" className="rounded-full px-10 py-6 text-lg font-serif italic shadow-xl">
                                Continue <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
