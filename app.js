// REPLACE THESE WITH YOUR ACTUAL PROJECT CREDENTIALS
const SUPABASE_URL = 'https://ehkqimqvucictvwkrail.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wxpKhcAQ4NNyDAG5JvfkxA_Ofz6FMFR';

// Use 'sb' here to avoid the naming conflict
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


let selectedTable = null;
const MANAGER_ID = '5c7c9d0b-422e-4c91-b972-7fa16497bb9f';
const MENU = ["Pintje", "Cola", "Witte Wijn", "Frietjes", "Bitterballen"];


// 1. App Initialization
window.onload = () => {
    generateTableGrid();
    checkUser();
};

function generateTableGrid() {
    const grid = document.getElementById('table-grid');
    for (let i = 1; i <= 50; i++) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerText = i;
        div.onclick = () => openTable(i);
        grid.appendChild(div);
    }
}

// 2. View Management
function showView(id) {
    ['view-login', 'view-tables', 'view-order', 'view-history'].forEach(v => {
        document.getElementById(v).classList.add('hidden');
    });
    document.getElementById(id).classList.remove('hidden');
}

// 3. Auth
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else showView('view-tables');
}

async function checkUser() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) showView('view-tables');
}


function openTable(num) {
    selectedTable = num;
    document.getElementById('current-table-title').innerText = `Table ${num}`;
    renderMenu(); // Draw the +/- buttons
    showView('view-order');
    fetchCurrentTableOrders();
}

function renderMenu() {
    const container = document.getElementById('menu-items');
    container.innerHTML = MENU.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; margin: 5px 0; border-radius: 8px;">
            <span><strong>${item}</strong></span>
            <div>
                <button onclick="removeItem('${item}')" style="background: #ff4d4d; width: 40px;">-</button>
                <button onclick="addItem('${item}')" style="background: #3ecf8e; width: 40px;">+</button>
            </div>
        </div>
    `).join('');
}

// Add an item (The + button)
async function addItem(itemName) {
    const { error } = await sb.from('orders').insert([{
        table_number: selectedTable,
        content: itemName,
        user_id: MANAGER_ID
    }]);

    if (error) alert(error.message);
    else fetchCurrentTableOrders();
}

// Remove one instance of an item (The - button)
async function removeItem(itemName) {
    // 1. Find the latest ID of this specific item at this table
    const { data, error } = await sb.from('orders')
        .select('id')
        .eq('table_number', selectedTable)
        .eq('content', itemName)
        .order('created_at', { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        // 2. Delete that specific ID
        await sb.from('orders').delete().eq('id', data[0].id);
        fetchCurrentTableOrders();
    }
}

async function fetchCurrentTableOrders() {
    const { data, error } = await sb.from('orders')
        .select('*')
        .eq('table_number', selectedTable)
        .order('created_at', { ascending: true });

    // Group items for a cleaner display (e.g., "3x Pintje")
    const summary = data.reduce((acc, curr) => {
        acc[curr.content] = (acc[curr.content] || 0) + 1;
        return acc;
    }, {});

    const container = document.getElementById('current-items');
    container.innerHTML = Object.entries(summary).map(([name, count]) => `
        <div class="order-item">
            <span>${count}x ${name}</span>
        </div>
    `).join('') || '<p>No items yet</p>';
}

// 5. History Logic
async function loadHistory() {
    showView('view-history');
    const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });

    document.getElementById('history-list').innerHTML = data.map(item => `
        <div class="order-item">
            <strong>T${item.table_number}:</strong> ${item.content}
            <button class="btn-del" onclick="deleteItem(${item.id})">X</button>
        </div>
    `).join('');
}

async function logout() {
    await sb.auth.signOut();
    location.reload();
}