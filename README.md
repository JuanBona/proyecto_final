# Proyecto Final — Plataforma de Viajes Corporativos

Proyecto académico para diseñar e implementar un sistema de gestión de viajes corporativos con foco en un **MVP semi-productivo**: flujo end-to-end, autenticación real, persistencia robusta y trazabilidad.

## Objetivo

Construir una solución que cubra el ciclo completo de un viaje corporativo:

1. Solicitud de viaje.
2. Aprobación o rechazo.
3. Reserva con proveedores mock.
4. Carga y validación de gastos.
5. Revisión y cierre administrativo.

## Alcance del MVP

### Incluye

- Flujo completo solicitud -> aprobación -> reserva -> gastos -> cierre.
- Roles y permisos (viajero, aprobador, auditor/finanzas, admin).
- Reglas base de políticas y validaciones de gastos.
- Auditoría y trazabilidad de eventos clave.

### No incluye (fase posterior)

- Geolocalización/geofencing.
- Asistente conversacional con IA.
- Recomendación inteligente y detección de anomalías con ML.
- Integraciones reales con proveedores externos.

## Arquitectura objetivo

- **Estilo:** modular monolith en TypeScript.
- **Backend:** API con módulos de dominio.
- **Frontend:** panel web por rol.
- **Datos:** PostgreSQL como fuente transaccional.
- **Integración interna:** eventos de dominio con patrón outbox + worker.

## Estado del repositorio

Este repositorio centraliza la documentación y evolución del proyecto.  
Actualmente, la referencia principal de diseño funcional/técnico está en:

- `docs/superpowers/specs/2026-04-12-viajes-corporativos-mvp-design.md`

## Integrantes

- Juan Cruz Bonanno
- Manuel Coccoz
- Felipe M Fernandez
