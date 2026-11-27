import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  HardHat,
  FileClock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Camera,
  FileWarning,
  FileText,
  Scale,
  Clock,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import EntityDashboard from './components/EntityDashboard';
import ProjectWorkspace from './components/ProjectWorkspace';
import IncidentList from './components/IncidentList';
import TramiteWorkflow from './components/TramiteWorkflow';
import { parsePartidasCSV } from './partidasCsv';
import { crearValidacionesDocumentales } from './documentConsistency';
import { calcularAvanceFisico, partidaTieneMetradoInconsistente } from './physicalProgress.js';
import { prepareImageEvidence } from './imageEvidence.js';
import {
  addBusinessDays,
  getTramiteDaysRemaining,
  getTramiteStageIndex,
  isTramiteResolved,
  TRAMITE_STAGES
} from './workflow.js';

function usePersistentState(key, initialValue) {
  const [state, setState] = React.useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

// DATOS SINTÉTICOS INICIALES (Proyecto Simulado: Infraestructura Educativa / Universitaria)
const INITIAL_PARTIDAS = [
  {
    codigo: '01.01',
    descripcion: 'Obras Provisionales y Trabajos Preliminares',
    unidad: 'glb',
    metradoContratado: 1.0,
    metradoProgramado: 1.0,
    metradoEjecutado: 1.0,
    presupuestoContratado: 45000,
    gastoEjecutado: 44200,
    jornadas: 10,
    subcontratista: 'Constructora Norte S.A.C.',
    especificacion: 'Cerco perimétrico metálico y caseta según E.T.',
    noConformidad: false,
    observacion: 'Conforme a expediente técnico.'
  },
  {
    codigo: '02.01',
    descripcion: 'Excavación Manual y Nivelación de Zanjas',
    unidad: 'm3',
    metradoContratado: 320,
    metradoProgramado: 320,
    metradoEjecutado: 285,
    presupuestoContratado: 64000,
    gastoEjecutado: 61500,
    jornadas: 18,
    subcontratista: 'Movimientos Tierra Trujillo E.I.R.L.',
    especificacion: 'Profundidad mín. 1.40 m en terreno semirocoso.',
    noConformidad: false,
    observacion: 'Ligero atraso por lluvias puntuales en sector norte.'
  },
  {
    codigo: '03.02',
    descripcion: 'Concreto Armado en Zapatas y Columnas f’c=210 kg/cm2',
    unidad: 'm3',
    metradoContratado: 180,
    metradoProgramado: 120,
    metradoEjecutado: 78,
    presupuestoContratado: 216000,
    gastoEjecutado: 148000,
    jornadas: 22,
    subcontratista: 'Estructuras La Libertad S.A.',
    especificacion: 'Cemento Tipo I, probetas a 7 y 28 días.',
    noConformidad: true,
    observacion: 'NO CONFORMIDAD: Lote de acero corrugado sin certificado de calidad vigente. Validación bloqueada.'
  },
  {
    codigo: '04.01',
    descripcion: 'Muros de Albañilería Confinada Ladrillo KK 18 Huecos',
    unidad: 'm2',
    metradoContratado: 850,
    metradoProgramado: 300,
    metradoEjecutado: 290,
    presupuestoContratado: 127500,
    gastoEjecutado: 44100,
    jornadas: 15,
    subcontratista: 'Acabados y Albañilería Moche S.R.L.',
    especificacion: 'Mortero 1:4, junta máxima 1.5 cm.',
    noConformidad: false,
    observacion: 'Rendimiento dentro de meta diaria.'
  }
];

const INITIAL_VALIDACIONES_DOC = [
  {
    id: 1,
    item: 'Concordancia de plazo contractual (Contrato vs. Cronograma Gantt)',
    estado: 'Conforme',
    detalle: '180 días calendario coinciden íntegramente en ambos documentos.'
  },
  {
    id: 2,
    item: 'Coherencia de presupuesto adjudicado vs. Desagregado de partidas',
    estado: 'Conforme',
    detalle: 'Monto total S/ 452,500.00 sin diferencias aritméticas.'
  },
  {
    id: 3,
    item: 'Disponibilidad de terreno y permisos municipales previos',
    estado: 'Inconsistencia',
    detalle: 'Falta adjuntar autorización de interferencia de red eléctrica en sector B.'
  },
  {
    id: 4,
    item: 'Especificaciones técnicas de acero y concreto (Bases vs. Oferta)',
    estado: 'Conforme',
    detalle: 'Cumple Norma Técnica E.060.'
  }
];

const INITIAL_TRAMITES = [
  {
    id: 'TR-2026-01',
    tipo: 'Ampliación de Plazo N° 01',
    asunto: 'Demora en liberación de interferencia eléctrica en sector B',
    fechaIngreso: '2026-11-15',
    fechaLimite: '2026-11-26',
    diasRestantes: 2,
    responsable: 'Área de Infraestructura / Supervisión',
    docsPendientes: 'Informe técnico de supervisión pendiente de firma',
    estado: 'Crítico'
  },
  {
    id: 'TR-2026-02',
    tipo: 'Prestación Adicional N° 01',
    asunto: 'Mejoramiento de subrasante por nivel freático no previsto en E.T.',
    fechaIngreso: '2026-11-18',
    fechaLimite: '2026-12-03',
    diasRestantes: 9,
    responsable: 'Proyectista / Gestión Contractual',
    docsPendientes: 'Certificación de crédito presupuestario',
    estado: 'Preventivo'
  },
  {
    id: 'TR-2026-03',
    tipo: 'Consulta Técnica N° 04',
    asunto: 'Aclaración de detalle de anclaje en cobertura metálica',
    fechaIngreso: '2026-11-10',
    fechaLimite: '2026-11-20',
    diasRestantes: 0,
    responsable: 'Supervisión de Obra',
    docsPendientes: 'Ninguno',
    estado: 'Atendido'
  }
];

const INITIAL_BITACORA = [
  {
    id: 101,
    fecha: '2026-11-24 16:40',
    usuario: 'Ing. Carlos Mendoza (Supervisor)',
    partida: '03.02',
    accion: 'Alerta Roja: Se detectó lote de acero sin certificado de calidad. Se bloquea valorización hasta subsanación.',
    evidencia: 'evidencia_acero_lote04.jpg'
  },
  {
    id: 102,
    fecha: '2026-11-24 11:15',
    usuario: 'Ing. María Torres (Residente)',
    partida: '04.01',
    accion: 'Registro diario: +35 m2 de muro ejecutados en 1ra planta. Conforme a especificaciones.',
    evidencia: 'avance_muro_p1.jpg'
  },
  {
    id: 103,
    fecha: '2026-11-23 17:05',
    usuario: 'Abg. Luis Rojas (Gestión Contractual)',
    partida: 'TR-2026-01',
    accion: 'Notificación de vencimiento: Ampliación de Plazo N° 01 vence en 48 horas.',
    evidencia: 'cargo_notificacion_01.pdf'
  }
];

const INITIAL_ENTIDAD = {
  nombre: 'Universidad Nacional de Trujillo',
  ruc: '20123456789',
  nivelGobierno: 'Nacional',
  pia: 125000000,
  pim: 138000000
};

const INITIAL_CONTRACT = {
  id: '014-2026-UNT/OAB',
  numero: '014-2026-UNT/OAB',
  nombre: 'Mejoramiento de Pabellón Académico e Infraestructura Educativa',
  cui: '2654321',
  ubicacion: 'Trujillo, La Libertad',
  areaUsuaria: 'Oficina de Infraestructura',
  expedienteTecnico: 5200000,
  valorReferencial: 452500,
  procedimiento: 'Licitación Pública',
  sistema: 'Precios Unitarios',
  modalidad: 'Por contrata',
  fechaConvocatoria: '2026-05-01',
  fechaBuenaPro: '2026-06-10',
  fechaFirma: '2026-06-18',
  contratista: 'Constructora Norte S.A.C.',
  montoContrato: 452500,
  plazoDias: 180,
  fechaInicio: '2026-06-20',
  fechaTermino: '2026-12-17',
  adelantos: 45250,
  montoGarantia: 45250,
  garantiaVence: '2026-12-15',
  penalidades: 0,
  estado: 'Ejecución',
  avanceProgramado: 92,
  entregaTerrenoFecha: '2026-06-20',
  entregaTerrenoActa: 'ACTA-TERRENO-014',
  presupuestoModificado: 452500,
  ampliacionesDias: 0,
  adicionales: 0,
  paralizacionesDias: 0,
  recepcionEstado: 'Pendiente',
  recepcionFecha: '',
  recepcionActa: '',
  liquidacionEstado: 'Pendiente',
  liquidacionFecha: '',
  liquidacionMonto: 0,
  observacionesCierre: '',
  notificaciones: [],
  incidencias: [],
  valorizaciones: [
    { id: 1, fecha: '2026-08-31', monto: 112500, acumulado: 25 },
    { id: 2, fecha: '2026-09-30', monto: 98500, acumulado: 46.8 },
    { id: 3, fecha: '2026-10-31', monto: 86800, acumulado: 66 }
  ]
};

const CSV_CONTRACT_DEFAULTS = {
  id: '',
  numero: '',
  nombre: '',
  cui: '',
  ubicacion: '',
  areaUsuaria: '',
  expedienteTecnico: 0,
  valorReferencial: 0,
  procedimiento: 'Licitación Pública',
  sistema: 'Precios Unitarios',
  modalidad: 'Por contrata',
  fechaConvocatoria: '',
  fechaBuenaPro: '',
  fechaFirma: '',
  contratista: '',
  montoContrato: 0,
  plazoDias: 180,
  fechaInicio: '',
  fechaTermino: '',
  adelantos: 0,
  montoGarantia: 0,
  garantiaVence: '',
  penalidades: 0,
  estado: 'Convocatoria',
  avanceProgramado: 0,
  entregaTerrenoFecha: '',
  entregaTerrenoActa: '',
  presupuestoModificado: 0,
  ampliacionesDias: 0,
  adicionales: 0,
  paralizacionesDias: 0,
  recepcionEstado: 'Pendiente',
  recepcionFecha: '',
  recepcionActa: '',
  liquidacionEstado: 'Pendiente',
  liquidacionFecha: '',
  liquidacionMonto: 0,
  observacionesCierre: '',
  notificaciones: [],
  incidencias: [],
  valorizaciones: []
};

function crearRegistroContrato(datosContrato, id, defaults = INITIAL_CONTRACT) {
  const montoContrato = Number(datosContrato.montoContrato) || 0;
  return {
    ...defaults,
    ...datosContrato,
    id,
    estado: datosContrato.estado || (datosContrato.fechaFirma ? 'Ejecución' : 'Convocatoria'),
    fechaInicio: datosContrato.fechaInicio || '',
    fechaTermino: datosContrato.fechaTermino || '',
    garantiaVence: datosContrato.garantiaVence || '',
    entregaTerrenoFecha: datosContrato.entregaTerrenoFecha || '',
    entregaTerrenoActa: datosContrato.entregaTerrenoActa || '',
    avanceProgramado: Number(datosContrato.avanceProgramado) || 0,
    montoGarantia: Number(datosContrato.montoGarantia) || 0,
    adelantos: Number(datosContrato.adelantos) || 0,
    penalidades: Number(datosContrato.penalidades) || 0,
    presupuestoModificado: Number(datosContrato.presupuestoModificado ?? montoContrato) || 0,
    ampliacionesDias: Number(datosContrato.ampliacionesDias) || 0,
    adicionales: Number(datosContrato.adicionales) || 0,
    paralizacionesDias: Number(datosContrato.paralizacionesDias) || 0,
    recepcionEstado: datosContrato.recepcionEstado || 'Pendiente',
    recepcionFecha: datosContrato.recepcionFecha || '',
    recepcionActa: datosContrato.recepcionActa || '',
    liquidacionEstado: datosContrato.liquidacionEstado || 'Pendiente',
    liquidacionFecha: datosContrato.liquidacionFecha || '',
    liquidacionMonto: Number(datosContrato.liquidacionMonto) || 0,
    observacionesCierre: datosContrato.observacionesCierre || '',
    partidas: [],
    validacionesDoc: Array.isArray(datosContrato.validacionesDoc)
      ? datosContrato.validacionesDoc
      : crearValidacionesDocumentales({ ...datosContrato, montoContrato }),
    tramites: [],
    bitacora: [],
    incidencias: Array.isArray(datosContrato.incidencias) ? datosContrato.incidencias : [],
    valorizaciones: []
  };
}

function readLegacyState(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function dateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localTimestamp(date = new Date()) {
  return date.toLocaleString('sv-SE', { hour12: false }).slice(0, 16);
}

function createInitialContracts() {
  return [{
    ...INITIAL_CONTRACT,
    partidas: readLegacyState('obra-traza-partidas', INITIAL_PARTIDAS),
    validacionesDoc: readLegacyState('obra-traza-validaciones-doc', INITIAL_VALIDACIONES_DOC),
    tramites: readLegacyState('obra-traza-tramites', INITIAL_TRAMITES),
    bitacora: readLegacyState('obra-traza-bitacora', INITIAL_BITACORA)
  }];
}

function evaluarEstadoPartida(p) {
  if (partidaTieneMetradoInconsistente(p)) {
    return {
      nivel: 'ROJO',
      etiqueta: 'Revisar metrados',
      color: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600',
      cumplimiento: '—'
    };
  }
  const cumplimiento = p.metradoProgramado > 0 ? (p.metradoEjecutado / p.metradoProgramado) * 100 : 100;
  const desvioCosto = p.presupuestoContratado > 0 ? ((p.gastoEjecutado - p.presupuestoContratado) / p.presupuestoContratado) * 100 : 0;

  if (p.noConformidad || cumplimiento < 75 || desvioCosto > 10) {
    return {
      nivel: 'ROJO',
      etiqueta: p.noConformidad ? 'Bloqueado (No Conformidad)' : 'Retraso / Sobrecosto Crítico',
      color: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600',
      cumplimiento: cumplimiento.toFixed(1)
    };
  }
  if (cumplimiento < 95 || desvioCosto > 2) {
    return {
      nivel: 'AMARILLO',
      etiqueta: 'Atención Preventiva',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      cumplimiento: cumplimiento.toFixed(1)
    };
  }
  return {
    nivel: 'VERDE',
    etiqueta: 'Conforme',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
    cumplimiento: cumplimiento.toFixed(1)
  };
}

export default function App() {
  const [notice, setNotice] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [activeTab, setActiveTab] = useState('entidad');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [contratos, setContratos] = usePersistentState('obra-traza-contratos', createInitialContracts);
  const [entidad, setEntidad] = usePersistentState('obra-traza-entidad', INITIAL_ENTIDAD);
  const [selectedContractId, setSelectedContractId] = useState(INITIAL_CONTRACT.id);
  const contratoActual = contratos.find(contract => contract.id === selectedContractId) || contratos[0];
  const partidas = contratoActual?.partidas || [];
  const validacionesDoc = contratoActual?.validacionesDoc || [];
  const tramites = contratoActual?.tramites || [];
  const bitacora = contratoActual?.bitacora || [];
  const incidencias = contratoActual?.incidencias || [];
  const updateCurrentContract = (update) => {
    if (!contratoActual) return;
    setContratos(current =>
      current.map(contract => {
        if (contract.id !== contratoActual.id) return contract;
        const changes = typeof update === 'function' ? update(contract) : update;
        return { ...contract, ...changes };
      })
    );
  };
  const updateContractList = (field, update) => {
    updateCurrentContract(contract => ({
      [field]: typeof update === 'function' ? update(contract[field] || []) : update
    }));
  };
  const setPartidas = update => updateContractList('partidas', update);
  const setValidacionesDoc = update => updateContractList('validacionesDoc', update);
  const setTramites = update => updateContractList('tramites', update);
  const setBitacora = update => updateContractList('bitacora', update);
  const setNotificaciones = update => updateContractList('notificaciones', update);
  const setIncidencias = update => updateContractList('incidencias', update);

  // Estados Módulo 2 (Campo)
  const [selectedPartida, setSelectedPartida] = useState('03.02');
  const [avanceInput, setAvanceInput] = useState('');
  const [gastoInput, setGastoInput] = useState('');
  const [incidenciaTipo, setIncidenciaTipo] = useState('Ninguna');
  const [comentarioCampo, setComentarioCampo] = useState('');
  const [evidenciaFoto, setEvidenciaFoto] = useState(null);
  const [evidenciaCargando, setEvidenciaCargando] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [selectedTramiteId, setSelectedTramiteId] = useState('');
  const evidenciaNombre = evidenciaFoto?.nombre || '';

  const resumen = useMemo(() => {
    const avanceFisico = calcularAvanceFisico(partidas);
    const metradoInconsistente = avanceFisico.metradoInconsistente;
    const totalPresupuesto = metradoInconsistente ? null : partidas.reduce((acc, p) => acc + Number(p.presupuestoContratado || 0), 0);
    const totalGasto = metradoInconsistente ? null : partidas.reduce((acc, p) => acc + Number(p.gastoEjecutado || 0), 0);
    const totalProgramado = partidas.reduce((acc, p) => acc + Number(p.metradoProgramado || 0), 0);
    const avanceFisicoReal = metradoInconsistente
      ? null
      : totalProgramado > 0
        ? ((avanceFisico.metradoEjecutado / totalProgramado) * 100).toFixed(1)
        : null;
    const avanceFisicoObra = avanceFisico.avance === null ? null : avanceFisico.avance.toFixed(1);
    const ejecucionFinanciera = totalPresupuesto > 0 && totalGasto !== null
      ? ((totalGasto / totalPresupuesto) * 100).toFixed(1)
      : metradoInconsistente ? null : 0;

    let rojas = 0, amarillas = 0, verdes = 0;
    partidas.forEach(p => {
      const est = evaluarEstadoPartida(p).nivel;
      if (est === 'ROJO') rojas++;
      else if (est === 'AMARILLO') amarillas++;
      else verdes++;
    });

    const tramitesUrgentes = tramites.filter(t =>
      !isTramiteResolved(t) && (getTramiteDaysRemaining(t) ?? Number.POSITIVE_INFINITY) <= 3
    ).length;

    return {
      totalPresupuesto,
      totalGasto,
      metradoInconsistente,
      avanceFisicoReal,
      avanceFisicoObra,
      ejecucionFinanciera,
      rojas,
      amarillas,
      verdes,
      tramitesUrgentes
    };
  }, [partidas, tramites]);
  const avanceChart = [
    { periodo: 'Q1', programado: 15, real: 15 },
    { periodo: 'Q2', programado: 35, real: 33 },
    { periodo: 'Q3', programado: 58, real: 49 },
    { periodo: 'Q4', programado: Number(contratoActual?.avanceProgramado || 0), real: resumen.avanceFisicoObra === null ? null : Number(resumen.avanceFisicoObra) }
  ];
  const totalPartidasEstado = resumen.rojas + resumen.amarillas + resumen.verdes;
  const porcentajeEstado = (cantidad) => totalPartidasEstado ? (cantidad / totalPartidasEstado) * 100 : 0;
  const chartX = (index) => 100 + index * 105;
  const chartMax = Math.max(100, Math.ceil(Math.max(...avanceChart.map(point => point.real)) / 25) * 25);
  const chartTicks = Array.from({ length: 5 }, (_, index) => index * chartMax / 4);
  const chartY = (value) => 220 - (Math.max(0, value) / chartMax * 172);

  const handleRegistrarCampo = (e) => {
    e.preventDefault();
    if (!hasExplicitPermission('REGISTRAR_AVANCE') && !hasExplicitPermission('REPORTAR_INCIDENCIA')) {
      setNotice({ error: true, text: 'Tu perfil no cuenta con permisos para registrar avances o incidencias.' });
      return;
    }
    const deltaAvance = parseFloat(avanceInput) || 0;
    const deltaGasto = parseFloat(gastoInput) || 0;
    const partida = partidas.find(p => p.codigo === selectedPartida);
    if (!partida || deltaAvance < 0 || deltaGasto < 0 || !Number.isFinite(deltaAvance + deltaGasto)) {
      setNotice({ error: true, text: 'Revisa la partida e ingresa valores iguales o mayores que cero.' });
      return;
    }
    if (!deltaAvance && !deltaGasto && !comentarioCampo.trim() && incidenciaTipo === 'Ninguna') {
      setNotice({ error: true, text: 'Ingresa un avance, un gasto o una observación antes de guardar.' });
      return;
    }
    if (partida.metradoEjecutado + deltaAvance > partida.metradoContratado) {
      setNotice({ error: true, text: `El avance supera el metrado contratado. Puedes registrar hasta ${partida.metradoContratado - partida.metradoEjecutado} ${partida.unidad}.` });
      return;
    }
    const generaNoConformidad = incidenciaTipo === 'No Conformidad de Calidad';
    const generaNotificacionCritica = incidenciaTipo === 'Incidencia Crítica';
    const subsanaNoConformidad = incidenciaTipo === 'Subsanación Aprobada';
    if (deltaAvance > 0 && (partida.noConformidad || generaNoConformidad) && !subsanaNoConformidad) {
      setNotice({ error: true, text: 'La partida tiene una no conformidad pendiente. No puedes registrar avance hasta que Supervisión apruebe la subsanación.' });
      return;
    }
    const reportaIncidencia = hasExplicitPermission('REPORTAR_INCIDENCIA') &&
      usuarioActual.rol === 'RESIDENTE' && incidenciaTipo !== 'Ninguna';
    if (generaNotificacionCritica && usuarioActual.rol !== 'RESIDENTE') {
      setNotice({ error: true, text: 'Solo el perfil Residente puede registrar incidencias críticas para Entidad.' });
      return;
    }
    if (reportaIncidencia && !comentarioCampo.trim()) {
      setNotice({
        error: true,
        text: generaNotificacionCritica
          ? 'Describe la incidencia crítica para notificar a Entidad.'
          : 'Describe la incidencia antes de registrarla.'
      });
      return;
    }
    if (deltaAvance > 0 && !hasExplicitPermission('REGISTRAR_AVANCE')) {
      setNotice({ error: true, text: 'Tu perfil puede validar calidad, pero no registrar avances físicos.' });
      return;
    }
    if (subsanaNoConformidad && !puedeLevantarBloqueo) {
      setNotice({ error: true, text: 'Solo Supervisión o Entidad puede aprobar la subsanación de una no conformidad.' });
      return;
    }

    const actualizaPartida = deltaAvance > 0 || deltaGasto > 0 ||
      generaNoConformidad || subsanaNoConformidad ||
      (!reportaIncidencia && Boolean(comentarioCampo.trim()));
    if (actualizaPartida) {
      setPartidas(prev =>
        prev.map(p => {
          if (p.codigo !== selectedPartida) return p;
          const nuevoEjecutado = Math.min(p.metradoContratado, p.metradoEjecutado + deltaAvance);
          const nuevoGasto = p.gastoEjecutado + deltaGasto;
          const nuevaNoConf = subsanaNoConformidad ? false : (generaNoConformidad ? true : p.noConformidad);
          return {
            ...p,
            metradoEjecutado: nuevoEjecutado,
            gastoEjecutado: nuevoGasto,
            jornadas: p.jornadas + 1,
            noConformidad: nuevaNoConf,
            observacion: comentarioCampo || p.observacion
          };
        })
      );
    }

    const fechaActual = new Date();
    const nuevaEntrada = {
      id: Date.now(),
      fecha: localTimestamp(fechaActual),
      usuario: usuarioActual.etiquetaRol,
      partida: selectedPartida,
      accion: reportaIncidencia && !deltaAvance && !deltaGasto
        ? `[${incidenciaTipo}] ${comentarioCampo.trim()}`
        : `${incidenciaTipo !== 'Ninguna' ? `[${incidenciaTipo}] ` : ''}Avance +${deltaAvance}, Gasto +S/${deltaGasto}. ${comentarioCampo}`,
      evidencia: evidenciaNombre || 'registro_campo_evidencia.jpg',
      evidenciaDataUrl: reportaIncidencia ? '' : evidenciaFoto?.dataUrl || ''
    };

    setBitacora(current => [nuevaEntrada, ...current]);
    if (reportaIncidencia) {
      setIncidencias(current => [{
        id: nuevaEntrada.id,
        tipo: incidenciaTipo,
        partida: selectedPartida,
        detalle: comentarioCampo.trim(),
        evidencia: evidenciaNombre.trim(),
        fecha: new Date().toISOString(),
        registradaPorId: usuarioActual.id,
        registradaPor: usuarioActual.nombre,
        evidenciaDataUrl: evidenciaFoto?.dataUrl || '',
        estadoRevision: 'Pendiente de revisión',
        revisadaPor: '',
        fechaRevision: ''
      }, ...current]);
    }
    if (reportaIncidencia) {
      const fechaNotificacion = fechaActual.toISOString();
      const destinatarios = ['SUPERVISOR', ...(generaNotificacionCritica ? ['ENTIDAD'] : [])];
      setNotificaciones(current => [
        ...destinatarios.map(destinatario => ({
          id: `${nuevaEntrada.id}-${destinatario}`,
          destinatario,
          kind: 'incidencia',
          tipo: generaNotificacionCritica ? 'Incidencia crítica de calidad' : 'Nueva incidencia reportada',
          incidentId: nuevaEntrada.id,
          partida: selectedPartida,
          detalle: comentarioCampo.trim(),
          usuario: usuarioActual.nombre,
          fecha: fechaNotificacion,
          leida: false
        })),
        ...current
      ]);
    }
    setAvanceInput('');
    setGastoInput('');
    setComentarioCampo('');
    setEvidenciaFoto(null);
    setNotice({
      text: reportaIncidencia
        ? generaNotificacionCritica
          ? 'Incidencia registrada. Supervisión fue notificada y Entidad recibió la alerta crítica.'
          : 'Incidencia registrada y enviada a Supervisión para su revisión.'
        : 'Registro guardado. Los indicadores y la bitácora están actualizados.'
    });
  };

  const handleSeleccionarEvidencia = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setEvidenciaFoto(null);
    setEvidenciaCargando(true);
    try {
      setEvidenciaFoto(await prepareImageEvidence(file));
      setNotice({ text: 'Foto comprimida y lista para adjuntar al registro.' });
    } catch (error) {
      setNotice({
        error: true,
        text: error instanceof Error ? error.message : 'No se pudo procesar la foto.'
      });
    } finally {
      input.value = '';
      setEvidenciaCargando(false);
    }
  };

  const handleDarVistoBueno = (id) => {
    if (usuarioActual.rol !== 'SUPERVISOR') {
      setNotice({ error: true, text: 'Solo el perfil Supervisor puede dar el visto bueno a una incidencia.' });
      return;
    }
    const incidencia = incidencias.find(item => item.id === id);
    if (!incidencia || incidencia.estadoRevision !== 'Pendiente de revisión') {
      setNotice({ error: true, text: 'La incidencia ya fue revisada o no está disponible.' });
      return;
    }

    const fechaRevision = new Date().toISOString();
    setIncidencias(current => current.map(item => item.id === id
      ? { ...item, estadoRevision: 'Visto bueno', revisadaPor: usuarioActual.nombre, fechaRevision }
      : item
    ));
    setBitacora(current => [{
      id: Date.now(),
      fecha: fechaRevision,
      usuario: usuarioActual.nombre,
      partida: incidencia.partida,
      accion: `Visto bueno del Supervisor a la incidencia "${incidencia.tipo}".`,
      evidencia: incidencia.evidencia || 'revisión de incidencia'
    }, ...current]);
    setNotificaciones(current => [{
      id: `${id}-revisada-${Date.now()}`,
      destinatario: 'RESIDENTE',
      kind: 'incidencia',
      tipo: 'Incidencia revisada por Supervisión',
      incidentId: id,
      partida: incidencia.partida,
      detalle: `La incidencia "${incidencia.tipo}" recibió visto bueno.`,
      usuario: usuarioActual.nombre,
      fecha: fechaRevision,
      leida: false
    }, ...current]);
    setNotice({ text: 'Visto bueno registrado. El Residente verá la incidencia como revisada.' });
  };

  const handleAprobarSubsanacion = (codigo) => {
    if (!puedeLevantarBloqueo) {
      setNotice({ error: true, text: 'Tu perfil no cuenta con permisos para levantar bloqueos de calidad.' });
      return;
    }
    const partida = partidas.find(item => item.codigo === codigo);
    if (!partida?.noConformidad) {
      setNotice({ error: true, text: 'La partida ya no tiene una no conformidad pendiente.' });
      return;
    }
    setPartidas(current => current.map(item =>
      item.codigo === codigo ? { ...item, noConformidad: false, observacion: 'Subsanación aprobada por Supervisión.' } : item
    ));
    setBitacora(current => [{
      id: Date.now(),
      fecha: localTimestamp(),
      usuario: usuarioActual.etiquetaRol,
      partida: codigo,
      accion: 'Subsanación de calidad aprobada; se levantó el bloqueo.',
      evidencia: 'validacion_de_supervision'
    }, ...current]);
    setNotice({ text: `Bloqueo de la partida ${codigo} levantado.` });
  };

  const notificarTramite = (tramite, destinatarios, tipo, detalle, fecha = new Date().toISOString()) => {
    const avisos = destinatarios
      .filter(destinatario => destinatario && destinatario !== usuarioActual.rol)
      .map(destinatario => ({
        id: `${tramite.id}-${destinatario}-${Date.now()}`,
        destinatario,
        kind: 'tramite',
        tipo,
        tramiteId: tramite.id,
        solicitante: tramite.solicitante,
        diasSolicitados: tramite.diasSolicitados,
        estado: tramite.etapa,
        detalle,
        usuario: usuarioActual.nombre,
        fecha,
        leida: false
      }));
    if (avisos.length) setNotificaciones(current => [...avisos, ...current]);
  };

  const registrarEtapaTramite = (tramite, stageIndex, patch = {}, detalle = '') => {
    const fecha = new Date().toISOString();
    const etapa = TRAMITE_STAGES[stageIndex];
    const evento = { etapa, fecha, usuario: usuarioActual.nombre, detalle };
    const actualizado = {
      ...tramite,
      ...patch,
      etapa,
      historial: [...(tramite.historial || []), evento]
    };
    setTramites(current => current.map(item => item.id === tramite.id ? actualizado : item));
    setBitacora(current => [{
      id: Date.now(),
      fecha: localTimestamp(new Date(fecha)),
      usuario: usuarioActual.etiquetaRol,
      partida: tramite.id,
      accion: `${etapa}${detalle ? `: ${detalle}` : ''}`,
      evidencia: 'seguimiento_de_tramite'
    }, ...current]);
    return actualizado;
  };

  const handleAgregarTramite = (tipo, asunto, diasSolicitados) => {
    if (!puedeSolicitarTramite) {
      setNotice({ error: true, text: 'Tu perfil no cuenta con permisos para solicitar trámites.' });
      return false;
    }
    const dias = Number(diasSolicitados);
    if (!asunto.trim() || !Number.isInteger(dias) || dias < 1 || dias > 30) {
      setNotice({ error: true, text: 'Ingresa un asunto y un plazo entre 1 y 30 días hábiles.' });
      return false;
    }
    const today = dateInputValue();
    const year = new Date().getFullYear();
    const nextNumber = tramites.reduce((maximum, item) => {
      const match = item.id?.match(new RegExp(`^TR-${year}-(\\d+)$`));
      return match ? Math.max(maximum, Number(match[1])) : maximum;
    }, 0) + 1;
    const id = `TR-${year}-${String(nextNumber).padStart(2, '0')}`;
    const nuevo = {
      id,
      tipo,
      asunto: asunto.trim(),
      fechaIngreso: today,
      fechaLimite: addBusinessDays(today, dias),
      diasSolicitados: dias,
      diasRestantes: dias,
      solicitante: contratoActual?.contratista || usuarioActual.etiquetaRol,
      solicitanteUsuario: usuarioActual.nombre,
      solicitanteRol: usuarioActual.rol,
      responsable: 'Gestión Contractual',
      docsPendientes: 'Pendiente de recepción',
      opinion: '',
      decision: '',
      estado: 'En trámite',
      etapa: TRAMITE_STAGES[0],
      historial: [{
        etapa: TRAMITE_STAGES[0],
        fecha: new Date().toISOString(),
        usuario: usuarioActual.nombre,
        detalle: 'Solicitud registrada; se notificó a Entidad, Supervisión y Gestión Contractual.'
      }]
    };
    setTramites(current => [nuevo, ...current]);
    setSelectedTramiteId(id);
    setBitacora(current => [{
        id: Date.now(),
        fecha: localTimestamp(),
        usuario: usuarioActual.etiquetaRol,
        partida: nuevo.id,
        accion: `Nuevo trámite contractual registrado: ${nuevo.tipo} - ${nuevo.asunto}`,
        evidencia: 'registro_de_solicitud'
      }, ...current]);
    notificarTramite(
      nuevo,
      ['ENTIDAD', 'SUPERVISOR', 'CONTRACTUAL'],
      `Nueva solicitud de ${tipo.toLowerCase()}`,
      `Solicitud originada por ${nuevo.asunto}. Pendiente de recepción por Gestión Contractual.`
    );
    setNotice({ text: `Trámite ${nuevo.id} registrado. Ya puedes consultar su seguimiento.` });
    return true;
  };

  const obtenerTramiteActivo = (id, etapaEsperada) => {
    const tramite = tramites.find(item => item.id === id);
    if (!tramite || getTramiteStageIndex(tramite) !== etapaEsperada) {
      setNotice({ error: true, text: 'El trámite cambió de etapa o ya no está disponible. Actualiza la vista.' });
      return null;
    }
    return tramite;
  };

  const handleRegistrarRecepcionTramite = (id) => {
    if (usuarioActual.rol !== 'CONTRACTUAL') {
      setNotice({ error: true, text: 'Solo Gestión Contractual puede registrar la recepción de una solicitud.' });
      return;
    }
    const tramite = obtenerTramiteActivo(id, 0);
    if (!tramite) return;
    const actualizado = registrarEtapaTramite(tramite, 1, {
      responsable: 'Supervisor de Obra',
      docsPendientes: 'Pendiente de inicio de revisión'
    }, 'Recepción registrada por Gestión Contractual.');
    notificarTramite(actualizado, ['SUPERVISOR'], 'Solicitud recibida para revisión', 'Gestión Contractual registró la recepción.');
    setNotice({ text: `Recepción del trámite ${id} registrada.` });
  };

  const handleIniciarRevisionTramite = (id) => {
    if (usuarioActual.rol !== 'SUPERVISOR') {
      setNotice({ error: true, text: 'Solo el Supervisor puede iniciar la revisión técnica.' });
      return;
    }
    const tramite = obtenerTramiteActivo(id, 1);
    if (!tramite) return;
    registrarEtapaTramite(tramite, 2, { responsable: 'Supervisor de Obra' }, 'El Supervisor inició la revisión del sustento.');
    setNotice({ text: `Revisión del trámite ${id} iniciada.` });
  };

  const handleOpinarTramite = (id, opinion) => {
    if (usuarioActual.rol !== 'SUPERVISOR' || !['Conforme', 'Observado'].includes(opinion)) {
      setNotice({ error: true, text: 'Solo el Supervisor puede registrar una opinión válida.' });
      return;
    }
    const tramite = obtenerTramiteActivo(id, 2);
    if (!tramite) return;
    const actualizado = registrarEtapaTramite(tramite, 3, {
      opinion,
      responsable: 'Entidad',
      docsPendientes: 'Pendiente de evaluación de Entidad'
    }, `Opinión de Supervisión: ${opinion}.`);
    notificarTramite(actualizado, ['ENTIDAD', tramite.solicitanteRol], 'Opinión del Supervisor registrada', `La opinión fue: ${opinion}.`);
    setNotice({ text: `Opinión del Supervisor registrada para ${id}.` });
  };

  const handleIniciarEvaluacionTramite = (id) => {
    if (usuarioActual.rol !== 'ENTIDAD') {
      setNotice({ error: true, text: 'Solo Entidad puede iniciar la evaluación de la solicitud.' });
      return;
    }
    const tramite = obtenerTramiteActivo(id, 3);
    if (!tramite) return;
    registrarEtapaTramite(tramite, 4, { responsable: 'Entidad' }, 'Entidad inició la evaluación de la solicitud.');
    setNotice({ text: `Evaluación de Entidad iniciada para ${id}.` });
  };

  const handleResolverTramite = (id, decision) => {
    if (usuarioActual.rol !== 'ENTIDAD' || !['Aprobada', 'Denegada'].includes(decision)) {
      setNotice({ error: true, text: 'Solo Entidad puede emitir una decisión válida para el trámite.' });
      return;
    }
    const tramite = obtenerTramiteActivo(id, 4);
    if (!tramite) return;
    const actualizado = registrarEtapaTramite(tramite, 5, {
      decision,
      estado: 'Atendido',
      diasRestantes: 0,
      responsable: 'Trámite resuelto',
      docsPendientes: 'Ninguno',
      fechaResolucion: new Date().toISOString()
    }, `Decisión de Entidad: ${decision}. Notificación enviada a los participantes.`);
    notificarTramite(
      actualizado,
      [tramite.solicitanteRol, 'CONTRACTUAL', 'SUPERVISOR'],
      `Solicitud ${decision.toLowerCase()}`,
      `Entidad resolvió la solicitud ${id}: ${decision}.`
    );
    setNotice({ text: `Trámite ${id} ${decision.toLowerCase()} y notificado.` });
  };

  const handleCargarCSVPartidas = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed = parsePartidasCSV(await file.text());
      const presupuestoPartidas = parsed.reduce((total, item) => total + item.presupuestoContratado, 0);
      const validacionPresupuesto = crearValidacionesDocumentales({
        ...contratoActual,
        presupuestoPartidas
      }).find(item => item.id === 'presupuesto-partidas');
      setPartidas(parsed);
      setSelectedPartida(parsed[0].codigo);
      setValidacionesDoc(current => {
        const existe = current.some(item => item.item === validacionPresupuesto.item);
        return existe
          ? current.map(item => item.item === validacionPresupuesto.item
            ? { ...item, estado: validacionPresupuesto.estado, detalle: validacionPresupuesto.detalle }
            : item)
          : [...current, validacionPresupuesto];
      });
      setNotice({ text: `Se importaron ${parsed.length} partidas desde ${file.name}.` });
    } catch (error) {
      setNotice({
        error: true,
        text: error instanceof Error ? error.message : 'No se pudo leer el CSV de partidas.'
      });
    } finally {
      input.value = '';
    }
  };

  const handleExportarReporte = async () => {
    if (exportando || (!hasPermission('EXPORTAR_PDF') && !hasPermission('EXPORTAR_CSV'))) return;
    setExportando(true);
    try {
      const { crearInformeAuditoria } = await import('./auditReport');
      const doc = crearInformeAuditoria({ partidas, validacionesDoc, tramites, bitacora, usuario: usuarioActual, contract: contratoActual, evaluarEstadoPartida });
      await doc.save('INFORME_AUDITORIA_OBRA_TRAZA.pdf', { returnPromise: true });
      setNotice({ text: 'Informe de auditoría PDF generado. Revisa las descargas de tu navegador.' });
    } catch (error) {
      console.error('No se pudo generar el informe PDF', error);
      setNotice({ error: true, text: 'No se pudo generar el PDF. Intenta exportar nuevamente.' });
    } finally {
      setExportando(false);
    }
  };

  const handleCrearContrato = (datosContrato) => {
    const nuevoContrato = crearRegistroContrato(datosContrato, `${Date.now()}`);
    setContratos(current => [nuevoContrato, ...current]);
    setSelectedContractId(nuevoContrato.id);
    setSelectedPartida('');
    setNotice({ text: `Contrato N.° ${nuevoContrato.numero} creado y seleccionado.` });
  };

  const handleImportarExpedientes = (datosExpedientes) => {
    const timestamp = Date.now();
    const reemplazos = new Map();
    const nuevosContratos = [];
    const idsImportados = [];

    datosExpedientes.forEach((registro, index) => {
      const { camposCSV, ...datos } = registro;
      const key = datos.numero.trim().toLowerCase();
      const existente = contratos.find(contract => contract.numero.trim().toLowerCase() === key);
      if (!existente) {
        const nuevoContrato = crearRegistroContrato(datos, `CSV-${timestamp}-${index}`, CSV_CONTRACT_DEFAULTS);
        nuevosContratos.push(nuevoContrato);
        idsImportados.push(nuevoContrato.id);
        return;
      }

      const camposActualizados = Object.fromEntries(camposCSV.map(campo => [campo, datos[campo]]));
      const datosActualizados = { ...existente, ...camposActualizados };
      const contratoActualizado = crearRegistroContrato({
        ...datosActualizados,
        validacionesDoc: crearValidacionesDocumentales(datosActualizados)
      }, existente.id, CSV_CONTRACT_DEFAULTS);
      reemplazos.set(existente.id, {
        ...contratoActualizado,
        partidas: existente.partidas || [],
        tramites: existente.tramites || [],
        bitacora: existente.bitacora || [],
        incidencias: existente.incidencias || [],
        valorizaciones: existente.valorizaciones || []
      });
      idsImportados.push(existente.id);
    });

    const contratosActualizados = contratos.map(contract => reemplazos.get(contract.id) || contract);
    const todosContratos = [...nuevosContratos, ...contratosActualizados];
    setContratos([...nuevosContratos, ...contratosActualizados]);
    setSelectedContractId(idsImportados[0]);
    const contratoSeleccionado = todosContratos.find(contract => contract.id === idsImportados[0]);
    setSelectedPartida(contratoSeleccionado?.partidas?.[0]?.codigo || '');
    const text = `Se agregaron ${nuevosContratos.length} expediente(s) y se actualizaron ${reemplazos.size} existente(s). Se conservaron partidas y registros de ejecución.`;
    setNotice({ text });
    return { agregados: nuevosContratos.length, actualizados: reemplazos.size, text };
  };

  const handleSeleccionarContrato = (id) => {
    setSelectedContractId(id);
    const selected = contratos.find(contract => contract.id === id);
    setSelectedPartida(selected?.partidas?.[0]?.codigo || '');
    setSelectedTramiteId('');
    setNotice(null);
  };

  const notificaciones = contratos
    .flatMap(contract => (contract.notificaciones || [])
      .filter(notification => notification.destinatario === usuarioActual?.rol)
      .map(notification => ({
        ...notification,
        contractId: contract.id,
        contractNumber: contract.numero,
        projectName: contract.nombre
      })))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const notificacionesNoLeidas = notificaciones.filter(notification => !notification.leida).length;

  const handleAbrirNotificacion = (notification) => {
    setContratos(current => current.map(contract => contract.id !== notification.contractId
      ? contract
      : {
          ...contract,
          notificaciones: (contract.notificaciones || []).map(item =>
            item.id === notification.id ? { ...item, leida: true } : item
          )
        }
    ));
    setSelectedContractId(notification.contractId);
    if (notification.kind === 'tramite' || notification.tramiteId) {
      setSelectedTramiteId(notification.tramiteId);
      setActiveTab('tramites');
    } else {
      setSelectedPartida(notification.partida);
      setActiveTab('ejecucion');
    }
    setMostrarNotificaciones(false);
  };

  const navItems = [
    { id: 'entidad', label: 'Entidad', icon: Building2, permissions: ['VER_TODO'] },
    { id: 'expediente', label: 'Expediente', icon: FileText, permissions: ['VER_TODO', 'VER_AUDITORIA', 'CONTROL_PLAZOS'] },
    { id: 'contrato', label: 'Contrato', icon: FileSpreadsheet, permissions: ['VER_TODO', 'CONTROL_PLAZOS'] },
    { id: 'ejecucion', label: 'Ejecución', icon: HardHat, permissions: ['VER_TODO', 'REGISTRAR_AVANCE', 'VALIDAR_CALIDAD'] },
    { id: 'tramites', label: 'Trámites', icon: FileClock, permissions: ['VER_TODO', 'APROBAR_TRAMITE', 'OPINAR_TRAMITE', 'SOLICITAR_TRAMITE', 'CONTROL_PLAZOS'] },
    { id: 'cierre', label: 'Recepción y liquidación', icon: CheckCircle2, permissions: ['VER_TODO'] },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck, permissions: ['VER_TODO', 'VER_AUDITORIA'] }
  ];
  const hasPermission = (permission) => {
    const permissions = usuarioActual?.permisos || [];
    return permissions.includes('VER_TODO') || permissions.includes(permission);
  };
  const hasExplicitPermission = (permission) => (usuarioActual?.permisos || []).includes(permission);
  const puedeCambiarContrato = hasExplicitPermission('CONTROL_PLAZOS') ||
    hasExplicitPermission('VALIDAR_CALIDAD') || usuarioActual?.rol === 'ENTIDAD';
  const puedeEditarProyecto = hasPermission('VER_TODO');
  const puedeValidarCalidad = hasExplicitPermission('VALIDAR_CALIDAD') || usuarioActual?.rol === 'ENTIDAD';
  const puedeLevantarBloqueo = hasExplicitPermission('LEVANTAR_BLOQUEO');
  const puedeLiquidar = usuarioActual?.rol === 'ENTIDAD';
  const puedeSolicitarTramite = hasExplicitPermission('SOLICITAR_TRAMITE');
  const puedeRegistrarCampo = hasExplicitPermission('REGISTRAR_AVANCE') || hasExplicitPermission('REPORTAR_INCIDENCIA');
  const puedeAdministrarDatosEjecucion = usuarioActual?.rol !== 'ENTIDAD';
  const visibleNavItems = usuarioActual
    ? navItems.filter(item => item.permissions.some(hasPermission))
    : [];
  const canAccessTab = (tab) => visibleNavItems.some(item => item.id === tab);
  const handleTabChange = (tab) => {
    if (canAccessTab(tab)) setActiveTab(tab);
  };

  if (!usuarioActual) {
    return (
      <LoginScreen
        onLogin={(usuario) => {
          setUsuarioActual(usuario);
          setMostrarNotificaciones(false);
          setSelectedTramiteId('');
          setIncidenciaTipo('Ninguna');
          setAvanceInput('');
          setGastoInput('');
          setComentarioCampo('');
          setEvidenciaFoto(null);
          const firstTabByRole = {
            ENTIDAD: 'entidad',
            SUPERVISOR: 'ejecucion',
            RESIDENTE: 'ejecucion',
            CONTRACTUAL: 'expediente'
          };
          setActiveTab(firstTabByRole[usuario.rol] || 'entidad');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-blue-950 text-white shadow-xl transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${sidebarExpanded ? 'lg:w-64' : 'lg:w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex min-h-20 items-center justify-between border-b border-blue-900 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-800 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div className={sidebarExpanded ? '' : 'lg:hidden'}>
              <p className="text-base font-extrabold tracking-tight text-white">OBRA<span className="text-unt-gold">TRAZA</span></p>
              <p className="text-[11px] text-blue-200">Gestión de obras</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={sidebarExpanded ? 'Contraer menú lateral' : 'Expandir menú lateral'}
            aria-expanded={sidebarExpanded}
            onClick={() => setSidebarExpanded(value => !value)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-100 hover:bg-blue-900 lg:flex"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-100 hover:bg-blue-900 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300 ${sidebarExpanded ? '' : 'lg:hidden'}`}>Módulos</p>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={!sidebarExpanded ? item.label : undefined}
                onClick={() => {
                  handleTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg border-l-4 px-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'border-unt-gold bg-blue-900 text-white shadow-sm'
                    : 'border-transparent text-blue-100 hover:bg-blue-900 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={sidebarExpanded ? '' : 'lg:hidden'}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-blue-900 p-3">
          <div className={`mb-3 px-2 ${sidebarExpanded ? '' : 'lg:hidden'}`}>
            <p className="truncate text-xs font-semibold text-white">{usuarioActual.nombre}</p>
            <p className="truncate text-[11px] text-blue-300">{usuarioActual.etiquetaRol}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsuarioActual(null);
              setMostrarNotificaciones(false);
              setSelectedTramiteId('');
              setActiveTab('entidad');
              setMobileSidebarOpen(false);
            }}
            aria-label={`Cerrar sesión de ${usuarioActual.nombre}`}
            title={!sidebarExpanded ? 'Cerrar sesión' : undefined}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-blue-100 transition hover:bg-blue-900 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={sidebarExpanded ? '' : 'lg:hidden'}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="app-header sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center gap-3 py-2">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileSidebarOpen}
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-900 hover:bg-blue-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-blue-950">{visibleNavItems.find(item => item.id === activeTab)?.label}</p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">Mejoramiento de Pabellón Académico e Infraestructura Educativa</p>
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label={`Notificaciones${notificacionesNoLeidas ? `: ${notificacionesNoLeidas} sin leer` : ''}`}
                aria-expanded={mostrarNotificaciones}
                aria-controls="panel-notificaciones"
                onClick={() => setMostrarNotificaciones(open => !open)}
                className="relative flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-blue-900 transition hover:bg-blue-50"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden text-xs font-semibold sm:inline">Notificaciones</span>
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>
              {mostrarNotificaciones && (
                <section
                  id="panel-notificaciones"
                  aria-label="Notificaciones"
                  className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-bold text-blue-950">Notificaciones</h2>
                    <span className="text-xs text-slate-500">{notificacionesNoLeidas} sin leer</span>
                  </div>
                  {notificaciones.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500">No hay notificaciones para este perfil.</p>
                  ) : (
                    <div className="space-y-2">
                      {notificaciones.map(notification => {
                        const esTramite = notification.kind === 'tramite' || Boolean(notification.tramiteId);
                        return (
                          <button
                            key={`${notification.contractId}-${notification.id}`}
                            type="button"
                            onClick={() => handleAbrirNotificacion(notification)}
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              esTramite ? 'hover:bg-blue-50' : 'hover:bg-red-50'
                            } ${
                              notification.leida
                                ? 'border-slate-200 bg-white'
                                : esTramite ? 'border-blue-200 bg-blue-50/60' : 'border-red-200 bg-red-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-xs font-bold ${esTramite ? 'text-blue-900' : 'text-red-800'}`}>
                                {notification.tipo}
                              </span>
                              <span className="shrink-0 text-[10px] font-semibold text-slate-500">
                                {notification.leida ? 'Leída' : 'Nueva'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-blue-950">{notification.projectName}</p>
                            <p className="mt-1 text-[11px] text-slate-600">
                              Contrato N.° {notification.contractNumber}
                              {esTramite ? ` · ${notification.tramiteId}` : ` · Partida ${notification.partida}`}
                            </p>
                            <p className="mt-2 text-xs text-slate-700">{notification.detalle}</p>
                            {esTramite && (
                              <p className="mt-1 text-[11px] text-slate-600">
                                Solicitante: {notification.solicitante || 'No especificado'} · Días solicitados: {notification.diasSolicitados}
                              </p>
                            )}
                            <p className="mt-2 text-[10px] text-slate-500">
                              {notification.usuario} · {new Date(notification.fecha).toLocaleString('es-PE')}
                            </p>
                            <span className="mt-2 inline-flex text-xs font-bold text-blue-900">
                              {esTramite ? 'Ver solicitud' : 'Ver incidencia'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>
            {(hasPermission('EXPORTAR_PDF') || hasPermission('EXPORTAR_CSV')) && (
              <button
                onClick={handleExportarReporte}
                disabled={exportando}
                aria-busy={exportando}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{exportando ? 'Generando PDF…' : 'Exportar Auditoría PDF'}</span>
                <span className="sm:hidden">{exportando ? 'Generando…' : 'PDF'}</span>
              </button>
            )}
          </div>
        </div>
        <div className="bg-blue-950 text-xs text-blue-100">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <FileText className="h-3.5 w-3.5" />
                Expediente:
              </span>
              {puedeCambiarContrato ? (
                <select
                  aria-label="Seleccionar expediente y contrato asociados"
                  value={contratoActual?.id || ''}
                  onChange={event => handleSeleccionarContrato(event.target.value)}
                  className="max-w-full rounded-md border border-blue-700 bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  {contratos.map(contract => (
                    <option key={contract.id} value={contract.id}>{contract.nombre} · CUI {contract.cui} — Contrato N.° {contract.numero}</option>
                  ))}
                </select>
              ) : (
                <span className="truncate font-semibold text-white">{contratoActual?.numero}</span>
              )}
            </div>
            <span className="rounded-full border border-blue-700/70 bg-blue-900/90 px-2.5 py-0.5 text-blue-200">
              Demostración • Datos de ejemplo
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          CONTENIDO PRINCIPAL
         ===================================================================== */}
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
        <section className="page-heading">
          <div>
            <p className="institution-label">{entidad.nombre}</p>
            <h1>{visibleNavItems.find(item => item.id === activeTab)?.label}</h1>
            <p className="page-description">{{
              entidad: 'Gestiona la ficha institucional, la cartera de obras, el presupuesto y sus alertas.',
              expediente: 'Consulta y administra los expedientes, procedimientos y fechas clave.',
              contrato: 'Controla contratista, monto, plazo, adelantos, garantías y penalidades.',
              ejecucion: 'Registra avances, valorizaciones, incidencias y cambios de ejecución.',
              tramites: 'Solicita, opina y controla los plazos de las actuaciones contractuales.',
              cierre: 'Gestiona la recepción de obra y el proceso de liquidación.',
              auditoria: 'Consulta indicadores, alertas, trazabilidad y reportes.'
            }[activeTab]}</p>
          </div>
          <div className="project-tag"><Building2 size={18} aria-hidden="true" /><span>{contratoActual?.ubicacion || 'Obra seleccionada'}<strong>{contratoActual?.numero}</strong></span></div>
        </section>
        {notice && <div className={`feedback ${notice.error ? 'feedback-error' : ''}`} role={notice.error ? 'alert' : 'status'}>
          {notice.error ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <p>{notice.text}</p><button type="button" onClick={() => setNotice(null)} aria-label="Cerrar mensaje">Cerrar</button>
        </div>}
        {/* TARJETAS DE INDICADORES CLAVE (KPIs) */}
        {activeTab === 'entidad' && (
          <EntityDashboard
            entity={entidad}
            onUpdateEntity={setEntidad}
            contracts={contratos}
            selectedContractId={contratoActual?.id}
            onSelectContract={(id) => {
              handleSeleccionarContrato(id);
              handleTabChange('expediente');
            }}
          />
        )}
        {activeTab === 'auditoria' && (
        <section aria-label="Indicadores generales" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avance Físico</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">
                  {resumen.metradoInconsistente ? 'Revisar metrados' : resumen.avanceFisicoObra === null ? 'Sin datos' : `${resumen.avanceFisicoObra}%`}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              Meta programada al corte: <strong className="text-slate-700">{contratoActual?.avanceProgramado || 0}%</strong>
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gasto Ejecutado</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">
                  {resumen.metradoInconsistente ? 'Revisar metrados' : `S/ ${resumen.totalGasto.toLocaleString()}`}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              {resumen.metradoInconsistente
                ? 'Ejecución financiera: revisar metrados.'
                : <><strong className="text-blue-700">{resumen.ejecucionFinanciera}%</strong> de S/ {resumen.totalPresupuesto.toLocaleString()}</>}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado de Partidas</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> {resumen.rojas} críticas
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {resumen.amarillas} preventivas
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> {resumen.verdes} conformes
                  </span>
                </div>
              </div>
              <svg className="h-14 w-14 shrink-0" viewBox="0 0 44 44" role="img" aria-label={`Estado de ${totalPartidasEstado} partidas: ${resumen.rojas} críticas, ${resumen.amarillas} preventivas y ${resumen.verdes} conformes`}>
                <circle cx="22" cy="22" r="16" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                <g transform="rotate(-90 22 22)">
                  <circle cx="22" cy="22" r="16" pathLength="100" fill="none" stroke="#dc2626" strokeWidth="7" strokeDasharray={`${porcentajeEstado(resumen.rojas)} 100`} />
                  <circle cx="22" cy="22" r="16" pathLength="100" fill="none" stroke="#f59e0b" strokeWidth="7" strokeDasharray={`${porcentajeEstado(resumen.amarillas)} 100`} strokeDashoffset={-porcentajeEstado(resumen.rojas)} />
                  <circle cx="22" cy="22" r="16" pathLength="100" fill="none" stroke="#059669" strokeWidth="7" strokeDasharray={`${porcentajeEstado(resumen.verdes)} 100`} strokeDashoffset={-(porcentajeEstado(resumen.rojas) + porcentajeEstado(resumen.amarillas))} />
                </g>
              </svg>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              {resumen.rojas > 0 ? 'Partidas con bloqueo o alerta crítica' : 'Todas las partidas operativas'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Plazos por Vencer</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">{resumen.tramitesUrgentes}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              Pronunciamientos con límite &le; 3 días
            </p>
          </div>
        </section>
        )}

        {/* =====================================================================
            MÓDULO DE AUDITORÍA: INDICADORES, CURVA Y BITÁCORA
           ===================================================================== */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6">
            {resumen.rojas > 0 && (
              <div className="bg-white border border-red-200 border-l-4 border-l-red-600 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Alerta Crítica Activa: {resumen.rojas} partida(s) requieren atención inmediata
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {usuarioActual.rol === 'ENTIDAD'
                        ? 'El avance y las valorizaciones seguirán bloqueados hasta que Residente registre la evidencia de subsanación y Supervisión la valide.'
                        : 'La validación de avance físico y valorización permanece bloqueada hasta registrar la evidencia de subsanación en campo.'}
                    </p>
                  </div>
                </div>
                {canAccessTab('ejecucion') && (
                  <button
                    onClick={() => handleTabChange('ejecucion')}
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shrink-0 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {usuarioActual.rol === 'ENTIDAD' ? 'Revisar ejecución' : 'Gestionar en campo'}
                  </button>
                )}
              </div>
            )}

            {/* Tabla Principal de Partidas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-blue-950">
                    Control de Partidas, Rendimiento y Calidad Contractual
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comparativo consolidado entre metas programadas y ejecución real en obra
                  </p>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
                  {partidas.length} Partidas registradas
                </span>
              </div>

              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Partidas: desplaza horizontalmente para ver todas las columnas">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-6">Partida y Especificación</th>
                      <th scope="col" className="py-3.5 px-4">Subcontratista</th>
                      <th scope="col" className="py-3.5 px-4">Avance Físico</th>
                      <th scope="col" className="py-3.5 px-4">Cumpl.</th>
                      <th scope="col" className="py-3.5 px-4">Ejecución Financiera</th>
                      <th scope="col" className="py-3.5 px-6">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {partidas.map((p) => {
                      const est = evaluarEstadoPartida(p);
                      return (
                        <tr key={p.codigo} className="hover:bg-blue-50/30 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {p.codigo}
                              </span>
                              <span className="font-semibold text-slate-900">{p.descripcion}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{p.observacion}</p>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-slate-700">{p.subcontratista}</td>
                          <td className="py-4 px-4 text-xs">
                            {partidaTieneMetradoInconsistente(p)
                              ? <span className="font-semibold text-red-700">Revisar metrado</span>
                              : <>
                                  <span className="font-bold text-slate-900">{p.metradoEjecutado}</span>{' '}
                                  <span className="text-slate-500">/ {p.metradoProgramado} {p.unidad}</span>
                                  <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                    <div
                                      className="bg-blue-700 h-full rounded-full"
                                      style={{ width: `${Math.min(100, Number(est.cumplimiento))}%` }}
                                    ></div>
                                  </div>
                                </>}
                          </td>
                          <td className="py-4 px-4 font-bold text-blue-950">{est.cumplimiento === '—' ? '—' : `${est.cumplimiento}%`}</td>
                          <td className="py-4 px-4 text-xs">
                            {partidaTieneMetradoInconsistente(p)
                              ? <p className="font-semibold text-red-700">Revisar datos financieros</p>
                              : <>
                                  <p className="font-bold text-slate-900">S/ {p.gastoEjecutado.toLocaleString()}</p>
                                  <p className="text-slate-500">de S/ {p.presupuestoContratado.toLocaleString()}</p>
                                </>}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${est.color}`}>
                              <span className={`w-2 h-2 rounded-full ${est.dot}`}></span>
                              {est.etiqueta}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Curva S + Bitácora */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-blue-950">Avance programado vs. real</h3>
                    <p className="text-xs text-slate-500">Seguimiento acumulado por periodo quincenal</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                    Corte Quincena 4
                  </span>
                </div>
                <svg className="h-64 w-full" viewBox="0 0 500 260" role="img" aria-label="Gráfico de barras: avance programado y real por quincena">
                  {chartTicks.map(tick => (
                    <g key={tick}>
                      <line x1="52" x2="470" y1={chartY(tick)} y2={chartY(tick)} stroke="#e2e8f0" strokeDasharray="3 5" />
                      <text x="8" y={chartY(tick) + 4} fill="#64748b" fontSize="11">{tick}%</text>
                    </g>
                  ))}
                  {avanceChart.map((point, index) => (
                    <g key={point.periodo}>
                      <rect x={chartX(index) - 30} y={chartY(point.programado)} width="25" height={220 - chartY(point.programado)} rx="3" fill="#12377b">
                        <title>{point.periodo}: programado {point.programado}%</title>
                      </rect>
                      {point.real !== null && (
                        <rect x={chartX(index) + 5} y={chartY(point.real)} width="25" height={220 - chartY(point.real)} rx="3" fill="#e6ad09">
                          <title>{point.periodo}: real {point.real}%</title>
                        </rect>
                      )}
                      <text x={chartX(index) - 17.5} y={chartY(point.programado) - 8} textAnchor="middle" fill="#12377b" fontSize="11">{point.programado}%</text>
                      <text
                        x={chartX(index) + 17.5}
                        y={point.real === null ? 216 : chartY(point.real) - 8}
                        textAnchor="middle"
                        fill={point.real === null ? '#b91c1c' : '#795900'}
                        fontSize="11"
                      >
                        {point.real === null ? 'Revisar' : `${point.real}%`}
                      </text>
                      <text x={chartX(index)} y="244" textAnchor="middle" fill="#64748b" fontSize="11">{point.periodo}</text>
                    </g>
                  ))}
                </svg>
                <div className="flex items-center gap-5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-2.5 bg-blue-950 inline-block rounded-sm"></span> Avance Programado
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-2.5 bg-unt-gold inline-block rounded-sm"></span> Avance Real Ejecutado
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-blue-950">Bitácora de Trazabilidad y Auditoría</h3>
                    <p className="text-xs text-slate-500">Historial cronológico con responsable y sustento</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {bitacora.map((b) => (
                    <div key={b.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                      <div className="flex justify-between items-center text-slate-500 mb-1.5">
                        <span className="font-bold text-blue-900">{b.usuario}</span>
                        <span className="text-xs">{b.fecha}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{b.accion}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-slate-700">
                          Ref: {b.partida}
                        </span>
                        <span className="text-slate-600 font-medium">{b.evidencia}</span>
                      </div>
                      {b.evidenciaDataUrl && (
                        <a href={b.evidenciaDataUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                          <img
                            src={b.evidenciaDataUrl}
                            alt={`Evidencia fotográfica del registro ${b.partida}`}
                            loading="lazy"
                            className="max-h-40 max-w-full rounded-lg border border-slate-200 object-contain"
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expediente' && (
          <ProjectWorkspace
            section="expediente"
            contract={contratoActual}
            contracts={contratos}
            canEdit={puedeEditarProyecto}
            canControl={hasPermission('CONTROL_PLAZOS')}
            canValidate={puedeValidarCalidad}
            canLiquidate={puedeLiquidar}
            onUpdateContract={updateCurrentContract}
            onCreateContract={handleCrearContrato}
            onImportExpedientes={handleImportarExpedientes}
          />
        )}
        {activeTab === 'contrato' && (
          <ProjectWorkspace
            section="contrato"
            contract={contratoActual}
            contracts={contratos}
            canEdit={puedeEditarProyecto}
            canControl={hasPermission('CONTROL_PLAZOS')}
            canValidate={puedeValidarCalidad}
            canLiquidate={puedeLiquidar}
            onUpdateContract={updateCurrentContract}
            onCreateContract={handleCrearContrato}
          />
        )}
        {activeTab === 'ejecucion' && (
          <ProjectWorkspace
            section="ejecucion"
            contract={contratoActual}
            contracts={contratos}
            canEdit={puedeEditarProyecto && puedeAdministrarDatosEjecucion}
            canControl={hasPermission('CONTROL_PLAZOS') && puedeAdministrarDatosEjecucion}
            canValidate={puedeValidarCalidad && puedeAdministrarDatosEjecucion}
            canLiquidate={puedeLiquidar}
            onUpdateContract={updateCurrentContract}
            onCreateContract={handleCrearContrato}
          />
        )}
        {activeTab === 'cierre' && (
          <ProjectWorkspace
            section="cierre"
            contract={contratoActual}
            contracts={contratos}
            canEdit={puedeEditarProyecto}
            canControl={hasPermission('CONTROL_PLAZOS')}
            canValidate={puedeValidarCalidad}
            canLiquidate={puedeLiquidar}
            onUpdateContract={updateCurrentContract}
            onCreateContract={handleCrearContrato}
          />
        )}

        {/* =====================================================================
            MÓDULO DE CONTRATO: CARGA DE PARTIDAS Y VALIDACIÓN DOCUMENTAL
           ===================================================================== */}
        {activeTab === 'contrato' && (
          <div className={`grid grid-cols-1 gap-6 ${puedeEditarProyecto ? 'lg:grid-cols-2' : ''}`}>
            {puedeEditarProyecto && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-blue-950">
                  1. Carga de Presupuesto y Cronograma Contractual
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Importa la estructura de partidas contratadas desde Excel/CSV para centralizar metrados, plazos y subcontratistas.
                </p>
              </div>

              <label className="border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center">
                <div className="p-3 bg-white rounded-full shadow-sm border border-blue-100 mb-3">
                  <Upload className="w-6 h-6 text-blue-700" />
                </div>
                <span className="text-sm font-bold text-blue-950">Subir archivo CSV de presupuesto</span>
                <span className="text-xs text-slate-500 mt-1 max-w-md">
                  Columnas: codigo, descripcion, unidad, metradoContratado, metradoProgramado, metradoEjecutado, presupuestoContratado, gastoEjecutado, subcontratista
                </span>
                <input type="file" accept=".csv,text/csv" onChange={handleCargarCSVPartidas} className="hidden" />
              </label>

              <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-100 text-xs text-blue-950 space-y-1">
                <p><strong>Contrato Activo:</strong> N° {contratoActual?.numero}</p>
                <p><strong>Sistema de Contratación:</strong> {contratoActual?.sistema} • Plazo: {contratoActual?.plazoDias} días calendario</p>
              </div>
            </div>
            )}

            <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 ${puedeEditarProyecto ? '' : 'lg:col-span-2'}`}>
              <div>
                <h2 className="text-base font-bold text-blue-950">
                  Verificación de Consistencia Documental
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Compara plazos y presupuestos, y revisa terreno, permisos y especificaciones técnicas.
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {validacionesDoc.filter(item => item.estado === 'Inconsistencia').length} inconsistencia(s) · {validacionesDoc.filter(item => item.estado === 'Pendiente').length} pendiente(s)
              </p>
              <div className="space-y-3">
                {validacionesDoc.map((v) => (
                  <div key={v.id} className="p-3.5 rounded-lg border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-start gap-2.5">
                      {v.estado === 'Conforme' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : v.estado === 'Pendiente' ? (
                        <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      ) : (
                        <FileWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{v.item}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{v.detalle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!puedeEditarProyecto}
                      aria-label={`${v.item}: ${v.estado}. Cambiar a ${v.estado === 'Conforme' ? 'Inconsistencia' : 'Conforme'}`}
                      title="Cambiar estado de la verificación"
                      onClick={() =>
                        setValidacionesDoc(prev =>
                          prev.map(item =>
                            item.id === v.id
                              ? { ...item, estado: item.estado === 'Conforme' ? 'Inconsistencia' : 'Conforme' }
                              : item
                          )
                        )
                      }
                      className={`text-xs px-3 py-1 rounded-md font-semibold shrink-0 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        v.estado === 'Conforme'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : v.estado === 'Pendiente'
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {v.estado}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 2: REGISTRO DIARIO EN CAMPO Y CONTROL DE CALIDAD
           ===================================================================== */}
        {activeTab === 'ejecucion' && (
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-blue-950">
                {usuarioActual.rol === 'ENTIDAD'
                  ? 'Seguimiento de Ejecución y Calidad'
                  : 'Registro Diario en Campo y Control de Calidad'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {usuarioActual.rol === 'ENTIDAD'
                  ? 'Consulta los avances registrados por Residente, las incidencias y el estado de las subsanaciones.'
                  : 'Ingresa avances físicos, gastos ejecutados, evidencias fotográficas o incidencias técnicas vinculadas a cada partida.'}
              </p>
            </div>

            {puedeRegistrarCampo && partidas.length > 0 && (
            <form onSubmit={handleRegistrarCampo} className="space-y-5">
              <div>
                <label htmlFor="field-1" className="block text-xs font-bold text-slate-700 mb-1.5">Partida Contractual</label>
                <select id="field-1"
                  value={selectedPartida}
                  onChange={(e) => setSelectedPartida(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:border-blue-600 focus:outline-none"
                >
                  {partidas.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.codigo} - {p.descripcion} ({p.subcontratista})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-2" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Avance Físico del Día (Metrado)
                  </label>
                  <input id="field-2"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ej. 15.5"
                    value={avanceInput}
                    onChange={(e) => setAvanceInput(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="field-3" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gasto Ejecutado del Día (S/)
                  </label>
                  <input id="field-3"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 4500"
                    value={gastoInput}
                    onChange={(e) => setGastoInput(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-4" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estado de Calidad / Incidencia
                  </label>
                  <select id="field-4"
                    value={incidenciaTipo}
                    onChange={(e) => setIncidenciaTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Ninguna">Ejecución Normal (Sin incidencias)</option>
                    <option value="Observación Preventiva">Observación Preventiva (Material / Rendimiento)</option>
                    <option value="No Conformidad de Calidad">No Conformidad de Calidad (Bloquea avance)</option>
                    {usuarioActual.rol === 'RESIDENTE' && <option value="Incidencia Crítica">Incidencia Crítica de Calidad (Notificar a Entidad)</option>}
                    {puedeLevantarBloqueo && <option value="Subsanación Aprobada">Subsanación Aprobada (Desbloquea partida)</option>}
                  </select>
                </div>

                <div>
                  <label htmlFor="evidencia" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Evidencia Fotográfica / Sustento
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm">
                    <Camera className="h-4 w-4 shrink-0 text-blue-700" />
                    <input
                      id="evidencia"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      aria-label="Subir foto de evidencia"
                      onChange={handleSeleccionarEvidencia}
                      disabled={evidenciaCargando}
                      className="min-w-0 w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-900"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {evidenciaCargando
                      ? 'Preparando foto…'
                      : evidenciaFoto
                        ? `Foto adjunta: ${evidenciaNombre}`
                        : 'Selecciona o toma una foto. Se comprime y guarda localmente.'}
                  </p>
                  {evidenciaFoto && (
                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
                      <img
                        src={evidenciaFoto.dataUrl}
                        alt={`Vista previa de ${evidenciaNombre}`}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEvidenciaFoto(null)}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Quitar foto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="field-5" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detalle Técnico u Observación en Cuaderno de Obra
                </label>
                <textarea id="field-5"
                  rows="3"
                  placeholder="Describe los trabajos realizados, ensayos de calidad o motivo de la incidencia..."
                  value={comentarioCampo}
                  onChange={(e) => setComentarioCampo(e.target.value)}
                  required={usuarioActual.rol === 'RESIDENTE' && incidenciaTipo !== 'Ninguna'}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={evidenciaCargando}
                className="w-full rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              >
                {evidenciaCargando ? 'Preparando foto…' : 'Guardar registro de campo'}
              </button>
            </form>
            )}
            {puedeRegistrarCampo && partidas.length === 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Este expediente todavía no tiene partidas. Solicita a Entidad que las importe desde el módulo Contrato.
              </p>
            )}
            {['RESIDENTE', 'SUPERVISOR', 'ENTIDAD'].includes(usuarioActual.rol) && (
              <IncidentList
                incidencias={incidencias}
                role={usuarioActual.rol}
                userId={usuarioActual.id}
                onApprove={handleDarVistoBueno}
              />
            )}
            {(puedeValidarCalidad || puedeLevantarBloqueo) && (
              <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-blue-950">Validación de calidad</h3>
                <p className="mt-1 text-xs text-slate-500">Supervisión puede aprobar la subsanación y levantar el bloqueo de una partida.</p>
                <div className="mt-4 space-y-3">
                  {partidas.filter(item => item.noConformidad).map(item => (
                    <div key={item.codigo} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                      <div>
                        <p className="text-sm font-bold text-red-800">{item.codigo} · {item.descripcion}</p>
                        <p className="mt-1 text-xs text-red-700">{item.observacion}</p>
                      </div>
                      {puedeLevantarBloqueo && (
                        <button
                          type="button"
                          onClick={() => handleAprobarSubsanacion(item.codigo)}
                          className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                          Aprobar subsanación
                        </button>
                      )}
                    </div>
                  ))}
                  {partidas.every(item => !item.noConformidad) && (
                    <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">No hay partidas bloqueadas por no conformidad.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* =====================================================================
            MÓDULO DE TRÁMITES Y PLAZOS CONTRACTUALES
           ===================================================================== */}
        {activeTab === 'tramites' && (
          <TramiteWorkflow
            contract={contratoActual}
            tramites={tramites}
            role={usuarioActual.rol}
            canSolicitar={puedeSolicitarTramite}
            onCreate={handleAgregarTramite}
            onRegisterReceipt={handleRegistrarRecepcionTramite}
            onStartReview={handleIniciarRevisionTramite}
            onOpinion={handleOpinarTramite}
            onStartEvaluation={handleIniciarEvaluacionTramite}
            onResolve={handleResolverTramite}
            selectedTramiteId={selectedTramiteId}
          />
        )}
      </main>

      {/* =====================================================================
          FOOTER INSTITUCIONAL (BLANCO Y AZUL MARINO)
         ===================================================================== */}
      <footer className="bg-blue-950 text-blue-100 border-t border-blue-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-blue-900">
            {/* Columna 1: Identidad */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-white">
                  OBRA<span className="text-unt-gold">TRAZA</span>
                </span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Plataforma digital orientada al seguimiento preventivo, trazabilidad documental y control de ejecución física y financiera en obras públicas.
              </p>
            </div>

            {/* Columna 2: Módulos del Sistema */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Explora los módulos
              </h4>
              <ul className="space-y-2 text-xs text-blue-100">
                {visibleNavItems.map(item => (
                  <li key={item.id}>
                    <button onClick={() => handleTabChange(item.id)} className="hover:text-white transition cursor-pointer">
                      • {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Marco Normativo y Concurso */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-unt-gold" />
                Marco de Referencia
              </h4>
              <ul className="space-y-2 text-xs text-blue-100">
                <li>• Ley N° 32069 — Ley General de Contrataciones Públicas</li>
                <li>• D.S. N° 009-2025-EF — Reglamento de Contrataciones</li>
                <li>• Desafío 01: Contrataciones públicas y ejecución de obras</li>
                <li>• Hackathon Innova Norte 3G — UNT / RUI (2026)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-unt-gold">
            <p>© 2026 OBRA TRAZA • MVP 1.0 • Prototipo Funcional (TRL 3–4) desarrollado para fines de demostración académica.</p>
            <p className="text-blue-100">Opera exclusivamente con datos sintéticos • Sin conexión a sistemas productivos.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}