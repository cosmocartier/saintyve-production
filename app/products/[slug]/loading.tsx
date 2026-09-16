import { StaticNavigation } from "@/components/static-navigation"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <StaticNavigation />
      </div>

      <div className="w-full lg:pt-[50px]">
        {/* Hero image — matches full-bleed square hero */}
        <div className="w-full aspect-square bg-[#F5F5F5]" />

        {/* Title / Details / Price — matches centered text block */}
        <div className="max-w-xl mx-auto px-6 py-10 lg:py-14 flex flex-col items-center">
          <div className="h-2.5 w-20 bg-[#F0F0F0] rounded-sm mb-3" />
          <div className="h-6 w-56 bg-[#F0F0F0] rounded-sm mb-10" />
          <div className="h-2.5 w-24 bg-[#F0F0F0] rounded-sm mb-1" />
          <div className="h-px w-24 bg-[#F0F0F0] mb-10" />
          <div className="h-4 w-28 bg-[#F0F0F0] rounded-sm mb-1.5" />
          <div className="h-2.5 w-20 bg-[#F0F0F0] rounded-sm" />
        </div>

        {/* Remaining images */}
        <div className="flex flex-col lg:hidden">
          <div className="w-full aspect-square bg-[#F5F5F5]" />
        </div>

        <div className="hidden lg:flex lg:flex-col gap-px">
          <div className="w-full aspect-[16/9] bg-[#F5F5F5]" />
          <div className="grid grid-cols-2 gap-px">
            <div className="w-full aspect-square bg-[#F5F5F5]" />
            <div className="w-full aspect-square bg-[#F5F5F5]" />
          </div>
        </div>
      </div>
    </div>
  )
}
