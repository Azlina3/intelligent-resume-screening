import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  const { data, error } = await supabase
    .from('interview')
    .select(`
      interview_id,
      scheduled_at,
      location_or_link,
      status,
      application:application_id (
        candidate:candidate_id ( name ),
        job:job_id ( job_title )
      )
    `)
  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

testQuery()
