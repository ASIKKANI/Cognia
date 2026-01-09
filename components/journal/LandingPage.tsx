import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/Button"
import { ArrowRight, Home } from "lucide-react"
import Link from "next/link"

interface LandingPageProps {
    onStart: (view: string) => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-8 left-8 z-50">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="rounded-full gap-2 opacity-60 hover:opacity-100 transition-opacity">
                        <Home className="w-4 h-4" /> Home
                    </Button>
                </Link>
            </div>
            <motion.div
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-mood-calm/30 rounded-full blur-[100px] -z-10"
            />
            <motion.div
                animate={{
                    rotate: [360, 0],
                    scale: [1, 1.3, 1],
                    x: [0, -50, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-mood-joy/20 rounded-full blur-[120px] -z-10"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="space-y-10 z-10"
            >
                <div className="relative inline-block">
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-primary leading-[1.1]">
                        Blue Paper<br />and White Ink
                    </h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                        className="h-1.5 bg-accent/80 absolute -bottom-4 left-0 rounded-full"
                    />
                </div>

                <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed tracking-wide font-light lowercase">
                    pixels of art and verses of consciousness
                </p>

                <div className="pt-12">
                    <Button
                        size="lg"
                        onClick={() => onStart("dashboard")}
                        className="text-lg px-12 py-8 rounded-full shadow-2xl hover:shadow-primary/10 bg-primary text-primary-foreground hover:scale-105 transition-transform duration-300 font-serif italic tracking-wider"
                    >
                        Start Writing <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
