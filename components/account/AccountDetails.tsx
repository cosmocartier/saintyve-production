"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/supabase"

interface AccountDetailsProps {
  user: User
  profile: Profile | null
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  formData: {
    first_name: string
    last_name: string
    phone: string
    address_street: string
    address_city: string
    address_state: string
    address_zip: string
    address_country: string
  }
  setFormData: (data: any) => void
  handleSaveProfile: () => void
  handleCancelEdit: () => void
  verificationMessage: string | null
  isResendingVerification: boolean
  handleResendVerification: () => void
  memberSince: string
  COUNTRIES: string[]
}

export default function AccountDetails({
  user,
  profile,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  handleSaveProfile,
  handleCancelEdit,
  verificationMessage,
  isResendingVerification,
  handleResendVerification,
  memberSince,
  COUNTRIES,
}: AccountDetailsProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
        <h2 className="mb-6 text-xl font-normal lg:text-2xl">Account Details</h2>

        {user && !user.email_confirmed_at && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">Email Not Verified</p>
                <p className="text-xs text-yellow-700">
                  Please check your inbox and verify your email address to access all features.
                </p>
                {verificationMessage && (
                  <p className="text-xs text-yellow-700 mt-2 font-medium">{verificationMessage}</p>
                )}
              </div>
              <button
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 lg:h-12"
              >
                {isResendingVerification ? "SENDING..." : "RESEND EMAIL"}
              </button>
            </div>
          </div>
        )}

        {user && user.email_confirmed_at && (
          <div className="mb-6 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">Email Verified</p>
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="space-y-6">
              {/* Account Information Section */}
              <div>
                <h3 className="text-xs text-zinc-500 tracking-widest uppercase mb-4 font-medium">
                  ACCOUNT INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">EMAIL ADDRESS</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">MEMBER SINCE</p>
                    <p className="text-sm">{memberSince}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">FIRST NAME</p>
                    <p className="text-sm">{profile?.first_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">LAST NAME</p>
                    <p className="text-sm">{profile?.last_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">PHONE</p>
                    <p className="text-sm">{(profile as any)?.phone || "Not set"}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="pt-6 border-t border-black/10">
                <h3 className="text-xs text-zinc-500 tracking-widest uppercase mb-4 font-medium">SHIPPING ADDRESS</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">STREET ADDRESS</p>
                    <p className="text-sm">{(profile as any)?.address_street || "Not set"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">CITY</p>
                      <p className="text-sm">{(profile as any)?.address_city || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">STATE</p>
                      <p className="text-sm">{(profile as any)?.address_state || "Not set"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">ZIP CODE</p>
                      <p className="text-sm">{(profile as any)?.address_zip || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">COUNTRY</p>
                      <p className="text-sm">{(profile as any)?.address_country || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="flex h-12 items-center justify-center rounded-full border border-black bg-transparent px-8 text-xs uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white lg:h-14"
              >
                EDIT INFORMATION
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              {/* Account Information Section */}
              <div>
                <h3 className="text-xs text-zinc-500 tracking-widest uppercase mb-4 font-medium">
                  ACCOUNT INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">FIRST NAME</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">LAST NAME</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">PHONE</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="pt-6 border-t border-black/10">
                <h3 className="text-xs text-zinc-500 tracking-widest uppercase mb-4 font-medium">SHIPPING ADDRESS</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">STREET ADDRESS</label>
                    <input
                      type="text"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">CITY</label>
                      <input
                        type="text"
                        value={formData.address_city}
                        onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                        className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">STATE</label>
                      <input
                        type="text"
                        value={formData.address_state}
                        onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                        className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">ZIP CODE</label>
                      <input
                        type="text"
                        value={formData.address_zip}
                        onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                        className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 tracking-widest uppercase mb-1 block">COUNTRY</label>
                      <select
                        value={formData.address_country}
                        onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                        className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                      >
                        <option value="">Select a country</option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSaveProfile}
                className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 lg:h-14"
              >
                SAVE CHANGES
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex h-12 items-center justify-center rounded-full border border-black bg-transparent px-8 text-xs uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white lg:h-14"
              >
                CANCEL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
