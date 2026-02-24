# Solicitudes - Almacén de Retiro

Documentación para el equipo frontend sobre los cambios en el flujo de solicitudes.

## Resumen

Al aprobar una solicitud, ahora es **obligatorio** asignar el almacén donde el cliente retirará los medicamentos. Este dato se usa para crear el despacho cuando el cliente acuda a retirar.

---

## Cambios en la API

### 1. PATCH `/api/v1/admin/solicitudes/:id/estado` — Aprobar solicitud

Al cambiar el estado a `APROBADA`, se debe enviar el ID del almacén de retiro:

```json
{
  "estado": "APROBADA",
  "solicitud_de_retiro": 1,
  "observaciones": "Opcional"
}
```

**Parámetros aceptados** (uno de los dos):
- `solicitud_de_retiro` (integer) — ID del almacén
- `idalmacen_retiro` (integer) — ID del almacén (alias)

**Validación:** Si se aprueba sin enviar el almacén, responde `400` con mensaje:
> "Al aprobar la solicitud debe asignar el almacén de retiro (idalmacen_retiro)"

---

### 2. Respuestas — Nuevo campo `almacen_retiro`

En **todas** las consultas de solicitudes (listado y detalle) se incluye el almacén de retiro cuando está asignado:

**GET** `/api/v1/admin/solicitudes`  
**GET** `/api/v1/admin/solicitudes/:id`

```json
{
  "success": true,
  "data": {
    "numerosolicitud": 1,
    "estado": "APROBADA",
    "almacen_retiro": {
      "idalmacen": 1,
      "nombre": "Almacén Central",
      "direccion": "Calle Principal 123",
      "telefono": "809-555-0000",
      "correo": "almacen@ejemplo.com",
      "ciudad": {
        "codigociudad": "SD",
        "nombre": "Santo Domingo"
      }
    }
  }
}
```

`almacen_retiro` será `null` si la solicitud no está aprobada o no tiene almacén asignado.

---

## Flujo sugerido en el frontend

1. **Listar solicitudes** — Excluye PENDIENTE por defecto. Usar `?estado=PENDIENTE` si se necesitan borradores.
2. **Aprobar** — En el body: `estado: "APROBADA"` y `solicitud_de_retiro: <id>` (o `idalmacen_retiro`).
3. **Mostrar info de retiro** — Usar `almacen_retiro` para mostrar nombre, dirección y ciudad al usuario.
4. **Crear despacho** — Cuando el cliente retire, usar la solicitud con `almacen_retiro` ya asignado.

---

## Endpoints afectados

| Método | Endpoint | Cambio |
|--------|----------|--------|
| GET | `/solicitudes` | Incluye `almacen_retiro` en cada item |
| GET | `/solicitudes/:id` | Incluye `almacen_retiro` |
| PATCH | `/solicitudes/:id/estado` | Requiere `solicitud_de_retiro` al aprobar |
