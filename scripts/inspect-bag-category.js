const { Client } = require("pg")

async function main() {
  const client = new Client({
    connectionString: `${process.env.POSTGRES_URL}&sslmode=require&uselibpqcompat=true`,
  })
  await client.connect()

  // All brand values + live counts
  const brands = await client.query(
    `select brand, status, count(*) as n from products group by brand, status order by brand, status`
  )
  console.log("All brands x status:")
  console.table(brands.rows)

  // Categories used by Hermes products (any status)
  for (const brand of ["Hermes", "YSL", "Yves Saint Laurent"]) {
    const res = await client.query(
      `select c.name as category, c.slug, p.status, count(*) as n
       from products p
       join product_categories pc on pc.product_id = p.id
       join categories c on c.id = pc.category_id
       where p.brand = $1
       group by c.name, c.slug, p.status
       order by n desc`,
      [brand]
    )
    console.log(`\nBrand ${brand} — all categories (any status):`)
    console.table(res.rows)
  }

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
