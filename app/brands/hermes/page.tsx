import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Discover Hermès's timeless luxury handbags. Every Hermès item is carefully authenticated before being offered by Saint Yve."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Hermès | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Hermès | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/brands/hermes",
    },
    twitter: {
      card: "summary_large_image",
      title: "Hermès | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/brands/hermes",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function HermesPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Hermès", "Hermes"]}
      brandLabel="Hermès"
      pageTitle="Hermès"
      basePath="/brands/hermes"
      storageKeyPrefix="hermes"
      breadcrumbs={[{ name: "Hermès", path: "/brands/hermes" }]}
    />
  )
}
