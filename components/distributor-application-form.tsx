'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Building2, Mail, User, MapPin, Lock } from 'lucide-react'
import { submitDistributorApplication } from '@/app/actions/distributor-application'

export function DistributorApplicationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await submitDistributorApplication(formData)

      if (result.success) {
        router.push('/distributor/apply/success')
      } else {
        setError(result.error || 'Failed to submit application')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('[v0] Application submission error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white border-zinc-200">
      <CardContent className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-zinc-50 border border-zinc-300 text-zinc-800 text-sm">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-500" />
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  disabled={isLoading}
                  className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-700">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  disabled={isLoading}
                  className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                placeholder="john.doe@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                placeholder="Minimum 8 characters"
              />
              <p className="text-xs text-zinc-400">
                Must be at least 8 characters long
              </p>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4 pt-4 border-t border-zinc-200">
            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-500" />
              Company Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-zinc-700">
                Company Name *
              </Label>
              <Input
                id="companyName"
                name="companyName"
                required
                disabled={isLoading}
                className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                placeholder="Your Company Ltd."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingRegion" className="text-zinc-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Operating Region *
              </Label>
              <Input
                id="operatingRegion"
                name="operatingRegion"
                required
                disabled={isLoading}
                className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0"
                placeholder="e.g., North America, Europe, Asia-Pacific"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold py-6 text-base transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-xs text-center text-zinc-400">
            By submitting this application, you agree to our terms of partnership
            and acknowledge that all information provided is accurate.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
