import { Wrench, FileText, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipmentRepairs, useMaterialRequests } from '@/hooks/useDatabase';
import { Skeleton } from '@/components/ui/skeleton';

export default function TechnicianDashboard() {
  const { userProfile } = useAuth();
  const { data: repairs = [], isLoading: repairsLoading } = useEquipmentRepairs();
  const { data: requests = [], isLoading: requestsLoading } = useMaterialRequests();

  // Filter equipment repairs
  const myRepairs = repairs.filter(r => r.technician_assigned_to === userProfile?.user_id);
  const pendingRepairs = myRepairs.filter(r => r.status === 'ingresado' || r.status === 'en_reparacion');
  const completedRepairs = myRepairs.filter(r => r.status === 'reparado' || r.status === 'no_reparable');

  // Filter material requests
  const myRequests = requests.filter(r => r.requester_id === userProfile?.user_id);
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');

  const isLoading = repairsLoading || requestsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Mi Dashboard Técnico" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Mi Dashboard Técnico" description="Gestiona tus reparaciones y solicitudes" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Reparaciones Pendientes"
          value={pendingRepairs.length}
          subtitle="en progreso"
          icon={<Wrench className="h-6 w-6" />}
          variant={pendingRepairs.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Reparaciones Completadas"
          value={completedRepairs.length}
          subtitle="finalizadas"
          icon={<Wrench className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={pendingRequests.length}
          subtitle="esperando aprobación"
          icon={<FileText className="h-6 w-6" />}
          variant={pendingRequests.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Reparaciones Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Mis Reparaciones</h3>
              <p className="text-muted-foreground text-sm mb-4">Total: {myRepairs.length} equipos</p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-600 font-medium">Pendientes: {pendingRepairs.length}</p>
                <p className="text-green-600 font-medium">Completadas: {completedRepairs.length}</p>
              </div>
            </div>
            <Wrench className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Solicitudes Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Mis Solicitudes</h3>
              <p className="text-muted-foreground text-sm mb-4">Total: {myRequests.length} solicitudes</p>
              <div className="space-y-2 text-sm">
                <p className="text-orange-600 font-medium">Pendientes: {pendingRequests.length}</p>
                <p className="text-green-600 font-medium">Aprobadas: {approvedRequests.length}</p>
              </div>
            </div>
            <FileText className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Actions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">¿Qué puedes hacer?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Crear y gestionar equipos en reparación</li>
              <li>✓ Crear solicitudes de materiales</li>
              <li>✓ Ver el estado de tus solicitudes</li>
              <li>✓ Ver tus equipos en reparación asignados</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
