const { Client } = require("pg")

async function main() {
  const client = new Client({
    connectionString: `${process.env.POSTGRES_URL}&sslmode=require&uselibpqcompat=true`,
  })
  await client.connect()

  // Columns of products table
  const cols = await client.query(
    `select column_name, data_type
     from information_schema.columns
     where table_schema = 'public' and table_name = 'products'
     order by ordinal_position`
  )
  console.log("products columns:")
  console.log(cols.rows.map((c) => c.column_name).join(", "))

  // category-like columns
  const catCols = cols.rows
    .map((c) => c.column_name)
    .filter((n) => /categor/i.test(n))
  console.log("\ncategory-like columns:", catCols.join(", "))

  // brand + category + status breakdown for the three brands
  const rows = await client.query(
    `select brand, category, status, count(*)::int as n
     from products
     where lower(brand) in ('chanel','hermes','yves saint laurent','ysl')
     group by brand, category, status
     order by brand, category, status`
  )
  console.log("\nbrand / category / status breakdown:")
  console.table(rows.rows)

  // distinct categories
  const cats = await client.query(
    `select distinct category from products order by category`
  )
  console.log("\nall categories:", cats.rows.map((c) => c.category).join(", "))

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
