// Game State Management
const GameState = {
    currentScreen: 'splash',
    playerName: '',
    playerStats: {
        victories: 0,
        stars: 0,
        coins: 100
    },
    deck: [],
    battle: {
        playerDeck: [],
        cpuDeck: [],
        currentRound: 1,
        playerRoundsWon: 0,
        cpuRoundsWon: 0,
        playerSelectedCard: null,
        cpuSelectedCard: null,
        usedPlayerCards: [],
        usedCpuCards: []
    },
    characters: [
        { name: 'Mario', image: 'mario.png', power: 10 },
        { name: 'Luigi', image: 'luigui.png', power: 8 },
        { name: 'Peach', image: 'peach.png', power: 7 },
        { name: 'Bowser', image: 'bowser.png', power: 12 },
        { name: 'Yoshi', image: 'yoshi.png', power: 9 },
        { name: 'Toad', image: 'toad.png', power: 6 },
        { name: 'Wario', image: 'wario.png', power: 11 },
        { name: 'DK', image: 'dk.png', power: 13 },
        { name: 'Birdo', image: 'birdo.png', power: 8 },
        { name: 'Daisy', image: 'daysie.png', power: 7 },
        { name: 'Diddy Kong', image: 'didikong.png', power: 8 },
        { name: 'Bowser Jr', image: 'bowsie.png', power: 9 },
        { name: 'Koopa', image: 'kupa.png', power: 5 },
        { name: 'Koopa Alado', image: 'kupaalado.png', power: 7 },
        { name: 'Shy Guy', image: 'shygy.png', power: 6 },
        { name: 'Boo', image: 'huesitos.png', power: 8 },
        { name: 'Toadette', image: 'toaddete.png', power: 6 },
        { name: 'Wiggler', image: 'weglear.png', power: 7 },
        { name: 'Rey Boo', image: 'reybu.png', power: 10 },
        { name: 'DK Pirata', image: 'dkpirata.png', power: 11 }
    ]
};

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        GameState.currentScreen = screenId;
    }
}

// Initialize Game
function initGame() {
    // Initialize Firebase for multiplayer
    if (typeof initFirebase === 'function') {
        const firebaseInitialized = initFirebase();
        if (firebaseInitialized) {
            console.log('✅ Multiplayer online habilitado');
        } else {
            console.log('⚠️ Multiplayer online no disponible, solo vs CPU');
        }
    }
    
    // Try to load saved game
    const hasExistingPlayer = loadGame();
    
    if (hasExistingPlayer && GameState.playerName) {
        // Skip to main menu if player exists
        setTimeout(() => {
            showScreen('mainMenu');
            updatePlayerDisplay();
        }, 3000);
    } else {
        // Show welcome screen for new players
        setTimeout(() => {
            showScreen('welcomeScreen');
        }, 3000);
    }

    // Setup Welcome Screen
    setupWelcomeScreen();
    
    // Setup Main Menu
    setupMainMenu();
    
    // Setup Deck Builder
    setupDeckBuilder();
    
    // Setup Settings
    setupSettings();
}

// Welcome Screen Setup
function setupWelcomeScreen() {
    const playerInput = document.getElementById('playerName');
    const startBtn = document.getElementById('startBtn');

    // Enable button when name is entered
    playerInput.addEventListener('input', (e) => {
        const name = e.target.value.trim();
        startBtn.disabled = name.length === 0;
    });

    // Handle enter key
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !startBtn.disabled) {
            handleStartGame();
        }
    });

    // Handle start button click
    startBtn.addEventListener('click', handleStartGame);
}

function handleStartGame() {
    const playerInput = document.getElementById('playerName');
    const name = playerInput.value.trim();
    
    if (name) {
        GameState.playerName = name;
        
        // Save immediately to localStorage
        saveGame();
        
        // Add button animation
        const startBtn = document.getElementById('startBtn');
        startBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            startBtn.style.transform = 'scale(1)';
        }, 100);

        // Play sound effect (optional)
        playSound('start');
        
        // Show main menu
        setTimeout(() => {
            showScreen('mainMenu');
            updatePlayerDisplay();
        }, 300);
    }
}

// Main Menu Setup
function setupMainMenu() {
    // Battle Button
    document.getElementById('battleBtn').addEventListener('click', () => {
        playSound('click');
        if (GameState.deck.length !== 4) {
            showNotification('⚠️ Debes definir tu mazo antes de batallar');
            return;
        }
        startAutomaticMatchmaking();
    });

    // Deck Button
    document.getElementById('deckBtn').addEventListener('click', () => {
        playSound('click');
        loadDeckBuilder();
        showScreen('deckScreen');
    });

    // Collection Button
    document.getElementById('collectionBtn').addEventListener('click', () => {
        playSound('click');
        showNotification('Colección próximamente disponible');
    });

    // Settings Button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        playSound('click');
        showScreen('settingsScreen');
        updateSettingsDisplay();
    });
}

