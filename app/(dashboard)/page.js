
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import QRCode from 'qrcode'
import { QRCodeCanvas } from 'qrcode.react'
import { Copy, Trash2, Globe, Link as LinkIcon, BarChart3, PlusCircle, ArrowRight, ExternalLink, QrCode as QrIcon, Download } from 'lucide-react'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [formData, setFormData] = useState({
    original_url: '',
    slug: '',
    title: '',
    is_for_bio: false
  })
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchLinks(user.id)
      }
    }
    checkUser()
  }, [])

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (mounted ? window.location.origin : '')
  const displayUrl = baseUrl.replace(/^https?:\/\//, '') // URL for display without protocol

  const fetchLinks = async (uid) => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (data) setLinks(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const newLink = {
      ...formData,
      user_id: userId,
      slug: formData.slug || Math.random().toString(36).substring(7) // Generate random slug if empty
    }

    const { data, error } = await supabase
      .from('links')
      .insert([newLink])
      .select()

    if (error) {
      alert('Error creating link: ' + error.message)
    } else {
      setLinks([data[0], ...links])
      setFormData({ original_url: '', slug: '', title: '', is_for_bio: false })
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (!error) {
      setLinks(links.filter(link => link.id !== id))
    }
  }

  const downloadQRCode = async (slug) => {
    if (!mounted) return
    try {
      const url = `${protocol}//${host}/${slug}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      const downloadLink = document.createElement("a")
      downloadLink.href = dataUrl
      downloadLink.download = `${slug}-qrcode.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      console.error('Failed to generate QR code', err)
      alert('Error downloading QR code')
    }
  }

  if (!mounted) return <div className="p-8 text-white">Loading dashboard...</div>

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-muted-foreground">Manage your links and view performance.</p>
        </div>
        {!loading && userId && (
          <div className="bg-card/50 backdrop-blur-md border border-border px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-foreground shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="whitespace-nowrap font-medium">Your Public Bio Link:</span>
            </div>
            <a href={`${baseUrl}/bio/${userId}`} target="_blank" className="font-mono text-primary hover:underline break-all bg-muted/50 px-2 py-1 rounded">
              {displayUrl}/bio/{userId}
            </a>
          </div>
        )}
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <LinkIcon size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Links</p>
              <h3 className="text-2xl font-bold text-foreground">{links.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <QrIcon size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">QR Codes</p>
              <h3 className="text-2xl font-bold text-foreground">{links.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Clicks</p>
              <h3 className="text-2xl font-bold text-foreground">0</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Create Link Form */}
      {/* Create Link Form & Links List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Create Link Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-6 rounded-2xl sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <PlusCircle className="text-primary" /> Create New
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Original URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/long-url"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.original_url}
                  onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Slug (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">/</span>
                  <input
                    type="text"
                    placeholder="my-link"
                    className="w-full bg-muted border border-border rounded-xl pl-8 pr-4 py-3 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="My Awesome Link"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_for_bio"
                  className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary/50"
                  checked={formData.is_for_bio}
                  onChange={(e) => setFormData({ ...formData, is_for_bio: e.target.checked })}
                />
                <label htmlFor="is_for_bio" className="text-sm text-muted-foreground cursor-pointer">Pin to Bio Page</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-700 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Shorten URL'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Links List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Your Links</h3>

          {links.length === 0 ? (
            <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">No links created yet.</p>
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-md transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-lg text-primary truncate tracking-tight">{link.slug}</h4>
                    {link.is_for_bio && <span className="text-xs bg-green-500/10 px-2 py-0.5 rounded-full text-green-500 font-medium border border-green-500/20">Bio</span>}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium border border-border">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/80 truncate font-mono bg-muted/50 p-1 rounded w-fit max-w-full">
                    {link.original_url}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <QRCodeCanvas
                      id={`qr-${link.slug}`}
                      value={`${baseUrl}/${link.slug}`}
                      size={40}
                      level={"H"}
                    />
                  </div>
                  <button
                    onClick={() => window.open(`/${link.slug}`, '_blank')}
                    className="p-3 bg-muted hover:bg-accent text-foreground rounded-xl transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => downloadQRCode(link.slug)}
                    className="p-3 bg-muted hover:bg-accent text-foreground rounded-xl transition-colors"
                    title="Download QR Code"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${link.slug}`)}
                    className="p-3 bg-muted hover:bg-accent text-foreground rounded-xl transition-colors"
                    title="Copy Link"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                    title="Delete Link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
