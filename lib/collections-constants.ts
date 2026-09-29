// Brands and gender that make up the /collections page. Kept in one shared,
// non-"use server" module so the page, client component, and server actions
// (which may only export async functions) can all import the same values.
export const COLLECTIONS_BRANDS = ["Hermès", "Hermes", "Chanel", "Maison Margiela"]
export const COLLECTIONS_GENDER = "Women"
