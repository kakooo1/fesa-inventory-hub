# 🚀 Guía Rápida: Reparaciones e Importación

## Para Supervisores: Crear una Reparación

### 3 Pasos Simples:

```
1. Menú → Reparaciones
2. "Nueva Reparación"
3. Rellenar:
   - Equipo (seleccionar)
   - Descripción de reparación
   - Asignar técnico
   - Clic "Crear Reparación"
```

**Listo ✅** El técnico verá la reparación asignada

---

## Para Técnicos: Actualizar Reparación

### 3 Pasos Simples:

```
1. Menú → Reparaciones
2. Ver solo las tuyas asignadas
3. Clic en Editar (🖊️)
   - Escribe lo que hiciste en "Notas del Técnico"
   - Clic "Actualizar"
```

**Nota**: El supervisor es quien marca como "Completada"

---

## Para Administradores: Importar Inventarios

### Orden Correcto:

```
1️⃣  Materiales
2️⃣  Herramientas  
3️⃣  Equipos
4️⃣  Vehículos
```

### Pasos:

```
1. Menú → Importar Datos
2. Selecciona tipo (Equipos, Materiales, Vehículos)
3. Clic "Descargar Plantilla"
4. Abre en Excel → Completa datos
5. Guarda como .xlsx
6. Vuelve a "Importar Datos"
7. Clic "Seleccionar Archivo"
8. Elige tu archivo Excel
9. Revisa resultados
```

**Listo ✅** Los datos están en el sistema

---

## Restricciones por Rol

### Supervisores pueden:
✅ Crear reparaciones  
✅ Asignar técnicos  
✅ Cambiar estado  
✅ Marcar como completada  
✅ Ver todas las reparaciones  
✅ Editar todo  

### Técnicos pueden:
✅ Ver reparaciones asignadas a ellos  
✅ Escribir notas técnicas  
✅ Actualizar notas  
❌ Cambiar estado  
❌ Ver otras reparaciones  
❌ Editar descripciones  

### Administradores:
✅ Todo lo de supervisores  
✅ Importar datos en lote  
✅ Descargar plantillas  
✅ Gestionar usuarios  

---

## Columnas en Plantillas

### Materiales/Equipos:
```
Nombre | Marca | Categoría | Cantidad | Unidad | 
Stock Mínimo | Ubicación | Descripción
```

### Vehículos:
```
Placa | Marca | Modelo | Año | KM Actual | 
Estado | Asignado a | Próximo Mantenimiento KM
```

---

## Valores Permitidos

### Categoría:
- `material`
- `tool`  
- `equipment`

### Estado Vehículo:
- `active`
- `maintenance`
- `inactive`

### Estado Reparación:
- `pending` (Pendiente)
- `in_progress` (En Progreso)
- `completed` (Completada)
- `cancelled` (Cancelada)

---

## Errores Comunes & Soluciones

| Problema | Solución |
|----------|----------|
| "Archivo no válido" | Debe ser .xlsx (Excel) |
| "Nombre es requerido" | Completa el campo Nombre |
| "Categoría inválida" | Usa: material, tool, equipment |
| "Cantidad no es número" | Usa solo números (ej: 50) |
| "Placa duplicada" | Ese vehículo ya existe |

---

## Estados de Reparación

```
Pendiente → En Progreso → Completada
                       → Cancelada
```

Solo supervisor puede cambiar estados.

---

## Recuerda:

✓ Importa en ORDEN: Materiales → Herramientas → Equipos → Vehículos  
✓ Archivos siempre .xlsx  
✓ Técnicos solo escriben notas, no pueden completar  
✓ Supervisores controlan todo en reparaciones  
✓ Admin importa datos y gestiona usuarios  

---

**¿Dudas?** Revisa la guía completa: `GUIA_IMPORTACION_DATOS.md`
