"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { POSTS } from "@/lib/blog/posts-data"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIES = ["All", "Drops", "Craft", "Behind the Scenes", "Operations", "Membership", "Sizing"] as const

export function BlogContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "most-read">("latest")

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const posts = POSTS.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort posts
    if (sortOrder === "latest") {
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortOrder === "oldest") {
      posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    // 'most-read' would need a view count field in production

    return posts
  }, [searchQuery, selectedCategory, sortOrder])

  const featuredPost = POSTS.find((p) => p.featured)
  const regularPosts = filteredPosts.filter((p) => !p.featured)

  return (
    <div className="pb-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Controls Row */}
        <div className="mb-12 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-[13px] font-mono border border-gray-200 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Category Chips + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.1em] whitespace-nowrap border transition-colors ${
                    selectedCategory === category
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
              <SelectTrigger className="w-[180px] text-[12px] font-mono border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest" className="text-[12px] font-mono">
                  Latest
                </SelectItem>
                <SelectItem value="oldest" className="text-[12px] font-mono">
                  Oldest
                </SelectItem>
                <SelectItem value="most-read" className="text-[12px] font-mono">
                  Most read
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && !searchQuery && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-16 group">
            <div className="bg-gray-50 border border-gray-200 overflow-hidden hover:border-black transition-colors">
              <div className="aspect-[16/9] relative bg-gray-100">
                <Image
                  src={featuredPost.image || "/placeholder.svg?height=600&width=1200"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-8 lg:p-10">
                <Badge className="mb-4 bg-black text-white text-[10px] font-mono uppercase tracking-wider">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-[24px] lg:text-[28px] font-light tracking-tight text-black mb-3 group-hover:text-gray-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-[13px] font-mono text-gray-600 leading-relaxed mb-4">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
                  <span>
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <div className="mt-6">
                  <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-black border-b border-black group-hover:border-gray-400 group-hover:text-gray-600 transition-all">
                    Read article →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group border border-gray-200 hover:border-black transition-colors"
            >
              <div className="aspect-[16/9] relative bg-gray-100">
                <Image
                  src={post.image || "/placeholder.svg?height=400&width=600"}
                  alt={post.title}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-6">
                <Badge className="mb-3 bg-gray-100 text-black text-[10px] font-mono uppercase tracking-wider">
                  {post.category}
                </Badge>
                <h3 className="text-[16px] font-light tracking-tight text-black mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-[12px] font-mono text-gray-600 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
                  <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[13px] font-mono text-gray-500">No posts found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
