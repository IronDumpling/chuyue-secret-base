// Throwaway spike for plan 06. Read-only (GET). Credentials come from the environment only,
// never from a file or the command line:
//   SHUTTERSTOCK_TOKEN=...                                 (OAuth bearer token), or
//   SHUTTERSTOCK_KEY=... SHUTTERSTOCK_SECRET=...           (app key/secret, basic auth)
// Usage: npx tsx scripts/spikes/shutterstock-probe.ts /v2/images/search?contributor=<id> [...]
const BASE = 'https://api.shutterstock.com'

function authHeader(): string | null {
  const token = process.env.SHUTTERSTOCK_TOKEN
  if (token) return `Bearer ${token}`
  const key = process.env.SHUTTERSTOCK_KEY
  const secret = process.env.SHUTTERSTOCK_SECRET
  if (key && secret) return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
  return null
}

async function main() {
  const auth = authHeader()
  if (!auth) {
    console.error('Set SHUTTERSTOCK_TOKEN, or SHUTTERSTOCK_KEY and SHUTTERSTOCK_SECRET, first.')
    process.exit(1)
  }

  const paths = process.argv.slice(2)
  if (paths.length === 0) {
    console.error('Pass at least one API path, e.g. /v2/images/search?contributor=<id>')
    process.exit(1)
  }

  for (const apiPath of paths) {
    if (!apiPath.startsWith('/')) {
      console.error(`Skipping ${apiPath}: paths must start with /`)
      continue
    }
    const response = await fetch(`${BASE}${apiPath}`, {
      headers: { Authorization: auth, Accept: 'application/json' },
    })
    const text = await response.text()
    console.log(`\n== GET ${apiPath} -> ${response.status}`)
    console.log(text.slice(0, 2000))
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
