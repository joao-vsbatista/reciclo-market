import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { PageTransition } from '@/components/page-transition'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReCicloMarket',
  description: 'Compre e venda materiais usados com sistema de lances. Encontre as melhores ofertas perto de você.',
  keywords: ['marketplace', 'usados', 'lances', 'compra', 'venda', 'brasil'],
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.className} antialiased min-h-screen bg-background`}>
        <PageTransition>{children}</PageTransition>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}