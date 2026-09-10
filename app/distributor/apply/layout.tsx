import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DESIGNERDRIP® | Official Distribution Program",
}

export default function DistributorApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
