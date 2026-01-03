🔧 GUÍA DE DEBUG - SONIDO DE NOTIFICACIONES NO FUNCIONA
=======================================================

## 📋 Checklist de Diagnóstico

Sigue estos pasos para identificar por qué el sonido no suena:

### Paso 1: Probar Sonido Manualmente
1. Ve a la página de **Notificaciones** (🔔 en la navbar)
2. Haz clic en el botón **"🔊 Probar sonido"**
3. ¿Se escucha un beep?

**Si sí:** El sonido funciona, el problema está en la detección de notificaciones nuevas
**Si no:** El problema está en el hook de audio o los permisos del navegador

### Paso 2: Revisar la Consola del Navegador
1. Presiona `F12` para abrir las Herramientas de Desarrollador
2. Ve a la pestaña **Console**
3. Haz lo siguiente:

**Para probar el sonido manual:**
- Haz clic en "🔊 Probar sonido"
- Debería ver: `🔊 Prueba de sonido manual`

**Para probar notificaciones:**
- Abre otra ventana con el admin
- Crea una solicitud de material (como supervisor)
- En la consola debería ver:
  - `📢 Notificaciones check: {...}`
  - `🔊 Reproduciendo sonido de notificación`

**Para probar aprobaciones:**
- Como admin, aprueba una solicitud
- En la consola debería ver:
  - `🔊 Reproduciendo sonido en MaterialRequests approve`

## 🔍 Posibles Problemas y Soluciones

### Problema 1: El navegador tiene silenciado el audio
**Síntomas:** 
- El botón de prueba no suena
- No hay sonido en ningún lado

**Soluciones:**
1. Asegúrate que el volumen del sistema NO está en silencio
2. En Chrome/Edge, busca el icono de silencio 🔇 en la barra de direcciones
3. Haz clic en "Permitir sonido"
4. Recarga la página

### Problema 2: Las notificaciones nuevas no se detectan
**Síntomas:**
- El botón de prueba sí suena ✓
- Pero el sonido automático en notificaciones nuevas NO funciona

**Causa probable:**
- La notificación no es "nueva" según el sistema
- El contador `previousNotificationsCount` no se está actualizando correctamente

**Cómo debuggear:**
1. Abre la consola (F12)
2. Actualiza la página
3. Crea una notificación nueva
4. Mira la consola, deberías ver:
```
📢 Notificaciones check: {
  currentUnreadCount: 1,
  previousCount: 0,
  soundEnabled: true,
  hasIncreased: true
}
```

### Problema 3: El sonido suena solo una vez
**Síntomas:**
- Primera notificación → suena ✓
- Segunda notificación → NO suena ✗

**Causa probable:**
- El Web Audio Context está en estado "suspended"

**Solución:**
- El código ya intenta reanudar el contexto automáticamente
- Si sigue sin funcionar, recarga la página

### Problema 4: El soundEnabled está en false
**Síntomas:**
- El botón dice "🔇 Sonido desactivado"
- No suena en notificaciones nuevas

**Solución:**
- Haz clic en el botón para activar el sonido

## 🔊 Información Técnica

### Cómo Funciona el Hook de Sonido

```typescript
// 1. Inicializa Web Audio Context
const audioContext = new AudioContext();

// 2. Crea nuevos nodos para cada sonido
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// 3. Genera un tono de 800Hz
oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

// 4. Suena por 0.5 segundos
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
```

### Dónde se Reproduce el Sonido

| Ubicación | Condición |
|-----------|-----------|
| **Notificaciones** | Cuando `currentUnreadCount > previousCount` |
| **Vehicles** | Después de crear notificación de vehículo |
| **MaterialRequests** | Después de aprobar/rechazar/despachar |

## 🧪 Tests para Hacer

### Test 1: Sonido Manual (10 segundos)
1. Ve a Notificaciones
2. Haz clic en "🔊 Probar sonido"
3. Abre Console (F12)
4. ¿Escuchas el beep?
5. ¿Ves en console: `🔊 Prueba de sonido manual`?

**Resultado esperado:** Sí a ambos

### Test 2: Notificación Nueva (30 segundos)
1. Abre dos ventanas: Admin + Supervisor
2. En Supervisor, crea una solicitud de material
3. En Admin, aprueba la solicitud
4. En Supervisor, ve a Notificaciones
5. ¿Se escucha un beep?

**Resultado esperado:** Sí

### Test 3: Aprobación (20 segundos)
1. Abre Admin
2. Ve a "Solicitudes de Materiales"
3. Si hay solicitudes pendientes, aprueba una
4. ¿Se escucha un beep?
5. Abre Console (F12)
6. ¿Ves: `🔊 Reproduciendo sonido en MaterialRequests approve`?

**Resultado esperado:** Sí a ambos

## 📞 Si Nada Funciona

Intenta estos pasos finales:

1. **Recarga la página:** Ctrl + Shift + R (recarga hard)
2. **Cierra todas las ventanas** y abre de nuevo
3. **Limpia el cache:** Abre DevTools → Más herramientas → Borrar datos de sitio
4. **Revisa la consola** por errores rojos
5. **Comparte en console:**
   - Qué dices los logs
   - Si escuchas sonido en el test manual
   - Qué navegador usas (Chrome, Firefox, Safari)
   - Si el sistema está en silencio

---

Con esta información, podemos debuggear y arreglar el problema rápidamente! 🔧
