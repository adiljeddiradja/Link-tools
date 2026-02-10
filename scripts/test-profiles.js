
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testProfiles() {
    console.log('--- Testing Profiles ---');
    const handle = 'test-profile-' + Math.floor(Math.random() * 1000);

    // 1. Create Profile
    const { data: profile, error: createError } = await supabase
        .from('profiles')
        .insert([{
            user_id: 'test-user',
            handle: handle,
            display_name: 'Test Profile',
            theme_color: 'purple'
        }])
        .select()
        .single();

    if (createError) {
        console.error('Create Profile Error:', createError.message);
        return;
    }
    console.log('✅ Profile Created:', profile.handle);

    // 2. Add Link to Profile
    const { data: link, error: linkError } = await supabase
        .from('links')
        .insert([{
            profile_id: profile.id,
            user_id: 'test-user',
            original_url: 'https://google.com',
            slug: 'test-link-' + Math.floor(Math.random() * 1000),
            title: 'Google',
            is_for_bio: true
        }])
        .select()
        .single();

    if (linkError) {
        console.error('Add Link Error:', linkError.message);
    } else {
        console.log('✅ Link Added to Profile:', link.slug);
    }

    // 3. Fetch Bio Page Data
    const { data: fetchedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .single();

    if (fetchError || !fetchedProfile) {
        console.error('Fetch Profile Error:', fetchError?.message);
    } else {
        console.log('✅ Fetched Profile by Handle:', fetchedProfile.display_name);
    }

    // Cleanup
    console.log('Cleaning up...');
    await supabase.from('links').delete().eq('id', link.id);
    await supabase.from('profiles').delete().eq('id', profile.id);
    console.log('✅ Cleanup done.');
}

testProfiles();
