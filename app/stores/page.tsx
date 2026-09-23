import type { Metadata } from "next"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Stores | Saint Yve",
  description:
    "Visit the Saint Yve Berlin store, the physical extension of our online archive of second-hand Chanel and Hermès.",
}

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <main className="pt-12 md:pt-14">
        <section className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Store info */}
          <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 lg:order-1">
            <div className="max-w-md">
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none">
                Saint Yve
              </h1>
              <p className="mt-2 text-sm md:text-base font-bold uppercase tracking-tight text-black">
                Torstraße 1, 10119 Berlin, Germany
              </p>

              <p className="mt-10 text-sm md:text-[15px] font-mono leading-relaxed text-gray-700">
                The Saint Yve Berlin store is the physical extension of our online archive, offering a curated
                selection of second-hand Chanel and Hermès pieces alongside selected objects and seasonal arrivals.
                <br />
                <br />
                For private appointments, special requests or pieces not currently displayed online, please contact
                us directly.
              </p>

              <a
                href="/contact-us"
                className="mt-10 inline-block bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider px-6 py-4 hover:bg-black/85 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Right: Store image */}
          <div className="order-1 lg:order-2 flex items-center justify-center px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
            <div className="relative aspect-[4/3] w-full max-w-[900px] overflow-hidden">
              <Image
                src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/73f06fb4-44be-4606-5bc7-9b51b88fee00/w=800"
                alt="Saint Yve Berlin store interior"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
