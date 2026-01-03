import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { MaterialRequestWithItems } from '@/hooks/useDatabase';

interface RequestDetailDialogProps {
  request: MaterialRequestWithItems | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDispatch?: () => void;
  isLoading?: boolean;
  showApprovalButtons?: boolean;
  showDispatchButtons?: boolean;
}

export const RequestDetailDialog: React.FC<RequestDetailDialogProps> = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onDispatch,
  isLoading = false,
  showApprovalButtons = false,
  showDispatchButtons = false,
}) => {
  if (!request) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Solicitante</p>
              <p className="font-semibold">{(request as any).profiles?.name || 'Desconocido'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              <div>{getStatusBadge(request.status)}</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fecha de Solicitud</p>
              <p className="text-sm">
                {format(new Date(request.request_date), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
            {request.approved_date && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha de Aprobación</p>
                <p className="text-sm">
                  {format(new Date(request.approved_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            )}
          </div>

          {/* Materials Table */}
          <div>
            <h3 className="font-semibold mb-3">Materiales Solicitados</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Material</th>
                    <th className="px-3 py-2 text-center font-medium">Solicitado</th>
                    <th className="px-3 py-2 text-center font-medium">Aprobado</th>
                    <th className="px-3 py-2 text-center font-medium">Despachado</th>
                  </tr>
                </thead>
                <tbody>
                  {request.material_request_items?.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2">
                        {item.inventory_items?.name || 'Desconocido'}
                      </td>
                      <td className="px-3 py-2 text-center font-medium">
                        {item.quantity_requested}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.quantity_approved !== null ? item.quantity_approved : '-'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.quantity_dispatched !== null ? item.quantity_dispatched : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notas</h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                {request.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {showApprovalButtons && request.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={onReject}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Rechazar
                </Button>
                <Button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Aprobar
                </Button>
              </>
            )}

            {showDispatchButtons && request.status === 'approved' && (
              <Button
                onClick={onDispatch}
                disabled={isLoading}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Despachar
              </Button>
            )}

            {!showApprovalButtons && !showDispatchButtons && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
