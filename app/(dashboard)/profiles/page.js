
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, ExternalLink, Edit, Trash2, Layout } from 'lucide-react'
import Link from 'next/link'

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [newProfile, setNewProfile] = useState({ handle: '', display_name: '' })
    const [mounted, setMounted] = useState(false)


    useEffect(() => {
        setMounted(true)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                fetchProfiles(user.id)
            }
        }
        checkUser()
    }, [])

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (mounted ? window.location.origin : '')
    const displayUrl = baseUrl.replace(/^https?:\/\//, '') // URL for display without protocol


    const fetchProfiles = async (uid) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })

        if (data) setProfiles(data)
        setLoading(false)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newProfile.handle) return

        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                user_id: userId,
                handle: newProfile.handle,
                display_name: newProfile.display_name || newProfile.handle,
                theme_color: 'blue' // Default
            }])
            .select()

        if (error) {
            alert('Error creating profile: ' + error.message)
        } else {
            setProfiles([data[0], ...profiles])
            setIsCreating(false)
            setNewProfile({ handle: '', display_name: '' })
        }
    }

    const handleToggleActive = async (id, currentStatus) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setProfiles(profiles.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
        } else {
            alert('Error updating status: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus halaman ini secara permanen?')) return

        const { error } = await supabase.from('profiles').delete().eq('id', id)
        if (!error) {
            setProfiles(profiles.filter(p => p.id !== id))
        } else {
            alert('Error deleting profile: ' + error.message)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pb-32 transition-colors duration-300">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">My Pages</h2>
                    <p className="text-muted-foreground mt-1">Manage your Linktree pages.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-primary hover:bg-blue-600 text-primary-foreground px-6 py-2 rounded-full font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Create New Page'}
                </button>
            </header>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-card border border-border p-6 rounded-2xl mb-8 animate-fade-in-down shadow-lg">
                    <h2 className="text-lg font-semibold text-foreground mb-4">New Page Details</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Handle (URL)</label>
                            <div className="flex relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/bio/</span>
                                <input
                                    type="text"
                                    placeholder="my-page"
                                    className="bg-muted border border-border p-3 pl-12 rounded-xl text-foreground w-full outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                                    value={newProfile.handle}
                                    onChange={(e) => {
                                        let val = e.target.value.toLowerCase()
                                        // Auto-strip protocols and domains if pasted
                                        val = val.replace(/^https?:\/\//, '')
                                        val = val.replace(/^[^/]+\/bio\//, '') // Strip domain/bio/
                                        val = val.replace(/\//g, '') // Strip any remaining slashes
                                        setNewProfile({ ...newProfile, handle: val.replace(/\s+/g, '-') })
                                    }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Display Name</label>
                            <input
                                type="text"
                                placeholder="My Awesome Page"
                                className="bg-muted border border-border p-3 rounded-xl text-foreground w-full outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                                value={newProfile.display_name}
                                onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md w-full md:w-auto">
                                Save Page
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-muted-foreground">Loading pages...</div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-2xl">
                    <Layout size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No pages yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first Linktree page to get started.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-primary hover:underline font-medium"
                    >
                        Create one now &rarr;
                    </button>
                </div>
            ) : (
                /* Profiles Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white shadow-lg transition-opacity ${profile.is_active === false ? 'opacity-40' : 'opacity-100'} ${profile.theme_color === 'purple' ? 'bg-purple-600' :
                                        profile.theme_color === 'pink' ? 'bg-pink-600' :
                                            profile.theme_color === 'light' ? 'bg-slate-400' : 'bg-blue-600'
                                        }`}>
                                        {profile.display_name?.slice(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-foreground truncate">{profile.display_name || 'Untitled'}</h3>
                                        <a href={`${baseUrl}/bio/${profile.handle}`} target="_blank" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors truncate">
                                            {displayUrl}/bio/{profile.handle} <ExternalLink size={10} className="flex-shrink-0" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <button
                                        onClick={() => handleToggleActive(profile.id, profile.is_active)}
                                        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${profile.is_active !== false ? 'bg-green-500' : 'bg-slate-600'
                                            }`}
                                        title={profile.is_active !== false ? 'Page is Live' : 'Page is Offline'}
                                    >
                                        <span
                                            className={`${profile.is_active !== false ? 'translate-x-5' : 'translate-x-1'
                                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(profile.id)}
                                        className="text-muted-foreground hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Link href={`/editor/${profile.id}`} className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-border">
                                    <Edit size={16} />
                                    Design & Manage
                                </Link>
                                <a href={`${baseUrl}/bio/${profile.handle}`} target="_blank" className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    <span className="sr-only">View</span>
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
