import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Discover Saint Yve's signature shoes. Every Saint Yve item is carefully authenticated before being offered by Saint Yve."

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
      brandLabel="Saint Yve"
      pageTitle="Saint Yve Shoes"
      basePath="/saintyve-shoes"
      storageKeyPrefix="saintyveShoes"
      modelPattern="shoe|heel|mule|boot|loafer|slide|sneaker"
      breadcrumbs={[{ name: "Saint Yve Shoes", path: "/saintyve-shoes" }]}
    />
  )
}
