
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('links').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            if (error.code === 'PGRST301') {
                console.error('Hint: The table "links" might not exist. Did you run the SQL schema?');
            }
        } else {
            console.log('Connection successful! Table "links" is accessible.');
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

testConnection();
