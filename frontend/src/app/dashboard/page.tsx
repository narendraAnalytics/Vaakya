import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import DashboardClient from './DashboardClient'

export type VaultDocument = {
  id: string
  document_type: string
  parties?: Array<{ name: string; role?: string }>
  created_at: string
  status: string
  final_pdf_url?: string
  risk_flags?: Array<unknown>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const username: string =
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'

  let documents: VaultDocument[] = []
  if (token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vault`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const json = await res.json()
        documents = Array.isArray(json) ? json : (json.documents ?? [])
      }
    } catch {
      // Backend unavailable — show empty state
    }
  }

  return <DashboardClient username={username} documents={documents} />
}
