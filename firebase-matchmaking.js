// Firebase Configuration and Matchmaking System
// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA93CVWFvBdQBezbwkJKbDPdimxOGlD9cs",
  authDomain: "mario-cards.firebaseapp.com",
  databaseURL: "https://mario-cards-default-rtdb.firebaseio.com",
  projectId: "mario-cards",
  storageBucket: "mario-cards.firebasestorage.app",
  messagingSenderId: "728431149686",
  appId: "1:728431149686:web:aff4e9ea2028a7aba85557"
};

// Firebase state
let firebaseApp = null;
let database = null;
let currentPlayerId = null;
let currentGameRef = null;
let matchmakingListener = null;

// Initialize Firebase
function initFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.log('Firebase SDK not loaded, multiplayer disabled');
            return false;
        }
        
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        currentPlayerId = generatePlayerId();
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// Generate unique player ID
function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate game code
function generateGameCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Matchmaking Queue System
const MatchmakingQueue = {
    // Add player to queue
    async joinQueue(playerData) {
        const queueRef = database.ref('matchmaking_queue/' + currentPlayerId);
        
        await queueRef.set({
            playerId: currentPlayerId,
            playerName: playerData.name,
            deck: playerData.deck,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: 'waiting'
        });
        
        console.log('🎮 Joined matchmaking queue');
        return queueRef;
    },
    
    // Remove player from queue
    async leaveQueue() {
        if (currentPlayerId) {
            await database.ref('matchmaking_queue/' + currentPlayerId).remove();
            console.log('❌ Left matchmaking queue');
        }
    },
    
    // Find available opponent
    async findOpponent() {
        const queueSnapshot = await database.ref('matchmaking_queue')
            .orderByChild('timestamp')
            .limitToFirst(10)
            .once('value');
        
        const players = [];
        queueSnapshot.forEach((child) => {
            const player = child.val();
            // Don't match with yourself
            if (player.playerId !== currentPlayerId && player.status === 'waiting') {
                players.push({ key: child.key, ...player });
            }
        });
        
        return players.length > 0 ? players[0] : null;
    },
    
    // Create game with matched opponent
    async createMatchedGame(opponent) {
        const gameId = generateGameCode();
        const gameRef = database.ref('games/' + gameId);
        
        // Distribute points for both players (get separate arrays)
        const player1Data = distributePointsForOnline(GameState.deck);
        const player2Data = distributePointsForOnline(opponent.deck);
        
        await gameRef.set({
            gameId: gameId,
            status: 'playing',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            currentRound: 1,
            player1: {
                id: currentPlayerId,
                name: GameState.playerName,
                deck: player1Data.deck,
                points: player1Data.points,
                currentSelection: null,
                roundsWon: 0,
                ready: false
            },
            player2: {
                id: opponent.playerId,
                name: opponent.playerName,
                deck: player2Data.deck,
                points: player2Data.points,
                currentSelection: null,
                roundsWon: 0,
                ready: false
            }
        });
        
        // Remove both players from queue
        await database.ref('matchmaking_queue/' + currentPlayerId).remove();
        await database.ref('matchmaking_queue/' + opponent.playerId).remove();
        
        console.log('✅ Game created with opponent:', opponent.playerName);
        return gameId;
    },
    
    // Listen for game invitations (when someone else creates game with you)
    listenForGameInvites(callback) {
        // Listen to games where you are player2
        const gamesRef = database.ref('games');
        
        matchmakingListener = gamesRef.on('child_added', (snapshot) => {
            const game = snapshot.val();
            if (game.player2.id === currentPlayerId && game.status === 'playing') {
                callback(snapshot.key, game);
            }
        });
    },
    
    // Stop listening
    stopListening() {
        if (matchmakingListener) {
            database.ref('games').off('child_added', matchmakingListener);
            matchmakingListener = null;
        }
    }
};

