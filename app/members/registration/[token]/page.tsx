import { createClient } from "@/lib/supabase/server"
import { RegistrationPageClient } from "@/components/registration/registration-page-client"

interface Props {
  params: { token: string }
}

export default async function MembersRegistrationPage({ params }: Props) {
  const { token } = params
  const supabase = await createClient()

  const { data: tokenData, error } = await supabase
    .from("registration_tokens")
    .select("id, email, used, expires_at")
    .eq("id", token)
    .single()

  const isInvalid = !!(error || !tokenData)
  const isUsed = tokenData?.used === true
  const isExpired = !!(tokenData && new Date(tokenData.expires_at) < new Date())

  return (
    <RegistrationPageClient
      token={token}
      email={tokenData?.email ?? ""}
      isInvalid={isInvalid}
      isUsed={isUsed}
      isExpired={isExpired}
    />
  )
}


