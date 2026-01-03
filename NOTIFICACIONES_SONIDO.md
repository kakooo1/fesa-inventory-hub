# 🔔 NOTIFICACIONES CON SONIDO

## ¿Qué se agregó?

Se implementó un sistema de notificaciones con **sonido** que se reproduce automáticamente cuando:

1. ✅ **Llega una notificación nueva** - Se reproduce al ver la página de notificaciones
2. ✅ **Se crea una notificación de vehículo** - Se toca cuando un supervisor reporta un incidente
3. ✅ **Se aprueba una solicitud de material** - Se toca cuando el admin aprueba/rechaza una solicitud
4. ✅ **Se marca lista para retiro** - Se toca cuando el bodeguero marca como listo para despacho

## Características

### 🔊 Sonido Adaptativo
- El sistema usa **Web Audio API** para máxima compatibilidad
- Fallback a HTML5 Audio si es necesario
- Sonido claro de 800Hz que dura 0.5 segundos

### 🎛️ Control de Sonido
En la página de **Notificaciones** hay un botón para:
- ✓ Activar/desactivar sonido
- ✓ Ver estado del sonido (Activado/Desactivado)
- ✓ Recordar preferencia en la sesión

## Archivos Modificados

### 📁 Nuevos Archivos
- `src/hooks/useNotificationSound.ts` - Hook para reproducir sonidos
- `src/hooks/useGlobalNotificationSound.ts` - Hook wrapper global

### 📝 Archivos Actualizados
- `src/pages/Notifications.tsx` - Agregado control de sonido y reproducción automática
- `src/pages/Vehicles.tsx` - Agregado sonido al crear notificación de vehículo
- `src/pages/MaterialRequests.tsx` - Agregado sonido en aprobaciones/rechazos

## Cómo Funciona

### Para el Usuario
1. Entra a cualquier página del sistema
2. Cuando llega una notificación, automáticamente se reproduce un sonido
3. En la página de Notificaciones, puede desactivar/activar el sonido con el botón de volumen

### Para el Desarrollador
```tsx
// Importar el hook
import { useGlobalNotificationSound } from '@/hooks/useGlobalNotificationSound';

// Usar en tu componente
const { playNotificationSound } = useGlobalNotificationSound();

// Reproducir cuando sea necesario
playNotificationSound();
```

## Compatibilidad

✅ **Chrome/Edge** - Soporte completo  
✅ **Firefox** - Soporte completo  
✅ **Safari** - Soporte (requiere interacción previa del usuario)  
✅ **Mobile** - Funciona en navegadores móviles

## Notas

- El sonido NO se reproduce si el usuario ha desactivado el sonido en la página de Notificaciones
- El sistema respeta las políticas de auto-play del navegador
- El volumen es moderado (0.7) para no ser molesto
- Si el navegador no permite audio, el sistema falla silenciosamente sin afectar la funcionalidad

## 🚀 Próximas Mejoras (Opcional)

- [ ] Seleccionar diferentes sonidos de notificación
- [ ] Controlar volumen
- [ ] Diferentes sonidos para diferentes tipos de notificación
- [ ] Notificaciones del sistema (Web Notifications API)
- [ ] Email para notificaciones críticas
