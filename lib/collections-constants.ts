// Brands, gender, and category that make up the /collections page. Kept in
// one shared, non-"use server" module so the page, client component, and
// server actions (which may only export async functions) can all import the
// same values.
export const COLLECTIONS_BRANDS = ["Hermès", "Hermes", "Chanel"]
export const COLLECTIONS_GENDER = "Women"
export const COLLECTIONS_CATEGORY = "Bag"
