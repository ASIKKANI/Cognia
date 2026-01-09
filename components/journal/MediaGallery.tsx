import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { ArrowLeft, X, ZoomIn } from "lucide-react"

const IMAGES = [
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1679678691328-54929d271c3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516205651411-a41674cebc79?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574349787141-8f244586e9e8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80",
]

interface MediaGalleryProps {
    onBack: () => void;
}

export function MediaGallery({ onBack }: MediaGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <div className="min-h-screen p-4 md:p-8 bg-background">
            <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-display font-bold">Inspiration Gallery</h2>
                <div className="w-10" />
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto space-y-6">
                {IMAGES.map((src, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in"
                        onClick={() => setSelectedImage(src)}
                        layoutId={`image-${src}`}
                    >
                        <img
                            src={src}
                            alt="Gallery Item"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="text-white drop-shadow-md" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="relative max-w-5xl max-h-[90vh] rounded-lg overflow-hidden"
                            layoutId={`image-${selectedImage}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt="Full view"
                                className="w-full h-full object-contain"
                            />
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
