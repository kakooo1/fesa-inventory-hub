# 🧪 GUÍA DE TESTING - Sistema de Solicitudes de Materiales

## ¡PROBEMOS TODO ANTES DE PRODUCCIÓN!

---

## 📋 CHECKLIST DE TESTING

- [ ] Las migraciones SQL se ejecutaron sin errores
- [ ] Puedo loguearme con diferentes roles
- [ ] Supervisor puede crear solicitudes
- [ ] Admin puede ver panel de aprobaciones
- [ ] Bodeguero puede ver panel de despacho
- [ ] Al aprobar, el stock se deduce
- [ ] stock_history registra los cambios
- [ ] Supervisor NO ve stock disponible
- [ ] Admin VE stock disponible
- [ ] Bodeguero VE stock disponible

---

## 🧑‍💻 USUARIOS DE PRUEBA

Para testear, crea estos usuarios en Supabase Auth (o usa los existentes):

### Usuario 1: SUPERVISOR
```
Email: supervisor@fesa.com
Password: Test123!@
Rol: supervisor
```

### Usuario 2: ADMIN
```
Email: admin@fesa.com
Password: Test123!@
Rol: admin
```

### Usuario 3: BODEGUERO
```
Email: bodeguero@fesa.com
Password: Test123!@
Rol: bodeguero
```

---

## 📝 TEST 1: SUPERVISOR CREA SOLICITUD

### Preparación
1. Ejecuta las 4 migraciones SQL en Supabase Dashboard
2. Abre tu app: `http://localhost:5173`
3. Loguéate como **SUPERVISOR**

### Pasos
```
1. ✓ Deberías ver "Solicitudes" en la navbar
2. ✓ Haz clic en "Solicitudes"
3. ✓ Ve la página: "Mis Solicitudes de Materiales"
4. ✓ Haz clic en "+ Nueva Solicitud"
5. ✓ Se abre un modal
6. ✓ Haz clic en "Agregar Material"
7. ✓ Selecciona un material (por ej: "Cemento")
8. ✓ Ingresa cantidad: 50
9. ✓ Haz clic en "Agregar Material" nuevamente si necesitas más
10. ✓ Ingresa notas: "Solicitud de prueba"
11. ✓ Haz clic en "Enviar Solicitud"
```

### Validaciones ✅
```
✓ Modal se cierra
✓ Toast dice: "Solicitud creada correctamente"
✓ Tab "Pendientes" muestra la nueva solicitud
✓ La solicitud tiene status "Pendiente"
✓ El formulario está vacío nuevamente
✓ IMPORTANTE: NO aparece la columna de "Stock Disponible"
```

### Verificar en BD
```
En Supabase → SQL Editor, ejecuta:
SELECT * FROM material_requests 
WHERE status = 'pending'
ORDER BY request_date DESC LIMIT 1;

Deberías ver:
- id: (uuid)
- requester_id: (tu user_id)
- status: 'pending'
- approved_by: NULL
- approved_date: NULL
```

---

## 🔴 TEST 2: ADMIN APRUEBA SOLICITUD

### Preparación
1. Loguéate como **ADMIN**
2. Ve a "Solicitudes"

### Pasos
```
1. ✓ Ve página: "Panel de Aprobaciones"
2. ✓ Ve tab "Pendientes" (por defecto)
3. ✓ La solicitud del supervisor aparece en la lista
4. ✓ Muestra: Solicitante, Materiales, Estado, Acciones
5. ✓ Haz clic en el botón "✓" (aprobar)
6. ✓ Se abre modal con detalles
7. ✓ Modal muestra tabla con materiales
8. ✓ Haz clic en botón "Aprobar"
```

### Validaciones ✅
```
✓ Modal se cierra
✓ Toast dice: "Solicitud aprobada y stock actualizado"
✓ Solicitud desaparece de "Pendientes"
✓ Aparece en tab "Aprobadas"
✓ Status cambió de "Pendiente" a "Aprobada"
✓ IMPORTANTE: Deberías ver stock disponible en el modal
```

### Verificar DEDUCCIÓN DE STOCK en BD
```
En Supabase → SQL Editor, ejecuta:
SELECT * FROM inventory_items 
WHERE id = 'material_id_que_solicitaste'
LIMIT 1;

Deberías ver:
- available_quantity: (número anterior - 50)
  Ej: Si había 150, ahora debe estar 100

SELECT * FROM stock_history 
WHERE operation_type = 'approval' 
ORDER BY created_at DESC 
LIMIT 1;

Deberías ver:
- operation_type: 'approval'
- quantity_change: -50
- performed_by: (tu admin user_id)
- related_request_id: (uuid de la solicitud)
```

