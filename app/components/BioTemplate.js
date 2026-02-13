'use client'

import { ExternalLink, Github, Twitter, Instagram, Linkedin, Globe, Mail, CheckCircle2 } from 'lucide-react'
import GeckoLogo from '@/app/components/GeckoLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { getYouTubeId, getSpotifyId } from '@/lib/utils'

export default function BioTemplate({ profile, links }) {
    if (!profile) return null

    // Theme configuration
    const themes = {
        blue: { bg: 'bg-[#0f172a]', accent: 'text-blue-400', button: 'bg-slate-800/40 border-white/5 hover:border-blue-500/50', text: 'text-white' },
        purple: { bg: 'bg-[#2e1065]', accent: 'text-purple-400', button: 'bg-white/10 border-white/10 hover:border-purple-400/50', text: 'text-white' },
        pink: { bg: 'bg-[#831843]', accent: 'text-pink-400', button: 'bg-white/10 border-white/10 hover:border-pink-400/50', text: 'text-white' },
        light: { bg: 'bg-slate-50', accent: 'text-blue-600', button: 'bg-white border-slate-200 hover:border-blue-400 shadow-sm', text: 'text-slate-900' },
        glass: { bg: 'bg-slate-950', accent: 'text-cyan-400', button: 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-xl', text: 'text-white' },
    }

    const currentTheme = themes[profile.theme_color] || themes.blue
    const buttonStyle = profile.button_style === 'rounded-full' ? 'rounded-full' :
        profile.button_style === 'sharp' ? 'rounded-none' : 'rounded-2xl'

    const fontStyles = {
        'sans-serif': 'font-sans',
        'serif': 'font-serif',
        'mono': 'font-mono',
        'display': 'font-display',
    }
    const currentFont = fontStyles[profile.font_family] || 'font-sans'

    const socialIcons = {
        instagram: <Instagram size={20} />,
        twitter: <Twitter size={20} />,
        github: <Github size={20} />,
        linkedin: <Linkedin size={20} />,
        globe: <Globe size={20} />,
        mail: <Mail size={20} />
    }

    const initials = profile.display_name ? profile.display_name.slice(0, 2).toUpperCase() : '??'

    // Sort links by position
    const sortedLinks = [...(links || [])].sort((a, b) => (a.position || 0) - (b.position || 0))

    const getBackgroundStyles = () => {
        if (profile.bg_type === 'color' && profile.bg_color) return { backgroundColor: profile.bg_color }
        if (profile.bg_type === 'gradient' && profile.bg_gradient) return { background: profile.bg_gradient }
        if (profile.bg_type === 'animated') return {
            background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #1e1b4b)',
            backgroundSize: '400% 400%',
        }
        if (profile.custom_bg) return { background: profile.custom_bg }
        return {}
    }

    return (
        <div
            className={`min-h-screen flex flex-col items-center py-16 px-4 ${(!profile.bg_type || profile.bg_type === 'theme') && !profile.custom_bg ? currentTheme.bg : ''} ${currentTheme.text} ${currentFont} relative overflow-hidden transition-all duration-700 ${profile.bg_type === 'animated' ? 'animate-aurora' : ''}`}
            style={getBackgroundStyles()}
        >
            <AnimatePresence>
                {/* Banner Section */}
                {profile.banner_url && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-0 w-full h-56 md:h-72 z-0"
                    >
                        <img
                            src={profile.banner_url}
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                    </motion.div>
                )}
            </AnimatePresence>

            {!profile.custom_bg && !profile.banner_url && (
                <>
                    <div className={`absolute top-0 left-1/4 w-96 h-96 ${profile.theme_color === 'glass' ? 'bg-cyan-500/10' : profile.theme_color === 'light' ? 'bg-blue-200/50' : 'bg-purple-600/20'} rounded-full blur-[128px] pointer-events-none`} />
                    <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${profile.theme_color === 'glass' ? 'bg-blue-500/10' : profile.theme_color === 'light' ? 'bg-purple-200/50' : 'bg-blue-600/20'} rounded-full blur-[128px] pointer-events-none`} />
                    {profile.theme_color === 'glass' && (
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    )}
                </>
            )}

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col items-center mb-8 space-y-4 relative z-10 w-full max-w-md ${profile.banner_url ? 'mt-36' : ''}`}
            >
                <div className="relative group transition-transform duration-300">
                    <div className={`absolute -inset-1 blur-sm opacity-50 ${profile.theme_color === 'light' ? 'bg-slate-200' : 'bg-slate-800'} rounded-full`}></div>
                    <div className={`relative w-32 h-32 rounded-full border-[6px] ${profile.theme_color === 'light' ? 'border-white' : 'border-[#0f172a]'} shadow-2xl overflow-hidden flex items-center justify-center bg-muted`}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                {initials}
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-2 w-full">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">{profile.display_name}</h1>
                        {profile.is_verified && (
                            <CheckCircle2 size={24} className="text-blue-500 fill-blue-500/10" />
                        )}
                    </div>
                    <p className={`text-sm leading-relaxed ${profile.theme_color === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {profile.bio || `Welcome to my page. @${profile.handle}`}
                    </p>
                </div>

                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                    <div className={`flex flex-wrap justify-center gap-4 ${profile.theme_color === 'light' ? 'text-slate-500' : 'text-slate-300'}`}>
                        {Object.entries(profile.social_links).map(([platform, url], i) => (
                            url && (
                                <motion.a
                                    key={platform}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    href={url.startsWith('http') ? url : `https://${url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:scale-110 hover:${currentTheme.accent} hover:border-white/20 shadow-lg`}
                                    title={platform}
                                >
                                    {socialIcons[platform] || <Globe size={20} />}
                                </motion.a>
                            )
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Links Stack */}
            <div className="w-full max-w-md space-y-4 relative z-10">
                {sortedLinks && sortedLinks.filter(l => l.is_hidden !== true).length > 0 ? (
                    sortedLinks.filter(l => l.is_hidden !== true).map((link, index) => (
                        <motion.a
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block w-full backdrop-blur-md border ${currentTheme.button} ${buttonStyle} p-4 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                            <div className="flex items-center justify-between px-2">
                                <div className="w-8" />
                                <span className={`font-semibold text-lg tracking-wide group-hover:${currentTheme.text.replace('text-', 'text-opacity-80 ')} transition-colors`}>
                                    {link.title || 'Untitled Link'}
                                </span>
                                <div className="w-8 flex justify-end">
                                    <ExternalLink size={16} className={`opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 ${currentTheme.accent}`} />
                                </div>
                            </div>

                            {/* YouTube Embed Logic */}
                            {getYouTubeId(link.original_url) && (
                                <div className="mt-4 aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(link.original_url)}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {/* Spotify Embed Logic */}
                            {getSpotifyId(link.original_url) && (
                                <div className="mt-4 w-full rounded-xl overflow-hidden shadow-xl border border-white/5">
                                    <iframe
                                        src={`https://open.spotify.com/embed/${getSpotifyId(link.original_url).type}/${getSpotifyId(link.original_url).id}`}
                                        width="100%"
                                        height={getSpotifyId(link.original_url).type === 'track' ? "80" : "152"}
                                        frameBorder="0"
                                        allowtransparency="true"
                                        allow="encrypted-media"
                                    ></iframe>
                                </div>
                            )}
                        </motion.a>
                    ))
                ) : (
                    <div className={`text-center p-8 rounded-2xl border border-dashed ${profile.theme_color === 'light' ? 'border-slate-300 text-slate-400' : 'border-slate-700 text-slate-600'}`}>
                        <p>No links added yet.</p>
                    </div>
                )}
            </div>

            <footer className={`mt-16 text-[10px] flex flex-col items-center gap-2 ${profile.theme_color === 'light' ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-[0.2em] font-bold opacity-60`}>
                <GeckoLogo className="w-8 h-8 mb-4 opacity-50 hover:opacity-100 transition-opacity" />
                <div className={`w-12 h-0.5 ${profile.theme_color === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`} />
                <p>Created by A Deel</p>
            </footer>
        </div>
    )
}