function updatePlayerDisplay() {
    const displayName = document.getElementById('displayName');
    if (displayName) {
        displayName.textContent = GameState.playerName;
    }

    // Update stats
    const stats = document.querySelectorAll('.stat-value');
    if (stats.length >= 3) {
        stats[0].textContent = GameState.playerStats.victories;
        stats[1].textContent = GameState.playerStats.stars;
        stats[2].textContent = GameState.playerStats.coins;
    }
}

// Deck Builder Setup
function setupDeckBuilder() {
    // Note: Close button event is handled globally in DOMContentLoaded
    
    // Reset deck button
    document.getElementById('resetDeckBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de reiniciar tu mazo?')) {
            GameState.deck = [];
            renderCharactersGrid();
            updateDeckSlots();
            playSound('click');
        }
    });
    
    // Save deck button
    document.getElementById('saveDeckBtn').addEventListener('click', () => {
        if (GameState.deck.length === 4) {
            saveGame();
            showNotification('¡Mazo guardado exitosamente!');
            playSound('success');
            setTimeout(() => {
                showScreen('mainMenu');
            }, 1500);
        }
    });
}

function loadDeckBuilder() {
    // Load current deck and render everything
    renderCharactersGrid();
    updateDeckSlots();
}

function renderCharactersGrid() {
    const grid = document.getElementById('charactersGrid');
    grid.innerHTML = '';
    
    GameState.characters.forEach((character, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.index = index;
        
        // Check if character is already in deck
        const isInDeck = GameState.deck.some(c => c.name === character.name);
        if (isInDeck) {
            card.classList.add('disabled');
        }
        
        card.innerHTML = `
            <img src="src/images/${character.image}" alt="${character.name}">
            <div class="character-info">
                <div class="character-name">${character.name}</div>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            if (!isInDeck && GameState.deck.length < 4) {
                selectCharacter(index);
            }
        });
        
        grid.appendChild(card);
    });
}

function selectCharacter(index) {
    const character = GameState.characters[index];
    
    if (GameState.deck.length < 4) {
        GameState.deck.push(character);
        playSound('select');
        renderCharactersGrid();
        updateDeckSlots();
    }
}

function removeCharacterFromDeck(slotIndex) {
    if (slotIndex >= 0 && slotIndex < GameState.deck.length) {
        GameState.deck.splice(slotIndex, 1);
        playSound('click');
        renderCharactersGrid();
        updateDeckSlots();
    }
}

function updateDeckSlots() {
    const slots = document.querySelectorAll('.card-slot');
    const saveBtn = document.getElementById('saveDeckBtn');
    
    slots.forEach((slot, index) => {
        slot.innerHTML = '';
        
        if (GameState.deck[index]) {
            const character = GameState.deck[index];
            slot.classList.remove('empty');
            slot.classList.add('filled');
            
            const img = document.createElement('img');
            img.src = `src/images/${character.image}`;
            img.alt = character.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-card';
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeCharacterFromDeck(index);
            });
            
            slot.appendChild(img);
            slot.appendChild(removeBtn);
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            const slotNumber = document.createElement('span');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = index + 1;
            slot.appendChild(slotNumber);
        }
    });
    
    // Enable save button only when deck is complete
    saveBtn.disabled = GameState.deck.length !== 4;
}

// Settings Setup
function setupSettings() {
    // Note: Close button event is handled globally in DOMContentLoaded
    
    const settingsInput = document.getElementById('settingsPlayerName');
    const changeNameBtn = document.getElementById('changeNameBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');
    
    // Enable change button when input has text
    settingsInput.addEventListener('input', (e) => {
        const newName = e.target.value.trim();
        changeNameBtn.disabled = newName.length === 0 || newName === GameState.playerName;
    });
    
    // Handle enter key
    settingsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !changeNameBtn.disabled) {
            changePlayerName();
        }
    });
    
    // Change name button
    changeNameBtn.addEventListener('click', changePlayerName);
    
    // Reset game button
    resetGameBtn.addEventListener('click', () => {
        if (confirm('⚠️ ¿Estás seguro de reiniciar TODO el juego?\n\nSe borrarán:\n- Tu nombre\n- Tu mazo\n- Todas tus estadísticas\n\nEsta acción no se puede deshacer.')) {
            localStorage.removeItem('marioCardsGame');
            playSound('click');
            showNotification('Juego reiniciado. Recargando...');
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    });
}

function changePlayerName() {
    const settingsInput = document.getElementById('settingsPlayerName');
    const newName = settingsInput.value.trim();
    
    if (newName && newName !== GameState.playerName) {
        const oldName = GameState.playerName;
        GameState.playerName = newName;
        saveGame();
        
        playSound('success');
        showNotification(`Nombre cambiado: ${oldName} → ${newName}`);
        
        // Update displays
        updatePlayerDisplay();
        updateSettingsDisplay();
        
        // Clear input and disable button
        settingsInput.value = '';
        document.getElementById('changeNameBtn').disabled = true;
    }
}

function updateSettingsDisplay() {
    // Update current name
    const currentNameDisplay = document.getElementById('currentNameDisplay');
    if (currentNameDisplay) {
        currentNameDisplay.textContent = GameState.playerName;
    }
    
    // Update stats
    document.getElementById('settingsVictories').textContent = GameState.playerStats.victories;
    document.getElementById('settingsStars').textContent = GameState.playerStats.stars;
    document.getElementById('settingsCoins').textContent = GameState.playerStats.coins;
}

// Battle System
function startBattle() {
    // Reset battle state
    GameState.battle = {
        playerDeck: [],
        cpuDeck: [],
        currentRound: 1,
        playerRoundsWon: 0,
        cpuRoundsWon: 0,
        playerSelectedCard: null,
        cpuSelectedCard: null,
        usedPlayerCards: [],
        usedCpuCards: []
    };
    
    // Prepare player deck with random points
    GameState.battle.playerDeck = distributePoints(GameState.deck);
    
    // Create CPU deck
    const cpuCharacters = selectRandomCharacters();
    GameState.battle.cpuDeck = distributePoints(cpuCharacters);
    
    // Show deck presentation
    showDeckPresentation();
}

function selectRandomCharacters() {
    const available = [...GameState.characters];
    const selected = [];
    
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        selected.push({...available[randomIndex]});
        available.splice(randomIndex, 1);
    }
    
    return selected;
}

function distributePoints(deck) {
    const totalPoints = 1200;
    const deckWithPoints = deck.map(card => ({...card}));
    
    // Generate random distribution
    let remaining = totalPoints;
    const minPoints = 200; // Mínimo por carta para evitar cartas demasiado débiles
    
    for (let i = 0; i < deckWithPoints.length - 1; i++) {
        const maxPossible = remaining - (minPoints * (deckWithPoints.length - i - 1));
        const points = Math.floor(Math.random() * (maxPossible - minPoints + 1)) + minPoints;
        deckWithPoints[i].battlePoints = points;
        remaining -= points;
    }
    
    // Last card gets remaining points
    deckWithPoints[deckWithPoints.length - 1].battlePoints = remaining;
    
    // Shuffle to randomize order
    return deckWithPoints.sort(() => Math.random() - 0.5);
}

function showDeckPresentation() {
    showScreen('deckPresentationScreen');
    
    // Display player deck
    const playerShowcase = document.getElementById('playerShowcaseCards');
    playerShowcase.innerHTML = '';
    GameState.battle.playerDeck.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'showcase-card';
        cardEl.innerHTML = `<img src="src/images/${card.image}" alt="${card.name}">`;
        playerShowcase.appendChild(cardEl);
    });
    
    // Display CPU deck
    const cpuShowcase = document.getElementById('cpuShowcaseCards');
    cpuShowcase.innerHTML = '';
    GameState.battle.cpuDeck.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'showcase-card';
        cardEl.innerHTML = `<img src="src/images/${card.image}" alt="${card.name}">`;
        cpuShowcase.appendChild(cardEl);
    });
    
    // Wait 3 seconds then start battle
    setTimeout(() => {
        initializeBattle();
        showScreen('battleScreen');
    }, 3000);
}

function initializeBattle() {
    // Update UI
    document.getElementById('playerNameBattle').textContent = GameState.playerName;
    document.getElementById('currentRound').textContent = GameState.battle.currentRound;
    document.getElementById('playerRoundsWon').textContent = GameState.battle.playerRoundsWon;
    document.getElementById('cpuRoundsWon').textContent = GameState.battle.cpuRoundsWon;
    
    // Clear selections
    document.getElementById('playerSelectedCard').innerHTML = '<div class="card-placeholder">Selecciona tu carta</div>';
    document.getElementById('cpuSelectedCard').innerHTML = '<div class="card-placeholder">?</div>';
    document.getElementById('battleMessageContainer').innerHTML = '';
    
    // Display player hand
    displayPlayerHand();
}

function displayPlayerHand() {
    const handContainer = document.getElementById('playerHand');
    handContainer.innerHTML = '';
    
    GameState.battle.playerDeck.forEach((card, index) => {
        if (GameState.battle.usedPlayerCards.includes(index)) return;
        
        const cardEl = document.createElement('div');
        cardEl.className = 'hand-card';
        cardEl.dataset.index = index;
        cardEl.innerHTML = `
            <img src="src/images/${card.image}" alt="${card.name}">
            <div class="hand-card-info">
                <div class="hand-card-name">${card.name}</div>
                <div class="hand-card-points">⚡ ${card.battlePoints}</div>
            </div>
        `;
        
        cardEl.addEventListener('click', () => selectPlayerCard(index));
        handContainer.appendChild(cardEl);
    });
}

function selectPlayerCard(index) {
    if (GameState.battle.playerSelectedCard !== null) return;
    
    const card = GameState.battle.playerDeck[index];
    GameState.battle.playerSelectedCard = index;
    
    // Display selected card
    const playerCardArea = document.getElementById('playerSelectedCard');
    playerCardArea.innerHTML = `
        <img src="src/images/${card.image}" alt="${card.name}">
        <div class="card-name">${card.name}</div>
        <div class="card-points-hidden">???</div>
    `;
    
    // Disable hand cards
    document.querySelectorAll('.hand-card').forEach(el => {
        el.style.pointerEvents = 'none';
        if (el.dataset.index !== index.toString()) {
            el.style.opacity = '0.5';
        }
    });
    
    playSound('select');
    
    // CPU selects card
    setTimeout(() => cpuSelectCard(), 1000);
}

function cpuSelectCard() {
    // CPU selects random available card
    const availableIndices = GameState.battle.cpuDeck
        .map((_, i) => i)
        .filter(i => !GameState.battle.usedCpuCards.includes(i));
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    GameState.battle.cpuSelectedCard = randomIndex;
    
    const card = GameState.battle.cpuDeck[randomIndex];
    const cpuCardArea = document.getElementById('cpuSelectedCard');
    cpuCardArea.innerHTML = `
        <img src="src/images/${card.image}" alt="${card.name}">
        <div class="card-name">${card.name}</div>
        <div class="card-points-hidden">???</div>
    `;
    
    playSound('select');
    
    // Reveal points and determine winner
    setTimeout(() => revealAndResolve(), 1500);
}

function revealAndResolve() {
    const playerCard = GameState.battle.playerDeck[GameState.battle.playerSelectedCard];
    const cpuCard = GameState.battle.cpuDeck[GameState.battle.cpuSelectedCard];
    
    // Reveal points
    const playerCardArea = document.getElementById('playerSelectedCard');
    playerCardArea.innerHTML = `
        <img src="src/images/${playerCard.image}" alt="${playerCard.name}">
        <div class="card-name">${playerCard.name}</div>
        <div class="card-points revealed">${playerCard.battlePoints}</div>
    `;
    
    const cpuCardArea = document.getElementById('cpuSelectedCard');
    cpuCardArea.innerHTML = `
        <img src="src/images/${cpuCard.image}" alt="${cpuCard.name}">
        <div class="card-name">${cpuCard.name}</div>
        <div class="card-points revealed">${cpuCard.battlePoints}</div>
    `;
    
    playSound('reveal');
    
    // Determine winner
    setTimeout(() => {
        let message = '';
        
        if (playerCard.battlePoints > cpuCard.battlePoints) {
            GameState.battle.playerRoundsWon++;
            message = '¡Ganaste esta ronda!';
            playerCardArea.classList.add('winner');
        } else if (cpuCard.battlePoints > playerCard.battlePoints) {
            GameState.battle.cpuRoundsWon++;
            message = 'CPU ganó esta ronda';
            cpuCardArea.classList.add('winner');
        } else {
            message = '¡Empate!';
        }
        
        // Show message
        const messageContainer = document.getElementById('battleMessageContainer');
        messageContainer.innerHTML = `<div class="round-result-message">${message}</div>`;
        
        // Update rounds won
        document.getElementById('playerRoundsWon').textContent = GameState.battle.playerRoundsWon;
        document.getElementById('cpuRoundsWon').textContent = GameState.battle.cpuRoundsWon;
        
        // Mark cards as used
        GameState.battle.usedPlayerCards.push(GameState.battle.playerSelectedCard);
        GameState.battle.usedCpuCards.push(GameState.battle.cpuSelectedCard);
        
        playSound('roundEnd');
        
        // Check if battle is over
        if (GameState.battle.currentRound >= 4) {
            setTimeout(() => endBattle(), 2500);
        } else {
            setTimeout(() => nextRound(), 2500);
        }
    }, 1000);
}

function nextRound() {
    GameState.battle.currentRound++;
    GameState.battle.playerSelectedCard = null;
    GameState.battle.cpuSelectedCard = null;
    
    // Remove winner classes
    document.getElementById('playerSelectedCard').classList.remove('winner');
    document.getElementById('cpuSelectedCard').classList.remove('winner');
    
    initializeBattle();
}

function endBattle() {
    // Determine final winner
    let title, icon, rewards;
    
    if (GameState.battle.playerRoundsWon > GameState.battle.cpuRoundsWon) {
        title = '¡VICTORIA!';
        icon = '🏆';
        const coinsWon = 100;
        const starsWon = 3;
        GameState.playerStats.victories++;
        GameState.playerStats.coins += coinsWon;
        GameState.playerStats.stars += starsWon;
        rewards = `<div class="reward-item">+${coinsWon} 🪙</div><div class="reward-item">+${starsWon} ⭐</div>`;
    } else if (GameState.battle.cpuRoundsWon > GameState.battle.playerRoundsWon) {
        title = 'DERROTA';
        icon = '😢';
        const coinsWon = 20;
        GameState.playerStats.coins += coinsWon;
        rewards = `<div class="reward-item">+${coinsWon} 🪙</div>`;
    } else {
        title = 'EMPATE';
        icon = '🤝';
        const coinsWon = 50;
        GameState.playerStats.coins += coinsWon;
        rewards = `<div class="reward-item">+${coinsWon} 🪙</div>`;
    }
    
    saveGame();
    
    // Show result screen
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('finalPlayerRounds').textContent = GameState.battle.playerRoundsWon;
    document.getElementById('finalCpuRounds').textContent = GameState.battle.cpuRoundsWon;
    document.getElementById('resultRewards').innerHTML = rewards;
    
    showScreen('battleResultScreen');
    
    // Setup result buttons
    document.getElementById('playAgainBtn').onclick = () => {
        playSound('click');
        startBattle();
    };
    
    document.getElementById('backToMenuBtn').onclick = () => {
        playSound('click');
        showScreen('mainMenu');
        updatePlayerDisplay();
    };
}

// Utility Functions
function playSound(soundType) {
    // Sound effects implementation
    // You can add audio files later
    const soundMap = {
        'click': '🔊',
        'select': '✓',
        'reveal': '💫',
        'roundEnd': '🎵',
        'success': '✨',
        'start': '▶️'
    };
    console.log(`${soundMap[soundType] || '🔊'} Playing sound: ${soundType}`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 1.2rem;
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

// Save game state to localStorage
function saveGame() {
    const dataToSave = {
        playerName: GameState.playerName,
        playerStats: GameState.playerStats,
        deck: GameState.deck
    };
    localStorage.setItem('marioCardsGame', JSON.stringify(dataToSave));
    console.log('Juego guardado:', dataToSave);
}

// Update player victories
function updateVictories() {
    GameState.playerStats.victories++;
    GameState.playerStats.stars += 3;
    GameState.playerStats.coins += 50;
    saveGame();
    updatePlayerDisplay();
}

// Load game state from localStorage
function loadGame() {
    const savedGame = localStorage.getItem('marioCardsGame');
    if (savedGame) {
        try {
            const loaded = JSON.parse(savedGame);
            // Preserve characters array, only load user data
            if (loaded.playerName) GameState.playerName = loaded.playerName;
            if (loaded.playerStats) GameState.playerStats = loaded.playerStats;
            if (loaded.deck) GameState.deck = loaded.deck;
            return true;
        } catch (e) {
            console.error('Error loading saved game:', e);
            return false;
        }
    }
    return false;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button/notification
    showInstallNotification();
});

function showInstallNotification() {
    // Only show once per session
    if (sessionStorage.getItem('installPromptShown')) return;
    
    setTimeout(() => {
        const installMessage = document.createElement('div');
        installMessage.className = 'install-prompt';
        installMessage.innerHTML = `
            <div class="install-prompt-content">
                <p>📱 ¡Instala Mario Cards en tu dispositivo!</p>
                <div class="install-prompt-actions">
                    <button id="installBtn" class="btn btn-primary">Instalar</button>
                    <button id="dismissInstallBtn" class="btn btn-secondary">Ahora no</button>
                </div>
            </div>
        `;
        document.body.appendChild(installMessage);
        
        document.getElementById('installBtn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
            }
            installMessage.remove();
            sessionStorage.setItem('installPromptShown', 'true');
        });
        
        document.getElementById('dismissInstallBtn').addEventListener('click', () => {
            installMessage.remove();
            sessionStorage.setItem('installPromptShown', 'true');
        });
    }, 3000);
}

// ============================================================
// FIREBASE MATCHMAKING HELPER FUNCTIONS
// ============================================================

let matchmakingTimerInterval = null;

// Show matchmaking screen
function showMatchmakingScreen() {
    console.log('Mostrando pantalla de matchmaking');
    showScreen('matchmakingScreen');
    const timerElement = document.getElementById('matchmakingTimer');
    if (timerElement) {
        timerElement.textContent = '0';
    }
    
    // Add cancel button listener
    const cancelBtn = document.getElementById('cancelMatchmakingBtn');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            console.log('Matchmaking cancelado por el usuario');
            stopMatchmakingTimer();
            
            // Cancel matchmaking in Firebase
            if (typeof cancelMatchmaking === 'function') {
                cancelMatchmaking();
            }
            
            showScreen('mainMenu');
        };
    }
}

// Hide matchmaking screen
function hideMatchmakingScreen() {
    console.log('Ocultando pantalla de matchmaking');
    stopMatchmakingTimer();
    // Don't change screen here - let the calling function decide
}

// Start matchmaking timer
function startMatchmakingTimer() {
    const timerElement = document.getElementById('matchmakingTimer');
    if (!timerElement) return;
    
    let seconds = 0;
    timerElement.textContent = '0';
    
    matchmakingTimerInterval = setInterval(() => {
        seconds++;
        timerElement.textContent = seconds.toString();
    }, 1000);
}

// Stop matchmaking timer
function stopMatchmakingTimer() {
    if (matchmakingTimerInterval) {
        clearInterval(matchmakingTimerInterval);
        matchmakingTimerInterval = null;
    }
}

// Show online battle (replaces startBattle for online games)
function showOnlineBattle(gameData, playerRole) {
    console.log('Iniciando batalla online:', { gameData, playerRole });
    
    // Store online game data
    GameState.isOnlineGame = true;
    GameState.onlineGameId = gameData.gameId;
    GameState.playerRole = playerRole;
    GameState.opponentData = gameData[playerRole === 'player1' ? 'player2' : 'player1'];
    
    // Set up battle state from online data
    GameState.battleState = {
        currentRound: gameData.currentRound || 1,
        myDeck: gameData[playerRole].deck,
        opponentDeck: gameData[playerRole === 'player1' ? 'player2' : 'player1'].deck,
        myPoints: gameData[playerRole].points,
        opponentPoints: gameData[playerRole === 'player1' ? 'player2' : 'player1'].points,
        myRoundsWon: gameData[playerRole].roundsWon || 0,
        opponentRoundsWon: gameData[playerRole === 'player1' ? 'player2' : 'player1'].roundsWon || 0,
        mySelectedCard: null,
        opponentSelectedCard: null,
        isRoundComplete: false
    };
    
    // Show battle presentation screen
    showScreen('battlePresentation');
    
    // Display opponent info
    const opponentNameEl = document.getElementById('opponentName');
    if (opponentNameEl) {
        opponentNameEl.textContent = GameState.opponentData.name || 'Oponente';
    }
    
    // Show opponent's deck
    displayOpponentDeck(GameState.battleState.opponentDeck);
    
    // Set up continue button to battle arena
    const continueBtn = document.getElementById('continueToBattleBtn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            playSound('click');
            showScreen('battleArena');
            setupOnlineBattleArena();
        };
    }
}

// Setup online battle arena
function setupOnlineBattleArena() {
    const state = GameState.battleState;
    
    // Display round number
    const roundDisplay = document.getElementById('roundDisplay');
    if (roundDisplay) {
        roundDisplay.textContent = `Ronda ${state.currentRound}/4`;
    }
    
    // Display scores
    updateScoreDisplay();
    
    // Display player's hand
    displayPlayerHand(state.myDeck, state.myPoints);
    
    // Display opponent's hand (face down)
    displayOpponentHand(state.opponentDeck.length);
    
    // Clear battlefield
    const playerField = document.getElementById('playerCardField');
    const opponentField = document.getElementById('opponentCardField');
    if (playerField) playerField.innerHTML = '';
    if (opponentField) opponentField.innerHTML = '';
    
    // Add online card selection handlers
    const handCards = document.querySelectorAll('.hand-card');
    handCards.forEach((card, index) => {
        card.onclick = () => {
            if (state.mySelectedCard !== null) return; // Already selected
            
            playSound('select');
            selectOnlineCard(index);
        };
    });
}

// Select card in online battle
function selectOnlineCard(cardIndex) {
    const state = GameState.battleState;
    state.mySelectedCard = cardIndex;
    
    // Send selection to Firebase
    if (typeof sendCardSelection === 'function') {
        sendCardSelection(GameState.onlineGameId, GameState.playerRole, cardIndex);
    }
    
    // Show selected card on field
    const selectedCard = state.myDeck[cardIndex];
    const selectedPoints = state.myPoints[cardIndex];
    
    const playerField = document.getElementById('playerCardField');
    if (playerField) {
        playerField.innerHTML = `
            <div class="field-card">
                <img src="src/images/${selectedCard}.png" alt="${selectedCard}">
                <div class="card-power">${selectedPoints}</div>
            </div>
        `;
    }
    
    // Disable hand cards
    const handCards = document.querySelectorAll('.hand-card');
    handCards.forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.6';
    });
    
    // Show waiting message
    showWaitingForOpponent();
}

// Show waiting for opponent message
function showWaitingForOpponent() {
    const battleArena = document.getElementById('battleArena');
    let waitingMsg = document.getElementById('waitingMessage');
    
    if (!waitingMsg) {
        waitingMsg = document.createElement('div');
        waitingMsg.id = 'waitingMessage';
        waitingMsg.className = 'waiting-message';
        waitingMsg.innerHTML = '⏳ Esperando al oponente...';
        battleArena.appendChild(waitingMsg);
    }
}

// Update online battle UI when game state changes
function updateOnlineBattleUI(gameData, playerRole) {
    console.log('Actualizando UI de batalla online:', { gameData, playerRole });
    
    const state = GameState.battleState;
    const otherRole = playerRole === 'player1' ? 'player2' : 'player1';
    
    // Update battle state from Firebase data
    state.currentRound = gameData.currentRound;
    state.myRoundsWon = gameData[playerRole].roundsWon || 0;
    state.opponentRoundsWon = gameData[otherRole].roundsWon || 0;
    
    // Check if opponent has selected
    const opponentSelection = gameData[otherRole].currentSelection;
    const mySelection = gameData[playerRole].currentSelection;
    
    // If both players have selected, show the reveal
    if (opponentSelection !== null && mySelection !== null && !state.isRoundComplete) {
        state.isRoundComplete = true;
        state.opponentSelectedCard = opponentSelection;
        revealOnlineRound(gameData, playerRole);
    }
    
    // Update scores
    updateScoreDisplay();
}

// Reveal online round results
function revealOnlineRound(gameData, playerRole) {
    const state = GameState.battleState;
    const otherRole = playerRole === 'player1' ? 'player2' : 'player1';
    
    // Remove waiting message
    const waitingMsg = document.getElementById('waitingMessage');
    if (waitingMsg) waitingMsg.remove();
    
    // Show opponent's card
    const opponentCard = state.opponentDeck[state.opponentSelectedCard];
    const opponentPoints = state.opponentPoints[state.opponentSelectedCard];
    
    const opponentField = document.getElementById('opponentCardField');
    if (opponentField) {
        opponentField.innerHTML = `
            <div class="field-card card-reveal">
                <img src="src/images/${opponentCard}.png" alt="${opponentCard}">
                <div class="card-power">${opponentPoints}</div>
            </div>
        `;
    }
    
    // Determine winner
    const myPoints = state.myPoints[state.mySelectedCard];
    const myWon = myPoints > opponentPoints;
    const tie = myPoints === opponentPoints;
    
    setTimeout(() => {
        let resultText = '';
        if (tie) {
            resultText = '🤝 ¡EMPATE!';
            playSound('tie');
        } else if (myWon) {
            resultText = '🎉 ¡GANASTE LA RONDA!';
            playSound('win');
        } else {
            resultText = '😔 Perdiste la ronda';
            playSound('lose');
        }
        
        // Show result message
        showRoundResult(resultText);
        
        // Continue to next round or show final results
        setTimeout(() => {
            if (state.currentRound < 4) {
                // Remove used cards from decks
                state.myDeck.splice(state.mySelectedCard, 1);
                state.myPoints.splice(state.mySelectedCard, 1);
                state.opponentDeck.splice(state.opponentSelectedCard, 1);
                state.opponentPoints.splice(state.opponentSelectedCard, 1);
                
                // Reset for next round
                state.mySelectedCard = null;
                state.opponentSelectedCard = null;
                state.isRoundComplete = false;
                
                // Setup next round
                setupOnlineBattleArena();
            } else {
                // Battle complete - show results
                showOnlineResults(state.myRoundsWon, state.opponentRoundsWon);
            }
        }, 3000);
    }, 1000);
}

// Show online battle results
function showOnlineResults(myRoundsWon, opponentRoundsWon) {
    const won = myRoundsWon > opponentRoundsWon;
    const tie = myRoundsWon === opponentRoundsWon;
    
    // Update stats if won
    if (won) {
        GameState.victories++;
        GameState.stars += 3;
        GameState.coins += 100;
    } else if (tie) {
        GameState.stars += 1;
        GameState.coins += 30;
    }
    
    saveGame();
    
    // Show results screen
    showScreen('battleResults');
    
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const rewardsDiv = document.getElementById('rewardsDisplay');
    
    if (won) {
        resultTitle.textContent = '¡VICTORIA!';
        resultTitle.style.color = '#43B047';
        resultSubtitle.textContent = `Ganaste ${myRoundsWon}-${opponentRoundsWon}`;
        rewardsDiv.innerHTML = `
            <div class="reward-item">⭐ +3 Estrellas</div>
            <div class="reward-item">🪙 +100 Monedas</div>
        `;
    } else if (tie) {
        resultTitle.textContent = '¡EMPATE!';
        resultTitle.style.color = '#F8981D';
        resultSubtitle.textContent = `${myRoundsWon}-${opponentRoundsWon}`;
        rewardsDiv.innerHTML = `
            <div class="reward-item">⭐ +1 Estrella</div>
            <div class="reward-item">🪙 +30 Monedas</div>
        `;
    } else {
        resultTitle.textContent = 'DERROTA';
        resultTitle.style.color = '#E52521';
        resultSubtitle.textContent = `Perdiste ${myRoundsWon}-${opponentRoundsWon}`;
        rewardsDiv.innerHTML = `<div class="reward-item">Sigue intentando...</div>`;
    }
    
    // Setup return button
    const returnBtn = document.getElementById('returnMenuBtn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            playSound('click');
            
            // Clean up online game state
            GameState.isOnlineGame = false;
            GameState.onlineGameId = null;
            GameState.playerRole = null;
            GameState.opponentData = null;
            GameState.battleState = null;
            
            showScreen('mainMenu');
        };
    }
}

// Helper: Show round result message
function showRoundResult(text) {
    const battleArena = document.getElementById('battleArena');
    const resultMsg = document.createElement('div');
    resultMsg.className = 'round-result-message';
    resultMsg.textContent = text;
    battleArena.appendChild(resultMsg);
    
    setTimeout(() => {
        resultMsg.remove();
    }, 2500);
}

// Helper: Update score display
function updateScoreDisplay() {
    const state = GameState.battleState;
    const myScoreEl = document.getElementById('myScore');
    const opponentScoreEl = document.getElementById('opponentScore');
    
    if (myScoreEl) myScoreEl.textContent = state.myRoundsWon;
    if (opponentScoreEl) opponentScoreEl.textContent = state.opponentRoundsWon;
}

// ============================================================
// END FIREBASE MATCHMAKING FUNCTIONS
// ============================================================

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Add global click handler for all close buttons using event delegation
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle deck close button
        if (target.id === 'backFromDeckBtn') {
            e.preventDefault();
            e.stopPropagation();
            playSound('click');
            showScreen('mainMenu');
            return;
        }
        
        // Handle settings close button
        if (target.id === 'backFromSettingsBtn') {
            e.preventDefault();
            e.stopPropagation();
            playSound('click');
            const settingsInput = document.getElementById('settingsPlayerName');
            const changeNameBtn = document.getElementById('changeNameBtn');
            if (settingsInput) settingsInput.value = '';
            if (changeNameBtn) changeNameBtn.disabled = true;
            showScreen('mainMenu');
            return;
        }
    });
});

// Save game before page unload
window.addEventListener('beforeunload', () => {
    if (GameState.playerName) {
        saveGame();
    }
});

// Prevent context menu on right click (optional - for game feel)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Log game version
console.log('%c🎮 Mario Cards v1.0', 'color: #E30613; font-size: 20px; font-weight: bold;');
console.log('%c¡Bienvenido al juego!', 'color: #0588D7; font-size: 14px;');
