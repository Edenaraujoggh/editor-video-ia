import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oyrhoaneifsbjcldsvvi.supabase.co'
const supabaseKey = 'sb_publishable_7z3Fs8u7hQEjxpZMFL4Pxw_d4teDEjY'

export const supabase = createClient(supabaseUrl, supabaseKey)