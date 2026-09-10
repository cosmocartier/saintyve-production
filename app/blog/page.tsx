import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogContent } from "@/components/blog/blog-content"

export const metadata: Metadata = {
  title: "Journal | Designerdrip",
  description: "Designerdrip journal: drops, craft notes, behind-the-scenes, and updates.",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[40px] lg:text-[52px] font-light tracking-tight text-black mb-4 leading-tight">
            Journal
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mb-2">
            Updates, drops, behind-the-scenes, and notes on craft.
          </p>
          <p className="text-[12px] font-mono text-gray-400">New posts weekly</p>
        </div>
      </section>

      {/* Blog Content - Client Component with search, filters, and posts */}
      <BlogContent />

      {/* Newsletter CTA */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 p-8 lg:p-12">
            <h2 className="text-[18px] lg:text-[20px] font-light tracking-tight text-black mb-3">
              Want updates first?
            </h2>
            <p className="text-[13px] font-mono text-gray-600 mb-6">
              Join the newsletter for drops, restocks, and behind-the-scenes.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 text-[13px] font-mono border border-gray-200 focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 text-[11px] font-mono uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
