"use client"

interface RequestMediaLinkProps {
  productTitle: string
}

export function RequestMediaLink({ productTitle }: RequestMediaLinkProps) {
  const handleClick = () => {
    const productUrl =
      typeof window !== "undefined" ? window.location.href : ""

    const message = `Hi, I'd like to receive additional detailed photos and videos of this item before ordering.

Product:
${productTitle}

Link:
${productUrl}

Thank you!`

    const encodedMessage = encodeURIComponent(message)
    const waUrl = `https://wa.me/971528079266?text=${encodedMessage}`

    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Request additional photos and videos for ${productTitle} via WhatsApp`}
      className="w-full h-[52px] flex items-center justify-center px-6 rounded-none bg-zinc-100 text-[#111111] cursor-pointer hover:bg-zinc-200 active:bg-zinc-300 transition-colors active:scale-[0.99]"
    >
      <span className="text-[11px] font-medium tracking-[0.18em] uppercase">
        Request additional photos &amp; videos
      </span>
    </button>
  )
}
