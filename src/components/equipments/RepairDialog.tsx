import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RepairFormData) => void;
  initialData?: RepairFormData;
  isEdit?: boolean;
  technicians?: Array<{ id: string; name: string }>;
  readOnly?: boolean;
  canEditStatus?: boolean;
}

export interface RepairFormData {
  id?: string;
  equipment_id: string;
  equipment_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  repair_notes: string;
  technician_notes: string;
  entry_date?: string;
  exit_date?: string;
}

export const RepairDialog: React.FC<RepairDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
  technicians = [],
  readOnly = false,
  canEditStatus = false,
}) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = React.useState<RepairFormData>({
    equipment_id: initialData?.equipment_id || "",
    equipment_name: initialData?.equipment_name || "",
    status: initialData?.status || "pending",
    assigned_to: initialData?.assigned_to || "",
    repair_notes: initialData?.repair_notes || "",
    technician_notes: initialData?.technician_notes || "",
    entry_date: initialData?.entry_date || new Date().toISOString().split('T')[0],
    exit_date: initialData?.exit_date || "",
  });

  const [selectedTech, setSelectedTech] = React.useState<string>(
    initialData?.assigned_to ? initialData.assigned_to : "none"
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedTech(initialData.assigned_to ? initialData.assigned_to : "none");
    }
  }, [initialData, open]);

  const isSupervisor = userProfile?.role === 'supervisor' || userProfile?.role === 'admin';
  const isTechnician = userProfile?.role === 'technician';
  const isAssignedTechnician = isTechnician && formData.assigned_to === userProfile?.id;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipment_id) {
      newErrors.equipment_id = "Equipo es requerido";
    }
    if (isSupervisor && !formData.repair_notes.trim()) {
      newErrors.repair_notes = "Descripción de la reparación es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      entry_date: formData.entry_date || new Date().toISOString().split('T')[0],
    };

    onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Reparación" : "Nueva Reparación"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment Info (Read-only for technicians) */}
          {!readOnly && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Equipo <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Nombre del equipo"
                value={formData.equipment_name}
                disabled={isEdit || isTechnician}
                className={errors.equipment_id ? "border-destructive" : ""}
              />
              {errors.equipment_id && (
                <p className="text-sm text-destructive mt-1">{errors.equipment_id}</p>
              )}
            </div>
          )}

          {/* Entry Date (Supervisors only) */}
          {isSupervisor && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Ingreso
              </label>
              <Input
                type="date"
                value={formData.entry_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                disabled={readOnly}
              />
            </div>
          )}

          {/* Status (Supervisors only) */}
          {isSupervisor && (
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as RepairFormData['status'],
                  })
                }
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Display (Technicians) */}
          {isTechnician && (
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {formData.status === 'pending' && 'Pendiente'}
                {formData.status === 'in_progress' && 'En Progreso'}
                {formData.status === 'completed' && 'Completada'}
                {formData.status === 'cancelled' && 'Cancelada'}
              </div>
            </div>
          )}

          {/* Assigned Technician (Supervisors only) */}
          {isSupervisor && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Asignar Técnico
              </label>
              <Select
                value={selectedTech}
                onValueChange={(value) => {
                  setSelectedTech(value);
                  setFormData({
                    ...formData,
                    assigned_to: value === "none" ? "" : value,
                  });
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned Technician Display */}
          {isTechnician && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Asignado a
              </label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {formData.assigned_to ? "Asignado a ti" : "No asignado"}
              </div>
            </div>
          )}

          {/* Repair Notes (Supervisors only) */}
          {isSupervisor && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción de la Reparación{" "}
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Detalles sobre la reparación a realizar..."
                value={formData.repair_notes}
                onChange={(e) =>
                  setFormData({ ...formData, repair_notes: e.target.value })
                }
                disabled={readOnly}
                className={`min-h-24 ${
                  errors.repair_notes ? "border-destructive" : ""
                }`}
              />
              {errors.repair_notes && (
                <p className="text-sm text-destructive mt-1">
                  {errors.repair_notes}
                </p>
              )}
            </div>
          )}

          {/* Repair Notes Display (Technicians) */}
          {isTechnician && formData.repair_notes && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción de la Reparación
              </label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {formData.repair_notes}
              </div>
            </div>
          )}

          {/* Technician Notes (Technicians and Supervisors) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas del Técnico
              {isTechnician && formData.assigned_to === userProfile?.id && (
                <span className="text-destructive">*</span>
              )}
            </label>
            <Textarea
              placeholder="Detalles sobre lo realizado en la reparación..."
              value={formData.technician_notes}
              onChange={(e) =>
                setFormData({ ...formData, technician_notes: e.target.value })
              }
              disabled={
                readOnly ||
                (isTechnician && formData.assigned_to !== userProfile?.id)
              }
              className="min-h-32"
            />
            {isTechnician && (
              <p className="text-xs text-muted-foreground mt-2">
                Solo puedes actualizar tus notas. El supervisor será quien
                marque como completada.
              </p>
            )}
          </div>

          {/* Completed Date (Supervisors only, when status is completed) */}
          {isSupervisor && formData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Finalización
              </label>
              <Input
                type="date"
                value={formData.exit_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, exit_date: e.target.value })
                }
                disabled={readOnly}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {!readOnly && (
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              {isEdit ? "Actualizar" : "Crear Reparación"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
