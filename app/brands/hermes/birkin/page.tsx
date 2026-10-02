import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Birkin | Saint Yve",
  description: "Discover the Hermès Birkin collection at Saint Yve.",
}

export default async function HermesBirkinPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Hermès", "Hermes"]}
      brandLabel="Hermès"
      pageTitle="Birkin"
      basePath="/brands/hermes/birkin"
      storageKeyPrefix="hermesBirkin"
      modelPattern="\mbirkin\M"
      breadcrumbs={[
        { name: "Hermès", path: "/brands/hermes" },
        { name: "Birkin", path: "/brands/hermes/birkin" },
      ]}
    />
  )
}