// Start automatic matchmaking
async function startAutomaticMatchmaking() {
    if (!database) {
        console.log('Firebase not initialized, playing vs CPU');
        startBattle(); // Play vs CPU
        return;
    }
    
    // Show searching screen
    showMatchmakingScreen();
    
    try {
        // Join matchmaking queue
        await MatchmakingQueue.joinQueue({
            name: GameState.playerName,
            deck: GameState.deck
        });
        
        // Start timeout for CPU fallback (10 seconds)
        const cpuFallbackTimeout = setTimeout(() => {
            console.log('⏱️ No players found, playing vs CPU');
            MatchmakingQueue.leaveQueue();
            MatchmakingQueue.stopListening();
            hideMatchmakingScreen();
            startBattle(); // Play vs CPU
        }, 10000);
        
        // Listen for game invitations (someone else matched with you)
        MatchmakingQueue.listenForGameInvites((gameId, gameData) => {
            clearTimeout(cpuFallbackTimeout);
            MatchmakingQueue.leaveQueue();
            MatchmakingQueue.stopListening();
            hideMatchmakingScreen();
            joinOnlineGame(gameId, gameData, 'player2');
        });
        
        // Try to find opponent immediately
        const opponent = await MatchmakingQueue.findOpponent();
        
        if (opponent) {
            clearTimeout(cpuFallbackTimeout);
            MatchmakingQueue.stopListening();
            
            // You found someone first, you create the game
            const gameId = await MatchmakingQueue.createMatchedGame(opponent);
            hideMatchmakingScreen();
            startOnlineGame(gameId, 'player1');
        }
        
    } catch (error) {
        console.error('Matchmaking error:', error);
        hideMatchmakingScreen();
        startBattle(); // Fallback to CPU
    }
}

// Start online multiplayer game
function startOnlineGame(gameId, playerRole) {
    currentGameRef = database.ref('games/' + gameId);
    
    console.log(`🎮 Starting online game as ${playerRole}`);
    
    // Listen to game state changes
    currentGameRef.on('value', (snapshot) => {
        const gameData = snapshot.val();
        if (gameData) {
            handleOnlineGameUpdate(gameData, playerRole);
        }
    });
    
    // Mark yourself as ready
    currentGameRef.child(playerRole + '/ready').set(true);
}

// Join existing online game
function joinOnlineGame(gameId, gameData, playerRole) {
    currentGameRef = database.ref('games/' + gameId);
    
    console.log(`🎮 Joining online game as ${playerRole}`);
    
    // Listen to game state changes
    currentGameRef.on('value', (snapshot) => {
        const game = snapshot.val();
        if (game) {
            handleOnlineGameUpdate(game, playerRole);
        }
    });
    
    // Mark yourself as ready
    currentGameRef.child(playerRole + '/ready').set(true);
}

// Handle online game updates
function handleOnlineGameUpdate(gameData, playerRole) {
    const isPlayer1 = playerRole === 'player1';
    const myData = isPlayer1 ? gameData.player1 : gameData.player2;
    const opponentData = isPlayer1 ? gameData.player2 : gameData.player1;
    
    // Both players ready, show game
    if (gameData.player1.ready && gameData.player2.ready) {
        // Only call showOnlineBattle once when game starts
        if (GameState.currentScreen !== 'battleScreen' && !GameState.isOnlineGameStarted) {
            GameState.isOnlineGameStarted = true;
            showOnlineBattle(gameData, playerRole);
            return; // Exit to avoid calling resolveOnlineRound before setup completes
        }
        
        // Update battle UI
        if (GameState.currentScreen === 'battleScreen') {
            updateOnlineBattleUI(gameData, playerRole);
        }
        
        // Check if both players selected cards (only resolve once per round)
        const roundKey = `${gameData.gameId}_${gameData.currentRound}`;
        if (myData.currentSelection !== null && 
            opponentData.currentSelection !== null && 
            !GameState.resolvedRounds?.includes(roundKey)) {
            
            // Mark this round as being resolved
            if (!GameState.resolvedRounds) GameState.resolvedRounds = [];
            GameState.resolvedRounds.push(roundKey);
            
            resolveOnlineRound(gameData, playerRole);
        }
        
        // Check if game finished
        if (gameData.currentRound > 4 && !GameState.onlineGameEnded) {
            GameState.onlineGameEnded = true;
            endOnlineGame(gameData, playerRole);
        }
    }
}

