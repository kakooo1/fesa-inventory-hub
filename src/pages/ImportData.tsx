import { useState, useEffect } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ImportResults } from '@/components/inventory/ImportResults';
import { toast } from 'sonner';

export default function ImportData() {
  const { userProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [importType, setImportType] = useState('equipment');
  
  // Guardar el progreso en localStorage cuando cambien los resultados
  useEffect(() => {
    if (results) {
      localStorage.setItem('importProgress', JSON.stringify({ results, importType, timestamp: Date.now() }));
    }
  }, [results, importType]);
  
  // Recuperar el progreso guardado al cargar el componente
  useEffect(() => {
    const savedProgress = localStorage.getItem('importProgress');
    if (savedProgress) {
      try {
        const { results: savedResults, importType: savedType } = JSON.parse(savedProgress);
        setResults(savedResults);
        setImportType(savedType);
      } catch (error) {
        console.error('Error al recuperar progreso guardado:', error);
      }
    }
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  if (!isAdmin) {
    return (
      <MainLayout>
        <PageHeader title="Importar Datos" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores pueden importar datos.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  const downloadTemplate = (type: string) => {
    const templates: Record<string, any> = {
      equipment: [
        {
          'Nombre': 'Multímetro Digital',
          'Marca': 'Fluke',
          'Categoría': 'Equipo',
          'Cantidad': 5,
          'Unidad': 'unidad',
          'Stock Mínimo': 1,
          'Ubicación': 'Almacén A',
          'Descripción': 'Multímetro digital profesional',
        },
      ],
      tool: [
        {
          'Nombre': 'Destornillador Phillips',
          'Marca': 'Stanley',
          'Categoría': 'Herramienta',
          'Cantidad': 10,
          'Unidad': 'unidad',
          'Stock Mínimo': 2,
          'Ubicación': 'Almacén B',
          'Descripción': 'Destornillador de precisión',
        },
        {
          'Nombre': 'Llave Inglesa',
          'Marca': 'Crescent',
          'Categoría': 'Herramienta',
          'Cantidad': 8,
          'Unidad': 'unidad',
          'Stock Mínimo': 2,
          'Ubicación': 'Almacén B',
          'Descripción': 'Llave inglesa ajustable',
        },
      ],
      material: [
        {
          'Nombre': 'Tubo PVC 1/2"',
          'Marca': 'Pavco',
          'Categoría': 'Material',
          'Cantidad': 50,
          'Unidad': 'metro',
          'Stock Mínimo': 5,
          'Ubicación': 'Almacén C',
          'Descripción': 'Tubo PVC estándar',
        },
      ],
      clothing: [
        {
          'Nombre': 'Camiseta Polo Azul',
          'Marca': 'Uniforme Fesa',
          'Categoría': 'Ropa',
          'Cantidad': 20,
          'Unidad': 'unidad',
          'Stock Mínimo': 5,
          'Ubicación': 'Almacén D',
          'Descripción': 'Camiseta polo talla M',
        },
      ],
      epp: [
        {
          'Nombre': 'Casco de Seguridad',
          'Marca': '3M',
          'Categoría': 'EPP',
          'Cantidad': 15,
          'Unidad': 'unidad',
          'Stock Mínimo': 3,
          'Ubicación': 'Almacén E',
          'Descripción': 'Casco de seguridad certificado',
        },
      ],
      vehicle: [
        {
          'Placa': 'ABC-1234',
          'Marca': 'Toyota',
          'Modelo': 'Hilux',
          'Año': 2023,
          'KM Actual': 5000,
          'Estado': 'active',
          'Asignado a': 'Juan Pérez',
          'Próximo Mantenimiento KM': 10000,
        },
      ],
    };

    (async () => {
      try {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(templates[type] || []);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, `plantilla_${type}.xlsx`);
        toast.success(`Plantilla de ${type} descargada`);
      } catch {
        toast.error('Error al descargar plantilla. Instala las dependencias con: npm install');
      }
    })();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Dynamically import XLSX only when needed
      let XLSX: any;
      try {
        XLSX = await import('xlsx');
      } catch {
        toast.error('La librería XLSX no está disponible. Por favor instala las dependencias.');
        setUploading(false);
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Función para normalizar las claves (eliminar espacios, acentos inconsistentes)
      const normalizeKey = (key: string): string => {
        return key.trim();
      };

      // Función para normalizar filas
      const normalizeRow = (row: any): Record<string, any> => {
        const normalized: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = normalizeKey(key as string);
          normalized[normalizedKey] = value;
        }
        return normalized;
      };

      let imported = 0;
      let errors = 0;
      const errorList = [];

      for (let i = 0; i < rows.length; i++) {
        const rawRow = rows[i] as any;
        const row = normalizeRow(rawRow);
        
        try {
          // Validar que la fila no esté vacía (al menos un campo debe tener valor)
          const hasContent = Object.values(row).some(v => v !== undefined && v !== null && v !== '');
          if (!hasContent) {
            continue; // Saltar filas vacías
          }

          if (importType === 'equipment' || importType === 'tool' || importType === 'material' || importType === 'clothing' || importType === 'epp') {
            // Map Spanish categories to English
            const categoryMap: Record<string, string> = {
              'Equipo': 'equipment',
              'Herramienta': 'tool',
              'Material': 'material',
              'Ropa': 'clothing',
              'EPP': 'epp',
            };
            
            const nombre = row['Nombre']?.toString().trim() || '';
            const cantidad = parseInt(row['Cantidad']?.toString() || '0') || 0;
            const categoria = row['Categoría']?.toString().trim() || importType;
            
            // Validar campos requeridos
            if (!nombre) {
              errors++;
              errorList.push(`Fila ${i + 2}: El campo "Nombre" es requerido`);
              continue;
            }
            if (cantidad < 0) {
              errors++;
              errorList.push(`Fila ${i + 2}: La cantidad no puede ser negativa`);
              continue;
            }

            const mappedCategory = categoryMap[categoria] || categoria.toLowerCase();

            await supabase.from('inventory_items').insert({
              name: nombre,
              category: mappedCategory,
              quantity: cantidad,
              available_quantity: cantidad,
              unit: row['Unidad']?.toString().trim() || 'unidad',
              min_stock: parseInt(row['Stock Mínimo']?.toString() || '1') || 1,
              location: row['Ubicación']?.toString().trim() || '',
              description: row['Descripción']?.toString().trim() || '',
            });
            imported++;
          } else if (importType === 'vehicle') {
            const placa = row['Placa']?.toString().trim() || '';
            
            // Validar campos requeridos para vehículos
            if (!placa) {
              errors++;
              errorList.push(`Fila ${i + 2}: El campo "Placa" es requerido`);
              continue;
            }

            await supabase.from('vehicles').insert({
              plate: placa,
              brand: row['Marca']?.toString().trim() || '',
              model: row['Modelo']?.toString().trim() || '',
              year: parseInt(row['Año']?.toString() || '') || new Date().getFullYear(),
              current_km: parseInt(row['KM Actual']?.toString() || '0') || 0,
              status: row['Estado']?.toString().trim() || 'active',
              assigned_to: row['Asignado a']?.toString().trim() || null,
              next_maintenance_km: parseInt(row['Próximo Mantenimiento KM']?.toString() || '') || null,
            });
            imported++;
          }
        } catch (error: any) {
          errors++;
          errorList.push(`Fila ${i + 2}: ${error.message}`);
        }
      }

      setResults({
        imported,
        errors,
        total: rows.length,
        errorList: errorList.slice(0, 10), // Show first 10 errors
      });

      toast.success(`${imported} registros importados exitosamente`);
      if (errors > 0) {
        toast.error(`${errors} registros tuvieron errores`);
      }
    } catch (error: any) {
      toast.error('Error al procesar el archivo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setImportType(value);
    // Limpiar resultados al cambiar de pestaña para mostrar interfaz limpia
    setResults(null);
    // Limpiar localStorage del progreso anterior
    localStorage.removeItem('importProgress');
  };

  const clearProgress = () => {
    setResults(null);
    localStorage.removeItem('importProgress');
    toast.success('Progreso limpiado');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Importar Datos"
        description="Carga datos en lote desde archivos Excel"
      />

      <Tabs defaultValue="equipment" className="space-y-4" onValueChange={handleTabChange} value={importType}>
        <TabsList>
          <TabsTrigger value="equipment">Equipos</TabsTrigger>
          <TabsTrigger value="tool">Herramientas</TabsTrigger>
          <TabsTrigger value="material">Materiales</TabsTrigger>
          <TabsTrigger value="clothing">Ropa</TabsTrigger>
          <TabsTrigger value="epp">EPP</TabsTrigger>
          <TabsTrigger value="vehicle">Vehículos</TabsTrigger>
        </TabsList>

        {/* Equipment/Material Import */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Equipos</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold mb-2">Selecciona un archivo Excel</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Los archivos deben estar en formato .xlsx o .xls
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-input-equipment"
                  />
                  <Button
                    onClick={() => document.getElementById('file-input-equipment')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                  </Button>
                </div>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('equipment')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de Equipos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Import */}
        <TabsContent value="tool" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Herramientas</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="tool-file"
                />
                <label htmlFor="tool-file">
                  <Button
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                    </span>
                  </Button>
                </label>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('tool')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de Herramientas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Materiales</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold mb-2">Selecciona un archivo Excel</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Los archivos deben estar en formato .xlsx o .xls
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-input-material"
                  />
                  <Button
                    onClick={() => document.getElementById('file-input-material')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                  </Button>
                </div>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('material')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de Materiales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clothing Import */}
        <TabsContent value="clothing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Ropa</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-input-clothing"
                />
                <Button
                  onClick={() => document.getElementById('file-input-clothing')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                </Button>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('clothing')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de Ropa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EPP Import */}
        <TabsContent value="epp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar EPP</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-input-epp"
                />
                <Button
                  onClick={() => document.getElementById('file-input-epp')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                </Button>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('epp')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de EPP
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Vehículos</CardTitle>
              <CardDescription>
                Descarga la plantilla, complétala con tus datos y cárgala aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold mb-2">Selecciona un archivo Excel</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Los archivos deben estar en formato .xlsx o .xls
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-input-vehicle"
                  />
                  <Button
                    onClick={() => document.getElementById('file-input-vehicle')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                  </Button>
                </div>
              </div>

              <ImportResults results={results} onClear={clearProgress} />

              <Button
                variant="outline"
                onClick={() => downloadTemplate('vehicle')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla de Vehículos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Guía de Importación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Pasos para importar correctamente:</h4>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li>Descarga la plantilla del tipo de dato que quieres importar</li>
              <li>Abre el archivo en Excel o Google Sheets</li>
              <li>Completa los datos siguiendo el formato de ejemplo</li>
              <li>Guarda el archivo en formato .xlsx</li>
              <li>Selecciona el archivo en esta página y cargalo</li>
              <li>Revisa los resultados y cualquier error</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> Los datos se validarán automáticamente. Si hay errores,
              se mostrarán en el resultado para que puedas corregirlos e intentar nuevamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
