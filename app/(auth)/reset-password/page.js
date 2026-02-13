
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react'
import GeckoLogo from '@/app/components/GeckoLogo'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    const handleReset = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/callback?next=/reset-password/update`,
            })

            if (error) throw error

            setMessage('Check your email for the password reset link.')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
                <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="text-center mb-8 flex flex-col items-center">
                    <GeckoLogo className="w-16 h-16 text-primary mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl text-sm mb-6 text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Reset Link <Send size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
