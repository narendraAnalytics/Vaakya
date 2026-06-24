import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ vaultId: string }> }
) {
  const { vaultId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: doc } = await supabase
    .from('vault_documents')
    .select('id')
    .eq('id', vaultId)
    .eq('user_id', user.id)
    .single()

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await admin.storage
    .from('vaakya-contracts')
    .createSignedUrl(`${user.id}/${vaultId}.pdf`, 3600)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'PDF not ready yet' }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl)
}
