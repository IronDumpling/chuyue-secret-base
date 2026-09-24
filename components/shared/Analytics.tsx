import Script from 'next/script'

// Cloudflare Web Analytics. Off unless a token is set at build time (the token is public,
// it ends up in the page source, but lives in a GitHub Actions variable, not the code).
export default function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
  if (!token) return null

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  )
}
