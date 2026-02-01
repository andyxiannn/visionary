import './globals.css'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-display' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Ollama Vision',
  description: 'Upload images and get descriptions via qwen3-vl',
  themeColor: '#0b0f14'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${mono.variable}`}>
      <body className="app-body">
        <div className="bg-grid" />
        {children}
      </body>
    </html>
  )
}
