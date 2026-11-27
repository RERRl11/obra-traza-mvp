import { TRAMITE_STAGES } from './workflow.js';

const DEMO_USERS = {
  resident: 'Arq. Jorge Paredes (Simulado)',
  supervisor: 'Ing. Elena Ríos (Simulado)',
  entity: 'Ing. Carlos Mendoza (Simulado)',
  contractual: 'Abg. Sofía Vargas (Simulado)'
};

function createTramiteHistory(stageIndex, startDate) {
  const users = [
    DEMO_USERS.resident,
    DEMO_USERS.contractual,
    DEMO_USERS.supervisor,
    DEMO_USERS.supervisor,
    DEMO_USERS.entity,
    DEMO_USERS.entity
  ];
  const details = [
    'Solicitud registrada por el Residente.',
    'Recepción registrada por Gestión Contractual.',
    'Supervisión inició la revisión.',
    'Opinión de Supervisión registrada.',
    'Entidad inició la evaluación.',
    'Decisión notificada a los participantes.'
  ];
  const start = new Date(`${startDate}T12:00:00-05:00`);
  return TRAMITE_STAGES.slice(0, stageIndex + 1).map((etapa, index) => ({
    etapa,
    fecha: new Date(start.getTime() + index * 86400000).toISOString(),
    usuario: users[index],
    detalle: details[index]
  }));
}

function createTramite({
  id,
  tipo,
  asunto,
  stageIndex,
  fechaIngreso,
  fechaLimite,
  diasSolicitados,
  decision = '',
  opinion = '',
  docsPendientes = 'Ninguno'
}) {
  return {
    id,
    tipo,
    asunto,
    fechaIngreso,
    fechaLimite,
    diasSolicitados,
    diasRestantes: 0,
    solicitante: 'Constructora Norte S.A.C.',
    solicitanteUsuario: DEMO_USERS.resident,
    solicitanteRol: 'RESIDENTE',
    responsable: '',
    docsPendientes,
    opinion,
    decision,
    estado: stageIndex === TRAMITE_STAGES.length - 1 ? decision : 'En trámite',
    etapa: TRAMITE_STAGES[stageIndex],
    fechaResolucion: stageIndex === TRAMITE_STAGES.length - 1 ? fechaLimite : '',
    historial: createTramiteHistory(stageIndex, fechaIngreso)
  };
}

function createIncident({
  id,
  tipo,
  partida,
  detalle,
  evidencia,
  fecha,
  estadoRevision = 'Pendiente de revisión',
  revisadaPor = '',
  fechaRevision = ''
}) {
  return {
    id,
    tipo,
    partida,
    detalle,
    evidencia,
    evidenciaDataUrl: '',
    fecha,
    registradaPorId: 'USR-03',
    registradaPor: DEMO_USERS.resident,
    estadoRevision,
    revisadaPor,
    fechaRevision
  };
}

function createIncidentNotification(id, destinatario, incident, tipo, usuario, fecha) {
  return {
    id,
    destinatario,
    kind: 'incidencia',
    tipo,
    incidentId: incident.id,
    partida: incident.partida,
    detalle: incident.detalle,
    usuario,
    fecha,
    leida: false
  };
}

function createTramiteNotification(id, destinatario, tramite, tipo, detalle, usuario, fecha) {
  return {
    id,
    destinatario,
    kind: 'tramite',
    tipo,
    tramiteId: tramite.id,
    solicitante: tramite.solicitante,
    diasSolicitados: tramite.diasSolicitados,
    estado: tramite.etapa,
    detalle,
    usuario,
    fecha,
    leida: false
  };
}

