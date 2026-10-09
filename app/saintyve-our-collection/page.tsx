import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Explore the Saint Yve collection. Every Saint Yve item is carefully authenticated before being offered by Saint Yve."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  return {
    title: "Saint Yve Our Collection | Saint Yve",
    description: DESCRIPTION,
    openGraph: { title: "Saint Yve Our Collection | Saint Yve", description: DESCRIPTION, type: "website", url: "https://designerdrip.com/saintyve-our-collection" },
    twitter: { card: "summary_large_image", title: "Saint Yve Our Collection | Saint Yve", description: DESCRIPTION },
    alternates: { canonical: "https://designerdrip.com/saintyve-our-collection" },
    robots: { index: !hasActiveBrandFilters(resolvedSearchParams), follow: true },
  }
}

export default async function SaintYveOurCollectionPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Saint Yve"]}
      brandLabel="Saint Yve"
      pageTitle="Saint Yve Our Collection"
      basePath="/saintyve-our-collection"
      storageKeyPrefix="saintyveOurCollection"
      breadcrumbs={[{ name: "Saint Yve Our Collection", path: "/saintyve-our-collection" }]}
    />
  )
}
