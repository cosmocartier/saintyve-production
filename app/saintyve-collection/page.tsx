import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Designed with restraint and crafted to endure, every Saint Yve piece is a signature of quiet, enduring luxury."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Saint Yve Collection | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Saint Yve Collection | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/saintyve-collection",
    },
    twitter: {
      card: "summary_large_image",
      title: "Saint Yve Collection | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/saintyve-collection",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function SaintYveCollectionPage({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Saint Yve"]}
      category={null}
      description={DESCRIPTION}
      brandLabel="Saint Yve"
      pageTitle="Saint Yve Collection"
      basePath="/saintyve-collection"
      storageKeyPrefix="saintyveCollection"
      breadcrumbs={[{ name: "Saint Yve Collection", path: "/saintyve-collection" }]}
    />
  )
}