const tramite014Ampliacion = createTramite({
  id: 'TR-014-26-01',
  tipo: 'Ampliación de plazo',
  asunto: 'Interferencia de red eléctrica en el pabellón B',
  stageIndex: 3,
  fechaIngreso: '2026-11-17',
  fechaLimite: '2026-12-08',
  diasSolicitados: 15,
  opinion: 'Conforme',
  docsPendientes: 'Pendiente de evaluación de Entidad'
});
const tramite014Adicional = createTramite({
  id: 'TR-014-26-02',
  tipo: 'Prestación adicional',
  asunto: 'Refuerzo de canalización para nuevas instalaciones eléctricas',
  stageIndex: 1,
  fechaIngreso: '2026-11-25',
  fechaLimite: '2026-12-10',
  diasSolicitados: 12,
  docsPendientes: 'Pendiente de revisión del Supervisor'
});
const tramite014Consulta = createTramite({
  id: 'TR-014-26-03',
  tipo: 'Consulta técnica / absolución',
  asunto: 'Detalle de anclaje para cobertura metálica',
  stageIndex: 5,
  fechaIngreso: '2026-11-10',
  fechaLimite: '2026-11-25',
  diasSolicitados: 5,
  decision: 'Aprobada'
});

const incidencia014Critica = createIncident({
  id: 'INC-014-01',
  tipo: 'Incidencia Crítica',
  partida: '03.02',
  detalle: 'Fisura superficial detectada en una columna del sector B; se solicita evaluación de Supervisión.',
  evidencia: 'fisura-columna-sector-b.jpg',
  fecha: '2026-11-26T09:30:00-05:00'
});
const incidencia014Revisada = createIncident({
  id: 'INC-014-02',
  tipo: 'Observación Preventiva',
  partida: '04.01',
  detalle: 'Se observó variación de espesor en juntas de albañilería; el Residente corrigió el tramo.',
  evidencia: 'juntas-albanileria-p1.jpg',
  fecha: '2026-11-21T11:15:00-05:00',
  estadoRevision: 'Visto bueno',
  revisadaPor: DEMO_USERS.supervisor,
  fechaRevision: '2026-11-22T15:40:00-05:00'
});

const tramite015Suspension = createTramite({
  id: 'TR-015-26-01',
  tipo: 'Suspensión de plazo',
  asunto: 'Restricción temporal de acceso al laboratorio durante la instalación de equipos',
  stageIndex: 2,
  fechaIngreso: '2026-11-24',
  fechaLimite: '2026-12-02',
  diasSolicitados: 8,
  docsPendientes: 'Opinión de Supervisión pendiente'
});
const tramite015Ampliacion = createTramite({
  id: 'TR-015-26-02',
  tipo: 'Ampliación de plazo',
  asunto: 'Demora en la entrega de tableros eléctricos especializados',
  stageIndex: 0,
  fechaIngreso: '2026-11-26',
  fechaLimite: '2026-12-11',
  diasSolicitados: 10,
  docsPendientes: 'Pendiente de recepción por Gestión Contractual'
});
const incidencia015Critica = createIncident({
  id: 'INC-015-01',
  tipo: 'Incidencia Crítica',
  partida: '02.01',
  detalle: 'El tablero eléctrico recibido no incluye certificado de ensayo; se retuvo su instalación.',
  evidencia: 'tablero-sin-certificado.jpg',
  fecha: '2026-11-26T13:20:00-05:00'
});

const tramite016Consulta = createTramite({
  id: 'TR-016-26-01',
  tipo: 'Consulta técnica / absolución',
  asunto: 'Confirmación del acabado sanitario antes del inicio de obra',
  stageIndex: 0,
  fechaIngreso: '2026-11-26',
  fechaLimite: '2026-12-11',
  diasSolicitados: 10,
  docsPendientes: 'Pendiente de recepción por Gestión Contractual'
});

