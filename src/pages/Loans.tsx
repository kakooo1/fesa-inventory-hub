import { useState } from 'react';
import { Plus, Search, RotateCcw, HandCoins } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { Loan } from '@/types/inventory';
import { LoanFormDialog } from '@/components/loans/LoanFormDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Loans() {
  const { loans, returnLoan } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.itemName.toLowerCase().includes(search.toLowerCase()) ||
                         l.borrowedBy.toLowerCase().includes(search.toLowerCase());
    const isActive = !l.returnedAt;
    
    if (activeTab === 'active') return matchesSearch && isActive;
    if (activeTab === 'returned') return matchesSearch && !isActive;
    return matchesSearch;
  });

  const handleReturn = (loan: Loan) => {
    returnLoan(loan.id);
    toast.success(`"${loan.itemName}" devuelto correctamente`);
  };

  const columns: Column<Loan>[] = [
    { 
      key: 'itemName', 
      header: 'Artículo',
      render: (loan) => (
        <div>
          <p className="font-medium">{loan.itemName}</p>
          <p className="text-sm text-muted-foreground">Cantidad: {loan.quantity}</p>
        </div>
      )
    },
    { key: 'borrowedBy', header: 'Prestado a' },
    { 
      key: 'borrowedAt', 
      header: 'Fecha préstamo',
      render: (loan) => format(new Date(loan.borrowedAt), 'dd MMM yyyy', { locale: es })
    },
    { 
      key: 'expectedReturn', 
      header: 'Devolución esperada',
      render: (loan) => format(new Date(loan.expectedReturn), 'dd MMM yyyy', { locale: es })
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (loan) => {
        if (loan.returnedAt) {
          return <StatusBadge status="success">Devuelto</StatusBadge>;
        }
        const isOverdue = new Date(loan.expectedReturn) < new Date();
        return (
          <StatusBadge status={isOverdue ? 'danger' : 'warning'}>
            {isOverdue ? 'Vencido' : 'Pendiente'}
          </StatusBadge>
        );
      }
    },
    { 
      key: 'actions', 
      header: 'Acciones',
      className: 'text-right',
      render: (loan) => !loan.returnedAt && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleReturn(loan); }}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Devolver
        </Button>
      )
    },
  ];

  const activeCount = loans.filter(l => !l.returnedAt).length;
  const returnedCount = loans.filter(l => l.returnedAt).length;

  return (
    <MainLayout>
      <PageHeader 
        title="Préstamos"
        description="Gestiona los préstamos de herramientas y materiales"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Préstamo
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por artículo o persona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Activos
            {activeCount > 0 && (
              <span className="bg-warning/20 text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="returned">
            Devueltos ({returnedCount})
          </TabsTrigger>
          <TabsTrigger value="all">Todos ({loans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredLoans.length === 0 && !search ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'active' ? 'No hay préstamos activos' : 'No hay préstamos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'active' 
                  ? 'Todos los artículos han sido devueltos' 
                  : 'Registra un nuevo préstamo de herramienta o material'}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Préstamo
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredLoans}
              keyExtractor={(loan) => loan.id}
              emptyMessage="No se encontraron préstamos"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <LoanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </MainLayout>
  );
}
