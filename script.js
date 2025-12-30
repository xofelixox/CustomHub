// 1. Clock Logic
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = 
        now.getHours().toString().padStart(2, '0') + ":" + 
        now.getMinutes().toString().padStart(2, '0') + ":" + 
        now.getSeconds().toString().padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();

// 2. Theme Data & Profiles
const defaultThemes = [
    { 
        name: "Sylveon", 
        bg: "#fff5f5", panel: "#fa8caa", text: "#000000", grey: "#d85a7a", accent: "#95daf8", 
        sprite: "https://play.pokemonshowdown.com/sprites/gen5ani/sylveon.gif"
    },
    { 
        name: "Leafeon", 
        bg: "#eed59c", panel: "#89d89b", text: "#000000", grey: "#319c73", accent: "#bd9462", 
        sprite: "https://img.pokemondb.net/sprites/black-white/anim/normal/leafeon.gif"
    },
    { 
        name: "Arcanine", 
        bg: "#fdf2e9", panel: "#f08030", text: "#000000", grey: "#c06828", accent: "#f8d030", 
        sprite: "https://img.pokemondb.net/sprites/black-white/anim/normal/arcanine.gif"
    },
    { 
        name: "Mew", 
        bg: "#fef2f9", panel: "#ffb7da", text: "#000000", grey: "#f096c4", accent: "#b1e5f2", 
        sprite: "https://img.pokemondb.net/sprites/black-white/anim/normal/mew.gif"
    },
    { 
        name: "Mimikyu", 
        bg: "#f4f1d6", panel: "#dccf91", text: "#000000", grey: "#a69a68", accent: "#ef4036", 
        sprite: "https://play.pokemonshowdown.com/sprites/gen5ani/mimikyu.gif"
    },
    { 
        name: "Reshiram", 
        bg: "#f0f4f7", panel: "#ffffff", text: "#2c3e50", grey: "#bdc3c7", accent: "#3498db", 
        sprite: "https://img.pokemondb.net/sprites/black-white/anim/normal/reshiram.gif"
    },
    { 
        name: "Asuka", 
        bg: "#3d0b0b", panel: "#e63946", text: "#ffffff", grey: "#f1faee", accent: "#ffb703", 
        sprite: "https://static.wikia.nocookie.net/all-worlds-alliance/images/2/24/9abc7cf4bd20d565c5f7da6df73a9bdf.png/revision/latest?cb=20190106111029"
    }
];

let userThemes = JSON.parse(localStorage.getItem('user_themes')) || defaultThemes;
let currentIdx = parseInt(localStorage.getItem('last_theme_index')) || 0;
let editingIdx = null; 

// NEW: Function to render the profile buttons in the top-right
function renderThemeNav() {
    const nav = document.getElementById('theme-nav');
    if (!nav) return;
    nav.innerHTML = userThemes.map((t, i) => `
        <button class="nav-tab ${i === currentIdx ? 'active' : ''}" onclick="applyTheme(${i})">
            ${t.name.toUpperCase()}
        </button>
    `).join('');
}

function applyTheme(idx) {
    if (!userThemes[idx]) idx = 0;
    currentIdx = idx;
    const t = userThemes[idx];
    updateVisuals(t);
    localStorage.setItem('last_theme_index', idx);
    renderThemeNav(); // Refresh tabs to show which one is active
}

function updateVisuals(config) {
    const r = document.documentElement;
    r.style.setProperty('--bg', config.bg);
    r.style.setProperty('--panel', config.panel);
    r.style.setProperty('--text', config.text);
    r.style.setProperty('--grey', config.grey);
    r.style.setProperty('--accent', config.accent);
    document.getElementById('pet-sprite').src = config.sprite;
}

// 3. Theme Manager Logic
const overlay = document.getElementById('editor-overlay');

function getEditorValues() {
    const rawName = document.getElementById('new-theme-name').value.trim() || "Preview";
    const spriteInput = document.getElementById('new-theme-sprite').value.trim();
    return {
        name: rawName,
        bg: document.getElementById('color-bg').value,
        panel: document.getElementById('color-panel').value,
        text: document.getElementById('color-text').value,
        grey: document.getElementById('color-grey').value,
        accent: document.getElementById('color-accent').value,
        sprite: spriteInput || `https://img.pokemondb.net/sprites/black-white/anim/normal/${rawName.toLowerCase()}.gif`
    };
}

// Live Preview
document.querySelectorAll('.editor-grid input').forEach(input => {
    input.addEventListener('input', () => {
        const preview = getEditorValues();
        updateVisuals(preview);
    });
});

document.getElementById('manage-btn').addEventListener('click', () => {
    overlay.classList.remove('hidden');
    editingIdx = null;
    resetEditorFields();
    renderList();
});

document.getElementById('close-editor').addEventListener('click', () => {
    overlay.classList.add('hidden');
    applyTheme(currentIdx); 
});

