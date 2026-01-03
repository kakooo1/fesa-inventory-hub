import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useInventoryItems, useCreateMaterialRequest } from '@/hooks/useDatabase';

interface RequestItem {
  material_id: string;
  quantity_requested: number;
  notes?: string;
}

interface MaterialRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requesterId: string;
  onSuccess?: () => void;
}

export const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({
  open,
  onOpenChange,
  requesterId,
  onSuccess,
}) => {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: materials = [] } = useInventoryItems();
  const createRequest = useCreateMaterialRequest();

  const addItem = () => {
    setItems([...items, { material_id: '', quantity_requested: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<RequestItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Debe agregar al menos un material');
      return;
    }

    // Validate all items have material_id and quantity
    if (items.some(item => !item.material_id || item.quantity_requested <= 0)) {
      alert('Complete todos los campos correctamente');
      return;
    }

    setIsLoading(true);
    try {
      await createRequest.mutateAsync({
        requester_id: requesterId,
        items,
        notes: notes.trim() || undefined,
      });
      
      // Reset form
      setItems([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Materiales</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Materiales Solicitados</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Agregar Material
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                No hay materiales agregados. Haz clic en "Agregar Material" para comenzar.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.material_id} onValueChange={(value) => updateItem(index, { material_id: value })}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity_requested}
                        onChange={(e) => updateItem(index, { quantity_requested: parseInt(e.target.value) || 1 })}
                        placeholder="Cantidad"
                        className="h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-9 w-9 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
            <Textarea
              placeholder="Agrrega notas adicionales sobre la solicitud..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || items.length === 0}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
