# Guía Completa de Importación de Inventarios

## 📋 Introducción

Esta guía te ayudará a cargar correctamente los inventarios de equipos, materiales y vehículos en el sistema FESA Inventory Hub. Sigue los pasos en el orden indicado para evitar problemas de integridad de datos.

---

## 🎯 Orden de Importación Recomendado

Para una carga correcta y sin errores, **DEBES SEGUIR ESTE ORDEN**:

### 1️⃣ **PRIMERO: Materiales**
   - Son la base del inventario
   - No tienen dependencias
   - Ejemplo: Tuberías, cables, tornillos

### 2️⃣ **SEGUNDO: Herramientas**
   - También son independientes
   - Pueden ser referencias para reparaciones
   - Ejemplo: Destornilladores, alicates

### 3️⃣ **TERCERO: Equipos**
   - Pueden referenciar materiales y herramientas
   - Base para registrar reparaciones
   - Ejemplo: Multímetros, compresores

### 4️⃣ **CUARTO: Vehículos**
   - Completamente independientes
   - Se pueden cargar en cualquier momento después
   - Ejemplo: Camionetas, furgones

---

## 📊 Estructura de las Plantillas

### Plantilla de MATERIALES/EQUIPOS/HERRAMIENTAS

| Campo | Descripción | Formato | Ejemplo |
|-------|-------------|---------|---------|
| **Nombre** | Nombre descriptivo del item | Texto | "Tubo PVC 1/2"" |
| **Marca** | Marca/Fabricante | Texto | "Pavco", "Fluke" |
| **Categoría** | Tipo de item | material / tool / equipment | "material" |
| **Cantidad** | Stock inicial | Número entero | 50 |
| **Unidad** | Unidad de medida | Texto | unidad, metro, caja, kg |
| **Stock Mínimo** | Cantidad mínima antes de alertar | Número entero | 5 |
| **Ubicación** | Dónde se almacena | Texto | "Almacén A", "Bodega Norte" |
| **Descripción** | Detalles adicionales | Texto (opcional) | "Tubo estándar de PVC" |

### Plantilla de VEHÍCULOS

| Campo | Descripción | Formato | Ejemplo |
|-------|-------------|---------|---------|
| **Placa** | Matrícula del vehículo | Texto | "ABC-1234" |
| **Marca** | Marca del vehículo | Texto | "Toyota" |
| **Modelo** | Modelo | Texto | "Hilux" |
| **Año** | Año de fabricación | Número | 2023 |
| **KM Actual** | Kilómetros actuales | Número | 5000 |
| **Estado** | Estado del vehículo | active / maintenance / inactive | "active" |
| **Asignado a** | Responsable del vehículo | Texto (opcional) | "Juan Pérez" |
| **Próximo Mantenimiento KM** | Km para próximo mantenimiento | Número (opcional) | 10000 |

---

## 🔧 Pasos de Importación

### Paso 1: Descargar la Plantilla

1. Accede a **Importar Datos** en el menú principal
2. Selecciona la pestaña del tipo que quieres importar (Equipos, Materiales, Vehículos)
3. Haz clic en **"Descargar Plantilla"**
4. Se descargará un archivo Excel con la estructura correcta

### Paso 2: Completar la Plantilla

1. Abre el archivo descargado en Excel o Google Sheets
2. **NO ELIMINES NI RENOMBRES LAS COLUMNAS** - Deben mantener los nombres exactos
3. Completa los datos en las filas, una por cada item
4. Respeta los formatos indicados en la tabla anterior
5. Deja vacíos solo los campos marcados como "(opcional)"

**Ejemplo para Materiales:**
```
Nombre                | Marca    | Categoría | Cantidad | Unidad | Stock Mínimo | Ubicación    | Descripción
Tubo PVC 1/2"        | Pavco    | material  | 50       | metro  | 5            | Almacén A    | Tubo estándar
Cinta Aislante       | 3M       | material  | 100      | rollo  | 10           | Almacén A    | Cinta negra
Tornillo M8          | DIN      | material  | 500      | unidad | 50           | Bodega B     | Acero inoxidable
```

### Paso 3: Guardar el Archivo

1. Guarda el archivo como **.xlsx** (Excel)
2. **NO guardes como .xls o .csv** - Solo acepta .xlsx
3. Usa un nombre descriptivo: `equipos_enero_2026.xlsx`

### Paso 4: Cargar el Archivo

1. Ve a **Importar Datos** en la aplicación
2. Selecciona la pestaña correspondiente al tipo de datos
3. Haz clic en **"Seleccionar Archivo"**
4. Elige tu archivo Excel completado
5. Espera a que se procese (puede tomar unos segundos)

### Paso 5: Revisar Resultados

Después de cargar:

- ✅ **Se mostrará un resumen** con cantidad de registros importados
- ⚠️ **Si hay errores**, aparecerá la lista de problemas con número de fila
- 🔄 **Si hay errores**, corrige el archivo y vuelve a intentar

---

## ⚠️ Validaciones y Restricciones

