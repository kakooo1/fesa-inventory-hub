import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from './useNotificationSound';

/**
 * Hook que escucha notificaciones en tiempo real
 * Reproduce sonido cuando llega una notificación NUEVA
 * Funciona incluso si el usuario no está en la página de Notificaciones
 */
export function useRealtimeNotifications(userRole?: string, soundEnabled: boolean = true) {
  const { playSound } = useNotificationSound();
  const isInitializingRef = useRef(true);
  const channelRef = useRef<any>(null);

  const handleNewNotification = useCallback(() => {
    if (soundEnabled && !isInitializingRef.current) {
      playSound();
    }
  }, [soundEnabled, playSound]);

  useEffect(() => {
    if (!userRole) return;

    // La primera vez que se monta, ignorar las notificaciones existentes
    isInitializingRef.current = true;

    // Dar un pequeño delay para que la inicialización se complete
    const initTimer = setTimeout(() => {
      isInitializingRef.current = false;
    }, 500);

    // Subscribe a cambios en la tabla de notificaciones
    const channel = supabase
      .channel(`notifications:${userRole}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_role=eq.${userRole}`,
        },
        () => {
          handleNewNotification();
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Limpiar suscripción al desmontar
    return () => {
      clearTimeout(initTimer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userRole, handleNewNotification]);
}
