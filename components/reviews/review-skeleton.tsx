export function ReviewSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#f0f0f0] rounded-sm p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 bg-zinc-100 rounded-sm" />
        <div className="h-3 w-16 bg-zinc-100 rounded-sm" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-2.5 w-full bg-zinc-100 rounded-sm" />
        <div className="h-2.5 w-full bg-zinc-100 rounded-sm" />
        <div className="h-2.5 w-3/4 bg-zinc-100 rounded-sm" />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-[#f0f0f0]">
        <div className="w-10 h-10 bg-zinc-100 rounded-sm" />
        <div className="h-2.5 w-32 bg-zinc-100 rounded-sm" />
      </div>
    </div>
  )
}
