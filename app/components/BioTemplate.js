
import { ExternalLink, Github, Twitter, Instagram, Linkedin, Globe, Mail } from 'lucide-react'

export default function BioTemplate({ profile, links }) {
    if (!profile) return null

    // Theme configuration
    const themes = {
        blue: { bg: 'bg-[#0f172a]', accent: 'text-blue-400', button: 'bg-slate-800/40 border-white/5 hover:border-blue-500/50', text: 'text-white' },
        purple: { bg: 'bg-[#2e1065]', accent: 'text-purple-400', button: 'bg-white/10 border-white/10 hover:border-purple-400/50', text: 'text-white' },
        pink: { bg: 'bg-[#831843]', accent: 'text-pink-400', button: 'bg-white/10 border-white/10 hover:border-pink-400/50', text: 'text-white' },
        light: { bg: 'bg-slate-50', accent: 'text-blue-600', button: 'bg-white border-slate-200 hover:border-blue-400 shadow-sm', text: 'text-slate-900' },
    }

    const currentTheme = themes[profile.theme_color] || themes.blue
    const buttonStyle = profile.button_style === 'rounded-full' ? 'rounded-full' :
        profile.button_style === 'sharp' ? 'rounded-none' : 'rounded-2xl'

    const fontStyles = {
        'sans-serif': 'font-sans',
        'serif': 'font-serif',
        'mono': 'font-mono',
        'display': 'font-display', // Assuming custom font classes or default ones
    }
    const currentFont = fontStyles[profile.font_family] || 'font-sans'

    // Social Links mapping
    const socialIcons = {
        instagram: <Instagram size={20} />,
        twitter: <Twitter size={20} />,
        github: <Github size={20} />,
        linkedin: <Linkedin size={20} />,
        globe: <Globe size={20} />,
        mail: <Mail size={20} />
    }

    const initials = profile.display_name ? profile.display_name.slice(0, 2).toUpperCase() : '??'

    return (
        <div
            className={`min-h-screen flex flex-col items-center py-16 px-4 ${!profile.custom_bg ? currentTheme.bg : ''} ${currentTheme.text} ${currentFont} relative overflow-hidden transition-colors duration-500`}
            style={profile.custom_bg ? { background: profile.custom_bg } : {}}
        >
            {/* Banner Section (Facebook-style Cover) */}
            {profile.banner_url && (
                <div className="absolute top-0 left-0 w-full h-56 md:h-72 z-0">
                    <img
                        src={profile.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                </div>
            )}

            {/* Background Ambience (only show if using default themes and NO banner) */}
            {!profile.custom_bg && !profile.banner_url && (
                <>
                    <div className={`absolute top-0 left-1/4 w-96 h-96 ${profile.theme_color === 'light' ? 'bg-blue-200/50' : 'bg-purple-600/20'} rounded-full blur-[128px] pointer-events-none`} />
                    <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${profile.theme_color === 'light' ? 'bg-purple-200/50' : 'bg-blue-600/20'} rounded-full blur-[128px] pointer-events-none`} />
                </>
            )}

            {/* Profile Header */}
            <div className={`flex flex-col items-center mb-8 space-y-4 relative z-10 animate-fade-in-up w-full max-w-md ${profile.banner_url ? 'mt-36' : ''}`}>
                <div className="relative group transform hover:scale-105 transition-transform duration-300">
                    {/* Ring for Overlap Effect */}
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
                    <h1 className="text-3xl font-bold tracking-tight">{profile.display_name}</h1>
                    <p className={`text-sm leading-relaxed ${profile.theme_color === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {profile.bio || `Welcome to my page. @${profile.handle}`}
                    </p>
                </div>

                {/* Social Icons */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                    <div className={`flex flex-wrap justify-center gap-4 ${profile.theme_color === 'light' ? 'text-slate-500' : 'text-slate-300'}`}>
                        {Object.entries(profile.social_links).map(([platform, url]) => (
                            url && (
                                <a
                                    key={platform}
                                    href={url.startsWith('http') ? url : `https://${url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:scale-110 hover:${currentTheme.accent} hover:border-white/20 shadow-lg`}
                                    title={platform}
                                >
                                    {socialIcons[platform] || <Globe size={20} />}
                                </a>
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Links Stack */}
            <div className="w-full max-w-md space-y-4 relative z-10 perspective-1000">
                {links && links.filter(l => l.is_hidden !== true).length > 0 ? (
                    links.filter(l => l.is_hidden !== true).map((link, index) => (
                        <a
                            key={link.id}
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block w-full backdrop-blur-md border ${currentTheme.button} ${buttonStyle} p-4 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden`}
                            style={{ animationDelay: `${index * 100}ms` }}
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
                        </a>
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

            <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
        </div>
    )
}