### Campos Obligatorios
- **Nombre**: No puede estar vacío
- **Categoría**: Debe ser exactamente: `material`, `tool` o `equipment`
- **Cantidad**: Debe ser un número mayor o igual a 0
- **Ubicación**: No puede estar vacío
- **Placa** (vehículos): No puede estar vacío y debe ser única

### Restricciones de Datos
- **Caracteres especiales**: Se permiten en la mayoría de campos
- **Acentos**: Se permiten: á, é, í, ó, ú, ñ, etc.
- **Longitud**: Máximo 255 caracteres por campo
- **Duplicados**: 
  - En materiales/equipos: Se permite el mismo nombre en diferentes ubicaciones
  - En vehículos: No se permite placas duplicadas

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Nombre es requerido" | Celda vacía en Nombre | Completa el campo Nombre |
| "Categoría inválida" | Valor no es material/tool/equipment | Usa exactamente los valores permitidos |
| "Cantidad no es un número" | Tiene letras o caracteres | Usa solo números |
| "Placa ya existe" | Ese vehículo ya está registrado | Verifica la matrícula y usa una nueva |

---

## 📝 Ejemplo Completo: Cargar Equipos

### Archivo `equipos_enero_2026.xlsx`

```
Nombre                    | Marca    | Categoría | Cantidad | Unidad   | Stock Min | Ubicación   | Descripción
Multímetro Digital        | Fluke    | equipment | 5        | unidad   | 1         | Almacén A   | Para mediciones eléctricas
Destornillador Phillips   | Stanley  | tool      | 10       | unidad   | 2         | Almacén B   | De precisión
Alicates de Corte         | Crescent | tool      | 8        | unidad   | 2         | Almacén B   | Para cables
Soldadura 60/40           | Kester   | material  | 20       | carrete  | 2         | Almacén C   | Estaño para soldadura
Pasta Térmica             | Arctic   | material  | 15       | tubo     | 3         | Almacén C   | Para disipadores
```

**Pasos:**
1. ✅ Descarga la plantilla de Equipos
2. ✅ Abre en Excel
3. ✅ Copia la tabla anterior
4. ✅ Guarda como `equipos_enero_2026.xlsx`
5. ✅ Carga el archivo
6. ✅ Confirma que se importaron 5 registros

---

## 🔐 Consideraciones de Seguridad

### Permisos
- **Solo Administradores** pueden importar datos
- Los cambios se registran automáticamente
- No se permite deshacer importaciones masivas (conserva copias de seguridad)

### Respaldo de Datos
Antes de cualquier importación masiva:

1. **Haz una copia de seguridad** del archivo Excel original
2. **Exporta los datos actuales** si es posible
3. **Prueba primero** con pocos registros

### Validación de Integridad
El sistema valida automáticamente:
- ✅ Tipos de datos correctos
- ✅ Campos obligatorios completos
- ✅ Valores únicos donde aplica
- ✅ Rangos de valores válidos

---

## 💡 Consejos y Mejores Prácticas

### ✓ Haz
- ✅ Organiza los datos antes de importar
- ✅ Usa descripciones claras y útiles
- ✅ Agrupa items por categoría o ubicación
- ✅ Revisa el archivo antes de cargar
- ✅ Mantén copias de seguridad
- ✅ Importa datos relacionados (Ubicaciones, Categorías) primero

### ✗ Evita
- ❌ Cambiar los nombres de las columnas
- ❌ Agregar filas vacías en el medio del documento
- ❌ Usar caracteres especiales innecesarios
- ❌ Importar datos sin validar primero
- ❌ Guardar en formato .csv o .xls
- ❌ Importar el mismo archivo dos veces

---

## 🆘 Solución de Problemas

### "No puedo seleccionar archivo"
- Verifica que sea formato `.xlsx`
- No uses archivos protegidos por contraseña

### "Se cargó pero sin resultados"
- Verifica que haya datos en la hoja
- Asegúrate de estar en la primera hoja del libro

### "Algunos registros filan y otros no"
- Lee los errores mostrados
- Corrige solo las filas con error
- Puedes cargar solo las filas faltantes nuevamente

### "El archivo parece corrupto"
- Abre en Excel y guarda nuevamente
- Copia los datos en una hoja nueva
- Intenta nuevamente

---

## 📞 Contacto y Soporte

Si encuentras problemas:

1. **Revisa esta guía** - La mayoría de problemas están documentados
2. **Consulta los errores específicos** - El sistema muestra qué está mal
3. **Contacta al administrador** - Para problemas técnicos

---

## 📅 Resumen Rápido

| Tipo | Orden | Campos Clave | Notas |
|------|-------|--------------|-------|
| Materiales | 1️⃣ | Nombre, Cantidad, Ubicación | Base del inventario |
| Herramientas | 2️⃣ | Nombre, Cantidad, Ubicación | Independientes |
| Equipos | 3️⃣ | Nombre, Categoría, Cantidad | Para reparaciones |
| Vehículos | 4️⃣ | Placa, Marca, Modelo | Plagas únicas |

---

**Última actualización**: Enero 2026

**Versión**: 1.0
