import { createClient } from '@supabase/supabase-js'

const supabaseUrl = `https://esavfffjfcrzjivqltvp.supabase.co`
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here' // You'll need to add this to .env.local

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveSecurityReport(report: any) {
  const { data, error } = await supabase
    .from('security_reports')
    .insert([report])
    .select()

  if (error) throw error
  return data
}

export async function getSecurityReports() {
  const { data, error } = await supabase
    .from('security_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