---

## 🟢 TEST 3: BODEGUERO DESPACHA SOLICITUD

### Preparación
1. Loguéate como **BODEGUERO**
2. Ve a "Solicitudes"

### Pasos
```
1. ✓ Ve página: "Panel de Despacho"
2. ✓ Ve tab "Para Despachar"
3. ✓ La solicitud aprobada aparece en la lista
4. ✓ Muestra: Solicitante, Materiales, Estado, Acciones
5. ✓ Haz clic en botón "✓" (despachar)
6. ✓ Se abre modal con detalles
7. ✓ Haz clic en botón "Despachar"
```

### Validaciones ✅
```
✓ Modal se cierra
✓ Toast dice: "Solicitud despachada correctamente"
✓ Solicitud desaparece de "Para Despachar"
✓ Aparece en tab "Despachadas"
✓ Status cambió de "Aprobada" a "Despachada"
```

### Verificar stock_history
```
En Supabase → SQL Editor, ejecuta:
SELECT * FROM stock_history 
WHERE related_request_id = 'uuid_solicitud'
ORDER BY created_at;

Deberías ver 2 entradas:
1. operation_type: 'approval'   | quantity_change: -50
2. operation_type: 'dispatch'   | quantity_change: 0
```

---

## 🔐 TEST 4: VALIDACIÓN DE PERMISOS POR ROL

### TEST 4A: Supervisor NO ve stock

```
1. Loguéate como SUPERVISOR
2. Ve a "Solicitudes"
3. Haz clic en "+ Nueva Solicitud"
4. Abre un formulario

VALIDACIÓN:
✓ Ve campo "Material" (select)
✓ Ve campo "Cantidad" (input)
✓ Ve campo "Notas" (textarea)
✓ NO debería haber columna de "Stock Disponible"
✓ NO ve mensaje que diga "Stock disponible: 100"
```

### TEST 4B: Admin VE stock

```
1. Loguéate como ADMIN
2. Ve a "Solicitudes"
3. Haz clic en solicitud pendiente
4. Se abre modal

VALIDACIÓN:
✓ Ve tabla de materiales
✓ Tabla tiene columnas: Material | Solicitado | Aprobado | Despachado
✓ Puede ver la cantidad disponible si hace clic
```

### TEST 4C: Bodeguero VE stock

```
1. Loguéate como BODEGUERO
2. Ve a "Solicitudes"
3. Tab "Para Despachar"

VALIDACIÓN:
✓ Ve solicitudes aprobadas
✓ Botón "✓" aparece (despachar)
✓ Botón "✗" NO aparece (rechazar)
✓ No ve tab "Aprobaciones"
```

### TEST 4D: Supervisor NO ve solicitudes que no creó

```
1. SUPERVISOR-A crea solicitud
2. SUPERVISOR-B loguéate
3. Ve a "Solicitudes"

VALIDACIÓN:
✓ Tab "Pendientes" está vacío
✓ NO ve la solicitud de SUPERVISOR-A
✓ Solo ve sus propias solicitudes
```

---

## 🔴 TEST 5: VALIDACIONES DE DATOS

### TEST 5A: Cantidad debe ser > 0

```
1. Loguéate como SUPERVISOR
2. "+ Nueva Solicitud"
3. Selecciona material
4. Ingresa cantidad: 0 (o -5)
5. Intenta enviar

VALIDACIÓN:
✓ Botón "Enviar Solicitud" está deshabilitado
O
✓ Aparece error: "Complete todos los campos correctamente"
```

### TEST 5B: Debe seleccionar al menos un material

```
1. Loguéate como SUPERVISOR
2. "+ Nueva Solicitud"
3. NO selecciones ningún material
4. Intenta hacer clic en "Enviar Solicitud"

VALIDACIÓN:
✓ Alert dice: "Debe agregar al menos un material"
✓ Solicitud NO se crea
```

### TEST 5C: Stock insuficiente

```
1. ADMIN intenta aprobar solicitud con cantidad > disponible
   Ej: Hay 30 disponibles, solicitan 50

VALIDACIÓN:
✓ Sistema deduce el máximo disponible (30)
✓ O muestra advertencia: "Stock insuficiente"
✓ O permite aprobar parcialmente
```

---

