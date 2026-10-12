import { legalSections, type LegalBlock } from "@/lib/legal-content"

function renderBlock(block: LegalBlock, key: string) {
  if (typeof block === "string") {
    return (
      <p key={key} className="mt-4 text-pretty">
        {block}
      </p>
    )
  }

  if ("heading" in block) {
    return (
      <h3 key={key} className="mt-8 text-[11px] font-bold leading-snug tracking-[0.02em]">
        {block.heading}
      </h3>
    )
  }

  return (
    <ul key={key} className="mt-4 space-y-3">
      {block.list.map((item, index) => (
        <li key={`${key}-${index}`} className="text-pretty">
          {item}
        </li>
      ))}
    </ul>
  )
}

export function LegalDocument() {
  return (
    <div className="space-y-24 md:space-y-32">
      {legalSections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
          <h2
            id={`${section.id}-title`}
            className="text-[18px] font-bold uppercase leading-tight tracking-tight md:text-[22px]"
          >
            {section.title}
          </h2>
          <div className="mt-6 text-[10px] uppercase leading-[1.5] tracking-[0.02em] md:text-[11px]">
            {section.blocks.map((block, index) => renderBlock(block, `${section.id}-${index}`))}
          </div>
        </section>
      ))}
    </div>
  )
}
