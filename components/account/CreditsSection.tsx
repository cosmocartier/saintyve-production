"use client"

import type React from "react"
import { Award, ExternalLink, Package, Star, Users, Video, X } from "lucide-react"

interface Order {
  id: string
  created_at: string
  status: string
  credits_to_award?: number
  credits_collected?: boolean
}

interface TiktokSubmission {
  id: string
  video_url: string
  status: string
  credits_awarded: number
  created_at: string
  credits_collected?: boolean
}

interface TrustpilotSubmission {
  id: string
  email: string
  status: string
  credits_amount: number
  created_at: string
  review_url: string
  credits_collected?: boolean
}

interface Referral {
  id: string
  referred_email: string
  status: string
  credits_awarded: number
  created_at: string
  has_purchased?: boolean
}

interface CreditsSectionProps {
  credits: number
  welcomeCreditsAvailable: boolean
  isClaimingWelcomeCredits: boolean
  handleClaimWelcomeCredits: () => Promise<void>
  trustpilotEmail: string
  setTrustpilotEmail: (email: string) => void
  isSubmittingTrustpilot: boolean
  handleSubmitTrustpilot: () => Promise<void>
  tiktokVideoUrl: string
  setTiktokVideoUrl: (url: string) => void
  isSubmittingTiktok: boolean
  handleSubmitTiktok: (e: React.FormEvent) => Promise<void>
  pendingOrderCredits: Order[]
  handleCollectOrderCredits: (orderId: string) => Promise<void>
  tiktokSubmissions: TiktokSubmission[]
  handleCollectTiktokCredits: (submissionId: string, creditsAmount: number) => Promise<void>
  handleDeleteSubmission: (submissionId: string, source: "tiktok" | "trustpilot") => Promise<void>
  trustpilotSubmissions: TrustpilotSubmission[]
  handleCollectTrustpilotCredits: (submissionId: string, creditsAmount: number) => Promise<void>
  referrals: Referral[]
  handleCollectReferralCredits: (referralId: string) => Promise<void>
  isCollectingCredits: string | null
}

