📚 GUÍA DE INTEGRACIÓN - AGREGAR SONIDO EN OTROS LUGARES
=======================================================

## Quick Start

Si quieres agregar sonido de notificación en **cualquier otro lugar** del app, sigue estos 3 pasos:

### Paso 1: Importar el Hook
```tsx
import { useGlobalNotificationSound } from '@/hooks/useGlobalNotificationSound';
```

### Paso 2: Usar en tu Componente
```tsx
export default function MiComponente() {
  const { playNotificationSound } = useGlobalNotificationSound();
  
  // ... resto del código
}
```

### Paso 3: Reproducir Sonido
```tsx
// En cualquier momento que quieras
playNotificationSound();
```

## Ejemplos Prácticos

### Ejemplo 1: Botón que Reproduce Sonido

```tsx
import { useGlobalNotificationSound } from '@/hooks/useGlobalNotificationSound';
import { Button } from '@/components/ui/button';

export function MiBoton() {
  const { playNotificationSound } = useGlobalNotificationSound();
  
  return (
    <Button onClick={playNotificationSound}>
      Reproducir Sonido de Prueba
    </Button>
  );
}
```

### Ejemplo 2: Sonido en Operación Async

```tsx
import { useGlobalNotificationSound } from '@/hooks/useGlobalNotificationSound';

export function MiFormulario() {
  const { playNotificationSound } = useGlobalNotificationSound();
  
  const handleSubmit = async () => {
    try {
      const resultado = await miAPI.enviar(datos);
      // Reproducir sonido al éxito
      playNotificationSound();
      toast.success('¡Éxito!');
    } catch (error) {
      toast.error('Error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### Ejemplo 3: Sonido en Mutation de React Query

```tsx
import { useMutation } from '@tanstack/react-query';
import { useGlobalNotificationSound } from '@/hooks/useGlobalNotificationSound';

export function useMiMutation() {
  const { playNotificationSound } = useGlobalNotificationSound();
  
  return useMutation({
    mutationFn: async (data) => {
      return await miAPI.enviar(data);
    },
    onSuccess: () => {
      playNotificationSound();
      // Invalidar queries, mostrar toast, etc.
    },
    onError: () => {
      // No reproducir sonido en errores (opcional)
    }
  });
}
```

### Ejemplo 4: Sonido Condicional

```tsx
const { playNotificationSound } = useGlobalNotificationSound();

// Solo reproducir si es importante
if (resultado.importancia === 'critica') {
  playNotificationSound();
}

// O solo reproducir con cierta probabilidad
if (Math.random() < 0.5) {
  playNotificationSound();
}
```

## Casos de Uso Recomendados

✅ **Bueno para:**
- Confirmación de acciones importantes
- Alerta de nuevos eventos
- Finalización de procesos largos
- Errores críticos que requieren atención

❌ **Evitar en:**
- Cada click de botón (muy molesto)
- Errores menores (puede frustar)
- Validaciones de formulario (demasiado frecuente)

## Customización del Sonido (Futuro)

Si en el futuro quieres crear diferentes tipos de sonidos, podrías hacer:

```tsx
// Esto NO está implementado aún, pero es una idea
const { playSound } = useNotificationSound();

// Diferentes tonos
playSound({ frequency: 800 }); // Beep normal
playSound({ frequency: 1000 }); // Beep alto
playSound({ frequency: 600 }); // Beep bajo

// O diferentes duraciones
playSound({ duration: 0.2 }); // Corto
playSound({ duration: 1 }); // Largo
```

## Cómo Funciona Internamente

Si te interesa entender la implementación:

### Hook: useNotificationSound
```
1. Crea un audio element o Web Audio context
2. Cuando llamas playSound()
3. Genera un tono de 800Hz
4. Maneja errores de navegador silenciosamente
5. Limpia recursos al desmontar
```

### Ventajas de esta Implementación
- ✅ No requiere archivos de audio (.mp3, .wav)
- ✅ Genera el sonido en tiempo real
- ✅ Muy ligero (sin dependencias extra)
- ✅ Compatible con todos los navegadores
- ✅ Funciona incluso offline

## Troubleshooting

### El sonido no suena
1. ¿El dispositivo está silenciado?
2. ¿El volumen está en 0?
3. ¿El navegador permite auto-play de audio?
   - En algunos navegadores requiere interacción previa del usuario
4. ¿Hay errores en la consola?

### Cómo Debuggear
```tsx
const { playNotificationSound } = useGlobalNotificationSound();

// Agregar logs
console.log('Intentando reproducir sonido...');
try {
  playNotificationSound();
  console.log('Sonido reproducido exitosamente');
} catch (error) {
  console.error('Error al reproducir sonido:', error);
}
```

## Próximas Mejoras Posibles

- [ ] Diferentes frecuencias de sonido
- [ ] Control de volumen
- [ ] Archivo de audio personalizado
- [ ] Multiple sonidos colas
- [ ] Integración con Web Notifications API
- [ ] Persistencia de preferencias de sonido

---

¡Ahora puedes agregar sonidos de notificación en cualquier parte de tu app! 🎉
