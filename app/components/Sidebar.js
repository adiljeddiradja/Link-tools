'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { LayoutDashboard, User, ExternalLink, Layout, LogOut, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import GeckoLogo from '@/app/components/GeckoLogo'

export default function Sidebar() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const closeSidebar = () => setIsOpen(false)

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-30 p-2 bg-card border border-border rounded-lg shadow-lg text-foreground hover:bg-muted transition-all active:scale-95"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
                md:static md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Mobile Close Button */}
                <button
                    onClick={closeSidebar}
                    className="md:hidden absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
                >
                    <X size={24} />
                </button>
                <div className="p-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <GeckoLogo className="w-20 h-14 text-primary" />
                    </Link>
                    <ThemeToggle />
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-all group">
                        <LayoutDashboard size={20} className="group-hover:text-primary transition-colors" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/profiles" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-all group">
                        <Layout size={20} className="group-hover:text-purple-500 transition-colors" />
                        <span className="font-medium">My Pages</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-border">
                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-4">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">Free Plan</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-2 group font-medium"
                            >
                                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Link href="/login" className="text-sm text-primary hover:underline">Sign In</Link>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-border mt-auto">
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold opacity-50">
                        Credit by A Deel
                    </p>
                </div>
            </aside>
        </>
    )
}