export function CreditsSection({
  credits,
  welcomeCreditsAvailable,
  isClaimingWelcomeCredits,
  handleClaimWelcomeCredits,
  trustpilotEmail,
  setTrustpilotEmail,
  isSubmittingTrustpilot,
  handleSubmitTrustpilot,
  tiktokVideoUrl,
  setTiktokVideoUrl,
  isSubmittingTiktok,
  handleSubmitTiktok,
  pendingOrderCredits,
  handleCollectOrderCredits,
  tiktokSubmissions,
  handleCollectTiktokCredits,
  handleDeleteSubmission,
  trustpilotSubmissions,
  handleCollectTrustpilotCredits,
  referrals,
  handleCollectReferralCredits,
  isCollectingCredits,
}: CreditsSectionProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900">CREDITS</h2>
          <div className="flex items-center gap-2 px-6 py-3 bg-transparent text-black">
            <span className="text-lg font-medium">{credits}</span>
            <span className="text-xs">CREDITS</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Credit Value Info */}

          {/* Ways to Earn Credits */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900 mb-4">EARN MORE CREDITS</h3>
            <div className="space-y-12">
              {/* Welcome Credits */}
              {welcomeCreditsAvailable && (
                <>
                  <div className="border border-black/10 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium tracking-wide mb-1">WELCOME OFFER</h4>
                        <p className="text-xs text-zinc-600 mb-3">
                          Claim your one-time welcome bonus of 15 free credits!
                        </p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handleClaimWelcomeCredits}
                            disabled={isClaimingWelcomeCredits}
                            className="flex h-11 items-center justify-center rounded-full bg-black px-6 text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 lg:h-12"
                          >
                            {isClaimingWelcomeCredits ? "CLAIMING..." : "CLAIM"}
                          </button>
                          <div className="text-right">
                            <p className="text-lg text-green-600 font-medium">+15</p>
                            <p className="text-xs text-zinc-500">CREDITS</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[#E5E5E5]" />
                </>
              )}

              {/* Trustpilot Review */}
              <>
                <div className="border border-black/10 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium tracking-wide mb-1">TRUSTPILOT REVIEW</h4>
                      <p className="text-xs text-zinc-600 mb-4">Write a 5-star review on Trustpilot and earn credits</p>
                      <div className="space-y-4">
                        <a
                          href="https://www.trustpilot.com/review/designerdrip.store"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 lg:h-12"
                        >
                          WRITE REVIEW
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <div className="border-t border-gray-200" />

                        <div className="space-y-2">
                          <input
                            type="email"
                            value={trustpilotEmail}
                            onChange={(e) => setTrustpilotEmail(e.target.value)}
                            placeholder="Email used for review"
                            className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none disabled:opacity-50"
                            disabled={isSubmittingTrustpilot}
                          />
                          <button
                            onClick={handleSubmitTrustpilot}
                            disabled={isSubmittingTrustpilot || !trustpilotEmail.trim()}
                            className="flex h-11 w-full items-center justify-center rounded-full bg-black text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 lg:h-12"
                          >
                            {isSubmittingTrustpilot ? "SUBMITTING..." : "SUBMIT FOR VERIFICATION"}
                          </button>
                        </div>
                      </div>
                      <div className="text-right mt-4">
                        <p className="text-lg text-green-600 font-medium">+25</p>
                        <p className="text-xs text-zinc-500">CREDITS</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-px bg-[#E5E5E5]" />
              </>

              {/* TikTok Video */}
              <>
                <div className="border border-black/10 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium tracking-wide mb-1">TIKTOK VIDEO</h4>
                      <p className="text-xs text-zinc-600 mb-4">
                        Post a TikTok video featuring our products and earn credits
                      </p>
                      <form onSubmit={handleSubmitTiktok} className="space-y-2">
                        <input
                          type="url"
                          value={tiktokVideoUrl}
                          onChange={(e) => setTiktokVideoUrl(e.target.value)}
                          placeholder="Paste TikTok video URL"
                          className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none disabled:opacity-50"
                          disabled={isSubmittingTiktok}
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingTiktok || !tiktokVideoUrl.trim()}
                          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 lg:h-12"
                        >
                          {isSubmittingTiktok ? "SUBMITTING..." : "SUBMIT FOR VERIFICATION"}
                        </button>
                      </form>
                      <div className="text-right mt-4">
                        <p className="text-lg text-green-600 font-medium">+100</p>
                        <p className="text-xs text-zinc-500">CREDITS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>

          {/* Submissions Section */}
          {(tiktokSubmissions.length > 0 || trustpilotSubmissions.length > 0 || pendingOrderCredits.length > 0) && (
            <div>
              <h3 className="text-sm font-medium tracking-widest uppercase mb-4">YOUR SUBMISSIONS</h3>
              <div className="space-y-3">
                {/* Pending Order Credits */}
                {pendingOrderCredits.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-[#ECECEC] bg-white p-4 hover:border-black/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Package className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Order Bonus: #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {order.status === "processing" ? (
                          <button
                            onClick={() => handleCollectOrderCredits(order.id)}
                            disabled={isCollectingCredits === order.id}
                            className="h-9 px-4 rounded-full bg-black text-white text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider font-normal"
                          >
                            {isCollectingCredits === order.id ? "COLLECTING..." : "COLLECT"}
                          </button>
                        ) : (
                          <span className="inline-block px-3 py-1.5 text-xs rounded-full tracking-wider bg-black text-white uppercase">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* TikTok Submissions */}
                {tiktokSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-lg border border-[#ECECEC] bg-white p-4 hover:border-black/20 transition-colors relative"
                  >
                    {submission.status === "rejected" && (
                      <button
                        onClick={() => handleDeleteSubmission(submission.id, "tiktok")}
                        className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition-colors"
                        title="Remove submission"
                      >
                        <X className="w-4 h-4 text-zinc-500 hover:text-black" />
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Video className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">TikTok Video</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {submission.status === "approved" ? (
                          <button
                            onClick={() => handleCollectTiktokCredits(submission.id, submission.credits_awarded)}
                            disabled={isCollectingCredits === submission.id}
                            className="h-9 px-4 rounded-full bg-black text-white text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider font-normal"
                          >
                            {isCollectingCredits === submission.id ? "COLLECTING..." : "COLLECT"}
                          </button>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 text-xs rounded-full tracking-wider uppercase ${
                              submission.status === "rejected" ? "bg-red-100 text-red-800" : "bg-black text-white"
                            }`}
                          >
                            {submission.status === "rejected" ? "REJECTED" : "PENDING"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {trustpilotSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-lg border border-[#ECECEC] bg-white p-4 hover:border-black/20 transition-colors relative"
                  >
                    {submission.status === "rejected" && (
                      <button
                        onClick={() => handleDeleteSubmission(submission.id, "trustpilot")}
                        className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition-colors"
                        title="Remove submission"
                      >
                        <X className="w-4 h-4 text-zinc-500 hover:text-black" />
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Star className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Trustpilot Review</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {submission.status === "approved" ? (
                          <button
                            onClick={() => handleCollectTrustpilotCredits(submission.id, submission.credits_amount)}
                            disabled={isCollectingCredits === submission.id}
                            className="h-9 px-4 rounded-full bg-black text-white text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider font-normal"
                          >
                            {isCollectingCredits === submission.id ? "COLLECTING..." : "COLLECT"}
                          </button>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 text-xs rounded-full tracking-wider uppercase ${
                              submission.status === "rejected" ? "bg-red-100 text-red-800" : "bg-black text-white"
                            }`}
                          >
                            {submission.status === "rejected" ? "REJECTED" : "PENDING"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Referrals */}
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-lg border border-[#ECECEC] bg-white p-4 hover:border-black/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Users className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Friend Referral</p>
                          <p className="text-xs text-zinc-500">{new Date(referral.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {referral.has_purchased ? (
                          <button
                            onClick={() => handleCollectReferralCredits(referral.id)}
                            disabled={isCollectingCredits === referral.id}
                            className="h-9 px-4 rounded-full bg-black text-white text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider font-normal"
                          >
                            {isCollectingCredits === referral.id ? "COLLECTING..." : "COLLECT"}
                          </button>
                        ) : (
                          <span className="inline-block px-3 py-1.5 text-xs rounded-full tracking-wider bg-black text-white uppercase">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Credits Message */}
          {credits === 0 && pendingOrderCredits.length === 0 && (
            <div className="text-center py-8 border border-dashed border-black/10">
              <Award className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm text-zinc-500 mb-1">No credits yet</p>
              <p className="text-xs text-zinc-400">Start earning credits using the methods above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
