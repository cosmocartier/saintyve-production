import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Discover the full Saint Yve collection. Every Saint Yve item is carefully authenticated before being offered by Saint Yve."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Our Collection | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Our Collection | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/saintyve-our-collection",
    },
    twitter: {
      card: "summary_large_image",
      title: "Our Collection | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/saintyve-our-collection",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function SaintYveOurCollectionPage({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Saint Yve"]}
      brandLabel="Saint Yve"
      pageTitle="Our Collection"
      basePath="/saintyve-our-collection"
      storageKeyPrefix="saintyveOurCollection"
      breadcrumbs={[{ name: "Our Collection", path: "/saintyve-our-collection" }]}
    />
  )
}
