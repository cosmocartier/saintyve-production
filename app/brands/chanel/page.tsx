import type { Metadata } from "next"
import {
  BrandCollectionPage,
  hasActiveBrandFilters,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

const DESCRIPTION =
  "Discover Chanel's timeless luxury handbags. Every Chanel item is carefully authenticated before being offered by Saint Yve."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams

  return {
    title: "Chanel | Saint Yve",
    description: DESCRIPTION,
    openGraph: {
      title: "Chanel | Saint Yve",
      description: DESCRIPTION,
      type: "website",
      url: "https://designerdrip.com/brands/chanel",
    },
    twitter: {
      card: "summary_large_image",
      title: "Chanel | Saint Yve",
      description: DESCRIPTION,
    },
    alternates: {
      canonical: "https://designerdrip.com/brands/chanel",
    },
    robots: {
      index: !hasActiveBrandFilters(resolvedSearchParams),
      follow: true,
    },
  }
}

export default async function ChanelPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Chanel"
      basePath="/brands/chanel"
      storageKeyPrefix="chanel"
      breadcrumbs={[{ name: "Chanel", path: "/brands/chanel" }]}
    />
  )
}
