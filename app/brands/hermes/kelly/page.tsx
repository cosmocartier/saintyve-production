import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Kelly | Saint Yve",
  description: "Discover the Hermès Kelly collection at Saint Yve.",
}

export default async function HermesKellyPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Hermès", "Hermes"]}
      brandLabel="Hermès"
      pageTitle="Kelly"
      basePath="/brands/hermes/kelly"
      storageKeyPrefix="hermesKelly"
      modelPattern="\mkelly\M"
      breadcrumbs={[
        { name: "Hermès", path: "/brands/hermes" },
        { name: "Kelly", path: "/brands/hermes/kelly" },
      ]}
    />
  )
}
