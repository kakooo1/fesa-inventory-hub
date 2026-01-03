import { useEffect, useRef } from 'react';

/**
 * Hook para reproducir sonidos de notificación
 * Proporciona un sonido claro y audible cuando llegan notificaciones
 */
export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear audio con un sonido de notificación (beep simple)
    // Este es un sonido WAV codificado en base64 de una campana simple
    const notificationSound = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQpGAAAAAAAAAAAA'
    );
    
    // Si el sonido base64 no funciona, intentar crear uno con Web Audio API
    if (!audioRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Guardar contexto para usar en playSound
        (audioRef.current as any) = { audioContext, oscillator, gainNode };
      } catch (e) {
        // Fallback: usar elemento de audio
        notificationSound.volume = 0.7;
        audioRef.current = notificationSound;
      }
    }

    return () => {
      // Cleanup
      if (audioRef.current && 'pause' in audioRef.current) {
        (audioRef.current as HTMLAudioElement).pause();
      }
    };
  }, []);

  const playSound = () => {
    try {
      if (!audioRef.current) return;

      // Si es un elemento de audio HTML
      if ('play' in audioRef.current) {
        const audio = audioRef.current as HTMLAudioElement;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Silently fail - algunos navegadores requieren interacción del usuario
        });
      } 
      // Si es Web Audio API
      else if ((audioRef.current as any).audioContext) {
        const { audioContext, oscillator, gainNode } = audioRef.current as any;
        
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.stop(audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
      }
    } catch (error) {
      console.log('No se pudo reproducir sonido de notificación');
    }
  };

  return { playSound };
}