const tramite017Adicional = createTramite({
  id: 'TR-017-26-01',
  tipo: 'Prestación adicional',
  asunto: 'Reubicación de sumideros por interferencia con red existente',
  stageIndex: 4,
  fechaIngreso: '2026-11-17',
  fechaLimite: '2026-12-04',
  diasSolicitados: 12,
  opinion: 'Conforme',
  docsPendientes: 'En evaluación de Entidad'
});
const tramite017Suspension = createTramite({
  id: 'TR-017-26-02',
  tipo: 'Suspensión de plazo',
  asunto: 'Paralización temporal por lluvias intensas',
  stageIndex: 5,
  fechaIngreso: '2026-11-08',
  fechaLimite: '2026-11-23',
  diasSolicitados: 4,
  decision: 'Aprobada'
});
const incidencia017Revisada = createIncident({
  id: 'INC-017-01',
  tipo: 'Incidencia Crítica',
  partida: '03.01',
  detalle: 'Se reportó una filtración en la zanja del tramo norte y se protegió el área.',
  evidencia: 'filtracion-tramo-norte.jpg',
  fecha: '2026-11-20T08:45:00-05:00',
  estadoRevision: 'Visto bueno',
  revisadaPor: DEMO_USERS.supervisor,
  fechaRevision: '2026-11-21T16:10:00-05:00'
});
const incidencia017Pendiente = createIncident({
  id: 'INC-017-02',
  tipo: 'Observación Preventiva',
  partida: '03.01',
  detalle: 'Se solicita verificar la compactación del relleno antes de continuar con el siguiente tramo.',
  evidencia: 'compactacion-tramo-sur.jpg',
  fecha: '2026-11-26T10:10:00-05:00'
});

const newIncidentNotifications = (incident, notificationDate) => [
  createIncidentNotification(
    `demo-${incident.id}-supervisor`,
    'SUPERVISOR',
    incident,
    incident.tipo === 'Incidencia Crítica' ? 'Incidencia crítica de calidad' : 'Nueva incidencia reportada',
    DEMO_USERS.resident,
    notificationDate
  ),
  ...(incident.tipo === 'Incidencia Crítica'
    ? [createIncidentNotification(
      `demo-${incident.id}-entity`,
      'ENTIDAD',
      incident,
      'Incidencia crítica de calidad',
      DEMO_USERS.resident,
      notificationDate
    )]
    : [])
];

