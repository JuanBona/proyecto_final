# Diseño — MVP Semi-productivo de Gestión de Viajes Corporativos

## 1. Problema y objetivo

El equipo necesita implementar un MVP de gestión de viajes corporativos para la materia, con calidad semi-productiva: autenticación real, persistencia robusta y despliegue operativo.  
El alcance acordado para esta fase es el flujo base end-to-end: **solicitud, aprobación, reserva (con proveedores mock) y rendición de gastos**, dejando geolocalización e IA avanzada para fases posteriores.

## 2. Alcance

### Incluido

- Solicitud de viaje por parte del viajero.
- Validación inicial de políticas.
- Flujo de aprobación/rechazo.
- Selección y confirmación de reserva con proveedores mock.
- Carga y validación de gastos con comprobantes.
- Revisión de excepciones por auditor/finanzas.
- Cierre administrativo del viaje.
- Auditoría básica y trazabilidad.

### Excluido (fase 2+)

- Geolocalización/geofencing.
- Asistente conversacional IA.
- Recomendador inteligente con aprendizaje continuo.
- Detección de anomalías con ML.
- BI avanzado y simulador de políticas.
- Integraciones reales con GDS/OTAs.

## 3. Arquitectura

### 3.1 Estilo

**Modular monolith** en TypeScript:

- Frontend web (panel por rol).
- Backend API único con módulos internos.
- PostgreSQL como fuente transaccional.
- Cola de eventos interna para procesos asíncronos.

Este enfoque prioriza velocidad y mantenibilidad para el contexto académico, preservando límites de dominio y facilitando migración futura a microservicios si hiciera falta.

### 3.2 Módulos del backend

- `auth-rbac`: login, refresh, autorización por rol.
- `trip-requests`: alta y edición de solicitudes.
- `approvals`: aprobación/rechazo con comentarios.
- `itinerary-catalog`: armado de opciones desde proveedores mock.
- `bookings`: confirmación de reserva y snapshot de decisión.
- `expenses`: carga de gastos, comprobantes y validaciones.
- `audit`: eventos de auditoría y reportes básicos.
- `notifications`: notificaciones de estados clave.
- `events`: outbox + worker para publicación/consumo de eventos.

### 3.3 Eventos de dominio

Eventos iniciales:

- `TripRequested`
- `TripApproved`
- `TripRejected`
- `BookingConfirmed`
- `ExpenseSubmitted`
- `ExpenseFlagged`
- `TripClosed`

Patrón recomendado: **outbox table + worker** para confiabilidad transaccional.

## 4. Roles y permisos

- **Viajero**: crea solicitudes, selecciona opciones, carga gastos/comprobantes.
- **Aprobador**: aprueba/rechaza solicitudes.
- **Auditor/Finanzas**: revisa excepciones, marca observaciones, cierra viaje.
- **Admin**: configura políticas y catálogos de referencia.

Permisos se aplican por endpoint y por acción (RBAC).

## 5. Flujo funcional

1. Viajero crea solicitud con destino, fechas, motivo, presupuesto y centro de costo.
2. Sistema valida políticas base (topes, ventanas de compra) y genera opciones de viaje mock.
3. Aprobador decide aprobar/rechazar.
4. Si aprueba, se confirma reserva y se persiste snapshot de costos/políticas aplicadas.
5. En/post viaje, viajero registra gastos con comprobantes.
6. Sistema valida reglas (categorías, topes, duplicados simples).
7. Excepciones pasan a auditor/finanzas.
8. Auditoría y cierre del viaje.

Estados de viaje:

`draft -> pending_approval -> approved/rejected -> booked -> in_trip -> expense_review -> closed`

## 6. Modelo de datos inicial

Tablas principales:

- `users`, `roles`, `user_roles`
- `trip_requests`
- `approvals`
- `itineraries`
- `bookings`
- `expenses`
- `receipts`
- `policy_rules`
- `audit_logs`
- `outbox_events`

Decisiones:

- `trip_requests` y `bookings` guardan trazabilidad de decisión.
- `bookings` conserva snapshot de precio/proveedor en momento de confirmación.
- `expenses` referencia `trip_request` y estado de validación.

## 7. Seguridad y cumplimiento

- Login real con JWT access + refresh rotativo.
- Hash de password con algoritmo seguro (bcrypt o argon2).
- Protección de endpoints por RBAC.
- Logs de auditoría para acciones críticas.
- Cifrado en tránsito (HTTPS) y secretos por variables de entorno.

## 8. Manejo de errores y resiliencia

- Contrato de error uniforme: `code`, `message`, `details`.
- Validaciones de negocio explícitas por caso de uso.
- Worker con reintentos acotados para outbox.
- Cola de errores (dead-letter lógica) para eventos fallidos.
- Sin silencios: toda falla relevante se registra y se expone de forma controlada.

## 9. Testing

Cobertura mínima esperada:

- **Unit**: reglas de política y validadores de gastos.
- **Integration**: flujo solicitud -> aprobación -> reserva -> gasto -> cierre.
- **E2E básico**: recorrido crítico por rol.

## 10. Despliegue y operación

- Contenedores con Docker Compose para:
  - frontend
  - backend
  - postgres
  - redis
  - almacenamiento de comprobantes (S3 compatible, p. ej. MinIO)
- Migraciones versionadas y seed base.
- Logs estructurados y métricas mínimas de API/worker.

## 11. Criterios de éxito del MVP

El MVP cumple su objetivo si permite gestionar un viaje completo end-to-end con:

1. autenticación real,
2. datos persistidos de forma robusta,
3. controles básicos de políticas y gastos,
4. trazabilidad auditable,
5. despliegue reproducible.

## 12. Fases siguientes (fuera de este MVP)

- Geolocalización y viáticos por presencia real.
- Integración de proveedores reales.
- IA conversacional y recomendación contextual.
- Auditoría inteligente con modelos de anomalías.
- BI avanzado y simulación de políticas.