## 📊 TEST 6: FLUJO COMPLETO (END-TO-END)

### Escenario: Solicitud de 100 sacos de Cemento

```
PASO 1: SUPERVISOR crea solicitud
├─ Material: Cemento
├─ Cantidad: 100
└─ Nota: "Construcción edificio A"

PASO 2: SUPERVISOR ve su solicitud
├─ Status: Pendiente
├─ Stock disponible: NO LO VE ✓
└─ Botones: [👁] (ver detalles)

PASO 3: ADMIN revisa solicitudes
├─ Ve "Pendientes": 1 solicitud
├─ Stock disponible Cemento: 200
├─ Aprueba (deducción: 200 - 100 = 100)
└─ Crea entrada en stock_history

PASO 4: BD actualiza en tiempo real
├─ inventory_items.available_quantity: 100
├─ material_requests.status: approved
├─ stock_history.operation_type: approval
└─ stock_history.quantity_change: -100

PASO 5: BODEGUERO despacha
├─ Ve "Para Despachar": 1 solicitud
├─ Stock disponible: 100 ✓
├─ Despacha
└─ Crea entrada en stock_history

PASO 6: BD actualiza
├─ material_requests.status: dispatched
├─ stock_history.operation_type: dispatch
└─ stock_history.quantity_change: 0
```

---

## 🆘 TROUBLESHOOTING

### Problema: "No veo Solicitudes en navbar"
```
Solución:
1. Verifica tu user tiene rol asignado en user_roles
2. Si tienes 'technician', cambia a 'supervisor' o 'bodeguero'
3. Recarga la página (F5)
4. Abre consola (F12) y busca errores
```

### Problema: "Stock no se deduce al aprobar"
```
Solución:
1. Verifica migración se ejecutó correctamente
2. SELECT * FROM material_requests - ¿existen registros?
3. SELECT * FROM inventory_items - ¿tiene available_quantity?
4. Revisa consola del navegador (F12) para errores
```

### Problema: "Formulario no valida"
```
Solución:
1. Consola F12 - ¿hay errores de JavaScript?
2. ¿Hay materiales en inventory_items con category='material'?
3. Intenta agregar un material en Materiales primera
4. Luego vuelve a intentar crear solicitud
```

### Problema: "No puedo rechazar solicitud"
```
Solución:
1. ¿Eres ADMIN?
2. ¿La solicitud está en status "pending"?
3. Abre modal de detalles (clic en 👁)
4. Debería ver botones [Rechazar] [Aprobar]
```

---

## 📈 VERIFICACIONES FINALES

```bash
# Verificar migraciones ejecutadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'material%';

# Debería devolver:
# material_requests
# material_request_items

# Verificar role_permissions
SELECT COUNT(*) FROM role_permissions;

# Debería devolver: 15 (15 permisos definidos)

# Verificar usuarios con roles
SELECT u.email, ur.role 
FROM profiles u 
LEFT JOIN user_roles ur ON u.user_id = ur.user_id;

# Debería mostrar:
# supervisor@fesa.com | supervisor
# admin@fesa.com | admin
# bodeguero@fesa.com | bodeguero
```

---

## 🎯 RESUMEN DE TESTING

| Feature | Status | Notas |
|---------|--------|-------|
| Crear solicitud (Supervisor) | ✅ | Debe funcionar sin errores |
| Aprobar solicitud (Admin) | ✅ | Stock debe deducirse automáticamente |
| Despachar solicitud (Bodeguero) | ✅ | Status debe cambiar a dispatched |
| Supervisor NO ve stock | ✅ | Campo completamente oculto |
| Admin VE stock | ✅ | Puede tomar decisión de aprobación |
| Bodeguero VE stock | ✅ | Auxilia en preparación de despacho |
| Historial de cambios | ✅ | stock_history con todos los cambios |
| Validaciones de datos | ✅ | Cantidad > 0, material seleccionado |
| Permisos por rol | ✅ | Solo acciones permitidas |

---

## ✅ CHECKLIST FINAL

Si todos los tests pasaron:
- [ ] Sistema de solicitudes funcionando
- [ ] Stock se deduce automáticamente
- [ ] Historial completo de cambios
- [ ] Permisos por rol funcionando
- [ ] UI responsive y user-friendly
- [ ] Manejo de errores correcto
- [ ] Toast notifications funcionando
- [ ] Datos persistidos en BD

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Si pasaste todos los tests, el sistema está listo para usar en producción.

**Tiempo estimado de testing:** 30-45 minutos
