// Maps a country name or ISO 3166-1 alpha-2 code to a flag emoji.
// Reviews store `country` as free text; this resolves the common cases
// (2-letter codes, and the most frequent full country names) to a flag,
// falling back to a neutral globe glyph rather than showing nothing.

const NAME_TO_CODE: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  england: "GB",
  france: "FR",
  germany: "DE",
  italy: "IT",
  spain: "ES",
  portugal: "PT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  austria: "AT",
  ireland: "IE",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  poland: "PL",
  greece: "GR",
  turkey: "TR",
  "united arab emirates": "AE",
  uae: "AE",
  "saudi arabia": "SA",
  qatar: "QA",
  kuwait: "KW",
  canada: "CA",
  australia: "AU",
  "new zealand": "NZ",
  japan: "JP",
  "south korea": "KR",
  china: "CN",
  singapore: "SG",
  "hong kong": "HK",
  brazil: "BR",
  mexico: "MX",
  argentina: "AR",
  "south africa": "ZA",
  india: "IN",
  israel: "IL",
  russia: "RU",
  ukraine: "UA",
  romania: "RO",
  "czech republic": "CZ",
  hungary: "HU",
  morocco: "MA",
  egypt: "EG",
}

// A small set of countries use a custom flag image instead of the emoji
// fallback below. Add more entries here as custom flag assets are provided;
// everything else continues to resolve through the emoji library.
const CODE_TO_FLAG_IMAGE: Record<string, string> = {
  CH: "/images/flags/switzerland.png",
  IT: "/images/flags/italy.png",
  DE: "/images/flags/germany.png",
  AT: "/images/flags/austria.png",
  DK: "/images/flags/denmark.png",
}

function resolveCountryCode(country: string | null | undefined): string | null {
  if (!country) return null
  const trimmed = country.trim()
  if (/^[a-zA-Z]{2}$/.test(trimmed)) return trimmed.toUpperCase()
  const mappedCode = NAME_TO_CODE[trimmed.toLowerCase()]
  return mappedCode ?? null
}

export function getCountryFlagImage(country: string | null | undefined): string | null {
  const code = resolveCountryCode(country)
  if (!code) return null
  return CODE_TO_FLAG_IMAGE[code] ?? null
}

function codeToFlagEmoji(code: string): string | null {
  if (!/^[a-zA-Z]{2}$/.test(code)) return null
  const upper = code.toUpperCase()
  const codePoints = upper.split("").map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function getCountryFlag(country: string | null | undefined): string {
  if (!country) return "🌍"

  const trimmed = country.trim()
  const direct = codeToFlagEmoji(trimmed)
  if (direct && trimmed.length === 2) return direct

  const normalized = trimmed.toLowerCase()
  const mappedCode = NAME_TO_CODE[normalized]
  if (mappedCode) {
    const flag = codeToFlagEmoji(mappedCode)
    if (flag) return flag
  }

  return "🌍"
}
