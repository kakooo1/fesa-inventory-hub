import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook que escucha cambios en tiempo real en la tabla de profiles
 * - Actualiza automáticamente la lista de usuarios cuando un nombre cambia
 * - Actualiza el perfil actual si el usuario que cambió es el actual
 */
export function useRealtimeProfiles() {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Subscribe a cambios en la tabla de profiles
    const channel = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        async (payload) => {
          // Actualizar el cache de perfiles
          queryClient.invalidateQueries({ queryKey: ['profiles'] });
          
          // Si cambió el perfil actual, actualizar también
          const updatedProfile = payload.new;
          queryClient.setQueryData(
            ['current-profile'],
            (oldData: any) => {
              if (oldData && oldData.user_id === updatedProfile.user_id) {
                return { ...oldData, ...updatedProfile };
              }
              return oldData;
            }
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Limpiar suscripción al desmontar
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);
}
