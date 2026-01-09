# 🎯 Instrucciones Finales de Implementación

## PASO 1: Actualizar Base de Datos ⚙️

### Opción A: Si usas Supabase CLI (Recomendado)

```bash
# En la raíz del proyecto
supabase migration up
```

### Opción B: Desde Supabase Console

1. Ve a [Supabase Console](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Haz clic en **New Query**
5. Copia el contenido de: `supabase/migrations/20260109_create_equipment_repairs.sql`
6. Pega en el editor
7. Clic en **Run**

✅ Verifica que se ejecutó sin errores

---

## PASO 2: Instalar Dependencias 📦

```bash
# En la raíz del proyecto
npm install
```

⏳ Espera a que se instalen todas las dependencias (especialmente `xlsx`)

---

## PASO 3: Verificar que todo funcione ✅

```bash
# Inicia el servidor de desarrollo
npm run dev
```

Abre http://localhost:5173 en tu navegador

### Checklist de Funcionalidades:

**Como Supervisor:**
- [ ] Ve el menú "Reparaciones"
- [ ] Puede clic "Nueva Reparación"
- [ ] Puede crear una reparación
- [ ] Puede asignar un técnico

**Como Técnico:**
- [ ] Ve el menú "Reparaciones"
- [ ] Solo ve reparaciones asignadas a él
- [ ] Puede editar y agregar notas técnicas
- [ ] NO puede cambiar el estado

**Como Admin:**
- [ ] Ve el menú "Importar Datos"
- [ ] Puede descargar plantillas
- [ ] Puede cargar archivos Excel

---

## PASO 4: Cargar Datos Iniciales (Recomendado)

Si tienes datos iniciales de equipos/materiales/vehículos:

### Orden Correcto:

1. **Materiales** (si existen)
2. **Herramientas** (si existen)
3. **Equipos**
4. **Vehículos**

### Cómo:

1. Ve a **Importar Datos**
2. Selecciona "Equipos"
3. Clic en **"Descargar Plantilla"**
4. Abre en Excel
5. Completa tus datos
6. Guarda como .xlsx
7. Clic en **"Seleccionar Archivo"**
8. Elige el archivo
9. Revisa los resultados

**Nota**: Si hay errores, corrige y vuelve a cargar

---

## PASO 5: Entrenar a los Usuarios 👥

Proporciona estos documentos a los usuarios:

### Para Supervisores:
- **GUIA_RAPIDA.md** - Instrucciones rápidas
- **RESUMEN_REPARACIONES_IMPORTACION.md** - Detalles técnicos

### Para Técnicos:
- **GUIA_RAPIDA.md** - Sección "Para Técnicos"
- Explicar que solo pueden escribir notas técnicas

### Para Administradores:
- **GUIA_IMPORTACION_DATOS.md** - Guía completa
- **GUIA_RAPIDA.md** - Referencia rápida
- **IMPLEMENTACION_COMPLETA.md** - Contexto técnico

---

## PASO 6: Testing Completo (Antes de Producción)

### Test 1: Crear Reparación

```
1. Login como Supervisor
2. Ve a Reparaciones → Nueva Reparación
3. Selecciona un equipo
4. Escribe descripción
5. Asigna un técnico
6. Clic Crear
✅ Debe funcionar
```

### Test 2: Editar como Técnico

```
1. Login como el Técnico asignado
2. Ve a Reparaciones
3. Debe ver SOLO la reparación asignada
4. Clic Editar
5. Escribe en "Notas del Técnico"
6. Clic Actualizar
✅ Debe funcionar
```

### Test 3: Completar como Supervisor

```
1. Login como Supervisor
2. Ve a Reparaciones
3. Clic Editar en la reparación
4. Cambiar Estado a "Completada"
5. Agregar fecha de finalización
6. Clic Actualizar
✅ Debe funcionar
```

### Test 4: Importación

```
1. Login como Admin
2. Ve a Importar Datos
3. Selecciona "Equipos"
4. Clic Descargar Plantilla
5. Completa 2-3 filas con datos
6. Guarda como .xlsx
7. Ve a Importar Datos
8. Clic Seleccionar Archivo
9. Selecciona tu archivo
✅ Debe importar exitosamente
```

---

## PASO 7: Verificar Permisos 🔐

Prueba que los permisos funcionan correctamente:

### Técnico NO puede:
- [ ] Ver reparaciones de otros técnicos
- [ ] Cambiar el estado
- [ ] Editar la descripción original
- [ ] Acceder a Importar Datos
- [ ] Ver menú Importar Datos

### Supervisor puede:
- [ ] Ver todas las reparaciones
- [ ] Crear reparaciones
- [ ] Asignar técnicos
- [ ] Cambiar estado
- [ ] Completar reparaciones

### Admin puede:
- [ ] Todo lo que Supervisor
- [ ] Importar datos
- [ ] Descargar plantillas

---

## PASO 8: Ir a Producción 🚀

Una vez todo funcione:

```bash
# Construir para producción
npm run build

# Verificar que no hay errores
```

Luego desplega según tu ambiente (Vercel, Docker, etc.)

---

## 📞 Solución de Problemas

### "No aparece el menú Reparaciones"

**Causa**: Probablemente no es supervisor ni admin  
**Solución**: Verifica que tu usuario tenga el rol correcto en la BD

```sql
SELECT * FROM user_roles WHERE user_id = 'tu_user_id';
-- Debe mostrar 'supervisor' o 'admin'
```

### "No puedo crear reparación"

**Causa**: No eres supervisor  
**Solución**: Solo supervisores pueden crear, técnicos solo ven asignadas

### "Error al importar: Cannot find module xlsx"

**Causa**: Las dependencias no se instalaron  
**Solución**: Ejecuta `npm install`

### "La tabla equipment_repairs no existe"

**Causa**: No corriste la migración  
**Solución**: Ejecuta `supabase migration up`

### "Puedo ver reparaciones de otros técnicos"

**Causa**: Probablemente eres supervisor o admin (normal)  
**Solución**: Los técnicos solo ven las suyas

---

## 📋 Checklist Final

Antes de ir a producción:

- [ ] Base de datos actualizada (migración ejecutada)
- [ ] Dependencias instaladas (npm install)
- [ ] Servidor dev funciona (npm run dev)
- [ ] Puedo crear reparación como supervisor
- [ ] Puedo editar notas como técnico
- [ ] Puedo completar como supervisor
- [ ] Puedo descargar plantilla
- [ ] Puedo importar datos
- [ ] Los permisos funcionan correctamente
- [ ] La documentación está disponible
- [ ] Los usuarios han sido entrenados

---

## 🎉 ¡Listo!

Si todos los pasos pasaron ✅, tu sistema está completamente funcional.

### Próximos Pasos:

1. Usa normalmente el sistema
2. Reporta bugs si los hay
3. Pide mejoras según necesidades
4. Mantén las guías actualizadas

---

## 📞 Contacto Técnico

Si tienes problemas:

1. Revisa **GUIA_RAPIDA.md**
2. Revisa **GUIA_IMPORTACION_DATOS.md**
3. Revisa **IMPLEMENTACION_COMPLETA.md**
4. Contacta al administrador de sistema

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: Listo para usar ✅
