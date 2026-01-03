import { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGetNotifications, useMarkNotificationAsRead } from '@/hooks/useDatabase';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Notifications() {
  const { userProfile } = useAuth();
  const { data: userNotifications = [], isLoading } = useGetNotifications(userProfile?.role);
  const markAsRead = useMarkNotificationAsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousNotificationsCount = useRef(0);
  const { playSound } = useNotificationSound();

  // Reproducir sonido cuando lleguen notificaciones nuevas
  useEffect(() => {
    const currentUnreadCount = userNotifications.filter(n => !n.read_at).length;
    
    console.log('📢 Notificaciones check:', {
      currentUnreadCount,
      previousCount: previousNotificationsCount.current,
      soundEnabled,
      hasIncreased: currentUnreadCount > previousNotificationsCount.current,
    });
    
    // Si el número de notificaciones sin leer aumentó y el sonido está habilitado
    if (soundEnabled && currentUnreadCount > previousNotificationsCount.current && currentUnreadCount > 0) {
      console.log('🔊 Reproduciendo sonido de notificación');
      playSound();
    }
    
    previousNotificationsCount.current = currentUnreadCount;
  }, [userNotifications, soundEnabled, playSound]);

  if (!userProfile) {
    return (
      <MainLayout>
        <PageHeader title="Notificaciones" />
        <Skeleton className="h-64" />
      </MainLayout>
    );
  }

  // Filter based on read/unread status
  const statusFilteredNotifications = filter === 'unread'
    ? userNotifications.filter(n => !n.read_at)
    : userNotifications;

  const unreadCount = userNotifications.filter(n => !n.read_at).length;

  const handleMarkAsRead = async (notificationId: string) => {
    if (userProfile) {
      markAsRead.mutate({ notificationId, userId: userProfile.user_id });
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'vehicle_report') {
      return '🚗';
    } else if (type === 'material_request') {
      return '📦';
    }
    return '📢';
  };

  const getNotificationColor = (type: string) => {
    if (type === 'vehicle_report') {
      return 'bg-blue-50 border-blue-200';
    } else if (type === 'material_request') {
      return 'bg-amber-50 border-amber-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Notificaciones" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <PageHeader
            title="Notificaciones"
            description={`Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🔊 Prueba de sonido manual');
              playSound();
            }}
            className="gap-2"
            title="Probar sonido de notificación"
          >
            <span>🔊 Probar sonido</span>
          </Button>
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
            title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sonido activado</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline">Sonido desactivado</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas ({userNotifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Sin leer ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {statusFilteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'unread' ? 'Sin notificaciones sin leer' : 'Sin notificaciones'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? 'Todas tus notificaciones han sido leídas'
                : 'No hay notificaciones disponibles'}
            </p>
          </div>
        ) : (
          statusFilteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.read_at
                  ? 'bg-gray-50/50 border-gray-200'
                  : getNotificationColor(notification.notification_type)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">
                      {notification.title}
                      {!notification.read_at && (
                        <Badge variant="default" className="ml-2">
                          Nuevo
                        </Badge>
                      )}
                    </h3>
                  </div>
                  {notification.description && (
                    <p className="text-sm text-gray-700 mb-2 break-words">
                      {notification.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                    {notification.notification_type === 'vehicle_report' && (
                      <span className="text-blue-600 font-medium">Reporte de Vehículo</span>
                    )}
                    {notification.notification_type === 'material_request' && (
                      <span className="text-amber-600 font-medium">Solicitud de Material</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs"
                    >
                      Marcar como leída
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}
