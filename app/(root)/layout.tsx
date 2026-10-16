import '../globals.css'

// Second root layout: the root URL lives outside [lang] and only forwards to the home page
// in the visitor's language, so it gets no header or footer.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
