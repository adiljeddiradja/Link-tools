
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors">
                <div className="w-5 h-5 bg-slate-600 rounded-full animate-pulse" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center relative"
            title="Toggle Theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            <span className="sr-only">Toggle theme</span>
            <div className="w-5 h-5"></div>
        </button>
    )
}
