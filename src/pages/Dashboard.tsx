import { Package, Wrench, HandCoins, Truck, AlertTriangle, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useApp } from '@/contexts/AppContext';
import { InventoryItem, Loan, Vehicle } from '@/types/inventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { items, loans, vehicles, currentUser } = useApp();

  const activeLoans = loans.filter(l => !l.returnedAt);
  const lowStockItems = items.filter(i => i.availableQuantity <= i.minStock);
  const materials = items.filter(i => i.category === 'material');
  const tools = items.filter(i => i.category === 'tool');
  const activeVehicles = vehicles.filter(v => v.status === 'active');

  const lowStockColumns: Column<InventoryItem>[] = [
    { key: 'name', header: 'Nombre', render: (item) => (
      <div className="font-medium">{item.name}</div>
    )},
    { key: 'category', header: 'Tipo', render: (item) => (
      <StatusBadge status={item.category === 'material' ? 'info' : 'neutral'}>
        {item.category === 'material' ? 'Material' : 'Herramienta'}
      </StatusBadge>
    )},
    { key: 'stock', header: 'Stock', render: (item) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-destructive">{item.availableQuantity}</span>
        <span className="text-muted-foreground">/ {item.quantity} {item.unit}</span>
      </div>
    )},
  ];

  const activeLoanColumns: Column<Loan>[] = [
    { key: 'itemName', header: 'Artículo', render: (loan) => (
      <div className="font-medium">{loan.itemName}</div>
    )},
    { key: 'borrowedBy', header: 'Prestado a', render: (loan) => loan.borrowedBy },
    { key: 'borrowedAt', header: 'Fecha', render: (loan) => (
      format(new Date(loan.borrowedAt), 'dd MMM yyyy', { locale: es })
    )},
    { key: 'status', header: 'Estado', render: (loan) => {
      const isOverdue = new Date(loan.expectedReturn) < new Date();
      return (
        <StatusBadge status={isOverdue ? 'danger' : 'warning'}>
          {isOverdue ? 'Vencido' : 'Pendiente'}
        </StatusBadge>
      );
    }},
  ];

  const vehicleColumns: Column<Vehicle>[] = [
    { key: 'plate', header: 'Patente', render: (v) => (
      <div className="font-mono font-semibold">{v.plate}</div>
    )},
    { key: 'vehicle', header: 'Vehículo', render: (v) => `${v.brand} ${v.model}` },
    { key: 'km', header: 'Kilometraje', render: (v) => (
      <span className="font-medium">{v.currentKm.toLocaleString()} km</span>
    )},
    { key: 'status', header: 'Estado', render: (v) => (
      <StatusBadge status={
        v.status === 'active' ? 'success' : 
        v.status === 'maintenance' ? 'warning' : 'neutral'
      }>
        {v.status === 'active' ? 'Activo' : v.status === 'maintenance' ? 'Mantención' : 'Inactivo'}
      </StatusBadge>
    )},
  ];

  return (
    <MainLayout>
      <PageHeader 
        title={`Bienvenido, ${currentUser?.name.split(' ')[0]}`}
        description="Resumen del inventario y operaciones de FESA"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Materiales"
          value={materials.length}
          subtitle={`${materials.reduce((acc, m) => acc + m.availableQuantity, 0)} unidades disponibles`}
          icon={<Package className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Herramientas"
          value={tools.length}
          subtitle={`${tools.filter(t => t.availableQuantity > 0).length} disponibles`}
          icon={<Wrench className="h-6 w-6" />}
          variant="default"
        />
        <StatCard
          title="Préstamos Activos"
          value={activeLoans.length}
          subtitle="pendientes de devolución"
          icon={<HandCoins className="h-6 w-6" />}
          variant={activeLoans.length > 5 ? 'warning' : 'success'}
        />
        <StatCard
          title="Vehículos"
          value={`${activeVehicles.length}/${vehicles.length}`}
          subtitle="operativos"
          icon={<Truck className="h-6 w-6" />}
          variant="default"
        />
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Stock Bajo</p>
            <p className="text-sm text-muted-foreground">
              {lowStockItems.length} artículos tienen stock bajo o agotado
            </p>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Stock Bajo
            </h2>
          </div>
          <DataTable
            columns={lowStockColumns}
            data={lowStockItems.slice(0, 5)}
            keyExtractor={(item) => item.id}
            emptyMessage="Todo el inventario tiene stock suficiente"
          />
        </div>

        {/* Active Loans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-display flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-accent" />
              Préstamos Activos
            </h2>
          </div>
          <DataTable
            columns={activeLoanColumns}
            data={activeLoans.slice(0, 5)}
            keyExtractor={(loan) => loan.id}
            emptyMessage="No hay préstamos activos"
          />
        </div>
      </div>

      {/* Vehicles */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estado de Vehículos
          </h2>
        </div>
        <DataTable
          columns={vehicleColumns}
          data={vehicles}
          keyExtractor={(v) => v.id}
          emptyMessage="No hay vehículos registrados"
        />
      </div>
    </MainLayout>
  );
}
