/**
 * Hook para usar sonido de notificación desde cualquier lugar del app
 * Uso: const { playNotificationSound } = useGlobalNotificationSound();
 *      playNotificationSound();
 */

import { useEffect } from 'react';
import { useNotificationSound } from './useNotificationSound';

export function useGlobalNotificationSound() {
  const { playSound } = useNotificationSound();

  return {
    playNotificationSound: playSound,
  };
}
