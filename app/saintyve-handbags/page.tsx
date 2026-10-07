import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Discover Saint Yve's signature handbags. Every Saint Yve item is carefully authenticated before being offered by Saint Yve."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Saint Yve Handbags | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Saint Yve Handbags | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/saintyve-handbags",
    },
    twitter: {
      card: "summary_large_image",
      title: "Saint Yve Handbags | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/saintyve-handbags",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function SaintYveHandbagsPage({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Saint Yve"]}
      brandLabel="Saint Yve"
      pageTitle="Saint Yve Handbags"
      basePath="/saintyve-handbags"
      storageKeyPrefix="saintyveHandbags"
      modelPattern="bag"
      breadcrumbs={[{ name: "Saint Yve Handbags", path: "/saintyve-handbags" }]}
    />
  )
}
