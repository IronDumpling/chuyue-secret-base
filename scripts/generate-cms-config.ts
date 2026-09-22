// Writes public/admin/{config.yml,index.html,sveltia-cms.js} at build time, so the phone
// editor's form always matches the categories in lib/taxonomy.ts. All three files are
// git-ignored (regenerated on every predev/prebuild) — see .gitignore.
import fs from 'fs'
import path from 'path'
import { stringify } from 'yaml'
import { buildCmsConfig } from './lib/cms-config'

const ADMIN_DIR = path.join(process.cwd(), 'public', 'admin')
const BUNDLE_SRC = path.join(process.cwd(), 'node_modules', '@sveltia', 'cms', 'dist', 'sveltia-cms.js')
const BUNDLE_NAME = 'sveltia-cms.js'

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
    <link href="config.yml" type="text/yaml" rel="cms-config-url" />
    <script>
      // Sveltia calls Uint8Array#toBase64 / Uint8Array.fromBase64 (ES2026) when saving;
      // older Chromium (e.g. Huawei Browser) lacks them, so saving throws. No-op where native.
      (function () {
        function def(obj, name, fn) {
          if (!obj[name]) Object.defineProperty(obj, name, { value: fn, writable: true, configurable: true, enumerable: false });
        }
        def(Uint8Array.prototype, 'toBase64', function () {
          var s = '', c = 0x8000;
          for (var i = 0; i < this.length; i += c) s += String.fromCharCode.apply(null, this.subarray(i, i + c));
          return btoa(s);
        });
        def(Uint8Array, 'fromBase64', function (b64) {
          var s = atob(b64), a = new Uint8Array(s.length);
          for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
          return a;
        });
      })();
    </script>
  </head>
  <body>
    <script src="${BUNDLE_NAME}"></script>
  </body>
</html>
`

function main() {
  const repo = process.env.CMS_REPO || 'IronDumpling/chuyue-content'
  const branch = process.env.CMS_BRANCH || 'main'

  if (!fs.existsSync(BUNDLE_SRC)) {
    throw new Error(`[cms] @sveltia/cms bundle not found at ${BUNDLE_SRC} — is @sveltia/cms installed?`)
  }

  fs.mkdirSync(ADMIN_DIR, { recursive: true })
  fs.writeFileSync(path.join(ADMIN_DIR, 'config.yml'), stringify(buildCmsConfig({ repo, branch })))
  fs.writeFileSync(path.join(ADMIN_DIR, 'index.html'), INDEX_HTML)
  fs.copyFileSync(BUNDLE_SRC, path.join(ADMIN_DIR, BUNDLE_NAME))

  console.log(`[cms] wrote public/admin for ${repo}@${branch}`)
}

main()
