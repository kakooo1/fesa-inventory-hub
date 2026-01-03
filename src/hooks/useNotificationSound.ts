import { useRef, useCallback } from 'react';

/**
 * Hook para reproducir sonidos de notificación
 * Proporciona un sonido claro y audible cuando llegan notificaciones
 * Usa Web Audio API para máxima compatibilidad
 */
export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      // Si ya existe, devolverlo
      if (audioContextRef.current) {
        // Intentar reanudar si está suspendido
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {
            console.warn('No se pudo reanudar AudioContext');
          });
        }
        return audioContextRef.current;
      }

      // Crear nuevo contexto
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Intentar reanudar si está suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {
          console.warn('No se pudo reanudar AudioContext al inicializar');
        });
      }

      return audioContext;
    } catch (error) {
      console.error('Error inicializando AudioContext:', error);
      return null;
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      
      if (!audioContext) {
        return;
      }

      // Reanudar contexto si está suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Crear nuevos nodos para cada reproducción (NO reutilizar)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Conectar nodos
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el sonido (beep de 800Hz)
      const now = audioContext.currentTime;
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.type = 'sine';

      // Rampa de volumen: inicia en 0.3, cae a 0 en 0.5 segundos
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      // Reproducir por 0.5 segundos
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
    }
  }, [getAudioContext]);

  return { playSound };
}
