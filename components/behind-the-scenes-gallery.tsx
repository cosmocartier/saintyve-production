"use client"

import { Play } from "lucide-react"

interface Video {
  id: string
  title: string
  tag: string
  duration: string
  videoUrl?: string
}

const VIDEOS: Video[] = [
  {
    id: "1",
    title: "Material Selection",
    tag: "Materials",
    duration: "0:42",
  },
  {
    id: "2",
    title: "Cutting & Pattern Work",
    tag: "Materials",
    duration: "1:15",
  },
  {
    id: "3",
    title: "Stitching Close-Up",
    tag: "Quality Check",
    duration: "0:38",
  },
  {
    id: "4",
    title: "Hardware & Details",
    tag: "Finishing",
    duration: "0:52",
  },
  {
    id: "5",
    title: "Embroidery / Logo Finishing",
    tag: "Finishing",
    duration: "1:08",
  },
  {
    id: "6",
    title: "Quality Check",
    tag: "Quality Check",
    duration: "1:22",
  },
  {
    id: "7",
    title: "Packaging",
    tag: "Packaging",
    duration: "0:45",
  },
  {
    id: "8",
    title: "Final Inspection",
    tag: "Quality Check",
    duration: "1:05",
  },
  {
    id: "9",
    title: "Detail Shots: Seams",
    tag: "Quality Check",
    duration: "0:33",
  },
  {
    id: "10",
    title: "Detail Shots: Zippers",
    tag: "Finishing",
    duration: "0:41",
  },
  {
    id: "11",
    title: "Workshop Overview",
    tag: "Materials",
    duration: "1:48",
  },
  {
    id: "12",
    title: "Shipping Prep",
    tag: "Packaging",
    duration: "0:56",
  },
]

export function BehindTheScenesGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {VIDEOS.map((video, index) => (
        <div
          key={video.id}
          className="group cursor-pointer animate-fade-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Video Card */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-sm overflow-hidden mb-3">
            {/* Subtle noise texture effect */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/15 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-sm">
              <span className="text-[10px] font-mono text-white">{video.duration}</span>
            </div>
          </div>

          {/* Video Info */}
          <div>
            <h3 className="text-[13px] font-mono text-black mb-1 group-hover:text-gray-600 transition-colors">
              {video.title}
            </h3>
            <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">{video.tag}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
