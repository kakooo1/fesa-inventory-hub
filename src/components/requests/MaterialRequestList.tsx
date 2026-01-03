import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, X, Clock, CheckCircle, Eye, Package, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useMaterialRequests, MaterialRequestWithItems } from '@/hooks/useDatabase';

interface MaterialRequestListProps {
  status?: string;
  requester_id?: string;
  onApprove?: (request: MaterialRequestWithItems) => void;
  onReject?: (request: MaterialRequestWithItems) => void;
  onDispatch?: (request: MaterialRequestWithItems) => void;
  onMarkReady?: (request: MaterialRequestWithItems) => void;
  onMarkPickedUp?: (request: MaterialRequestWithItems) => void;
  onViewDetails?: (request: MaterialRequestWithItems) => void;
  showApprovalButtons?: boolean;
  showDispatchButtons?: boolean;
  showReadyButton?: boolean;
  showPickupButton?: boolean;
}

export const MaterialRequestList: React.FC<MaterialRequestListProps> = ({
  status,
  requester_id,
  onApprove,
  onReject,
  onDispatch,
  onMarkReady,
  onMarkPickedUp,
  onViewDetails,
  showApprovalButtons = false,
  showDispatchButtons = false,
  showReadyButton = false,
  showPickupButton = false,
}) => {
  const { data: requests = [], isLoading } = useMaterialRequests(status, requester_id);

  // Filtrar por status exacto para asegurar que solo se muestren los que coinciden
  const filteredRequests = useMemo(() => {
    if (!status) return requests;
    return requests.filter(r => r.status === status);
  }, [requests, status]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      approved: 'secondary',
      rejected: 'destructive',
      dispatched: 'default',
      completed: 'default',
    };

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      dispatched: 'Despachada',
      completed: 'Completada',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const columns: Column<MaterialRequestWithItems>[] = [
    {
      key: 'request_date',
      header: 'Fecha de Solicitud',
      render: (request) => (
        <span className="text-sm">
          {format(new Date(request.request_date), 'dd/MM/yyyy HH:mm', { locale: es })}
        </span>
      ),
    },
    {
      key: 'requester',
      header: 'Solicitante',
      render: (request) => (
        <div>
          <p className="font-medium">{(request as any).profiles?.name || 'Desconocido'}</p>
        </div>
      ),
    },
    {
      key: 'items_count',
      header: 'Materiales',
      render: (request) => (
        <span className="text-sm">
          {request.material_request_items?.length || 0} material(es)
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (request) => getStatusBadge(request.status),
    },
    {
      key: 'ready_status',
      header: 'Retiro',
      render: (request) => {
        if (request.status !== 'approved' && request.status !== 'dispatched') {
          return '-';
        }
        if (request.picked_up) {
          return <Badge className="bg-blue-100 text-blue-800">Retirado</Badge>;
        }
        return request.ready_for_pickup ? (
          <Badge className="bg-green-100 text-green-800">Listo</Badge>
        ) : (
          <Badge variant="outline">Pendiente</Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      render: (request) => (
        <div className="flex justify-end gap-1">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(request)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {showApprovalButtons && request.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApprove?.(request)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Aprobar"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject?.(request)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Rechazar"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          {showDispatchButtons && request.status === 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDispatch?.(request)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Despachar"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          {showReadyButton && (request.status === 'approved' || request.status === 'dispatched') && !(request as any).ready_for_pickup && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkReady?.(request)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="Marcar como listo para retiro"
            >
              <Package className="h-4 w-4" />
            </Button>
          )}

          {showPickupButton && request.ready_for_pickup && !request.picked_up && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkPickedUp?.(request)}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              title="Marcar como retirado"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Cargando solicitudes...</div>;
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-lg border">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
        <p className="text-muted-foreground">
          {status
            ? `No hay solicitudes en estado "${status}"`
            : 'No hay solicitudes para mostrar'}
        </p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={filteredRequests}
      keyExtractor={(request) => request.id}
      emptyMessage="No se encontraron solicitudes"
    />
  );
};
