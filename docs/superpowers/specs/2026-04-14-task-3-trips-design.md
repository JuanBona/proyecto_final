# Diseño — Task 3: Solicitudes y Aprobaciones de Viaje

## 1. Objetivo

Implementar el flujo base de solicitudes de viaje: el viajero crea y envía una solicitud, y el aprobador la aprueba o rechaza.

## 2. Alcance

### Incluido
- CRUD de solicitudes de viaje (módulo `trips`)
- Flujo de estados: `draft → pending_approval → approved / rejected`
- Endpoints protegidos por JWT + RBAC
- Modelos Prisma: `TripRequest` y `Approval`

### Excluido
- Tests (Task 7)
- Integración con IA (fase posterior)
- Notificaciones
- Edición de solicitud rechazada

## 3. Estructura de archivos

```
apps/api/src/trips/
  trips.module.ts
  trips.controller.ts
  trips.service.ts
```

Se registra en `AppModule`. Reutiliza `PrismaModule`, `JwtAuthGuard` y `RolesGuard` existentes.

## 4. Modelo de datos

### TripRequest

| campo        | tipo           | descripción                                          |
|--------------|----------------|------------------------------------------------------|
| id           | String (cuid)  | PK                                                   |
| travelerId   | String         | FK → User                                            |
| destination  | String         | Destino del viaje                                    |
| startDate    | DateTime       | Fecha de salida                                      |
| endDate      | DateTime       | Fecha de regreso                                     |
| reason       | String         | Motivo del viaje                                     |
| budget       | Float          | Presupuesto en $                                     |
| costCenter   | String         | Centro de costo (área o proyecto que absorbe el gasto) |
| status       | String         | `draft` / `pending_approval` / `approved` / `rejected` |
| createdAt    | DateTime       | Auto                                                 |
| updatedAt    | DateTime       | Auto                                                 |

### Approval

| campo          | tipo          | descripción                        |
|----------------|---------------|------------------------------------|
| id             | String (cuid) | PK                                 |
| tripRequestId  | String        | FK → TripRequest                   |
| approverId     | String        | FK → User                          |
| decision       | String        | `approved` / `rejected`            |
| comment        | String?       | Comentario opcional del aprobador  |
| createdAt      | DateTime      | Auto                               |

## 5. Endpoints

| Método | Ruta                    | Rol                   | Descripción                                      |
|--------|-------------------------|-----------------------|--------------------------------------------------|
| POST   | `/trips`                | traveler              | Crea solicitud en estado `draft`                 |
| POST   | `/trips/:id/submit`     | traveler              | Pasa de `draft` a `pending_approval`             |
| GET    | `/trips`                | traveler / approver   | Viajero ve las suyas; aprobador ve `pending_approval` |
| GET    | `/trips/:id`            | traveler / approver   | Ver detalle de una solicitud                     |
| POST   | `/trips/:id/approve`    | approver              | Aprueba la solicitud                             |
| POST   | `/trips/:id/reject`     | approver              | Rechaza con comentario opcional                  |

Todos los endpoints requieren JWT (`JwtAuthGuard`). Los de rol específico también usan `RolesGuard`.

## 6. Flujo de estados

```
draft → pending_approval → approved
                        → rejected
```

### Reglas de negocio
- Solo el dueño (`travelerId`) puede hacer submit de su solicitud.
- Solo un usuario con rol `approver` puede aprobar o rechazar.
- No se puede aprobar/rechazar una solicitud que no esté en `pending_approval`.
- El viajero solo puede ver y operar sus propias solicitudes.
- El aprobador ve todas las solicitudes en `pending_approval`.

## 7. Contrato de errores

Todos los errores siguen el formato:

```json
{
  "code": "TRIP_NOT_FOUND",
  "message": "Trip request not found",
  "statusCode": 404
}
```

| Código HTTP | code                    | Situación                                              |
|-------------|-------------------------|--------------------------------------------------------|
| 404         | `TRIP_NOT_FOUND`        | La solicitud no existe                                 |
| 403         | `FORBIDDEN`             | El viajero intenta operar sobre una solicitud ajena    |
| 409         | `INVALID_STATUS`        | Acción inválida para el estado actual                  |
| 400         | `VALIDATION_ERROR`      | Campos faltantes o inválidos                           |

## 8. Integración con IA (futura)

El diseño es compatible con un asistente de IA futuro. La IA interpretará lenguaje natural y llamará a `POST /trips` con los campos ya completados, creando un `draft` que el viajero confirma antes de hacer submit. No requiere cambios en este módulo.
