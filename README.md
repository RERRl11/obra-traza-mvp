# OBRA TRAZA

Plataforma web para la gestión preventiva, seguimiento contractual y trazabilidad de la ejecución física y financiera en obras públicas.

Propuesta desarrollada para el **Desafío 1: Contrataciones públicas y ejecución de obras** de la **Hackathon Innova Norte 3G** (Universidad Nacional de Trujillo - Red Universitaria de Innovación, 2026).

---

## 1. Descripción del Problema

Durante la ejecución de obras públicas, el seguimiento de las condiciones contractuales exige verificar de forma continua el cumplimiento de obligaciones, plazos, especificaciones técnicas y presupuestos. En la práctica, esta información suele encontrarse dispersa entre contratos, expedientes técnicos, cronogramas, cuadernos de obra e informes aislados.

Esta fragmentación dificulta:
- Contrastar oportunamente si lo ejecutado en campo coincide con lo contratado.
- Identificar fechas límite de pronunciamientos sobre ampliaciones de plazo, prestaciones adicionales o suspensiones.
- Mantener la trazabilidad de las incidencias técnicas, los subcontratistas responsables y las evidencias de subsanación.

Como resultado, las entidades públicas enfrentan pronunciamientos tardíos, controversias contractuales, sobrecostos y paralizaciones de obra.

---

## 2. Usuarios Objetivo

- **Usuario principal:** Área de infraestructura o gestión de obras de la entidad pública (requiere visibilidad consolidada del avance físico, ejecución financiera, cumplimiento de plazos y alertas críticas).
- **Usuarios secundarios:**
  - **Residente de obra:** Registra avances físicos diarios, gastos ejecutados, incidencias y evidencias fotográficas por partida.
  - **Supervisor de obra:** Valida avances, registra observaciones de calidad (No Conformidades) y sustenta actuaciones contractuales.
  - **Personal de gestión contractual:** Monitorea vencimientos de trámites, documentos pendientes y plazos legales de atención.

---

## 3. Arquitectura Funcional (Módulos del MVP)

El prototipo funcional (nivel TRL 3-4) está estructurado en cuatro módulos integrados:

1. **Carga Contractual y Validación Inicial:**
   - Importación de partidas presupuestales, metrados, plazos y subcontratistas desde archivos CSV.
   - Lista de verificación de consistencia documental entre contrato, cronograma, bases y expediente técnico.
2. **Control de Ejecución y Calidad en Campo:**
   - Registro diario por partida de metrados ejecutados, jornadas, gastos, evidencias fotográficas e incidencias técnicas.
   - Bloqueo automático de validación cuando se registra una No Conformidad de calidad hasta que se acredite su subsanación.
3. **Gestión de Trámites y Plazos Contractuales:**
   - Registro y seguimiento de solicitudes de ampliación de plazo, prestaciones adicionales, suspensiones y consultas técnicas.
   - Control de días hábiles restantes para evitar vencimientos de plazos de pronunciamiento.
4. **Tablero de Alertas Tempranas y Trazabilidad:**
   - Evaluación automática de indicadores mediante sistema de alertas visuales (Verde: Conforme, Amarillo: Atención preventiva, Rojo: Crítico/Bloqueado).
   - Visualización de avance acumulado programado vs. real en barras agrupadas por quincena.
   - Bitácora cronológica de auditoría con registro de usuario, fecha, referencia y evidencia, con exportación en PDF de un informe de auditoría: resumen ejecutivo, criterios, hallazgos, recomendaciones, detalle de partidas, verificaciones documentales, trámites y referencias de evidencia.

## 4. Flujos operativos por rol

- **Trámites:** Residente registra la solicitud. Gestión Contractual registra su recepción; el Supervisor inicia la revisión y registra su opinión; Entidad evalúa, aprueba o deniega y notifica el resultado. Cada cambio queda en el historial y la bitácora. Los plazos se calculan en días hábiles de lunes a viernes; no se consideran feriados.
- **Ejecución e incidencias:** Residente registra avances e incidencias de campo y puede adjuntar fotos. Supervisión revisa y deja el visto bueno; Entidad consulta la ejecución y las incidencias, y recibe alertas de las críticas. Un reporte sin metrados ni gasto no altera los indicadores de avance.
- **Recepción y liquidación:** Solo Entidad puede acceder al módulo y registrar el cierre. La liquidación requiere que la recepción esté registrada.
- Los datos y las notificaciones se guardan en el almacenamiento local del navegador; no se sincronizan entre dispositivos.

---

## 5. Marco Normativo de Referencia

- **Ley N° 32069**, Ley General de Contrataciones Públicas, y su Reglamento aprobado mediante **Decreto Supremo N° 009-2025-EF**.
- **Ley N° 27785**, Ley Orgánica del Sistema Nacional de Control y de la Contraloría General de la República.
- **Ley N° 29733**, Ley de Protección de Datos Personales.

---

## 6. Tecnologías Utilizadas

- **Frontend:** React 18, Vite 6
- **Estilos:** Tailwind CSS 3
- **Iconografía:** Lucide React
- **Despliegue:** Vercel

---

## 7. Estructura del Proyecto

```text
obra-traza-mvp/
├── index.html              # Punto de entrada HTML
├── package.json            # Dependencias y scripts de construcción
├── postcss.config.js       # Configuración de PostCSS
├── tailwind.config.js      # Configuración de estilos Tailwind CSS
├── vite.config.js          # Configuración del empaquetador Vite
└── src/
    ├── App.jsx             # Lógica principal, estado y vistas de los 4 módulos
    ├── index.css           # Directivas base de Tailwind
    └── main.jsx            # Renderizado de la aplicación React
