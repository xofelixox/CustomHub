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

// 2. Theme Data & Persistence
const defaultThemes = [
    { 
        name: "Sylveon", 
        bg: "#fff5f5", 
        panel: "#fa8caa", 
        text: "#000000", 
        grey: "#d85a7a", 
        accent: "#95daf8", 
        sprite: "https://play.pokemonshowdown.com/sprites/gen5ani/sylveon.gif",
        msgs: ["Sylveon!", "Ribbon Dance!", "Fairy Wind!", "Love you!", "Sparkle!"] 
    },
    { 
        name: "Leafeon", 
        bg: "#eed59c", 
        panel: "#89d89b", 
        text: "#000000", 
        grey: "#319c73", 
        accent: "#bd9462", 
        sprite: "https://img.pokemondb.net/sprites/black-white/anim/normal/leafeon.gif",
        msgs: ["Leafeon!", "Leaf Blade!", "Synthesis...", "Fresh Air!", "Photosynthesis!"] 
    }
];

// Load themes from LocalStorage or use defaults
let userThemes = JSON.parse(localStorage.getItem('user_themes')) || defaultThemes;
let currentIdx = parseInt(localStorage.getItem('last_theme_index')) || 0;

function applyTheme(idx) {
    if (!userThemes[idx]) idx = 0;
    const t = userThemes[idx];
    const r = document.documentElement;
    
    // Update CSS Variables
    r.style.setProperty('--bg', t.bg);
    r.style.setProperty('--panel', t.panel);
    r.style.setProperty('--text', t.text);
    r.style.setProperty('--grey', t.grey);
    r.style.setProperty('--accent', t.accent);
    
    // Update Sprite and Button Text
    document.getElementById('pet-sprite').src = t.sprite;
    document.getElementById('theme-toggle').innerText = t.name.toUpperCase();
    
    // Save last used theme
    localStorage.setItem('last_theme_index', idx);
}

// 3. Theme Manager (Editor) Logic
const overlay = document.getElementById('editor-overlay');
const manageBtn = document.getElementById('manage-btn');
const closeBtn = document.getElementById('close-editor');
const saveBtn = document.getElementById('save-theme');

manageBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    renderList();
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

function renderList() {
    const list = document.getElementById('theme-list');
    list.innerHTML = userThemes.map((t, i) => `
        <div class="theme-item">
            <span>${t.name}</span>
            <button class="delete-btn" onclick="deleteTheme(${i})">DELETE</button>
        </div>
    `).join('');
}

window.deleteTheme = (i) => {
    if (userThemes.length <= 1) {
        alert("You must keep at least one theme!");
        return;
    }
    userThemes.splice(i, 1);
    currentIdx = 0;
    saveAndRefresh();
    applyTheme(0);
};

saveBtn.addEventListener('click', () => {
    const rawName = document.getElementById('new-theme-name').value.trim() || "Custom";
    const nameInput = rawName.toLowerCase();
    const spriteInput = document.getElementById('new-theme-sprite').value.trim();
    
    // AUTO-SPRITE LOGIC: If sprite URL is empty, fetch from PokeDB
    let finalSprite = spriteInput;
    if (!finalSprite) {
        // Using animated gen 5 sprites for a nice look
        finalSprite = `https://img.pokemondb.net/sprites/black-white/anim/normal/${nameInput}.gif`;
    }

    const newTheme = {
        name: rawName,
        sprite: finalSprite,
        bg: document.getElementById('color-bg').value,
        panel: document.getElementById('color-panel').value,
        text: document.getElementById('color-text').value,
        grey: document.getElementById('color-grey').value,
        accent: document.getElementById('color-accent').value,
        msgs: [`I am ${rawName}!`, "New Friend!", "Happy!", "Ready to go!"]
    };

    // Verify if sprite exists before saving
    const imgTest = new Image();
    imgTest.src = finalSprite;
    imgTest.onload = () => {
        userThemes.push(newTheme);
        saveAndRefresh();
        overlay.classList.add('hidden');
        currentIdx = userThemes.length - 1;
        applyTheme(currentIdx);
    };
    imgTest.onerror = () => {
        alert("Could not find that Pokémon sprite automatically. Please try a different name or paste a direct image URL!");
    };
});

function saveAndRefresh() {
    localStorage.setItem('user_themes', JSON.stringify(userThemes));
    renderList();
}

// Cycle themes on main button click
document.getElementById('theme-toggle').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % userThemes.length;
    applyTheme(currentIdx);
});

// 4. Pet Interaction Logic
const pet = document.getElementById('pet-sprite');
const speech = document.getElementById('pet-speech');

pet.addEventListener('mousedown', () => {
    pet.style.transform = 'scale(0.8) translateY(20px)';
});

pet.addEventListener('mouseup', () => {
    pet.style.transform = 'scale(1.1) translateY(-20px)';
    
    const currentMsgs = userThemes[currentIdx].msgs || ["Hello!"];
    speech.innerText = currentMsgs[Math.floor(Math.random() * currentMsgs.length)];
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

function updatePoolDisplay() {
    poolDisplay.innerText = pool.length === 0 ? "Empty" : pool.join(", ");
}

document.getElementById('add-to-pool').addEventListener('click', () => {
    const val = poolInput.value.trim();
    if (val) {
        pool.push(val);
        poolInput.value = "";
        updatePoolDisplay();
    }
});

poolInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('add-to-pool').click();
});

document.getElementById('clear-pool').addEventListener('click', () => {
    pool = [];
    resultDisplay.innerText = "???";
    updatePoolDisplay();
});

document.getElementById('choose-btn').addEventListener('click', () => {
    if (pool.length === 0) {
        resultDisplay.innerText = "ADD ITEMS!";
        return;
    }
    resultDisplay.innerText = "ROLLING...";
    setTimeout(() => {
        const choice = pool[Math.floor(Math.random() * pool.length)];
        resultDisplay.innerText = choice.toUpperCase() + "!";
    }, 600);
});

// INITIALIZE
applyTheme(currentIdx);