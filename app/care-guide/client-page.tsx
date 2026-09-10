"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CARE_GUIDE, CARE_PRINCIPLES } from "@/lib/care-guide/care-guide-data"
import { Button } from "@/components/ui/button"

function CareGuideClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-4 leading-tight">
            Care Guide
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Simple care habits that keep your pieces looking sharp for years.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact-us?topic=care">
              <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-5"
              >
                Contact Support
              </Button>
            </Link>
            <button
              onClick={() => {
                document.getElementById("care-tabs")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-[11px] font-mono uppercase tracking-[0.15em] text-black border-b border-black hover:border-gray-400 hover:text-gray-600 transition-all"
            >
              Jump to category →
            </button>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section id="care-tabs" className="pb-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="sneakers" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 mb-12 flex-wrap">
              <TabsTrigger
                value="sneakers"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Sneakers
              </TabsTrigger>
              <TabsTrigger
                value="jackets"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Jackets
              </TabsTrigger>
              <TabsTrigger
                value="vests"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Vests
              </TabsTrigger>
              <TabsTrigger
                value="bags"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Bags
              </TabsTrigger>
              <TabsTrigger
                value="watches"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Watches
              </TabsTrigger>
              <TabsTrigger
                value="jewelry"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Jewelry
              </TabsTrigger>
              <TabsTrigger
                value="accessories"
                className="font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3"
              >
                Accessories
              </TabsTrigger>
            </TabsList>

            {/* Sneakers */}
            <TabsContent value="sneakers" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.sneakers.quickEssentials} />
              <DoDont dos={CARE_GUIDE.sneakers.dos} donts={CARE_GUIDE.sneakers.donts} />
              {CARE_GUIDE.sneakers.steps && <StepByStep steps={CARE_GUIDE.sneakers.steps} title="Simple routine" />}
              <SupportCTA />
            </TabsContent>

            {/* Jackets */}
            <TabsContent value="jackets" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.jackets.quickEssentials} />
              <DoDont dos={CARE_GUIDE.jackets.dos} donts={CARE_GUIDE.jackets.donts} />
              <SupportCTA />
            </TabsContent>

            {/* Vests */}
            <TabsContent value="vests" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.vests.quickEssentials} />
              <DoDont dos={CARE_GUIDE.vests.dos} donts={CARE_GUIDE.vests.donts} />
              <SupportCTA />
            </TabsContent>

            {/* Bags */}
            <TabsContent value="bags" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.bags.quickEssentials} />
              <DoDont dos={CARE_GUIDE.bags.dos} donts={CARE_GUIDE.bags.donts} />
              {CARE_GUIDE.bags.steps && <StepByStep steps={CARE_GUIDE.bags.steps} title="Routine" />}
              <SupportCTA />
            </TabsContent>

            {/* Watches */}
            <TabsContent value="watches" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.watches.quickEssentials} />
              <DoDont dos={CARE_GUIDE.watches.dos} donts={CARE_GUIDE.watches.donts} />
              {CARE_GUIDE.watches.note && (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-6">
                    <p className="text-[13px] font-mono text-gray-700">{CARE_GUIDE.watches.note}</p>
                  </CardContent>
                </Card>
              )}
              <SupportCTA />
            </TabsContent>

            {/* Jewelry */}
            <TabsContent value="jewelry" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.jewelry.quickEssentials} />
              <DoDont dos={CARE_GUIDE.jewelry.dos} donts={CARE_GUIDE.jewelry.donts} />
              <SupportCTA />
            </TabsContent>

            {/* Accessories */}
            <TabsContent value="accessories" className="space-y-12">
              <QuickEssentials data={CARE_GUIDE.accessories.quickEssentials} />
              <DoDont dos={CARE_GUIDE.accessories.dos} donts={CARE_GUIDE.accessories.donts} />
              <SupportCTA />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Universal Care Principles */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-10 text-center">
            Care Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CARE_PRINCIPLES.map((principle, index) => (
              <Card key={index} className="border-gray-200 bg-white hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-[13px] font-mono font-medium text-black mb-3">{principle.title}</h3>
                  <p className="text-[13px] font-mono text-gray-600 leading-relaxed">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="py-16 px-6 lg:px-12 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[14px] lg:text-[15px] font-mono text-white mb-6">
            Unsure about a specific piece? Send us a photo and we'll guide you.
          </p>
          <Link href="/contact-us?topic=care">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-5 bg-transparent"
            >
              Contact Support
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Helper Components
function QuickEssentials({ data }: { data: { cleaning: string; storage: string; avoid: string } }) {
  return (
    <div>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-6">Quick Essentials</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-5">
            <h4 className="text-[12px] font-mono font-medium text-black mb-2">Cleaning</h4>
            <p className="text-[13px] font-mono text-gray-700 leading-relaxed">{data.cleaning}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-5">
            <h4 className="text-[12px] font-mono font-medium text-black mb-2">Storage</h4>
            <p className="text-[13px] font-mono text-gray-700 leading-relaxed">{data.storage}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-5">
            <h4 className="text-[12px] font-mono font-medium text-black mb-2">What to avoid</h4>
            <p className="text-[13px] font-mono text-gray-700 leading-relaxed">{data.avoid}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-6">
          <h4 className="text-[12px] font-mono font-medium text-black mb-4 uppercase tracking-wide">Do</h4>
          <ul className="space-y-2">
            {dos.map((item, index) => (
              <li key={index} className="text-[13px] font-mono text-gray-700">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-6">
          <h4 className="text-[12px] font-mono font-medium text-black mb-4 uppercase tracking-wide">Don't</h4>
          <ul className="space-y-2">
            {donts.map((item, index) => (
              <li key={index} className="text-[13px] font-mono text-gray-700">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function StepByStep({ steps, title }: { steps: string[]; title: string }) {
  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-6">
        <h4 className="text-[12px] font-mono font-medium text-black mb-4 uppercase tracking-wide">{title}</h4>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="text-[13px] font-mono text-gray-700">
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function SupportCTA() {
  return (
    <Card className="border-gray-200 bg-white">
      <CardContent className="p-6">
        <p className="text-[13px] font-mono text-gray-700 mb-4">
          Unsure about something specific?{" "}
          <Link
            href="/contact-us?topic=care"
            className="text-black border-b border-black hover:border-gray-400 hover:text-gray-600 transition-all"
          >
            Contact support
          </Link>{" "}
          and we'll help.
        </p>
      </CardContent>
    </Card>
  )
}

export { CareGuideClientPage }
export default CareGuideClientPage