document.getElementById('factory-reset').addEventListener('click', () => {
    if(confirm("This will delete all custom themes and reset to the original 7. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});

function renderList() {
    const list = document.getElementById('theme-list');
    list.innerHTML = userThemes.map((t, i) => `
        <div class="theme-item">
            <span style="font-size:10px;">${t.name}</span>
            <div style="display:flex; gap:5px;">
                <button class="mini-btn" style="padding:2px 5px; font-size:8px; background:var(--accent); color:var(--text);" onclick="startEdit(${i})">EDIT</button>
                <button class="mini-btn" style="padding:2px 5px; font-size:8px; background:#ffd700; color:#000;" onclick="cloneTheme(${i})">CLONE</button>
                <button class="delete-btn" onclick="deleteTheme(${i})">X</button>
            </div>
        </div>
    `).join('');
}

window.startEdit = (i) => {
    editingIdx = i;
    const t = userThemes[i];
    fillEditor(t);
    updateVisuals(t);
};

window.cloneTheme = (i) => {
    const cloned = JSON.parse(JSON.stringify(userThemes[i]));
    cloned.name += " (Copy)";
    userThemes.push(cloned);
    saveAndRefresh();
    startEdit(userThemes.length - 1);
};

function fillEditor(t) {
    document.getElementById('new-theme-name').value = t.name;
    document.getElementById('new-theme-sprite').value = t.sprite;
    document.getElementById('color-bg').value = t.bg;
    document.getElementById('color-panel').value = t.panel;
    document.getElementById('color-text').value = t.text;
    document.getElementById('color-grey').value = t.grey;
    document.getElementById('color-accent').value = t.accent;
}

function resetEditorFields() {
    document.getElementById('new-theme-name').value = "";
    document.getElementById('new-theme-sprite').value = "";
}

window.deleteTheme = (i) => {
    if (userThemes.length <= 1) return alert("Keep at least one!");
    userThemes.splice(i, 1);
    currentIdx = 0;
    saveAndRefresh();
    applyTheme(0);
};

document.getElementById('save-theme').addEventListener('click', () => {
    const themeData = getEditorValues();
    if (editingIdx !== null) {
        userThemes[editingIdx] = themeData;
    } else {
        userThemes.push(themeData);
        currentIdx = userThemes.length - 1;
    }
    saveAndRefresh();
    overlay.classList.add('hidden');
    applyTheme(currentIdx);
});

function saveAndRefresh() {
    localStorage.setItem('user_themes', JSON.stringify(userThemes));
    renderList();
    renderThemeNav(); // Keep the profile list updated
}

// 4. Pet Interaction (Time-based Speech)
const pet = document.getElementById('pet-sprite');
const speech = document.getElementById('pet-speech');

pet.addEventListener('mousedown', () => pet.style.transform = 'scale(0.8) translateY(20px)');
pet.addEventListener('mouseup', () => {
    pet.style.transform = 'scale(1.1) translateY(-20px)';
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); 
    let greeting = "";
    if (hour >= 5 && hour < 12) greeting = "Good morning!";
    else if (hour >= 12 && hour < 18) greeting = "Good afternoon!";
    else if (hour >= 18 && hour < 22) greeting = "Good evening!";
    else greeting = "Working late?";
    
    if (day === 0 || day === 6) greeting += " Happy weekend!";
    
    const randomSuffixes = [" Hope you're well!", " Ready to work?", " Let's go!", " :)", " Stay hydrated!"];
    const suffix = randomSuffixes[Math.floor(Math.random() * randomSuffixes.length)];
    
    speech.innerText = greeting + suffix;
    speech.style.visibility = 'visible';
    setTimeout(() => {
        speech.style.visibility = 'hidden';
        pet.style.transform = 'scale(1)';
    }, 1500);
});

// 5. Decision Pool Logic
let pool = [];
const poolInput = document.getElementById('pool-input');
const poolDisplay = document.getElementById('pool-display');
const resultDisplay = document.getElementById('decision-result');

function updatePool() { poolDisplay.innerText = pool.length ? pool.join(", ") : "No items in pool"; }

document.getElementById('add-to-pool').addEventListener('click', () => {
    if (poolInput.value.trim()) {
        pool.push(poolInput.value.trim());
        poolInput.value = "";
        updatePool();
    }
});

document.getElementById('clear-pool').addEventListener('click', () => {
    pool = [];
    resultDisplay.innerText = "???";
    updatePool();
});

document.getElementById('choose-btn').addEventListener('click', () => {
    if (!pool.length) return resultDisplay.innerText = "EMPTY!";
    resultDisplay.innerText = "ROLLING...";
    setTimeout(() => {
        resultDisplay.innerText = pool[Math.floor(Math.random() * pool.length)].toUpperCase() + "!";
    }, 600);
});

// INITIALIZE
renderThemeNav();

applyTheme(currentIdx);
