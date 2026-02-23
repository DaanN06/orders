// REPLACE THESE WITH YOUR ACTUAL PROJECT CREDENTIALS
const SUPABASE_URL = 'https://ehkqimqvucictvwkrail.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wxpKhcAQ4NNyDAG5JvfkxA_Ofz6FMFR';

// Use 'sb' here to avoid the naming conflict
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Use 'sb' here
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('data-section').classList.remove('hidden');
    }
}

async function addOrder() {
    const content = document.getElementById('order-data').value;
    const status = document.getElementById('status');

    // Use 'sb' here
    const { error } = await sb
        .from('orders')
        .insert([{
            content: content,
            user_id: '5c7c9d0b-422e-4c91-b972-7fa16497bb9f'
        }]);

    if (error) {
        status.innerText = "❌ Fail: " + error.message;
    } else {
        status.innerText = "✅ Success!";
        document.getElementById('order-data').value = '';
    }
}

async function logout() {
    await sb.auth.signOut();
    location.reload();
}