# Shutterstock Integration Spike Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status (2026-09-23):** Photography now lives in `content/portfolio/photography/*.en.mdx` (taxonomy restructure), so Task 1 adds `website:` there. Its format is a list of `{ url, label }`, as in `portfolio/illustration/illustration-1.en.mdx`. `lib/link-icon.ts` now recognizes Shutterstock links. The probe (`scripts/spikes/shutterstock-probe.ts`) also accepts `SHUTTERSTOCK_KEY` + `SHUTTERSTOCK_SECRET` (basic auth); try `/v2/images/search?contributor=<id>` first. Blocked on the owner's portfolio URL and API credentials.

**Goal:** Put a "More on Shutterstock" button on the photography posts today (no code), and find out, with a time-boxed probe, whether the Shutterstock API can list the owner's own portfolio well enough to justify an automatic gallery. The output of this plan is a written go/no-go, not a feature.

**Architecture:** Task 1 uses the `website: {url, label}` frontmatter field that the blog post page already renders as a button. Task 2 is a throwaway probe script that sends authenticated GET requests to endpoints given on the command line and prints status and a trimmed body. Task 3 records what was found. No build-time integration is written in this plan, because the external plan itself lists three unknowns (buyer-oriented API, whether contributor content is readable, thumbnail reuse terms) that must be answered first.

