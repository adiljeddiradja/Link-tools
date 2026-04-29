export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linkiez.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/editor/', '/dashboard/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
