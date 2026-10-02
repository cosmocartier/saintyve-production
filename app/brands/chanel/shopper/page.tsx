import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Chanel Shopper | Saint Yve",
  description: "Discover the Chanel Shopper collection at Saint Yve.",
}

export default async function ChanelShopperPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Shopper"
      basePath="/brands/chanel/shopper"
      storageKeyPrefix="chanelShopper"
      modelPattern="\mshopper\M"
      breadcrumbs={[
        { name: "Chanel", path: "/brands/chanel" },
        { name: "Shopper", path: "/brands/chanel/shopper" },
      ]}
    />
  )
}
