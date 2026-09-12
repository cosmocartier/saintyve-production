import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { POSTS } from "@/lib/blog/posts-data"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: "Post Not Found | Saint Yve",
    }
  }

  return {
    title: `${post.title} | Saint Yve Journal`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Article Header */}
      <article className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Journal
          </Link>

          {/* Meta */}
          <div className="mb-6">
            <Badge className="bg-black text-white text-[10px] font-mono uppercase tracking-wider">
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Post Meta */}
          <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500 mb-12 pb-8 border-b border-gray-100">
            <span>
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span>·</span>
            <span>{post.readTime} read</span>
          </div>

          {/* Hero Image */}
          {post.image && (
            <div className="aspect-[16/9] relative bg-gray-100 mb-12">
              <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* Article Body - Placeholder Content */}
          <div className="prose prose-sm max-w-none">
            <div className="space-y-6 text-[14px] font-mono text-gray-700 leading-relaxed">
              <p>{post.excerpt}</p>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>

              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum.
              </p>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
                rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                explicabo.
              </p>

              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
            </div>
          </div>

          {/* Back to Journal */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-black hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Journal
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
