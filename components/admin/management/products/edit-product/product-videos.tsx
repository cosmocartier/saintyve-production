"use client"

import { Upload, Trash2 } from "lucide-react"

interface ProductVideo {
  id: string
  product_id: string
  video_url: string
  display_order: number
}

interface ProductVideosProps {
  videos: ProductVideo[]
  uploading: boolean
  videoInputRef: React.RefObject<HTMLInputElement>
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteVideo: (videoId: string, videoUrl: string) => void
  onAddVideoClick: () => void
}

export function ProductVideos({
  videos,
  uploading,
  videoInputRef,
  onVideoUpload,
  onDeleteVideo,
  onAddVideoClick,
}: ProductVideosProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">Product Videos</h2>
        <button
          type="button"
          onClick={onAddVideoClick}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-40"
        >
          <Upload size={12} />
          {uploading ? "Uploading..." : "Add Videos"}
        </button>
      </div>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/mov"
        multiple
        onChange={onVideoUpload}
        className="hidden"
        disabled={uploading}
      />

      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
          <Upload className="mx-auto mb-3 text-white/20" size={28} />
          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
            No videos yet. Click "Add Videos" to upload.
          </p>
          <p className="font-sans text-[9px] text-white/25 mt-1">
            Videos will display in 3:4 aspect ratio and loop automatically
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <div key={video.id} className="relative group">
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <div className="aspect-square relative">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onDeleteVideo(video.id, video.video_url)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500/80 text-white p-1.5 rounded-lg transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute top-1.5 left-1.5 rounded-lg bg-black/70 text-white px-1.5 py-0.5 font-sans text-[9px] font-medium">
                    {index + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
