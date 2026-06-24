import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

  const username: string =
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'

  // Service role key bypasses RLS — safe here because this is a Server Component
  // (env var has no NEXT_PUBLIC_ prefix, never sent to the browser).
  // Explicit .eq('user_id', user.id) provides the same security as RLS.
  let documents: VaultDocument[] = []
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: rows } = await admin
      .from('vault_documents')
      .select('id, document_type, parties, updated_at, esign_status, final_pdf_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    documents = (rows ?? []).map(row => ({
      id: row.id as string,
      document_type: (row.document_type as string) || '',
      parties: (row.parties as Array<{ name: string; role?: string }>) || [],
      created_at: (row.updated_at as string) || '',
      status: (row.esign_status as string) || 'processing',
      final_pdf_url: (row.final_pdf_url as string) || '',
      risk_flags: [],
    }))
  } catch (err) {
    console.error('[dashboard] vault query failed:', err)
  }

  return <DashboardClient username={username} documents={documents} />
}
