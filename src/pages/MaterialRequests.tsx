import React, { useState } from 'react';
import { Plus, PackageOpen, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  useMaterialRequests,
  useApproveMaterialRequest,
  useRejectMaterialRequest,
  useDispatchMaterialRequest,
  useMarkReadyForPickup,
  useMarkAsPickedUp,
  MaterialRequestWithItems,
} from '@/hooks/useDatabase';
import { MaterialRequestForm } from '@/components/requests/MaterialRequestForm';
import { MaterialRequestList } from '@/components/requests/MaterialRequestList';
import { RequestDetailDialog } from '@/components/requests/RequestDetailDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MaterialRequests() {
  const { userProfile } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestWithItems | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pendientes');

  const approveMutation = useApproveMaterialRequest();
  const rejectMutation = useRejectMaterialRequest();
  const dispatchMutation = useDispatchMaterialRequest();
  const markReadyMutation = useMarkReadyForPickup();
  const markPickedUpMutation = useMarkAsPickedUp();

  if (!userProfile) {
    return (
      <MainLayout>
        <PageHeader title="Solicitudes de Materiales" />
        <Skeleton className="h-64" />
      </MainLayout>
    );
  }

  const isAdmin = userProfile.role === 'admin';
  const isSupervisor = userProfile.role === 'supervisor';
  const isBodeguero = userProfile.role === 'bodeguero';

  // ============ SUPERVISOR VIEW ============
  if (isSupervisor) {
    return (
      <MainLayout>
        <PageHeader
          title="Mis Solicitudes de Materiales"
          description="Crea y gestiona tus solicitudes de materiales"
          actions={
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="aprobadas">Aprobadas / Listas</TabsTrigger>
            <TabsTrigger value="rechazadas">Rechazadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes" className="mt-6">
            <MaterialRequestList
              status="pending"
              requester_id={userProfile.user_id}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="aprobadas" className="mt-6">
            <MaterialRequestList
              status="approved"
              requester_id={userProfile.user_id}
              onMarkPickedUp={(request) => {
                markPickedUpMutation.mutate({
                  requestId: request.id,
                  pickedUpBy: userProfile.user_id,
                });
                setDetailOpen(false);
                setSelectedRequest(null);
              }}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              showPickupButton={true}
            />
          </TabsContent>

          <TabsContent value="rechazadas" className="mt-6">
            <MaterialRequestList
              status="rejected"
              requester_id={userProfile.user_id}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>

        <MaterialRequestForm
          open={formOpen}
          onOpenChange={setFormOpen}
          requesterId={userProfile.user_id}
          onSuccess={() => setActiveTab('pendientes')}
        />

        <RequestDetailDialog
          request={selectedRequest}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </MainLayout>
    );
  }

  // ============ ADMIN VIEW ============
  if (isAdmin) {
    const handleApprove = async (request: MaterialRequestWithItems) => {
      try {
        await approveMutation.mutateAsync({
          requestId: request.id,
          approvedBy: userProfile.user_id,
        });
        setDetailOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error al aprobar:', error);
      }
    };

    const handleReject = async (request: MaterialRequestWithItems) => {
      try {
        await rejectMutation.mutateAsync({
          requestId: request.id,
          rejectedBy: userProfile.user_id,
        });
        setDetailOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error al rechazar:', error);
      }
    };

    return (
      <MainLayout>
        <PageHeader
          title="Panel de Aprobaciones"
          description="Revisa y aprueba las solicitudes de materiales pendientes"
        />

        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Tienes que aprobar las solicitudes para que se descuente automáticamente el stock disponible.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
            <TabsTrigger value="rechazadas">Rechazadas</TabsTrigger>
            <TabsTrigger value="despachadas">Despachadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes" className="mt-6">
            <MaterialRequestList
              status="pending"
              onApprove={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              onReject={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              showApprovalButtons={true}
            />
          </TabsContent>

          <TabsContent value="aprobadas" className="mt-6">
            <MaterialRequestList
              status="approved"
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="rechazadas" className="mt-6">
            <MaterialRequestList
              status="rejected"
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="despachadas" className="mt-6">
            <MaterialRequestList
              status="dispatched"
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>

        <RequestDetailDialog
          request={selectedRequest}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onApprove={() => selectedRequest && handleApprove(selectedRequest)}
          onReject={() => selectedRequest && handleReject(selectedRequest)}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
          showApprovalButtons={selectedRequest?.status === 'pending'}
        />
      </MainLayout>
    );
  }

  // ============ BODEGUERO VIEW ============
  if (isBodeguero) {
    const handleDispatch = async (request: MaterialRequestWithItems) => {
      try {
        await dispatchMutation.mutateAsync({
          requestId: request.id,
          dispatchedBy: userProfile.user_id,
        });
        setDetailOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error al despachar:', error);
      }
    };

    const handleMarkReady = async (request: MaterialRequestWithItems) => {
      try {
        await markReadyMutation.mutateAsync({
          requestId: request.id,
          markedBy: userProfile.user_id,
        });
        setDetailOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error al marcar como listo:', error);
      }
    };

    return (
      <MainLayout>
        <PageHeader
          title="Despacho de Solicitudes"
          description="Prepara y marca listo para retiro las solicitudes aprobadas"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="aprobadas">Por Despachar</TabsTrigger>
            <TabsTrigger value="despachadas">Despachadas</TabsTrigger>
          </TabsList>

          <TabsContent value="aprobadas" className="mt-6">
            <MaterialRequestList
              status="approved"
              onDispatch={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              onMarkReady={(request) => {
                handleMarkReady(request);
              }}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              showDispatchButtons={true}
              showReadyButton={true}
            />
          </TabsContent>

          <TabsContent value="despachadas" className="mt-6">
            <MaterialRequestList
              status="dispatched"
              onMarkReady={(request) => {
                handleMarkReady(request);
              }}
              onViewDetails={(request) => {
                setSelectedRequest(request);
                setDetailOpen(true);
              }}
              showReadyButton={true}
            />
          </TabsContent>
        </Tabs>

        <RequestDetailDialog
          request={selectedRequest}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onDispatch={() => selectedRequest && handleDispatch(selectedRequest)}
          isLoading={dispatchMutation.isPending || markReadyMutation.isPending}
          showDispatchButtons={selectedRequest?.status === 'approved'}
        />
      </MainLayout>
    );
  }

  // ============ DEFAULT VIEW (TECHNICIAN or other roles) ============
  return (
    <MainLayout>
      <PageHeader
        title="Solicitudes de Materiales"
        description="No tienes permiso para acceder a esta sección"
      />

      <Alert className="mt-6 bg-amber-50 border-amber-200">
        <FileText className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Tu rol no tiene acceso a la gestión de solicitudes de materiales. Contacta al administrador si crees que esto es un error.
        </AlertDescription>
      </Alert>
    </MainLayout>
  );
}
