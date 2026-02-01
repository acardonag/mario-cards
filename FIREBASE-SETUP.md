# Firebase Matchmaking - Guía de Implementación

## 🎯 Sistema Implementado

### Características:
- ✅ **Matchmaking Automático**: Emparejamiento aleatorio con jugadores en línea
- ✅ **Fallback a CPU**: Si no hay jugadores (10 segundos), juega vs máquina
- ✅ **Sin códigos**: No necesitas compartir códigos de sala
- ✅ **Tiempo real**: Las partidas se sincronizan instantáneamente
- ✅ **Limpieza automática**: Se eliminan salas antiguas

## 📋 Pasos de Configuración

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Build > Realtime Database**
4. Haz clic en "Crear base de datos"
5. Selecciona ubicación (us-central1 recomendado)
6. Modo: **Empezar en modo de prueba** (lo cambiaremos después)

### 2. Configurar Reglas de Seguridad

En Realtime Database > Reglas, usa estas reglas:

```json
{
  "rules": {
    "matchmaking_queue": {
      "$playerId": {
        ".read": true,
        ".write": "!data.exists() || data.child('playerId').val() === $playerId",
        ".indexOn": ["timestamp", "status"]
      }
    },
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status", "createdAt"]
      }
    }
  }
}
```

### 3. Obtener Credenciales

1. Ve a **Configuración del proyecto** (⚙️)
2. En la sección "Tus apps", selecciona "Web"
3. Copia las credenciales de configuración
4. Pega en `firebase-matchmaking.js` línea 3-10

Ejemplo:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXX",
    authDomain: "mario-cards-xxxxx.firebaseapp.com",
    databaseURL: "https://mario-cards-xxxxx.firebaseio.com",
    projectId: "mario-cards-xxxxx",
    storageBucket: "mario-cards-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:xxxxx"
};
```

### 4. Agregar SDK de Firebase

En tu `index.html`, antes de cerrar `</body>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<!-- Matchmaking System -->
<script src="firebase-matchmaking.js"></script>
```

### 5. Agregar Pantalla de Matchmaking

Copia el contenido de `matchmaking-screen.html` y pégalo en `index.html` antes del cierre de `</body>`.

### 6. Agregar Estilos

En `index.html`, en el `<head>`, agrega:
```html
<link rel="stylesheet" href="matchmaking-styles.css">
```

## 🎮 Cómo Funciona

### Flujo del Matchmaking:

```
Usuario hace clic en "Iniciar Batalla"
    ↓
¿Firebase disponible?
    ↓
SÍ → Buscar jugadores en línea
    ↓
    ├─ ¿Hay jugadores? → Crear partida online
    │                     ↓
    │                   Jugar en tiempo real
    │
    └─ ¿No hay jugadores en 10s? → Jugar vs CPU
```

### Estructura de Datos en Firebase:

```
firebase-database/
├── matchmaking_queue/
│   ├── player_12345/
│   │   ├── playerId: "player_12345"
│   │   ├── playerName: "Juan"
│   │   ├── deck: [...]
│   │   ├── timestamp: 1234567890
│   │   └── status: "waiting"
│   └── player_67890/
│       └── ...
│
└── games/
    └── ABC123/
        ├── gameId: "ABC123"
        ├── status: "playing"
        ├── currentRound: 1
        ├── player1: {...}
        └── player2: {...}
```

## 🔧 Integración con el Código Existente

### En `game.js`, reemplaza la función del botón batalla:

```javascript
// Battle Button
document.getElementById('battleBtn').addEventListener('click', () => {
    playSound('click');
    if (GameState.deck.length !== 4) {
        showNotification('⚠️ Debes definir tu mazo antes de batallar');
        return;
    }
    
    // Iniciar matchmaking automático
    startAutomaticMatchmaking();
});
```

### Agregar funciones auxiliares en `game.js`:

```javascript
function showMatchmakingScreen() {
    showScreen('matchmakingScreen');
    startMatchmakingTimer();
}

function hideMatchmakingScreen() {
    stopMatchmakingTimer();
}

let matchmakingTimerInterval;
function startMatchmakingTimer() {
    let seconds = 0;
    const timerElement = document.getElementById('matchmakingTimer');
    matchmakingTimerInterval = setInterval(() => {
        seconds++;
        if (timerElement) timerElement.textContent = seconds;
    }, 1000);
}

function stopMatchmakingTimer() {
    if (matchmakingTimerInterval) {
        clearInterval(matchmakingTimerInterval);
        matchmakingTimerInterval = null;
    }
}

// Cancel matchmaking button
document.getElementById('cancelMatchmakingBtn').addEventListener('click', () => {
    cleanupOnlineGame();
    hideMatchmakingScreen();
    showScreen('mainMenu');
});
```

## 📊 Ventajas de este Sistema

1. **UX Mejorada**: No necesitas códigos complicados
2. **Rápido**: Emparejamiento en segundos
3. **Siempre jugable**: Si no hay nadie, juega vs CPU
4. **Escalable**: Funciona con 2 o 2000 jugadores
5. **Bajo costo**: Gratis hasta 100 usuarios simultáneos

## 🔒 Seguridad

Las reglas actuales son de prueba. Para producción, mejora la seguridad:

```json
{
  "rules": {
    "matchmaking_queue": {
      "$playerId": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('playerId').val() === auth.uid)"
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null && (data.child('player1/id').val() === auth.uid || data.child('player2/id').val() === auth.uid)"
      }
    }
  }
}
```

## 🧪 Testing

1. Abre el juego en 2 pestañas/dispositivos diferentes
2. En ambas, haz clic en "Iniciar Batalla"
3. Deberían emparejarse automáticamente
4. Juega la partida online en tiempo real

## 🚀 Próximos Pasos

- [ ] Implementar autenticación anónima de Firebase
- [ ] Agregar historial de partidas
- [ ] Implementar ranking global
- [ ] Agregar chat durante la batalla
- [ ] Sistema de amigos (opcional)

## 💡 Notas

- El timeout de 10 segundos es configurable (línea 127 en firebase-matchmaking.js)
- Los jugadores se emparejan por orden de llegada (FIFO)
- Las partidas antiguas se pueden limpiar con Cloud Functions (opcional)
