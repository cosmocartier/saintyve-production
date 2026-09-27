/**
 * Replaces every occurrence of the old support email addresses with the new
 * Saint Yve contact email across the codebase.
 *
 * Old addresses replaced:
 *   - support[at]designerdrip[dot]store
 *   - support[at]designerdrip[dot]de
 *   - support[at]designerdrip[dot]com
 *
 * New address:
 *   - contact@saintyve.com
 *
 * Usage:
 *   node scripts/replace-support-emails.mjs
 *
 * Note: this script is idempotent and safe to re-run - once the old
 * addresses have been replaced, running it again is a no-op.
 */
import { readdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")
const SELF_PATH = __filename

// Built via array.join so this file's own source never contains the literal
// old addresses - keeps the script safe to re-run without self-matching.
const OLD_EMAILS = [
  ["support", "designerdrip.store"].join("@"),
  ["support", "designerdrip.de"].join("@"),
  ["support", "designerdrip.com"].join("@"),
]
const NEW_EMAIL = "contact@saintyve.com"

// Build a single regex matching any of the old emails (case-insensitive).
const EMAIL_PATTERN = new RegExp(OLD_EMAILS.map((e) => e.replace(/[.]/g, "\\.")).join("|"), "gi")

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".vercel",
  "dist",
  "build",
  "user_read_only_context",
  ".v0",
])

// Only touch text/source files - skip binaries, images, fonts, lockfiles, etc.
const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".sql",
  ".css",
  ".txt",
  ".html",
  ".yml",
  ".yaml",
  ".env",
])

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      await walk(path.join(dir, entry.name), files)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (ALLOWED_EXTENSIONS.has(ext)) {
        files.push(path.join(dir, entry.name))
      }
    }
  }

  return files
}

async function main() {
  const files = await walk(ROOT)
  let filesChanged = 0
  let totalReplacements = 0

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8")

    if (!EMAIL_PATTERN.test(content)) continue

    const matches = content.match(EMAIL_PATTERN) || []
    const updated = content.replace(EMAIL_PATTERN, NEW_EMAIL)

    await writeFile(filePath, updated, "utf8")

    filesChanged++
    totalReplacements += matches.length
    console.log(`[v0] Updated ${matches.length} occurrence(s) in ${path.relative(ROOT, filePath)}`)
  }

  console.log(`\n[v0] Done. Replaced ${totalReplacements} email occurrence(s) across ${filesChanged} file(s).`)
}

main().catch((err) => {
  console.error("[v0] Failed to replace emails:", err)
  process.exit(1)
})