**Tech Stack:** Node `fetch`, tsx.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`

## Global Constraints

- The Shutterstock API token is supplied only through the environment variable `SHUTTERSTOCK_TOKEN` when running the probe. Never commit it, never put it in `deploy.yml` during the spike, and do not paste it into notes.
- The probe is read-only (GET only).
- Time box for Tasks 2-3: one hour. If the API cannot be authenticated or does not expose your own portfolio in that time, record "no-go" and stop.
- Do not download or store Shutterstock thumbnails in the repo during the spike.
- Shell is Git Bash on Windows.

## Inputs needed from the owner

- Your Shutterstock contributor/portfolio page URL (for Task 1).
- A Shutterstock developer account and an API application/token (for Task 2). Created at the Shutterstock developers site, "Getting started" page. You create these yourself.

## File Structure

- Modify `content/blog/photography/casual/*.mdx` (4 files): add a `website` field. After plan 07, `content/` is a clone of the `chuyue-content` repo, so this change is committed and pushed there (`git -C content add ... && git -C content commit ... && git -C content push`), which triggers the site rebuild. Task 1's build check needs the content repo push to have deployed, or a local build.
- Create `scripts/spikes/shutterstock-probe.ts`: throwaway probe.
- Create `docs/superpowers/notes/shutterstock-findings.md`: the result.

---

### Task 1: Manual Shutterstock button (no code)

**Files:**
- Modify: `content/blog/photography/casual/blue-sky-series.mdx`, `chongqing-peninsula.mdx`, `hongkong-spring-2026.mdx`, `qutang-gorge.mdx`

**Interfaces:**
- Consumes: the blog post page renders `frontMatter.website` as a button, where `website` is a string or `{ url: string, label: string }`. Illustration posts already use the object form.

- [ ] **Step 1: Look at how an existing post declares it**

Run: `sed -n 1,16p content/blog/illustration/casual/illustration-1.mdx`
Expected: a frontmatter block with a multi-line `website:` containing `url:` and `label:`. Match that indentation style.

- [ ] **Step 2: Add the field to each photography post**

In each of the four files, add this to the frontmatter (before the closing `---`), using the URL the owner supplied as the value of `url`:
```yaml
website:
  url: "https://www.shutterstock.com/g/<owner-contributor-name>"
  label: "More on Shutterstock"
```
The `url` line must hold the owner's real portfolio URL. If the owner wants a different link per series (for example a Shutterstock collection URL), use that per file.

- [ ] **Step 3: Verify on the built page**

Run the production build (`MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`), then
```bash
grep -o 'More on Shutterstock' out/blog/photography/casual/qutang-gorge/index.html
```
Expected: one match per photography page. Open one page with `npm run dev` and click the button; it must open the Shutterstock page in a new tab.

- [ ] **Step 4: Commit**

```bash
git -C content add blog/photography/casual
git -C content commit -m "content: link photography posts to Shutterstock"
git -C content push
```
(This commits to the `chuyue-content` repo, not the site repo.)

---

### Task 2: API probe

**Files:**
- Create: `scripts/spikes/shutterstock-probe.ts`

**Interfaces:**
- Produces: `npx tsx scripts/spikes/shutterstock-probe.ts <path> [<path> ...]` prints `== GET <path> -> <status>` and the first 2000 characters of each response body.

- [ ] **Step 1: Write the probe**

Create `scripts/spikes/shutterstock-probe.ts`:
```ts
// Throwaway spike. Read-only. Token comes from the environment, never from a file.
const BASE = 'https://api.shutterstock.com'

async function main() {
  const token = process.env.SHUTTERSTOCK_TOKEN
  if (!token) {
    console.error('Set SHUTTERSTOCK_TOKEN first, e.g.  SHUTTERSTOCK_TOKEN=... npx tsx scripts/spikes/shutterstock-probe.ts /v2/...')
    process.exit(1)
  }

  const paths = process.argv.slice(2)
  if (paths.length === 0) {
    console.error('Pass at least one API path, e.g. /v2/contributors/<id>')
    process.exit(1)
  }

  for (const apiPath of paths) {
    const response = await fetch(`${BASE}${apiPath}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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
```

- [ ] **Step 2: Find the endpoints in the official reference**

Open `https://api-reference.shutterstock.com` and locate the contributor endpoints (contributor details and contributor collections or images). Write down the exact path, required scopes and whether the endpoint is documented for contributors to read their own content. Do not guess paths from memory.

- [ ] **Step 3: Authenticate and call**

Create an API token in your Shutterstock developer app with the scopes the reference names for the endpoints from Step 2. Then run, with your real values:
```bash
SHUTTERSTOCK_TOKEN='<token>' npx tsx scripts/spikes/shutterstock-probe.ts /v2/contributors/<your-contributor-id>
```
Expected outcomes and what each means:
- `200` with your profile: the token works and contributor details are readable. Continue to your collections/images endpoint from Step 2.
- `401` or `403`: token or scopes are wrong, or the endpoint is not available to your account type. Fix scopes once; if it still fails, record no-go.
- `404` for your own id: record the exact response; it may mean the endpoint is not for contributors.

- [ ] **Step 4: Capture the facts that decide the feature**

From the responses and the API terms, answer each of these in one line:
1. Can you list your own images or collections? Which endpoint and fields?
2. Does each item include a thumbnail or preview URL? Which fields (for example `assets.preview`)?
3. What do the developer terms say about displaying previews on a personal website and about copying/storing them (read the Terms of Service linked from the developer site)?
4. Rate limits and token lifetime (does a token expire, which would break an unattended CI build)?

Do not save any response containing your token or private account data.

- [ ] **Step 5: Commit the probe (token-free)**

```bash
git add scripts/spikes/shutterstock-probe.ts
git commit -m "chore: shutterstock api probe (spike)"
```

---

### Task 3: Record the decision

**Files:**
- Create: `docs/superpowers/notes/shutterstock-findings.md`

- [ ] **Step 1: Write the findings**

Create `docs/superpowers/notes/shutterstock-findings.md` with this structure, filling every field from Task 2 step 4 (write "unknown" only where the source really does not say):
```md
# Shutterstock API findings (<date>)

## Verdict
GO / NO-GO for an automatic gallery built at deploy time.

## Evidence
- Own portfolio readable: yes/no, endpoint `<path>`, fields `<list>`
- Thumbnail fields: `<names>`; hot-linking allowed: yes/no/unclear (quote the term)
- Storing thumbnails in the repo or site build allowed: yes/no/unclear (quote the term)
- Token lifetime / refresh: `<answer>`; usable unattended in GitHub Actions: yes/no
- Rate limits: `<answer>`

## If GO: smallest next step
One sentence, for example "fetch collection X at build time into `content/data/shutterstock.json`, render as a gallery below the post, link each thumbnail to its Shutterstock page".

## If NO-GO: fallback
Keep the manual button from task 1 and pick 3-6 photos per post by hand (already the current practice).
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/notes/shutterstock-findings.md
git commit -m "docs: shutterstock api findings and decision"
```

- [ ] **Step 3: If the verdict is GO, stop and plan separately**

Ask the owner to confirm, then write a new implementation plan for the build-time gallery using the "smallest next step" line. Do not extend this spike into the feature.

## Self-Review

- **Spec coverage:** manual first version (Task 1), API access check and terms check called out as uncertain in the external plan (Tasks 2-3), token kept out of the repo (constraints, probe).
- **Placeholders:** `<owner-contributor-name>`, `<token>`, `<your-contributor-id>` and `<date>` are owner-supplied values, listed under "Inputs needed"; the API paths are intentionally not written down because they must be read from the official reference in Task 2 step 2 rather than guessed.
- **Type consistency:** the frontmatter shape matches the existing `website` object used by the illustration posts and rendered by the blog page.
