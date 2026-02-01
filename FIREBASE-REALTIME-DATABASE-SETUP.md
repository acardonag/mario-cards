# Guía Detallada: Configurar Firebase Realtime Database

## 📋 Paso 1: Crear/Acceder a tu Proyecto Firebase

### 1.1 Ir a Firebase Console
1. Abre tu navegador
2. Ve a: **https://console.firebase.google.com/**
3. Inicia sesión con tu cuenta de Google

### 1.2 Seleccionar o Crear Proyecto
- Si ya tienes un proyecto, haz clic en él
- Si no tienes proyecto, haz clic en **"Agregar proyecto"**

### 1.3 Crear Nuevo Proyecto (si es necesario)
1. **Nombre del proyecto**: `mario-cards` (o el nombre que prefieras)
2. Haz clic en **"Continuar"**
3. **Google Analytics**: Puedes desactivarlo por ahora (opcional)
4. Haz clic en **"Crear proyecto"**
5. Espera 30-60 segundos mientras se crea
6. Haz clic en **"Continuar"**

---

## 🔥 Paso 2: Habilitar Realtime Database

### 2.1 Navegar a Realtime Database
1. En el menú lateral izquierdo, busca la sección **"Compilación"** o **"Build"**
2. Haz clic en **"Realtime Database"**
3. Verás una pantalla que dice "Comienza a usar Realtime Database"

### 2.2 Crear Base de Datos
1. Haz clic en el botón **"Crear base de datos"**
2. Aparecerá un modal/ventana emergente

### 2.3 Seleccionar Ubicación
Se te preguntará: **"¿Dónde quieres ubicar tu base de datos?"**

**Opciones comunes:**
- `us-central1` (Estados Unidos - Iowa) ✅ Recomendado
- `europe-west1` (Bélgica)
- `asia-southeast1` (Singapur)

**Selecciona la más cercana a tus usuarios**

Haz clic en **"Siguiente"**

### 2.4 Configurar Reglas de Seguridad
Se te preguntará: **"¿Cómo quieres empezar?"**

Tienes dos opciones:

#### Opción A: Modo de Prueba (RECOMENDADO para desarrollo)
- Selecciona **"Empezar en modo de prueba"**
- Esto permite leer/escribir sin autenticación (útil para desarrollo)
- ⚠️ Las reglas expiran en 30 días

#### Opción B: Modo bloqueado
- Selecciona **"Empezar en modo bloqueado"**
- Requiere configuración de seguridad desde el inicio

**Para este proyecto, selecciona "Empezar en modo de prueba"**

Haz clic en **"Habilitar"**

### 2.5 Esperar Creación
- Espera 10-20 segundos mientras se crea la base de datos
- Verás un spinner/loading

---

## ⚙️ Paso 3: Configurar Reglas de Seguridad

Una vez creada la base de datos:

### 3.1 Ir a la Pestaña "Reglas"
1. En la parte superior, verás pestañas: **"Datos"**, **"Reglas"**, **"Copia de seguridad"**, **"Uso"**
2. Haz clic en **"Reglas"**

### 3.2 Reemplazar Reglas
Verás algo como esto (reglas por defecto):
```json
{
  "rules": {
    ".read": "now < 1709251200000",
    ".write": "now < 1709251200000"
  }
}
```

**BORRA TODO** y reemplázalo con:

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

### 3.3 Publicar Reglas
1. Haz clic en el botón **"Publicar"** (arriba a la derecha)
2. Las reglas se aplicarán inmediatamente

---

## 🔑 Paso 4: Obtener Credenciales de Firebase

### 4.1 Ir a Configuración del Proyecto
1. Haz clic en el ícono de **engranaje ⚙️** (arriba a la izquierda, al lado de "Descripción general del proyecto")
2. Selecciona **"Configuración del proyecto"**

### 4.2 Registrar una App Web
1. Baja hasta la sección **"Tus apps"**
2. Si no tienes ninguna app, verás iconos de iOS, Android, Web, Unity, etc.
3. Haz clic en el ícono **</>** (Web)

### 4.3 Registrar App
1. **Nombre de la app**: `Mario Cards Web`
2. **NO marques** "Configurar Firebase Hosting" (por ahora)
3. Haz clic en **"Registrar app"**

### 4.4 Copiar Configuración
Verás un código como este:

