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

  const username: string =
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'

  let documents: VaultDocument[] = []
  try {
    // Refresh JWT in-memory so RLS sees a valid auth.uid() for this request.
    // proxy.ts doesn't refresh sessions, so cookies may carry an expired token.
    await supabase.auth.refreshSession()

    const { data: rows, error: qErr } = await supabase
      .from('vault_documents')
      .select('id, document_type, parties, created_at, updated_at, esign_status, final_pdf_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (qErr) console.error('[dashboard] vault query error:', qErr.message)

    documents = (rows ?? []).map(row => ({
      id: row.id as string,
      document_type: (row.document_type as string) || '',
      parties: (row.parties as Array<{ name: string; role?: string }>) || [],
      created_at: (row.created_at as string) || (row.updated_at as string) || '',
      status: (row.esign_status as string) || 'processing',
      final_pdf_url: (row.final_pdf_url as string) || '',
      risk_flags: [],
    }))
  } catch (err) {
    console.error('[dashboard] vault query failed:', err)
  }

  return <DashboardClient username={username} documents={documents} />
}
