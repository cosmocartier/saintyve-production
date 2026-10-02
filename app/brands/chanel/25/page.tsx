import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Chanel 25 | Saint Yve",
  description: "Discover the Chanel 25 handbag collection at Saint Yve.",
}

export default async function Chanel25Page({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Chanel 25"
      basePath="/brands/chanel/25"
      storageKeyPrefix="chanel25"
      modelPattern="\m25\M"
      breadcrumbs={[
        { name: "Chanel", path: "/brands/chanel" },
        { name: "Chanel 25", path: "/brands/chanel/25" },
      ]}
    />
  )
}
