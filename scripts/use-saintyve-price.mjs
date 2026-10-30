#!/usr/bin/env node
/**
 * Points the storefront's catalog surfaces at products.saintyve_price instead of products.price.
 *
 * Code only: this script never talks to Supabase. Orders, carts, invoices, checkout and the supplier/admin
 * order tooling are intentionally out of scope because they work with price snapshots, not catalog prices.
 *
 * Usage:
 *   node scripts/use-saintyve-price.mjs          # dry run, prints what would change
 *   node scripts/use-saintyve-price.mjs --write  # applies the changes
 *
 * Re-running is safe: every rule only matches the old `price` column, so already-migrated code is skipped.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const WRITE = process.argv.includes("--write")

const TARGETS = [
  { dir: "app/brands", match: /page\.tsx$/ },
  { dir: "app/mens", match: /page\.tsx$/ },
  { dir: "app/womens", match: /page\.tsx$/ },
  { dir: "components/category-pages", match: /\.tsx$/ },
  { dir: "components/mens", match: /\.tsx$/ },
  { dir: "components/womens", match: /\.tsx$/ },
]

const SINGLE_FILES = [
  "app/accessories/page.tsx",
  "app/all/page.tsx",
  "app/bags/page.tsx",
  "app/best-sellers/page.tsx",
  "app/clothing/page.tsx",
  "app/collections/page.tsx",
  "app/jackets/page.tsx",
  "app/jewelry/page.tsx",
  "app/new-arrivals/page.tsx",
  "app/outerwear/page.tsx",
  "app/shoes/page.tsx",
  "app/sneakers/page.tsx",
  "app/vests/page.tsx",
  "app/watches/page.tsx",
  "app/actions/get-smart-sorted-products.ts",
  "components/products/product-card.tsx",
  "components/navigation.tsx",
  "components/static-navigation.tsx",
  "components/navigation/product-page-navigation.tsx",
  "contexts/wishlist-context.tsx",
]

const RULES = [
  // Database-side sorting: query.order("price", ...) and joined q.order("products(price)", ...)
  { pattern: /\.order\((["'])price\1/g, replacement: '.order($1saintyve_price$1' },
  { pattern: /\.order\((["'])products\(price\)\1/g, replacement: '.order($1products(saintyve_price)$1' },
  // Product objects read in memory (sorting comparators, smart sort, price tiers, cards, search results)
  {
    pattern: /\b(a|b|p|sel|selected|selectedProduct|product|item\.products)\.price\b/g,
    replacement: "$1.saintyve_price",
  },
]

function walk(dir, match, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, match, out)
    else if (match.test(entry)) out.push(full)
  }
  return out
}

const files = new Set(SINGLE_FILES.map((f) => join(ROOT, f)))
for (const { dir, match } of TARGETS) {
  for (const file of walk(join(ROOT, dir), match)) files.add(file)
}

let changedFiles = 0
let totalReplacements = 0

for (const file of [...files].sort()) {
  let source
  try {
    source = readFileSync(file, "utf8")
  } catch {
    continue
  }

  let next = source
  let count = 0
  for (const { pattern, replacement } of RULES) {
    next = next.replace(pattern, (...args) => {
      count++
      return replacement.replace(/\$(\d)/g, (_, i) => args[Number(i)])
    })
  }

  if (next === source) continue
  changedFiles++
  totalReplacements += count
  console.log(`${String(count).padStart(3)}  ${relative(ROOT, file).split(sep).join("/")}`)
  if (WRITE) writeFileSync(file, next)
}

console.log(
  `\n${WRITE ? "Updated" : "Would update"} ${changedFiles} files (${totalReplacements} replacements).` +
    (WRITE ? "" : " Re-run with --write to apply."),
)
