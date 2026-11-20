import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const assetsDir = path.join(distDir, 'assets')
const indexHtmlPath = path.join(distDir, 'index.html')

console.log('[verify-build] Checking production build assets...')

// 1. Verify dist and index.html exist
if (!fs.existsSync(distDir) || !fs.existsSync(indexHtmlPath)) {
  console.error('[verify-build] ERROR: dist/ or dist/index.html does not exist.')
  process.exit(1)
}

// 2. Check for generated CSS file in dist/assets
if (!fs.existsSync(assetsDir)) {
  console.error('[verify-build] ERROR: dist/assets directory is missing.')
  process.exit(1)
}

const assetFiles = fs.readdirSync(assetsDir)
const cssFiles = assetFiles.filter((f) => f.endsWith('.css'))

if (cssFiles.length === 0) {
  console.error('[verify-build] ERROR: No CSS files found in dist/assets/. Styles were not emitted!')
  process.exit(1)
}

const primaryCss = cssFiles[0]
const cssPath = path.join(assetsDir, primaryCss)
const cssStats = fs.statSync(cssPath)
const MIN_CSS_BYTES = 15 * 1024 // 15 KB sensible minimum for full Tailwind bundle

console.log(`[verify-build] Found CSS asset: ${primaryCss} (${(cssStats.size / 1024).toFixed(2)} KB)`)

if (cssStats.size < MIN_CSS_BYTES) {
  console.error(
    `[verify-build] ERROR: Generated CSS file is suspiciously small (${cssStats.size} bytes < ${MIN_CSS_BYTES} bytes threshold). Tailwind utilities may be missing!`
  )
  process.exit(1)
}

// 3. Verify index.html links to the emitted CSS file
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8')
if (!indexHtmlContent.includes(primaryCss)) {
  console.error(
    `[verify-build] ERROR: dist/index.html does not link to the generated stylesheet: ${primaryCss}`
  )
  process.exit(1)
}

console.log('[verify-build] PASSED: CSS asset verified, size is valid, and linked in index.html.')

