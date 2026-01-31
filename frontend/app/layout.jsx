export const metadata = {
  title: 'Ollama Vision',
  description: 'Upload images and get descriptions via qwen3-vl',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif', margin: '2rem' }}>{children}</body>
    </html>
  )
}
