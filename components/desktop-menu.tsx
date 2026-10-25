"use client"

import { MobileMenu } from "@/components/mobile-menu"

// Desktop shares the exact menu used on mobile, including the admin "Menu"
// site-config toggle, so the two can never drift apart.
export function DesktopMenu({ hasScrolled }: { hasScrolled: boolean }) {
  return <MobileMenu hasScrolled={hasScrolled} desktop />
}
