// REPLACE THESE WITH YOUR ACTUAL PROJECT CREDENTIALS
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-public-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login Function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        showDataSection();
    }
}

// Add Data Function
async function addOrder() {
    const content = document.getElementById('order-data').value;
    const status = document.getElementById('status');

    // IMPORTANT: Make sure your table column is named 'content' (or change it below)
    const { error } = await supabase
        .from('orders')
        .insert([{ content: content, user_id: '5c7c9d0b-422e-4c91-b972-7fa16497bb9f' }]);

    if (error) {
        status.innerText = "❌ Fail: " + error.message;
    } else {
        status.innerText = "✅ Success!";
        document.getElementById('order-data').value = '';
    }
}

// UI Helpers
function showDataSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('data-section').classList.remove('hidden');
}

async function logout() {
    await supabase.auth.signOut();
    location.reload();
}