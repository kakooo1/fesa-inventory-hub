# Orden de Importación de Datos

## Descripción General
Este documento especifica el **orden exacto** en el que debes cargar las plantillas Excel para evitar errores de dependencias y asegurar la integridad de los datos.

---

## 📋 Orden de Importación (IMPORTANTE)

### **PASO 1: Equipos (Equipment)**
**Primero:** Importa los **Equipos** 

**Por qué:** Todos los préstamos y reparaciones dependen de los equipos existentes. Sin equipos, no puedes crear registros relacionados.

**Archivo:** `plantilla_equipment.xlsx`

**Columnas obligatorias:**
- **Nombre**: Nombre del equipo (ej: "Multímetro Digital")
- **Marca**: Fabricante (ej: "Fluke")
- **Categoría**: Tipo de equipo en ESPAÑOL (DEBE ser: "Equipo")
- **Cantidad**: Stock inicial en números (ej: 5)
- **Unidad**: Unidad de medida (ej: "unidad", "metro", "litro")
- **Stock Mínimo**: Cantidad mínima recomendada (ej: 1)
- **Ubicación**: Dónde está almacenado (ej: "Almacén A")
- **Descripción**: Detalles adicionales (ej: "Multímetro digital profesional")

**Ejemplo de datos:**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Multímetro Digital,Fluke,Equipo,5,unidad,1,Almacén A,Multímetro digital profesional
```

---

### **PASO 2: Herramientas (Tools)**
**Segundo:** Importa las **Herramientas**

**Por qué:** Las herramientas son items de inventario que se pueden prestar y reparar.

**Archivo:** `plantilla_tool.xlsx`

**Columnas obligatorias:**
- **Nombre**: Nombre de la herramienta (ej: "Destornillador Phillips")
- **Marca**: Fabricante (ej: "Stanley")
- **Categoría**: DEBE ser `"Herramienta"` en español
- **Cantidad**: Stock inicial
- **Unidad**: Unidad de medida (ej: "unidad")
- **Stock Mínimo**: Cantidad mínima
- **Ubicación**: Almacén o ubicación
- **Descripción**: Detalles

**Ejemplo de datos:**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Destornillador Phillips,Stanley,Herramienta,10,unidad,2,Almacén B,Destornillador de precisión
Llave Inglesa,Crescent,Herramienta,8,unidad,2,Almacén B,Llave inglesa ajustable
```

---

### **PASO 3: Materiales (Material)**
**Tercero:** Importa los **Materiales**

**Por qué:** Los materiales son independientes. Se cargan después de equipos y herramientas por consistencia.

**Archivo:** `plantilla_material.xlsx`

**Columnas obligatorias:**
- **Nombre**: Nombre del material (ej: "Tubo PVC 1/2\"")
- **Marca**: Fabricante (ej: "Pavco")
- **Categoría**: DEBE ser `"Material"` en español
- **Cantidad**: Stock inicial
- **Unidad**: Unidad de medida (ej: "metro", "kilogramo")
- **Stock Mínimo**: Cantidad mínima
- **Ubicación**: Almacén o ubicación
- **Descripción**: Detalles

**Ejemplo de datos:**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Tubo PVC 1/2",Pavco,Material,50,metro,5,Almacén C,Tubo PVC estándar
Cinta Aislante,3M,Material,100,metro,10,Almacén C,Cinta aislante roja
```

---

### **PASO 4: Vehículos (Vehicles)**
**Cuarto:** Importa los **Vehículos**

**Por qué:** Los vehículos no dependen de los equipos, herramientas ni materiales. Se cargan al final.

**Archivo:** `plantilla_vehicle.xlsx`

**Columnas obligatorias:**
- **Placa**: Matrícula del vehículo (ej: "ABC-1234")
- **Marca**: Fabricante (ej: "Toyota")
- **Modelo**: Modelo del vehículo (ej: "Hilux")
- **Año**: Año de fabricación en números (ej: 2023)
- **KM Actual**: Kilómetros actuales (ej: 5000)
- **Estado**: Estado del vehículo (ej: "active", "maintenance", "inactive")
- **Asignado a**: Nombre del responsable (ej: "Juan Pérez") - OPCIONAL
- **Próximo Mantenimiento KM**: KM para próximo mantenimiento (ej: 10000) - OPCIONAL

**Ejemplo de datos:**
```
Placa,Marca,Modelo,Año,KM Actual,Estado,Asignado a,Próximo Mantenimiento KM
ABC-1234,Toyota,Hilux,2023,5000,active,Juan Pérez,10000
DEF-5678,Nissan,Frontier,2022,15000,active,María García,20000
```

**Estados válidos:**
- `active` → Vehículo en uso
- `maintenance` → En mantenimiento
- `inactive` → Fuera de servicio

---

## 🚨 Restricciones y Validaciones

### **NO DEBES:**
1. ❌ Importar herramientas, materiales o vehículos antes que equipos (habrá errores)
2. ❌ Dejar columnas vacías si son obligatorias
3. ❌ Usar categorías que no estén en la lista anterior
4. ❌ Usar caracteres especiales sin codificar en Excel

### **VALIDACIONES AUTOMÁTICAS:**
- El sistema automáticamente convierte categorías en español a inglés
- Valores numéricos se convierten automáticamente
- Los errores se reportan fila por fila
- Los registros exitosos se guardan aunque haya errores en otros

---

## 📊 Ejemplo Completo de Flujo

### **Archivo 1: plantilla_equipment.xlsx**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Multímetro Digital,Fluke,Equipo,5,unidad,1,Almacén A,Multímetro digital profesional
```

