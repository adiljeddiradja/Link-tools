import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getProfile() {
    const { data, error } = await supabase.from('profiles').select('handle').limit(1).single()
    if (data) {
        console.log('FOUND_HANDLE:', data.handle)
    } else {
        console.log('NO_PROFILE_FOUND')
    }
}

getProfile()