export const DEMO_EXPEDIENTES = [
  {
    cui: '2654330',
    nombre: 'Mejoramiento de laboratorios de ingeniería',
    ubicacion: 'Trujillo La Libertad',
    areaUsuaria: 'Facultad de Ingeniería',
    expedienteTecnico: 1420000,
    valorReferencial: 1300000,
    procedimiento: 'Licitación Pública',
    sistema: 'Suma Alzada',
    modalidad: 'Por contrata',
    fechaConvocatoria: '2026-04-15',
    fechaBuenaPro: '2026-05-28',
    fechaFirma: '2026-06-05',
    numero: '015-2026-UNT/OAB',
    contratista: 'Consorcio Norte Verde S.A.C.',
    montoContrato: 1280000,
    plazoDias: 240,
    estado: 'Ejecución',
    fechaInicio: '2026-06-15',
    fechaTermino: '2027-02-10',
    adelantos: 128000,
    montoGarantia: 128000,
    garantiaVence: '2027-03-10',
    penalidades: 0,
    avanceProgramado: 45,
    presupuestoModificado: 1280000,
    plazoCronogramaDias: 240,
    presupuestoPartidas: 1280000,
    permisoTerreno: 'Conforme',
    detallePermisoTerreno: 'Permisos municipales y disponibilidad de terreno verificados',
    especificacionesTecnicas: 'Conforme',
    detalleEspecificacionesTecnicas: 'Especificaciones de bases y oferta coinciden'
  },
  {
    cui: '2654331',
    nombre: 'Rehabilitación de servicios higiénicos del pabellón central',
    ubicacion: 'Trujillo La Libertad',
    areaUsuaria: 'Oficina de Servicios Generales',
    expedienteTecnico: 420000,
    valorReferencial: 390000,
    procedimiento: 'Adjudicación Simplificada',
    sistema: 'Precios Unitarios',
    modalidad: 'Por contrata',
    fechaConvocatoria: '2026-10-12',
    fechaBuenaPro: '2026-11-18',
    numero: '016-2026-UNT/OAB',
    contratista: 'Constructora Valle Moche E.I.R.L.',
    montoContrato: 385000,
    plazoDias: 120,
    estado: 'Convocatoria',
    presupuestoModificado: 385000,
    plazoCronogramaDias: 120,
    presupuestoPartidas: 385000,
    permisoTerreno: 'Pendiente',
    detallePermisoTerreno: 'Autorización de intervención pendiente',
    especificacionesTecnicas: 'Pendiente',
    detalleEspecificacionesTecnicas: 'Validación de ficha técnica pendiente'
  },
  {
    cui: '2654332',
    nombre: 'Mejoramiento del sistema de drenaje pluvial',
    ubicacion: 'Trujillo La Libertad',
    areaUsuaria: 'Gerencia de Infraestructura',
    expedienteTecnico: 1040000,
    valorReferencial: 980000,
    procedimiento: 'Licitación Pública',
    sistema: 'Precios Unitarios',
    modalidad: 'Por contrata',
    fechaConvocatoria: '2026-03-10',
    fechaBuenaPro: '2026-04-20',
    fechaFirma: '2026-05-04',
    numero: '017-2026-UNT/OAB',
    contratista: 'Consorcio Drenaje Seguro S.A.C.',
    montoContrato: 980000,
    plazoDias: 180,
    estado: 'Ejecución',
    fechaInicio: '2026-05-15',
    fechaTermino: '2026-11-11',
    adelantos: 98000,
    montoGarantia: 98000,
    garantiaVence: '2026-11-05',
    penalidades: 0,
    avanceProgramado: 70,
    presupuestoModificado: 1050000,
    plazoCronogramaDias: 240,
    presupuestoPartidas: 1050000,
    permisoTerreno: 'Inconsistencia',
    detallePermisoTerreno: 'Falta autorización para interferencias de redes de agua',
    especificacionesTecnicas: 'Inconsistencia',
    detalleEspecificacionesTecnicas: 'La oferta indica acero fy=4200 y las bases exigen fy=5000'
  }
];

