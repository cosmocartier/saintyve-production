"use client"

import type React from "react"

import { Switch } from "@/components/ui/switch"

interface SettingsSectionProps {
  emailNotifications: boolean
  handleEmailNotificationsToggle: (checked: boolean) => void
  marketingEmails: boolean
  handleMarketingEmailsToggle: (checked: boolean) => void
  isChangingPassword: boolean
  setIsChangingPassword: (value: boolean) => void
  passwordForm: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  setPasswordForm: (form: { currentPassword: string; newPassword: string; confirmPassword: string }) => void
  passwordError: string | null
  passwordSuccess: string | null
  setPasswordError: (error: string | null) => void
  setPasswordSuccess: (success: string | null) => void
  handleChangePassword: (e: React.FormEvent) => void
}

export default function SettingsSection({
  emailNotifications,
  handleEmailNotificationsToggle,
  marketingEmails,
  handleMarketingEmailsToggle,
  isChangingPassword,
  setIsChangingPassword,
  passwordForm,
  setPasswordForm,
  passwordError,
  passwordSuccess,
  setPasswordError,
  setPasswordSuccess,
  handleChangePassword,
}: SettingsSectionProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900 mb-8">SETTINGS</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <div>
              <p className="text-sm font-medium tracking-wide">Email Notifications</p>
              <p className="text-xs text-zinc-500">Receive updates about your orders</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsToggle}
              className="data-[state=checked]:bg-black"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <div>
              <p className="text-sm font-medium tracking-wide">Marketing Emails</p>
              <p className="text-xs text-zinc-500">Get exclusive offers and updates</p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={handleMarketingEmailsToggle}
              className="data-[state=checked]:bg-black"
            />
          </div>

          <div className="py-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium tracking-wide">Password</p>
                <p className="text-xs text-zinc-500">Change your account password</p>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex h-12 items-center justify-center rounded-full border border-black bg-transparent px-6 text-xs uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white lg:h-12"
                >
                  CHANGE
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form
                onSubmit={handleChangePassword}
                className="space-y-4 mt-4 p-4 bg-zinc-50 border border-black/10 rounded-lg"
              >
                <div>
                  <label className="text-xs text-zinc-500 tracking-widest uppercase mb-2 block">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 tracking-widest uppercase mb-2 block">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full rounded-full border border-[#D4D4D4] bg-white px-4 py-3 text-sm text-black placeholder:text-[#9CA3AF] focus:border-black focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-600">{passwordSuccess}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-xs uppercase tracking-wider text-white transition-all hover:bg-zinc-800 lg:h-12"
                  >
                    UPDATE PASSWORD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                      setPasswordError(null)
                      setPasswordSuccess(null)
                    }}
                    className="flex h-12 items-center justify-center rounded-full border border-black bg-transparent px-8 text-xs uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white lg:h-12"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
