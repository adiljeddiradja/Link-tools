
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: 'Linkiez - Smart Link Management',
    template: '%s | Linkiez'
  },
  description: 'Create beautiful bio pages, shorten links, and track analytics. All-in-one link management platform for creators and businesses.',
  keywords: ['link management', 'bio link', 'url shortener', 'link in bio', 'social media links', 'analytics'],
  authors: [{ name: 'Linkiez' }],
  creator: 'Linkiez',

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://linkiez.app',
    title: 'Linkiez - Smart Link Management',
    description: 'Create beautiful bio pages, shorten links, and track analytics.',
    siteName: 'Linkiez',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Linkiez - Smart Link Management',
    description: 'Create beautiful bio pages, shorten links, and track analytics.',
    creator: '@linkiez',
  },

  // Icons
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },

  // Manifest
  manifest: '/manifest.json',
};

import { ThemeProvider } from "@/app/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
