import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function ExamplePage() {
  const supabase = await createServerSupabaseClient()
  
  // Data fetching is done server-side
  const { data } = await supabase.from('your_table').select()
  
  return (
    <div>
      {/* Render your data here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
} 