export const DEMO_WORKFLOWS = {
  '014-2026-UNT/OAB': {
    avanceQuincenal: [
      { periodo: 'Q1', programado: 15, real: 15 },
      { periodo: 'Q2', programado: 35, real: 33 },
      { periodo: 'Q3', programado: 58, real: 41 }
    ],
    tramites: [tramite014Ampliacion, tramite014Adicional, tramite014Consulta],
    incidencias: [incidencia014Critica, incidencia014Revisada],
    notificaciones: [
      ...newIncidentNotifications(incidencia014Critica, '2026-11-26T09:31:00-05:00'),
      createIncidentNotification('demo-INC-014-02-resident', 'RESIDENTE', incidencia014Revisada, 'Incidencia revisada por Supervisión', DEMO_USERS.supervisor, '2026-11-22T15:41:00-05:00'),
      createTramiteNotification('demo-TR-014-26-01-entity', 'ENTIDAD', tramite014Ampliacion, 'Opinión del Supervisor registrada', 'La opinión fue conforme; la solicitud espera evaluación de Entidad.', DEMO_USERS.supervisor, '2026-11-20T15:00:00-05:00'),
      createTramiteNotification('demo-TR-014-26-02-supervisor', 'SUPERVISOR', tramite014Adicional, 'Solicitud recibida para revisión', 'Gestión Contractual registró la recepción.', DEMO_USERS.contractual, '2026-11-26T11:00:00-05:00'),
      createTramiteNotification('demo-TR-014-26-03-resident', 'RESIDENTE', tramite014Consulta, 'Solicitud aprobada', 'Entidad aprobó y notificó la consulta técnica.', DEMO_USERS.entity, '2026-11-18T16:00:00-05:00'),
      createTramiteNotification('demo-TR-014-26-03-contractual', 'CONTRACTUAL', tramite014Consulta, 'Solicitud aprobada', 'Entidad aprobó y notificó la consulta técnica.', DEMO_USERS.entity, '2026-11-18T16:00:00-05:00')
    ],
    bitacora: [
      { id: 'DEMO-LOG-014-01', fecha: '2026-11-26 09:30', usuario: DEMO_USERS.resident, partida: incidencia014Critica.partida, accion: 'Incidencia crítica reportada: fisura superficial en columna del sector B.', evidencia: incidencia014Critica.evidencia },
      { id: 'DEMO-LOG-014-02', fecha: '2026-11-22 15:40', usuario: DEMO_USERS.supervisor, partida: incidencia014Revisada.partida, accion: 'Supervisión dio visto bueno a la observación preventiva.', evidencia: incidencia014Revisada.evidencia }
    ]
  },
  '015-2026-UNT/OAB': {
    avanceQuincenal: [
      { periodo: 'Q1', programado: 12, real: 10 },
      { periodo: 'Q2', programado: 26, real: 22 },
      { periodo: 'Q3', programado: 38, real: 32 }
    ],
    partidas: [{
      codigo: '02.01',
      descripcion: 'Instalaciones eléctricas y de datos para laboratorios',
      unidad: 'punto',
      metradoContratado: 100,
      metradoProgramado: 60,
      metradoEjecutado: 38,
      presupuestoContratado: 740000,
      gastoEjecutado: 323000,
      jornadas: 18,
      subcontratista: 'Consorcio Norte Verde S.A.C.',
      especificacion: 'Tableros certificados y canalización según expediente técnico.',
      noConformidad: true,
      observacion: 'Pendiente certificado de ensayo del tablero eléctrico.'
    }],
    valorizaciones: [
      { id: 'DEMO-015-VAL-01', fecha: '2026-09-30', monto: 320000, acumulado: 25 },
      { id: 'DEMO-015-VAL-02', fecha: '2026-10-31', monto: 180000, acumulado: 39 }
    ],
    tramites: [tramite015Suspension, tramite015Ampliacion],
    incidencias: [incidencia015Critica],
    notificaciones: [
      ...newIncidentNotifications(incidencia015Critica, '2026-11-26T13:21:00-05:00'),
      createTramiteNotification('demo-TR-015-26-01-supervisor', 'SUPERVISOR', tramite015Suspension, 'Solicitud recibida para revisión', 'Gestión Contractual recibió la suspensión; corresponde iniciar la revisión.', DEMO_USERS.contractual, '2026-11-26T10:00:00-05:00'),
      ...['ENTIDAD', 'SUPERVISOR', 'CONTRACTUAL'].map(role =>
        createTramiteNotification(`demo-TR-015-26-02-${role.toLowerCase()}`, role, tramite015Ampliacion, 'Nueva solicitud de ampliación de plazo', 'Solicitud pendiente de recepción por Gestión Contractual.', DEMO_USERS.resident, '2026-11-26T14:00:00-05:00')
      )
    ],
    bitacora: [
      { id: 'DEMO-LOG-015-01', fecha: '2026-11-26 13:20', usuario: DEMO_USERS.resident, partida: incidencia015Critica.partida, accion: 'Incidencia crítica: tablero eléctrico sin certificado; instalación retenida.', evidencia: incidencia015Critica.evidencia },
      { id: 'DEMO-LOG-015-02', fecha: '2026-11-26 14:00', usuario: DEMO_USERS.resident, partida: tramite015Ampliacion.id, accion: 'Solicitud de ampliación registrada; pendiente de recepción.', evidencia: 'registro_de_solicitud' }
    ]
  },
  '016-2026-UNT/OAB': {
    tramites: [tramite016Consulta],
    notificaciones: ['ENTIDAD', 'SUPERVISOR', 'CONTRACTUAL'].map(role =>
      createTramiteNotification(`demo-TR-016-26-01-${role.toLowerCase()}`, role, tramite016Consulta, 'Nueva solicitud de consulta técnica', 'Solicitud pendiente de recepción por Gestión Contractual.', DEMO_USERS.resident, '2026-11-26T16:00:00-05:00')
    ),
    bitacora: [
      { id: 'DEMO-LOG-016-01', fecha: '2026-11-26 16:00', usuario: DEMO_USERS.resident, partida: tramite016Consulta.id, accion: 'Consulta técnica registrada antes del inicio de la obra.', evidencia: 'registro_de_solicitud' }
    ]
  },
  '017-2026-UNT/OAB': {
    avanceQuincenal: [
      { periodo: 'Q1', programado: 20, real: 14 },
      { periodo: 'Q2', programado: 40, real: 29 },
      { periodo: 'Q3', programado: 58, real: 44 }
    ],
    partidas: [{
      codigo: '03.01',
      descripcion: 'Instalación de tubería y sumideros de drenaje pluvial',
      unidad: 'm',
      metradoContratado: 1000,
      metradoProgramado: 720,
      metradoEjecutado: 550,
      presupuestoContratado: 980000,
      gastoEjecutado: 535000,
      jornadas: 34,
      subcontratista: 'Consorcio Drenaje Seguro S.A.C.',
      especificacion: 'Tubería HDPE y sumideros conforme a planos aprobados.',
      noConformidad: false,
      observacion: 'Atraso por interferencia de redes existentes en el tramo norte.'
    }],
    valorizaciones: [
      { id: 'DEMO-017-VAL-01', fecha: '2026-09-30', monto: 280000, acumulado: 28.6 },
      { id: 'DEMO-017-VAL-02', fecha: '2026-10-31', monto: 255000, acumulado: 54.6 }
    ],
    tramites: [tramite017Adicional, tramite017Suspension],
    incidencias: [incidencia017Revisada, incidencia017Pendiente],
    notificaciones: [
      createIncidentNotification('demo-INC-017-01-resident', 'RESIDENTE', incidencia017Revisada, 'Incidencia revisada por Supervisión', DEMO_USERS.supervisor, '2026-11-21T16:11:00-05:00'),
      ...newIncidentNotifications(incidencia017Pendiente, '2026-11-26T10:11:00-05:00'),
      createTramiteNotification('demo-TR-017-26-01-entity', 'ENTIDAD', tramite017Adicional, 'Opinión del Supervisor registrada', 'La opinión fue conforme; la solicitud espera evaluación de Entidad.', DEMO_USERS.supervisor, '2026-11-21T15:00:00-05:00'),
      ...['RESIDENTE', 'SUPERVISOR', 'CONTRACTUAL'].map(role =>
        createTramiteNotification(`demo-TR-017-26-02-${role.toLowerCase()}`, role, tramite017Suspension, 'Solicitud aprobada', 'Entidad aprobó y notificó la suspensión de plazo.', DEMO_USERS.entity, '2026-11-14T16:00:00-05:00')
      )
    ],
    bitacora: [
      { id: 'DEMO-LOG-017-01', fecha: '2026-11-21 16:10', usuario: DEMO_USERS.supervisor, partida: incidencia017Revisada.partida, accion: 'Supervisión dio visto bueno a la incidencia crítica del tramo norte.', evidencia: incidencia017Revisada.evidencia },
      { id: 'DEMO-LOG-017-02', fecha: '2026-11-26 10:10', usuario: DEMO_USERS.resident, partida: incidencia017Pendiente.partida, accion: 'Observación preventiva reportada; pendiente de revisión por Supervisión.', evidencia: incidencia017Pendiente.evidencia }
    ]
  }
};
