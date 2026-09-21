import '../globals.css'

// Second root layout: the root URL and the pre-language URLs (/blog/..., /portfolio/...)
// live outside [lang] and only forward to the real pages, so they get no header or footer.
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
