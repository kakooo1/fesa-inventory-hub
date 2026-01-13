import { HandCoins, CheckCircle, AlertTriangle, Clock, Truck, RotateCcw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans, useVehicles, useReturnLoan, Loan, InventoryItem, Vehicle } from '@/hooks/useDatabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupervisorDashboard() {
  const { userProfile } = useAuth();
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();

  // Filter loans for this supervisor
  const mySupervisorLoans = loans.filter(l => l.borrowed_by === userProfile?.user_id);
  
  // Filter vehicles assigned to this supervisor
  const mySupervisorVehicles = vehicles.filter(v => v.assigned_to === userProfile?.user_id);

  // Calculate statistics
  const activeLoans = mySupervisorLoans.filter(l => !l.returned_at);
  const returnedLoans = mySupervisorLoans.filter(l => l.returned_at);
  const overdueLoans = activeLoans.filter(l => new Date(l.expected_return) < new Date());
  const activeVehicles = mySupervisorVehicles.filter(v => v.status === 'ok');

  const isLoading = loansLoading || vehiclesLoading;

  const loanColumns: Column<Loan & { item: InventoryItem }>[] = [
    {
      key: 'itemName',
      header: 'Artículo',
      render: (loan) => (
        <div>
          <p className="font-medium">{loan.item?.name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Cantidad: {loan.quantity}</p>
        </div>
      ),
    },
    {
      key: 'borrowedAt',
      header: 'Fecha préstamo',
      render: (loan) => format(new Date(loan.borrowed_at), 'dd MMM yyyy', { locale: es }),
    },
    {
      key: 'expectedReturn',
      header: 'Devolución esperada',
      render: (loan) => format(new Date(loan.expected_return), 'dd MMM yyyy', { locale: es }),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (loan) => {
        if (loan.returned_at) {
          return <StatusBadge status="success">Devuelto</StatusBadge>;
        }
        const isOverdue = new Date(loan.expected_return) < new Date();
        return (
          <StatusBadge status={isOverdue ? 'danger' : 'warning'}>
            {isOverdue ? 'Vencido' : 'Pendiente'}
          </StatusBadge>
        );
      },
    },
  ];

  const vehicleColumns: Column<Vehicle>[] = [
    {
      key: 'plate',
      header: 'Placa',
      render: (vehicle) => <p className="font-semibold text-blue-600">{vehicle.plate}</p>,
    },
    {
      key: 'brand',
      header: 'Marca',
      render: (vehicle) => `${vehicle.brand} ${vehicle.model}`,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (vehicle) => (
        <StatusBadge status={vehicle.status === 'active' ? 'success' : vehicle.status === 'maintenance' ? 'warning' : 'danger'}>
          {vehicle.status === 'active' ? 'Activo' : vehicle.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
        </StatusBadge>
      ),
    },
    {
      key: 'km',
      header: 'Km actuales',
      render: (vehicle) => <p className="font-medium">{vehicle.current_km.toLocaleString()}</p>,
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Mi Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Mi Dashboard" description="Resumen de tus préstamos y vehículos" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Préstamos Activos"
          value={activeLoans.length}
          subtitle="pendientes de devolución"
          icon={<HandCoins className="h-6 w-6" />}
          variant={activeLoans.length > 5 ? 'warning' : 'success'}
        />
        <StatCard
          title="Devueltos"
          value={returnedLoans.length}
          subtitle="completados"
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Préstamos Vencidos"
          value={overdueLoans.length}
          subtitle="requieren atención"
          icon={<AlertTriangle className="h-6 w-6" />}
          variant={overdueLoans.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Vehículos a Cargo"
          value={`${activeVehicles.length}/${mySupervisorVehicles.length}`}
          subtitle="operativos"
          icon={<Truck className="h-6 w-6" />}
          variant="default"
        />
      </div>

      {/* Active Loans Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Préstamos Activos ({activeLoans.length})</h2>
        </div>
        {activeLoans.length > 0 ? (
          <DataTable
            data={activeLoans}
            columns={loanColumns}
            keyExtractor={(loan) => loan.id}
          />
        ) : (
          <div className="text-center py-12">
            <HandCoins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes préstamos activos</p>
          </div>
        )}
      </div>

      {/* Overdue Loans Section (only if there are any) */}
      {overdueLoans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold text-red-600">Préstamos Vencidos ({overdueLoans.length})</h2>
          </div>
          <DataTable
            data={overdueLoans}
            columns={loanColumns}
            keyExtractor={(loan) => loan.id}
          />
        </div>
      )}

      {/* My Vehicles Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Vehículos a Mi Cargo ({mySupervisorVehicles.length})</h2>
        </div>
        {mySupervisorVehicles.length > 0 ? (
          <DataTable
            data={mySupervisorVehicles}
            columns={vehicleColumns}
            keyExtractor={(vehicle) => vehicle.id}
          />
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes vehículos asignados</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
