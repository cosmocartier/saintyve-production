/**
 * Renames every occurrence of the word "Designerdrip" (in any casing) to
 * "Saint Yve" across the database's text columns.
 *
 * URL-storing columns (whatsapp_url, review_url, etc.) and the profiles.email
 * column are intentionally skipped — those hold real links/addresses whose
 * "designerdrip" segment is part of an actual domain, not free text, so
 * rewriting it would just break the link/address rather than rename a word.
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/rename-designerdrip-to-saintyve.js          # dry run (default)
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/rename-designerdrip-to-saintyve.js --apply  # writes changes
 */

const { Client } = require("pg")

const APPLY = process.argv.includes("--apply")

// table -> { pk, columns: [...] }
const TARGETS = {
  loyalty_rewards: { pk: "id", columns: ["title"] },
  products: { pk: "id", columns: ["meta_title", "our_commitment", "seo_keywords"] },
  reviews: { pk: "id", columns: ["review", "title"] },
}

const WORD_PATTERN = /designerdrip/gi

function replacement(match) {
  if (match === match.toUpperCase()) return "SAINT YVE"
  if (match === match.toLowerCase()) return "saint yve"
  return "Saint Yve"
}

function renameWord(value) {
  if (typeof value !== "string") return value
  return value.replace(WORD_PATTERN, replacement)
}

async function main() {
  const client = new Client({
    connectionString: `${process.env.POSTGRES_URL}&sslmode=require&uselibpqcompat=true`,
  })
  await client.connect()

  let totalRows = 0
  let totalCells = 0

  try {
    if (APPLY) await client.query("BEGIN")

    for (const [table, { pk, columns }] of Object.entries(TARGETS)) {
      const whereClause = columns.map((c) => `"${c}" ILIKE '%designerdrip%'`).join(" OR ")
      const selectSql = `SELECT "${pk}", ${columns.map((c) => `"${c}"`).join(", ")} FROM public."${table}" WHERE ${whereClause}`
      const { rows } = await client.query(selectSql)

      for (const row of rows) {
        const updates = {}
        for (const col of columns) {
          const original = row[col]
          const updated = renameWord(original)
          if (updated !== original) {
            updates[col] = updated
          }
        }

        if (Object.keys(updates).length === 0) continue

        totalRows += 1
        for (const [col, newValue] of Object.entries(updates)) {
          totalCells += 1
          console.log(`\n[${table}.${col}] id=${row[pk]}`)
          console.log(`  before: ${JSON.stringify(row[col])}`)
          console.log(`  after:  ${JSON.stringify(newValue)}`)
        }

        if (APPLY) {
          const setClause = Object.keys(updates)
            .map((col, i) => `"${col}" = $${i + 2}`)
            .join(", ")
          const values = [row[pk], ...Object.values(updates)]
          await client.query(`UPDATE public."${table}" SET ${setClause} WHERE "${pk}" = $1`, values)
        }
      }
    }

    if (APPLY) {
      await client.query("COMMIT")
    }

    console.log(
      `\n${APPLY ? "Applied" : "Dry run —"} ${totalCells} cell(s) across ${totalRows} row(s).${
        APPLY ? "" : " Re-run with --apply to write these changes."
      }`,
    )
  } catch (err) {
    if (APPLY) await client.query("ROLLBACK")
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
