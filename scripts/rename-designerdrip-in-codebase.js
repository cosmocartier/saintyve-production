/**
 * Renames every free-text occurrence of the word "Designerdrip" (in any casing)
 * to "Saint Yve" across the codebase's source files.
 *
 * URLs, domains and email addresses are intentionally skipped: any "designerdrip"
 * that is immediately followed by a TLD (e.g. designerdrip.store, designerdrip.com,
 * www.designerdrip.store) or immediately preceded by "@", "/" or "." is part of a
 * real link/address, so rewriting it would break the link rather than rename a word.
 *
 * Usage:
 *   node scripts/rename-designerdrip-in-codebase.js          # dry run (default)
 *   node scripts/rename-designerdrip-in-codebase.js --apply  # writes changes
 */

const fs = require("fs")
const path = require("path")

const APPLY = process.argv.includes("--apply")
const ROOT = path.resolve(__dirname, "..")

const INCLUDE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql", ".css", ".json", ".md", ".mdx"])

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "user_read_only_context",
  "v0_memories",
])

// The rename scripts themselves reference "designerdrip" in code/comments and
// must not be rewritten (it would break their own logic / references).
const SKIP_FILES = new Set([
  path.join(ROOT, "scripts", "rename-designerdrip-in-codebase.js"),
  path.join(ROOT, "scripts", "rename-designerdrip-to-saintyve.js"),
])

// Match "designerdrip" only when it is NOT part of a domain/email/URL token:
//  - not preceded by "@", "/" or "."
//  - not immediately followed by ".<letter>" (a TLD such as .store / .com)
const WORD_PATTERN = /(?<![@/.\w])designerdrip(?!\.[a-z])/gi

function replacement(match) {
  if (match === match.toUpperCase()) return "SAINT YVE"
  if (match === match.toLowerCase()) return "saint yve"
  return "Saint Yve"
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, files)
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(full)) continue
      if (INCLUDE_EXT.has(path.extname(entry.name))) files.push(full)
    }
  }
}

function main() {
  const files = []
  walk(ROOT, files)

  let totalFiles = 0
  let totalReplacements = 0

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8")
    if (!/designerdrip/i.test(original)) continue

    let count = 0
    const updated = original.replace(WORD_PATTERN, (m) => {
      count += 1
      return replacement(m)
    })

    if (count === 0 || updated === original) continue

    totalFiles += 1
    totalReplacements += count
    console.log(`\n${path.relative(ROOT, file)} — ${count} replacement(s)`)

    if (APPLY) fs.writeFileSync(file, updated, "utf8")
  }

  console.log(
    `\n${APPLY ? "Applied" : "Dry run —"} ${totalReplacements} replacement(s) across ${totalFiles} file(s).${
      APPLY ? "" : " Re-run with --apply to write these changes."
    }`,
  )
}

main()
