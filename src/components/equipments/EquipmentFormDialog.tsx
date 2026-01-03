import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Trash2, Plus, Check } from "lucide-react";

interface Equipment {
  name: string;
  marca: string;
  capacidad: string;
  modelo: string;
  cantidad: number;
  existencias: Array<{
    id: string;
    cantidad: number;
    descripcion: string;
  }>;
  selectedId?: string; // ID del equipo seleccionado para agregar stock
}

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Equipment, mode: 'create' | 'update') => void;
  initialData?: Equipment;
  isEdit?: boolean;
  existingEquipments?: Array<{
    id: string;
    name: string;
    marca: string;
    capacidad: string;
    modelo: string;
    quantity: number;
  }>;
}

export const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
  existingEquipments = [],
}) => {
  const [mode, setMode] = React.useState<'select' | 'create' | 'update'>('select');
  const [selectedEquipmentId, setSelectedEquipmentId] = React.useState<string>('');
  const [marca, setMarca] = React.useState(initialData?.marca || "");
  const [capacidad, setCapacidad] = React.useState(initialData?.capacidad || "");
  const [modelo, setModelo] = React.useState(initialData?.modelo || "");
  const [cantidad, setCantidad] = React.useState(initialData?.cantidad || 1);
  const [existencias, setExistencias] = React.useState(
    initialData?.existencias || []
  );

  React.useEffect(() => {
    if (isEdit) {
      setMode('update');
      setMarca(initialData?.marca || "");
      setCapacidad(initialData?.capacidad || "");
      setModelo(initialData?.modelo || "");
      setCantidad(initialData?.cantidad || 1);
      setExistencias(initialData?.existencias || []);
    } else {
      setMode('select');
      setSelectedEquipmentId('');
      setMarca("");
      setCapacidad("");
      setModelo("");
      setCantidad(1);
      setExistencias([]);
    }
  }, [initialData, isEdit, open]);

  const handleSubmitForm = () => {
    console.log('handleSubmitForm ejecutado', { mode, selectedEquipmentId, marca, capacidad, modelo, cantidad });
    
    if (mode === 'select' && selectedEquipmentId) {
      console.log('Modo select - agregando stock a:', selectedEquipmentId);
      const equipmentData = {
        name: '',
        marca: '',
        capacidad: '',
        modelo: '',
        cantidad,
        existencias: [],
        selectedId: selectedEquipmentId,
      };
      console.log('Enviando datos:', equipmentData);
      onSubmit(equipmentData, 'update');
      console.log('onSubmit ejecutado, cerrando diálogo');
      onOpenChange(false);
    } else if (mode === 'create' && (marca.trim() || capacidad.trim() || modelo.trim())) {
      console.log('Modo create - creando nuevo equipo');
      const equipmentName = `${marca} ${capacidad} ${modelo}`.trim();
      const equipmentData = {
        name: equipmentName,
        marca,
        capacidad,
        modelo,
        cantidad,
        existencias,
      };
      console.log('Enviando datos:', equipmentData);
      onSubmit(equipmentData, 'create');
      console.log('onSubmit ejecutado, cerrando diálogo');
      onOpenChange(false);
    } else if (isEdit && (marca.trim() || capacidad.trim() || modelo.trim())) {
      console.log('Modo edit - editando equipo');
      const equipmentName = `${marca} ${capacidad} ${modelo}`.trim();
      const equipmentData = {
        name: equipmentName,
        marca,
        capacidad,
        modelo,
        cantidad,
        existencias,
      };
      console.log('Enviando datos:', equipmentData);
      onSubmit(equipmentData, 'update');
      console.log('onSubmit ejecutado, cerrando diálogo');
      onOpenChange(false);
    } else {
      console.log('No se cumplió ninguna condición - validación fallida');
      console.log('Valores actuales:', { mode, selectedEquipmentId, marca, capacidad, modelo, isEdit });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar equipo" : "Agregar stock de equipo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmitForm(e);
        }} className="space-y-4">
          {!isEdit && existingEquipments.length > 0 && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold">¿Qué deseas hacer?</h3>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-3">
                  Selecciona un equipo existente para agregar stock, o crea uno nuevo
                </div>
                
                {existingEquipments.length > 0 && mode === 'select' && (
                  <>
                    {existingEquipments.map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => {
                          setSelectedEquipmentId(eq.id);
                          setCantidad(1);
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                          selectedEquipmentId === eq.id
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{eq.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock actual: {eq.quantity}
                            </p>
                          </div>
                          {selectedEquipmentId === eq.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedEquipmentId && (
                      <div className="space-y-2 mt-4 pt-4 border-t">
                        <label className="block text-sm font-medium">
                          Cantidad a agregar
                        </label>
                        <Input
                          type="number"
                          value={cantidad}
                          onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                          min={1}
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setMode('create')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear equipo nuevo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {(mode === 'create' || isEdit) && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold">Detalles del equipo</h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Marca</label>
                  <Input
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej: Samsung"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Capacidad
                  </label>
                  <Input
                    value={capacidad}
                    onChange={(e) => setCapacidad(e.target.value)}
                    placeholder="Ej: 12000 BTU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <Input
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej: AR12NSWSBURNZG"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <Input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                  placeholder="Cantidad disponible"
                  min={1}
                />
              </div>

              {!isEdit && mode === 'create' && existingEquipments.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode('select')}
                >
                  Volver a seleccionar
                </Button>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('Cancelar clickeado');
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={() => {
                console.log('Botón submit clickeado');
                handleSubmitForm();
              }}
            >
              {isEdit ? "Guardar cambios" : mode === 'select' && selectedEquipmentId ? "Agregar stock" : "Crear equipo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
