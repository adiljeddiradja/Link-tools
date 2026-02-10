
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, ArrowRight } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            alert('Password updated successfully! You will be redirected to the dashboard.')
            router.push('/')
            router.refresh()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">Set New Password</h1>
                    <p className="text-muted-foreground">Enter your new secure password below.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Update Password <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
