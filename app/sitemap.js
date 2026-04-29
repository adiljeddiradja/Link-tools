
export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linkiez.vercel.app';

    // Core static pages
    const routes = ['', '/login', '/signup'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // In a real scenario, you might fetch top profiles here.
    // For now, we provide the main routes.
    
    return [...routes];
}
