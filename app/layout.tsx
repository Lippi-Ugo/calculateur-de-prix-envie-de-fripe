import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins"
});

// Configuration avec le chemin exact vers ton dossier public
const handyMode = localFont({
  src: '../public/fonts/Handy Mode Demo.otf',
  variable: '--font-display',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} ${handyMode.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}