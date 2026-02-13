
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import BioTemplate from '@/app/components/BioTemplate'
import { Save, Plus, Trash2, ArrowLeft, Loader2, GripVertical, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ProfileEditor({ params }) {
    const { id } = use(params)
    const [profile, setProfile] = useState(null)
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('design') // design, links, socials
    const [newLink, setNewLink] = useState({ title: '', url: '' })

    // Fetch initial data
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)

        // Check Auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Should be handled by middleware, but extra safety
            return
        }

        // Fetch Profile
        const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
        if (p) {
            // Verify ownership
            if (p.user_id !== user.id) {
                alert("Unauthorized access")
                return
            }
            setProfile(p)
        }

        // Fetch Links
        const { data: l } = await supabase.from('links').select('*').eq('profile_id', id).order('created_at', { ascending: false })
        if (l) setLinks(l)

        setLoading(false)
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update({
            display_name: profile.display_name,
            bio: profile.bio,
            theme_color: profile.theme_color,
            button_style: profile.button_style,
            avatar_url: profile.avatar_url,
            banner_url: profile.banner_url,
            social_links: profile.social_links,
            font_family: profile.font_family,
            custom_bg: profile.custom_bg
        }).eq('id', id)

        if (error) {
            alert("Error saving profiles: " + error.message)
            console.error("Save error:", error)
        } else {
            alert("Changes saved successfully!")
        }
        setSaving(false)
    }

    const handleAddLink = async (e) => {
        e.preventDefault()
        if (!newLink.url) return

        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase.from('links').insert([{
            profile_id: id,
            user_id: user.id,
            original_url: newLink.url,
            title: newLink.title || newLink.url,
            slug: Math.random().toString(36).substring(7), // Random slug for shortlink compatibility
            is_for_bio: true
        }]).select()

        if (data) {
            setLinks([data[0], ...links])
            setNewLink({ title: '', url: '' })
        }
    }

    const handleDeleteLink = async (linkId) => {
        await supabase.from('links').delete().eq('id', linkId)
        setLinks(links.filter(l => l.id !== linkId))
    }

    const handleToggleLinkActive = async (linkId, currentStatus) => {
        const newStatus = currentStatus === false ? true : false
        const { error } = await supabase
            .from('links')
            .update({ is_active: newStatus })
            .eq('id', linkId)

        if (!error) {
            setLinks(links.map(l => l.id === linkId ? { ...l, is_active: newStatus } : l))
        }
    }

    const handleToggleLinkHidden = async (linkId, currentStatus) => {
        const newStatus = currentStatus === true ? false : true
        const { error } = await supabase
            .from('links')
            .update({ is_hidden: newStatus })
            .eq('id', linkId)

        if (!error) {
            setLinks(links.map(l => l.id === linkId ? { ...l, is_hidden: newStatus } : l))
        }
    }

    const updateSocialLink = (platform, value) => {
        setProfile({
            ...profile,
            social_links: {
                ...(profile.social_links || {}),
                [platform]: value
            }
        })
    }

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Editor...</div>
    if (!profile) return <div className="text-white">Profile not found</div>

    return (
        <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-background overflow-y-auto md:overflow-hidden transition-colors duration-300">
            {/* Left Sidebar: Controls */}
            <div className="w-full md:w-[400px] flex flex-col border-r border-border bg-card z-20 shadow-2xl shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-card text-foreground">
                    <Link href="/profiles" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="font-bold">Editor</h2>
                    <div className="w-5"></div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('design')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'design' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                        Design
                    </button>
                    <button
                        onClick={() => setActiveTab('links')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'links' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                        Links
                    </button>
                    <button
                        onClick={() => setActiveTab('socials')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'socials' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                        Socials
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {activeTab === 'design' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Profile Info */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Info</label>
                                <input
                                    type="text"
                                    value={profile.display_name || ''}
                                    onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                                    placeholder="Display Name"
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    value={profile.avatar_url || ''}
                                    onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                                    placeholder="Logo Image URL (https://...)"
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                                />
                                <input
                                    type="text"
                                    value={profile.banner_url || ''}
                                    onChange={e => setProfile({ ...profile, banner_url: e.target.value })}
                                    placeholder="Banner Image URL (https://...)"
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                                />
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Bio Description"
                                    rows={3}
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Theme */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['blue', 'purple', 'pink', 'light'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setProfile({ ...profile, theme_color: color })}
                                            className={`h-12 rounded-xl border-2 transition-all transform hover:scale-105 ${profile.theme_color === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'} ${color === 'blue' ? 'bg-[#0f172a]' :
                                                color === 'purple' ? 'bg-[#2e1065]' :
                                                    color === 'pink' ? 'bg-[#831843]' :
                                                        'bg-slate-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Buttons Style */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Button Style</label>
                                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                                    {['rounded-xl', 'rounded-full', 'sharp'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setProfile({ ...profile, button_style: style })}
                                            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${profile.button_style === style ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {style === 'rounded-xl' ? 'Rounded' : style === 'rounded-full' ? 'Full' : 'Sharp'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Family */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Font Style</label>
                                <select
                                    value={profile.font_family || 'sans-serif'}
                                    onChange={e => setProfile({ ...profile, font_family: e.target.value })}
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                                >
                                    <option value="sans-serif">Sans Serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                    <option value="display">Modern Display</option>
                                </select>
                            </div>

                            {/* Custom Background */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Background (CSS)</label>
                                <input
                                    type="text"
                                    value={profile.custom_bg || ''}
                                    onChange={e => setProfile({ ...profile, custom_bg: e.target.value })}
                                    placeholder="e.g. #000, linear-gradient(...)"
                                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                                />
                                <p className="text-[10px] text-muted-foreground">Tip: Leave empty to use theme background.</p>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full bg-primary hover:bg-blue-600 text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'socials' && (
                        <div className="space-y-6 animate-fade-in text-foreground">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Media Links</label>
                            <div className="space-y-4">
                                {['instagram', 'twitter', 'github', 'linkedin', 'mail'].map(social => (
                                    <div key={social} className="space-y-1">
                                        <label className="text-[10px] font-medium text-muted-foreground capitalize">{social}</label>
                                        <input
                                            type="text"
                                            value={(profile.social_links && profile.social_links[social]) || ''}
                                            onChange={e => updateSocialLink(social, e.target.value)}
                                            placeholder={`Your ${social} link/username`}
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full bg-primary hover:bg-blue-600 text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Save Socials
                            </button>
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* New Link Form */}
                            <form onSubmit={handleAddLink} className="bg-muted p-4 rounded-xl border border-border space-y-3">
                                <h3 className="text-sm font-semibold text-foreground mb-2">Add New Link</h3>
                                <input
                                    type="url"
                                    placeholder="URL (https://...)"
                                    value={newLink.url}
                                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                    className="w-full bg-card border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-primary"
                                />
                                <input
                                    type="text"
                                    placeholder="Title (e.g. My Website)"
                                    value={newLink.title}
                                    onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                    className="w-full bg-card border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-primary"
                                />
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                    Add Link
                                </button>
                            </form>

                            {/* Links List */}
                            <div className="space-y-3">
                                {links.map(link => (
                                    <div key={link.id} className={`bg-card border border-border p-4 rounded-xl flex items-center gap-3 group transition-all ${link.is_active === false ? 'opacity-50' : 'opacity-100'}`}>
                                        <GripVertical className="text-muted-foreground cursor-move" size={18} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground text-sm font-medium truncate">{link.title}</p>
                                            <p className="text-muted-foreground text-xs truncate">{link.original_url}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleLinkActive(link.id, link.is_active)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${link.is_active !== false ? 'bg-green-500' : 'bg-slate-600'
                                                        }`}
                                                    title={link.is_active !== false ? 'Active' : 'Deactivated'}
                                                >
                                                    <span
                                                        className={`${link.is_active !== false ? 'translate-x-5' : 'translate-x-1'
                                                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </button>
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Status</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleLinkHidden(link.id, link.is_hidden)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${link.is_hidden ? 'bg-orange-500' : 'bg-slate-700'
                                                        }`}
                                                    title={link.is_hidden ? 'Hidden from Bio' : 'Visible in Bio'}
                                                >
                                                    <span
                                                        className={`${link.is_hidden ? 'translate-x-5' : 'translate-x-1'
                                                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </button>
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Bio</span>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {links.length === 0 && (
                                    <p className="text-center text-muted-foreground text-sm py-4">No links yet. Add one above!</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Right Area: Preview */}
            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 relative py-20 md:py-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 opacity-50 pointer-events-none" />

                {/* Mobile Frame */}
                <div className="relative w-[340px] h-[680px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 ring-4 ring-black/20">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-20"></div>

                    {/* Screen Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-900">
                        <BioTemplate profile={profile} links={links.filter(l => l.is_active !== false)} />
                    </div>
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-slate-500 text-sm">Live Preview</p>
                    <a
                        href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/bio/${profile.handle}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        View Live Page <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    )
}
