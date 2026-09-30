import type { ShopWithYveMessage } from "./types"

interface ShopWithYveMessageRowProps {
  message: ShopWithYveMessage
}

export function ShopWithYveMessageRow({ message }: ShopWithYveMessageRowProps) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words border border-black/10 px-4 py-3 text-[13px] font-normal leading-relaxed text-[#111111]">
        {message.content}
      </p>
    </div>
  )
}