```html
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>

<script>
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "mario-cards-12345.firebaseapp.com",
    databaseURL: "https://mario-cards-12345-default-rtdb.firebaseio.com",
    projectId: "mario-cards-12345",
    storageBucket: "mario-cards-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxx"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
</script>
```

**COPIA el objeto `firebaseConfig`** (solo la parte entre las llaves { })

### 4.5 Pegar en tu Código
1. Abre el archivo **`firebase-matchmaking.js`** en tu proyecto
2. Busca las líneas 2-11 que dicen:
```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "...",
    // ...
};
```

3. **REEMPLAZA** con tu configuración real que copiaste

**Ejemplo REAL:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "mario-cards-12345.firebaseapp.com",
    databaseURL: "https://mario-cards-12345-default-rtdb.firebaseio.com",
    projectId: "mario-cards-12345",
    storageBucket: "mario-cards-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

### 4.6 Cerrar Modal
Haz clic en **"Continuar a la consola"**

---

## 📝 Paso 5: Obtener URL de la Base de Datos

### 5.1 Verificar URL
1. Ve nuevamente a **"Realtime Database"** en el menú lateral
2. En la pestaña **"Datos"**
3. Arriba verás la URL de tu base de datos, algo como:
   ```
   https://mario-cards-12345-default-rtdb.firebaseio.com/
   ```

### 5.2 Verificar que Coincida
- Esta URL **debe coincidir** con el `databaseURL` en tu configuración
- Si no coincide, cópiala y actualízala en `firebaseConfig`

---

## ✅ Paso 6: Verificar que Todo Funcione

### 6.1 Estructura Visual
En Firebase Console > Realtime Database > Datos, deberías ver:

```
mario-cards-12345-default-rtdb
├── null
```

(Está vacío, es normal)

### 6.2 Probar Escritura
Puedes probar manualmente:
1. Haz clic en el **"+"** junto a la raíz
2. **Nombre**: `test`
3. **Valor**: `"hello world"`
4. Haz clic en **"Agregar"**

Si se agrega sin error, ¡funciona! 🎉

Puedes eliminar el test haciendo hover sobre `test` y clic en **X**

---

## 🎯 Resumen de URLs Importantes

Después de configurar, tendrás:

1. **Firebase Console**: `https://console.firebase.google.com/project/mario-cards-12345`
2. **Database URL**: `https://mario-cards-12345-default-rtdb.firebaseio.com/`
3. **Realtime Database**: Console > Build > Realtime Database

---

## 🔒 Notas de Seguridad

### ⚠️ Importante:
Las reglas actuales permiten acceso público para desarrollo.

**Para producción, deberías:**
1. Habilitar Firebase Authentication
2. Usar reglas más restrictivas
3. Validar usuarios autenticados

### Reglas Mejoradas (Futuro):
```json
{
  "rules": {
    "matchmaking_queue": {
      "$playerId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $playerId"
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Permission denied"
- **Causa**: Las reglas están en modo bloqueado
- **Solución**: Cambia a modo de prueba (paso 3.2)

### Error: "Firebase not initialized"
- **Causa**: Credenciales incorrectas o falta SDK
- **Solución**: Verifica firebaseConfig y que los scripts estén cargados

### Error: "Database URL not found"
- **Causa**: No agregaste el databaseURL
- **Solución**: Copia la URL de Realtime Database y agrégala a firebaseConfig

### La base de datos no aparece
- **Causa**: Necesitas refrescar la página
- **Solución**: Presiona F5 o Ctrl+R

---

## 📊 Monitoreo

### Ver Datos en Tiempo Real
1. Ve a Realtime Database > Datos
2. Verás las estructuras `matchmaking_queue` y `games` aparecer automáticamente cuando los jugadores jueguen
3. Puedes ver las partidas en vivo expandiendo los nodos

### Ver Uso
1. Ve a la pestaña **"Uso"**
2. Verás gráficas de:
   - Conexiones simultáneas
   - Almacenamiento usado
   - Descarga de datos

### Límites del Plan Gratuito (Spark)
- ✅ 100 conexiones simultáneas
- ✅ 1 GB de almacenamiento
- ✅ 10 GB de transferencia/mes

**Para Mario Cards, esto es suficiente para ~500-1000 jugadores/día**

---

## ✨ ¡Listo!

Ahora tienes Firebase Realtime Database configurado y listo para usar con Mario Cards.

**Siguiente paso**: Integrar el código en tu aplicación siguiendo `FIREBASE-SETUP.md`
