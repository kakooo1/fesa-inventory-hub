import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from './useNotificationSound';
import type { Notification } from './useDatabase';

/**
 * Hook que escucha notificaciones en tiempo real
 * - Reproduce sonido cuando llega una notificación NUEVA
 * - Actualiza automáticamente la lista de notificaciones en la UI sin recargar
 * - Funciona incluso si el usuario no está en la página de Notificaciones
 */
export function useRealtimeNotifications(userRole?: string, soundEnabled: boolean = true) {
  const { playSound } = useNotificationSound();
  const queryClient = useQueryClient();
  const isInitializingRef = useRef(true);
  const channelRef = useRef<any>(null);

  const handleNewNotification = useCallback(() => {
    if (soundEnabled && !isInitializingRef.current) {
      playSound();
    }
    
    // Refetch inmediato del query de notificaciones para actualizar la lista en tiempo real
    if (!isInitializingRef.current) {
      queryClient.invalidateQueries({ queryKey: ['notifications', userRole] });
      queryClient.refetchQueries({ queryKey: ['notifications', userRole] });
    }
  }, [soundEnabled, playSound, queryClient, userRole]);

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
        async (payload) => {
          // Reproducir sonido
          if (soundEnabled && !isInitializingRef.current) {
            playSound();
          }

          // Actualizar el cache de React Query directamente con la nueva notificación
          if (!isInitializingRef.current) {
            const newNotification = payload.new as Notification;
            
            queryClient.setQueryData<Notification[]>(
              ['notifications', userRole],
              (oldData) => {
                if (!oldData) return [newNotification];
                // Agregar al inicio (más reciente primero)
                return [newNotification, ...oldData];
              }
            );
          }
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
  }, [userRole, soundEnabled, queryClient, playSound]);
}