**Resultado esperado:** ✅ 1 equipo importado

---

### **Archivo 2: plantilla_tool.xlsx**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Destornillador Phillips,Stanley,Herramienta,10,unidad,2,Almacén B,Destornillador de precisión
Llave Inglesa,Crescent,Herramienta,8,unidad,2,Almacén B,Llave inglesa ajustable
```

**Resultado esperado:** ✅ 2 herramientas importadas

---

### **Archivo 3: plantilla_material.xlsx**
```
Nombre,Marca,Categoría,Cantidad,Unidad,Stock Mínimo,Ubicación,Descripción
Tubo PVC 1/2",Pavco,Material,50,metro,5,Almacén C,Tubo PVC estándar
Cinta Aislante,3M,Material,100,metro,10,Almacén C,Cinta aislante roja
Tornillo M8,Stanley,Material,1000,pieza,100,Almacén D,Tornillo métrico M8
```

**Resultado esperado:** ✅ 3 materiales importados

---

### **Archivo 4: plantilla_vehicle.xlsx**
```
Placa,Marca,Modelo,Año,KM Actual,Estado,Asignado a,Próximo Mantenimiento KM
ABC-1234,Toyota,Hilux,2023,5000,active,Juan Pérez,10000
DEF-5678,Nissan,Frontier,2022,15000,active,María García,20000
```

**Resultado esperado:** ✅ 2 vehículos importados

---

## 🆘 Solución de Problemas

### **Error: "Fila X: violates foreign key constraint"**
**Causa:** Intentaste importar herramientas, materiales o vehículos sin haber importado los equipos primero
**Solución:** Importa primero `Equipos`, luego `Herramientas`, luego `Materiales`, finalmente `Vehículos`

### **Error: "Cantidad debe ser un número"**
**Causa:** Escribiste letras en la columna "Cantidad"
**Solución:** Usa solo números: `5` en lugar de `cinco`

### **Error: "Categoría no válida"**
**Causa:** Usaste "Equipment" en inglés en lugar de "Equipo" en español
**Solución:** Usa siempre en español: `Equipo`, `Herramienta`, `Material`

### **Error: "Ubicación debe tener valor"**
**Causa:** La columna está vacía
**Solución:** Especifica la ubicación: `Almacén A`, `Almacén B`, etc.

---

## ✅ Checklist Antes de Importar

- [ ] He descargado las 3 plantillas desde la aplicación
- [ ] Completé primero la plantilla de **Equipos**
- [ ] Completé la plantilla de **Herramientas** 
- [ ] Completé la plantilla de **Materiales** 
- [ ] Completé la plantilla de **Vehículos**
- [ ] Todas las categorías están en **ESPAÑOL**
- [ ] No hay celdas vacías en columnas obligatorias
- [ ] Los números están sin comillas o formato de texto
- [ ] Voy a importar en este orden: 1. Equipos, 2. Herramientas, 3. Materiales, 4. Vehículos

---

## 📞 Notas Finales

- Si importas fuera de orden, algunos registros pueden fallar
- Los registros exitosos se guardan aunque haya errores
- Puedes ver el detalle de errores en la pantalla después de importar
- Los datos en **ESPAÑOL** en la plantilla se convierten automáticamente a inglés en la base de datos