// Player selects card in online game
async function sendCardSelection(gameId, playerRole, cardIndex) {
    if (!database) return;
    
    const gameRef = database.ref('games/' + gameId);
    await gameRef.child(playerRole + '/currentSelection').set(cardIndex);
}

// Resolve online round
async function resolveOnlineRound(gameData, playerRole) {
    console.log('🎮 Resolving round', gameData.currentRound, 'for', playerRole);
    
    const isPlayer1 = playerRole === 'player1';
    const myData = isPlayer1 ? gameData.player1 : gameData.player2;
    const opponentData = isPlayer1 ? gameData.player2 : gameData.player1;
    
    console.log('My selection:', myData.currentSelection, 'Opponent selection:', opponentData.currentSelection);
    
    // Show opponent's card reveal
    if (GameState.battleState) {
        GameState.battleState.opponentSelectedCard = opponentData.currentSelection;
        console.log('Calling revealOnlineRound with opponentSelectedCard:', opponentData.currentSelection);
        revealOnlineRound(gameData, playerRole);
    }
    
    // Wait a moment for cards to be visible
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get points from separate arrays
    const myPoints = myData.points[myData.currentSelection];
    const opponentPoints = opponentData.points[opponentData.currentSelection];
    
    // Determine winner (only player1 updates the database to avoid conflicts)
    if (isPlayer1) {
        let player1RoundsWon = gameData.player1.roundsWon;
        let player2RoundsWon = gameData.player2.roundsWon;
        
        if (myPoints > opponentPoints) {
            player1RoundsWon++;
        } else if (opponentPoints > myPoints) {
            player2RoundsWon++;
        }
        
        // Update rounds won
        await currentGameRef.child('player1/roundsWon').set(player1RoundsWon);
        await currentGameRef.child('player2/roundsWon').set(player2RoundsWon);
        
        // Wait 2 seconds then next round
        setTimeout(async () => {
            if (gameData.currentRound < 4) {
                await nextOnlineRound();
            }
        }, 2500);
    }
}

// Next round in online game
async function nextOnlineRound() {
    if (!currentGameRef) return;
    
    const snapshot = await currentGameRef.once('value');
    const gameData = snapshot.val();
    
    await currentGameRef.update({
        currentRound: gameData.currentRound + 1,
        'player1/currentSelection': null,
        'player2/currentSelection': null
    });
}

// End online game
async function endOnlineGame(gameData, playerRole) {
    const isPlayer1 = playerRole === 'player1';
    const myRoundsWon = isPlayer1 ? gameData.player1.roundsWon : gameData.player2.roundsWon;
    const opponentRoundsWon = isPlayer1 ? gameData.player2.roundsWon : gameData.player1.roundsWon;
    
    // Update stats
    if (myRoundsWon > opponentRoundsWon) {
        GameState.playerStats.victories++;
        GameState.playerStats.coins += 100;
        GameState.playerStats.stars += 3;
    } else if (myRoundsWon < opponentRoundsWon) {
        GameState.playerStats.coins += 20;
    } else {
        GameState.playerStats.coins += 50;
    }
    
    saveGame();
    
    // Cleanup
    if (currentGameRef) {
        currentGameRef.off();
        currentGameRef = null;
    }
    
    // Show results
    showOnlineResults(myRoundsWon, opponentRoundsWon);
}

// Cleanup on disconnect
function cleanupOnlineGame() {
    if (currentGameRef) {
        currentGameRef.off();
        currentGameRef = null;
    }
    MatchmakingQueue.leaveQueue();
    MatchmakingQueue.stopListening();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    cleanupOnlineGame();
});
