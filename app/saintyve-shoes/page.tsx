import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Sculpted silhouettes and impeccable craftsmanship define our shoes, each pair a signature of Saint Yve's quiet luxury."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Saint Yve Shoes | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Saint Yve Shoes | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/saintyve-shoes",
    },
    twitter: {
      card: "summary_large_image",
      title: "Saint Yve Shoes | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/saintyve-shoes",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function SaintYveShoesPage({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Saint Yve"]}
      category="Shoe"
      description={DESCRIPTION}
      brandLabel="Saint Yve"
      pageTitle="Saint Yve Shoes"
      basePath="/saintyve-shoes"
      storageKeyPrefix="saintyveShoes"
      breadcrumbs={[{ name: "Saint Yve Shoes", path: "/saintyve-shoes" }]}
    />
  )
}
