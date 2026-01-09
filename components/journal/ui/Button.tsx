import React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends HTMLMotionProps<"button"> {
    className?: string;
    variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "link" | "calm" | "joy" | "focus";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", asChild = false, isLoading, children, ...props }, ref) => {
    // NextJS/React 19 doesn't support motion.slot out of the box easily without more setup
    const Comp = motion.button

    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        calm: "bg-mood-calm text-[#1A237E] hover:bg-mood-calm/90 shadow-md",
        joy: "bg-mood-joy text-[#4E342E] hover:bg-mood-joy/90 shadow-md",
        focus: "bg-mood-focus text-[#4A148C] hover:bg-mood-focus/90 shadow-md",
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return (
        <Comp
            className={cn(
                "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            disabled={isLoading}
            {...(props as any)}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Comp>
    )
})
Button.displayName = "Button"

export { Button }
