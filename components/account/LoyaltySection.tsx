"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LOYALTY_TIERS, ORDERED_TIERS, type LoyaltyStatus } from "@/lib/loyalty-tiers"
import { getOrCreateUserMonthlyRewards, claimMonthlyReward } from "@/app/actions/loyalty"
import { getUserMembership } from "@/app/actions/membership"

interface LoyaltySectionProps {
  profile: {
    id?: string
    created_at?: string
  } | null
}

interface MonthlyReward {
  id: string
  title: string
  description: string
  status: "available" | "claimed" | "expired"
  claimed_at?: string
  expires_at?: string
}

interface Membership {
  member_id: string
  member_since: string
  valid_until: string
  status: string
}

export default function LoyaltySection({ profile }: LoyaltySectionProps) {
  const [monthlyRewards, setMonthlyRewards] = useState<MonthlyReward[]>([])
  const [isLoadingRewards, setIsLoadingRewards] = useState(true)
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [isLoadingMembership, setIsLoadingMembership] = useState(true)

  const getCurrentTierIndex = () => {
    if (!membership) return 0
    const currentStatus = (membership.status || "bronze").toLowerCase()
    return ORDERED_TIERS.indexOf(currentStatus as LoyaltyStatus)
  }

  const currentTierIndex = getCurrentTierIndex()
  const currentStatus = membership ? (membership.status.toLowerCase() as LoyaltyStatus) : null
  const isPlatinum = currentStatus === "platinum"
  const isBlack = currentStatus === "black"
  const isSilver = currentStatus === "silver"
  const isGold = currentStatus === "gold"
  const isBronze = currentStatus === "bronze"

  const getHeroCardImage = (): string => {
    if (!currentStatus) return "/placeholder.svg"

    if (currentStatus === "platinum") {
      return "/images/platinum-hero-card.png"
    }
    if (currentStatus === "black") {
      return "/images/black-hero-card.png"
    }
    if (currentStatus === "silver") {
      return "/images/silver-hero-card.png"
    }
    if (currentStatus === "gold") {
      return "/images/gold-hero-card.png"
    }
    if (currentStatus === "bronze") {
      return "/images/bronze-hero-card.png"
    }
    return LOYALTY_TIERS[currentStatus].imageSrc || "/placeholder.svg"
  }

  useEffect(() => {
    const fetchMonthlyRewards = async () => {
      try {
        const result = await getOrCreateUserMonthlyRewards()
        if (result.error) {
          console.error("Failed to fetch monthly rewards:", result.error)
        } else {
          setMonthlyRewards(result.rewards as MonthlyReward[])
        }
      } catch (error) {
        console.error("Failed to fetch monthly rewards:", error)
      } finally {
        setIsLoadingRewards(false)
      }
    }

    const fetchMembership = async () => {
      try {
        const result = await getUserMembership()
        if (result.error) {
          console.error("Failed to fetch membership:", result.error)
        } else {
          setMembership(result.membership)
        }
      } catch (error) {
        console.error("Failed to fetch membership:", error)
      } finally {
        setIsLoadingMembership(false)
      }
    }

    fetchMonthlyRewards()
    fetchMembership()
  }, [])

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-200"
      case "claimed":
        return "bg-gray-50 text-gray-600 border-gray-200"
      case "expired":
        return "bg-red-50 text-red-600 border-red-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getTierPrefix = (status: string): string => {
    const prefixes: Record<string, string> = {
      bronze: "BRZ",
      silver: "SLV",
      gold: "GLD",
      platinum: "PLT",
      black: "BLK",
    }
    return prefixes[status.toLowerCase()] || "BRZ"
  }

  const generateMemberId = (): string => {
    if (!profile?.id || !currentStatus) return "BRZ-00000"
    const prefix = getTierPrefix(currentStatus)
    const numericId = profile.id.replace(/\D/g, "").slice(0, 5).padStart(5, "0")
    return `${prefix}-${numericId}`
  }

  const getMemberIdDisplay = (): string => {
    if (membership) return membership.member_id
    return generateMemberId() // Fallback to old method
  }

  const getMemberSinceYear = (): string => {
    if (membership) return new Date(membership.member_since).getFullYear().toString()
    if (!profile?.created_at) return new Date().getFullYear().toString()
    return new Date(profile.created_at).getFullYear().toString()
  }

  const getValidUntil = (): string => {
    if (membership) {
      const validUntil = new Date(membership.valid_until)
      return `${String(validUntil.getMonth() + 1).padStart(2, "0")} / ${String(validUntil.getFullYear()).slice(-2)}`
    }
    if (!profile?.created_at) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 12)
      return `${String(futureDate.getMonth() + 1).padStart(2, "0")} / ${String(futureDate.getFullYear()).slice(-2)}`
    }
    const createdDate = new Date(profile.created_at)
    const validUntil = new Date(createdDate)
    validUntil.setFullYear(validUntil.getFullYear() + 1)
    return `${String(validUntil.getMonth() + 1).padStart(2, "0")} / ${String(validUntil.getFullYear()).slice(-2)}`
  }

  const getCurrentEdition = (): string => {
    return `EDITION // ${new Date().getFullYear()}`
  }

  const handleClaimReward = async (rewardId: string) => {
    setClaimingRewardId(rewardId)
    try {
      const result = await claimMonthlyReward(rewardId)
      if (result.error) {
        console.error("Failed to claim reward:", result.error)
      } else {
        setMonthlyRewards((prevRewards) =>
          prevRewards.map((reward) => (reward.id === rewardId ? { ...reward, status: "claimed" } : reward)),
        )
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
    } finally {
      setClaimingRewardId(null)
    }
  }

  if (isLoadingMembership) {
    return (
      <div className="min-h-screen bg-white px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-[28px] font-medium uppercase tracking-wider text-black md:text-[32px]">
              LOYALTY STATUS
            </h1>
            <p className="text-[13px] font-medium text-[#8C8C8C] md:text-[14px]">
              Your exclusive membership tier inside Saint Yve.
            </p>
          </div>
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentStatus) {
    return (
      <div className="min-h-screen bg-white px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-[28px] font-medium uppercase tracking-wider text-black md:text-[32px]">
              LOYALTY STATUS
            </h1>
            <p className="text-[13px] font-medium text-[#8C8C8C] md:text-[14px]">
              Your exclusive membership tier inside Saint Yve.
            </p>
          </div>
          <div className="py-20 text-center">
            <p className="text-[13px] text-[#999999]">No membership found. Please contact support.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-6 py-12 md:px-10 md:py-16 bg-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[28px] font-medium uppercase tracking-wider text-black md:text-[32px]">
            LOYALTY STATUS
          </h1>
          <p className="text-[13px] font-medium text-[#8C8C8C] md:text-[14px]">
            Your exclusive membership tier inside Saint Yve.
          </p>
        </div>

        {/* Main "Current Card" Hero with Metadata Overlay */}
        <div className="mx-auto mb-10 mt-8 max-w-3xl rounded-[20px] bg-white px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] md:px-8 md:py-10 shadow-none">
          {/* Card Image with Metadata Overlay */}
          <div className="relative mx-auto max-w-2xl">
            <Image
              src={getHeroCardImage() || "/placeholder.svg"}
              alt={LOYALTY_TIERS[currentStatus].label}
              width={800}
              height={450}
              className="w-full rounded-none object-cover shadow-xl"
            />

            <div className="absolute bottom-4 left-4 space-y-1.5 text-white md:bottom-6 md:left-6 md:space-y-2">
              {/* Member ID */}
              <div>
                <p className="text-[7px] font-medium uppercase tracking-wider opacity-60 md:text-[8px]">MEMBER ID</p>
                <p className="text-[11px] font-semibold md:text-[12px]">{getMemberIdDisplay()}</p>
              </div>

              {/* Member Since */}
              <div>
                <p className="text-[7px] font-medium uppercase tracking-wider opacity-60 md:text-[8px]">MEMBER SINCE</p>
                <p className="text-[11px] font-semibold md:text-[12px]">{getMemberSinceYear()}</p>
              </div>

              {/* Valid Until */}
              <div>
                <p className="text-[7px] font-medium uppercase tracking-wider opacity-60 md:text-[8px]">VALID UNTIL</p>
                <p className="text-[11px] font-semibold md:text-[12px]">{getValidUntil()}</p>
              </div>

              {/* Authorized Member */}
              <div className="pt-1">
                <p className="text-[7px] font-medium uppercase tracking-wider opacity-60 md:text-[8px]">
                  AUTHORIZED MEMBER
                </p>
              </div>

              {/* Edition Number */}
              <div className="pt-0.5">
                <p className="text-[11px] font-semibold md:text-[12px]">{getCurrentEdition()}</p>
              </div>
            </div>
          </div>

          {/* Status & Description */}
          <div className="mt-3 text-center">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#999999]">CURRENT STATUS</p>
            <h2 className="text-[20px] font-medium text-black md:text-[22px]">
              {membership?.status ? membership.status.charAt(0).toUpperCase() + membership.status.slice(1) : "Bronze"}
            </h2>
          </div>
        </div>

        <div className="mx-auto mb-12 max-w-3xl">
          <h3 className="mb-6 text-center text-[11px] font-medium uppercase tracking-wider text-[#999999] md:text-[12px]">
            THIS MONTH&apos;S REWARDS
          </h3>

          {isLoadingRewards ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
            </div>
          ) : monthlyRewards.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#999999]">No rewards available for this month yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 md:grid md:grid-cols-3">
                {monthlyRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`relative min-w-[240px] flex-shrink-0 rounded-[12px] shadow-md md:min-w-0 ${
                      isPlatinum || isBlack || isSilver || isGold || isBronze
                        ? "aspect-[4/3] bg-cover bg-center bg-no-repeat p-5"
                        : "bg-black p-4"
                    }`}
                    style={
                      isPlatinum
                        ? {
                            backgroundImage: "url('/platinum-reward-card.png')",
                            backgroundSize: "100% 100%",
                          }
                        : isBlack
                          ? {
                              backgroundImage: "url('/black-reward-card.png')",
                              backgroundSize: "100% 100%",
                            }
                          : isSilver
                            ? {
                                backgroundImage: "url('/silver-reward-card.png')",
                                backgroundSize: "100% 100%",
                              }
                            : isGold
                              ? {
                                  backgroundImage: "url('/gold-reward-card.png')",
                                  backgroundSize: "100% 100%",
                                }
                              : isBronze
                                ? {
                                    backgroundImage: "url('/bronze-reward-card.png')",
                                    backgroundSize: "100% 100%",
                                  }
                                : undefined
                    }
                  >
                    {/* Dashed line separator */}
                    <div className="absolute left-0 right-0 top-[60%] border-t-2 border-dashed border-white/20" />

                    {/* Top section */}
                    <div className="mb-6 flex min-h-[80px] flex-col items-center justify-center">
                      <h4 className="mb-2 text-center text-[14px] font-medium uppercase tracking-wide text-white">
                        {reward.title}
                      </h4>
                    </div>

                    {/* Bottom section */}
                    <div className="mt-6 flex flex-col items-center">
                      {reward.status === "available" ? (
                        <button
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={claimingRewardId === reward.id}
                          className="w-full rounded-full border border-white bg-white px-4 py-2 text-[11px] font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
                        >
                          {claimingRewardId === reward.id ? "Claiming..." : "Claim"}
                        </button>
                      ) : reward.status === "claimed" ? (
                        <div className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-[11px] font-medium text-white/60">
                          Claimed
                        </div>
                      ) : (
                        <div className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-[11px] font-medium text-white/60">
                          Expired
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Membership Tiers Overview */}
        <div className="mt-12">
          <h3 className="mb-6 text-center text-[11px] font-medium uppercase tracking-wider text-[#999999] md:text-[12px]">
            MEMBERSHIP TIERS OVERVIEW
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ORDERED_TIERS.map((tierStatus, index) => {
              const tier = LOYALTY_TIERS[tierStatus]
              const isCurrentTier = currentTierIndex === index
              const isBelowCurrent = index < currentTierIndex
              const isAboveCurrent = index > currentTierIndex
              const tiltClass = index % 2 === 0 ? "[transform:rotate(-2deg)]" : "[transform:rotate(2deg)]"

              return (
                <div
                  key={tierStatus}
                  className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                    isCurrentTier ? "border-[#CCCCCC] shadow-md ring-2 ring-[#E5E5E5]" : "border-[#F0F0F0]"
                  }`}
                >
                  {isCurrentTier && (
                    <div className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-[#999999]">
                      CURRENT TIER
                    </div>
                  )}

                  {/* Tilted membership card image */}
                  <div
                    className={`relative mb-4 transform transition-transform duration-300 ${tiltClass} hover:[transform:rotate(0deg)_translateY(-4px)]`}
                  >
                    <Image
                      src={tier.imageSrc || "/placeholder.svg"}
                      alt={tier.label}
                      width={260}
                      height={160}
                      className="w-full rounded-none object-cover shadow-md"
                    />
                  </div>

                  <div className="mb-3 text-center">
                    <p className="text-[13px] font-medium uppercase tracking-wide text-[#111111]">{tierStatus}</p>
                  </div>

                  <div className="mb-4 text-center">
                    <p className="mb-1 text-[20px] font-medium text-black">{tier.price}</p>
                    <p className="text-[11px] text-[#999999]">{tier.value}</p>
                  </div>

                  <div className="mt-auto space-y-2">
                    <button className="w-full rounded-full border border-black bg-white px-4 py-2.5 text-center text-[12px] font-medium text-black transition-colors hover:bg-[#F5F5F5]">
                      View Details
                    </button>

                    {isCurrentTier ? (
                      <div className="w-full rounded-full bg-black px-4 py-2.5 text-center text-[12px] font-medium text-white">
                        Current tier
                      </div>
                    ) : isBelowCurrent ? (
                      <div className="w-full rounded-full bg-[#F5F5F5] px-4 py-2.5 text-center text-[12px] font-medium text-[#999999]">
                        Included
                      </div>
                    ) : (
                      <button className="w-full rounded-full bg-black px-4 py-2.5 text-center text-[12px] font-medium text-white transition-colors hover:bg-[#333333]">
                        Upgrade to {tierStatus.charAt(0).toUpperCase() + tierStatus.slice(1)}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
