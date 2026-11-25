import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  HardHat,
  FileClock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  Plus,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Camera,
  FileWarning,
  ArrowRight,
  UserCheck,
  FileText,
  Layers,
  Scale,
  Clock
} from 'lucide-react';

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

function evaluarEstadoPartida(p) {
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rolActivo, setRolActivo] = useState('Área de Infraestructura (Entidad)');
  const [partidas, setPartidas] = useState(INITIAL_PARTIDAS);
  const [validacionesDoc, setValidacionesDoc] = useState(INITIAL_VALIDACIONES_DOC);
  const [tramites, setTramites] = useState(INITIAL_TRAMITES);
  const [bitacora, setBitacora] = useState(INITIAL_BITACORA);

  // Estados Módulo 2 (Campo)
  const [selectedPartida, setSelectedPartida] = useState('03.02');
  const [avanceInput, setAvanceInput] = useState('');
  const [gastoInput, setGastoInput] = useState('');
  const [incidenciaTipo, setIncidenciaTipo] = useState('Ninguna');
  const [comentarioCampo, setComentarioCampo] = useState('');
  const [evidenciaNombre, setEvidenciaNombre] = useState('');

  // Estados Módulo 3 (Trámites)
  const [nuevoTramiteTipo, setNuevoTramiteTipo] = useState('Ampliación de Plazo');
  const [nuevoTramiteAsunto, setNuevoTramiteAsunto] = useState('');
  const [nuevoTramiteDias, setNuevoTramiteDias] = useState(5);

  const resumen = useMemo(() => {
    const totalPresupuesto = partidas.reduce((acc, p) => acc + p.presupuestoContratado, 0);
    const totalGasto = partidas.reduce((acc, p) => acc + p.gastoEjecutado, 0);
    const totalProgramado = partidas.reduce((acc, p) => acc + p.metradoProgramado, 0);
    const totalEjecutado = partidas.reduce((acc, p) => acc + p.metradoEjecutado, 0);

    const avanceFisicoReal = totalProgramado > 0 ? ((totalEjecutado / totalProgramado) * 100).toFixed(1) : 0;
    const ejecucionFinanciera = totalPresupuesto > 0 ? ((totalGasto / totalPresupuesto) * 100).toFixed(1) : 0;

    let rojas = 0, amarillas = 0, verdes = 0;
    partidas.forEach(p => {
      const est = evaluarEstadoPartida(p).nivel;
      if (est === 'ROJO') rojas++;
      else if (est === 'AMARILLO') amarillas++;
      else verdes++;
    });

    const tramitesUrgentes = tramites.filter(t => t.estado !== 'Atendido' && t.diasRestantes <= 3).length;

    return {
      totalPresupuesto,
      totalGasto,
      avanceFisicoReal,
      ejecucionFinanciera,
      rojas,
      amarillas,
      verdes,
      tramitesUrgentes
    };
  }, [partidas, tramites]);

  const handleRegistrarCampo = (e) => {
    e.preventDefault();
    const deltaAvance = parseFloat(avanceInput) || 0;
    const deltaGasto = parseFloat(gastoInput) || 0;
    const generaNoConformidad = incidenciaTipo === 'No Conformidad de Calidad';
    const subsanaNoConformidad = incidenciaTipo === 'Subsanación Aprobada';

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

    const nuevaEntrada = {
      id: Date.now(),
      fecha: '2026-11-24 23:40',
      usuario: rolActivo,
      partida: selectedPartida,
      accion: `${incidenciaTipo !== 'Ninguna' ? `[${incidenciaTipo}] ` : ''}Avance +${deltaAvance}, Gasto +S/${deltaGasto}. ${comentarioCampo}`,
      evidencia: evidenciaNombre || 'registro_campo_evidencia.jpg'
    };

    setBitacora([nuevaEntrada, ...bitacora]);
    setAvanceInput('');
    setGastoInput('');
    setComentarioCampo('');
    setEvidenciaNombre('');
    alert('Registro guardado en la bitácora de trazabilidad.');
  };

  const handleAgregarTramite = (e) => {
    e.preventDefault();
    if (!nuevoTramiteAsunto.trim()) return;
    const dias = parseInt(nuevoTramiteDias, 10) || 5;
    const nuevo = {
      id: `TR-2026-0${tramites.length + 1}`,
      tipo: nuevoTramiteTipo,
      asunto: nuevoTramiteAsunto,
      fechaIngreso: '2026-11-24',
      fechaLimite: '2026-11-29',
      diasRestantes: dias,
      responsable: rolActivo,
      docsPendientes: 'En revisión inicial',
      estado: dias <= 3 ? 'Crítico' : 'Preventivo'
    };
    setTramites([nuevo, ...tramites]);
    setBitacora([
      {
        id: Date.now(),
        fecha: '2026-11-24 23:40',
        usuario: rolActivo,
        partida: nuevo.id,
        accion: `Nuevo trámite contractual registrado: ${nuevo.tipo} - ${nuevo.asunto}`,
        evidencia: 'expediente_tramite.pdf'
      },
      ...bitacora
    ]);
    setNuevoTramiteAsunto('');
  };

  const handleCargarCSVSimulado = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 1) {
          const parsed = lines.slice(1).map((line, idx) => {
            const cols = line.split(',');
            return {
              codigo: cols[0]?.trim() || `05.0${idx + 1}`,
              descripcion: cols[1]?.trim() || 'Partida Importada CSV',
              unidad: cols[2]?.trim() || 'und',
              metradoContratado: parseFloat(cols[3]) || 100,
              metradoProgramado: parseFloat(cols[4]) || 50,
              metradoEjecutado: parseFloat(cols[5]) || 40,
              presupuestoContratado: parseFloat(cols[6]) || 25000,
              gastoEjecutado: parseFloat(cols[7]) || 20000,
              jornadas: 5,
              subcontratista: cols[8]?.trim() || 'Contratista Importado S.A.C.',
              especificacion: 'Según archivo CSV importado',
              noConformidad: false,
              observacion: 'Cargado desde CSV contractual.'
            };
          });
          setPartidas(parsed);
          alert(`Se importaron ${parsed.length} partidas desde ${file.name}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportarReporte = () => {
    const headers = ['Codigo,Descripcion,Subcontratista,Programado,Ejecutado,Cumplimiento%,Presupuesto,Gasto,EstadoAlertas'];
    const rows = partidas.map(p => {
      const est = evaluarEstadoPartida(p);
      return `"${p.codigo}","${p.descripcion}","${p.subcontratista}",${p.metradoProgramado},${p.metradoEjecutado},${est.cumplimiento}%,${p.presupuestoContratado},${p.gastoEjecutado},"${est.nivel} - ${est.etiqueta}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'REPORTE_AUDITORIA_OBRA_TRAZA.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'dashboard', label: 'Panel General', sub: 'Alertas y Curva S', icon: LayoutDashboard },
    { id: 'contrato', label: 'Contrato', sub: 'Carga y Validación', icon: FileSpreadsheet },
    { id: 'campo', label: 'Ejecución en Obra', sub: 'Avance y Calidad', icon: HardHat },
    { id: 'tramites', label: 'Trámites', sub: 'Plazos Legales', icon: FileClock }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* =====================================================================
          NAVBAR PRINCIPAL (STICKY, BLANCO Y AZUL INSTITUCIONAL)
         ===================================================================== */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Marca / Logo */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-blue-950">
                    OBRA<span className="text-blue-600">TRAZA</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    v1.0 MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  Control Contractual y Trazabilidad de Obras
                </p>
              </div>
            </div>

            {/* Navegación Central (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-blue-700'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Controles Derechos: Selector de Rol y Exportación */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <select
                  value={rolActivo}
                  onChange={(e) => setRolActivo(e.target.value)}
                  aria-label="Seleccionar rol de usuario"
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Área de Infraestructura (Entidad)">Área de Infraestructura</option>
                  <option value="Ing. Carlos Mendoza (Supervisor)">Supervisor de Obra</option>
                  <option value="Ing. María Torres (Residente)">Residente de Obra</option>
                  <option value="Abg. Luis Rojas (Gestión Contractual)">Gestión Contractual</option>
                </select>
              </div>

              <button
                onClick={handleExportarReporte}
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exportar Auditoría</span>
                <span className="md:hidden">CSV</span>
              </button>
            </div>
          </div>

          {/* Navegación Secundaria Responsive (Móvil / Tablet) */}
          <div className="flex lg:hidden overflow-x-auto gap-1.5 py-2 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-barra de Contexto del Proyecto Simulado */}
        <div className="bg-blue-950 text-blue-100 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-300" />
                Expediente: Contrato N° 014-2026-UNT/OAB
              </span>
              <span className="hidden sm:inline text-blue-400">|</span>
              <span className="text-blue-200">
                Obra: Mejoramiento de Pabellón Académico e Infraestructura Educativa
              </span>
            </div>
            <span className="text-[11px] bg-blue-900/90 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-700/70">
              Entorno de Prueba • Datos Sintéticos (Ley N° 32069)
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          CONTENIDO PRINCIPAL
         ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* TARJETAS DE INDICADORES CLAVE (KPIs) */}
        <section aria-label="Indicadores generales" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avance Físico</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">{resumen.avanceFisicoReal}%</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              Meta programada al corte: <strong className="text-slate-700">100.0%</strong>
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gasto Ejecutado</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">
                  S/ {resumen.totalGasto.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              <strong className="text-blue-700">{resumen.ejecucionFinanciera}%</strong> de S/ {resumen.totalPresupuesto.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado de Partidas</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> {resumen.rojas}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {resumen.amarillas}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> {resumen.verdes}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Layers className="w-5 h-5" />
              </div>
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

        {/* =====================================================================
            MÓDULO 4: DASHBOARD GENERAL, CURVA S Y BITÁCORA
           ===================================================================== */}
        {activeTab === 'dashboard' && (
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
                      La validación de avance físico y valorización permanece bloqueada hasta registrar la evidencia de subsanación en campo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('campo')}
                  className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shrink-0 flex items-center gap-1.5 transition cursor-pointer"
                >
                  Gestionar en Campo <ArrowRight className="w-3.5 h-3.5" />
                </button>
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

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Partida y Especificación</th>
                      <th className="py-3.5 px-4">Subcontratista</th>
                      <th className="py-3.5 px-4">Avance Físico</th>
                      <th className="py-3.5 px-4">Cumpl.</th>
                      <th className="py-3.5 px-4">Ejecución Financiera</th>
                      <th className="py-3.5 px-6">Estado</th>
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
                            <span className="font-bold text-slate-900">{p.metradoEjecutado}</span>{' '}
                            <span className="text-slate-500">/ {p.metradoProgramado} {p.unidad}</span>
                            <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-blue-700 h-full rounded-full"
                                style={{ width: `${Math.min(100, Number(est.cumplimiento))}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-blue-950">{est.cumplimiento}%</td>
                          <td className="py-4 px-4 text-xs">
                            <p className="font-bold text-slate-900">S/ {p.gastoEjecutado.toLocaleString()}</p>
                            <p className="text-slate-400">de S/ {p.presupuestoContratado.toLocaleString()}</p>
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
                    <h3 className="text-base font-bold text-blue-950">Curva S: Avance Programado vs. Real</h3>
                    <p className="text-xs text-slate-500">Seguimiento acumulado por periodo quincenal</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                    Corte Quincena 4
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { periodo: 'Quincena 1', prog: 15, real: 15 },
                    { periodo: 'Quincena 2', prog: 35, real: 33 },
                    { periodo: 'Quincena 3', prog: 58, real: 49 },
                    { periodo: 'Quincena 4 (Actual)', prog: 80, real: Number(resumen.avanceFisicoReal) }
                  ].map((item) => (
                    <div key={item.periodo} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700 font-semibold">{item.periodo}</span>
                        <span>
                          Programado: <strong className="text-blue-900">{item.prog}%</strong> • Real:{' '}
                          <strong className="text-blue-600">{item.real}%</strong>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-950 h-2 rounded-full" style={{ width: `${item.prog}%` }}></div>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.real}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-2.5 bg-blue-950 inline-block rounded-sm"></span> Avance Programado
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-2.5 bg-blue-500 inline-block rounded-sm"></span> Avance Real Ejecutado
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
                        <span className="text-[11px]">{b.fecha}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{b.accion}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                          Ref: {b.partida}
                        </span>
                        <span className="text-blue-700 font-medium underline">{b.evidencia}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 1: CARGA CONTRACTUAL Y VALIDACIÓN INICIAL
           ===================================================================== */}
        {activeTab === 'contrato' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  Columnas: codigo, descripcion, unidad, metradoContratado, programado, ejecutado, presupuesto, gasto, subcontratista
                </span>
                <input type="file" accept=".csv" onChange={handleCargarCSVSimulado} className="hidden" />
              </label>

              <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-100 text-xs text-blue-950 space-y-1">
                <p><strong>Contrato Activo:</strong> N° 014-2026-UNT/OAB</p>
                <p><strong>Sistema de Contratación:</strong> A Precios Unitarios • Plazo: 180 días calendario</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-blue-950">
                  2. Verificación de Consistencia Documental
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control previo para identificar discrepancias entre requerimiento, bases, oferta y expediente técnico.
                </p>
              </div>
              <div className="space-y-3">
                {validacionesDoc.map((v) => (
                  <div key={v.id} className="p-3.5 rounded-lg border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-start gap-2.5">
                      {v.estado === 'Conforme' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <FileWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{v.item}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{v.detalle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setValidacionesDoc(prev =>
                          prev.map(item =>
                            item.id === v.id
                              ? { ...item, estado: item.estado === 'Conforme' ? 'Inconsistencia' : 'Conforme' }
                              : item
                          )
                        )
                      }
                      className={`text-xs px-3 py-1 rounded-md font-semibold shrink-0 cursor-pointer transition ${
                        v.estado === 'Conforme'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
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
        {activeTab === 'campo' && (
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-blue-950">
                Registro Diario en Campo y Control de Calidad
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa avances físicos, gastos ejecutados, evidencias fotográficas o incidencias técnicas vinculadas a cada partida.
              </p>
            </div>

            <form onSubmit={handleRegistrarCampo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Partida Contractual</label>
                <select
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Avance Físico del Día (Metrado)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 15.5"
                    value={avanceInput}
                    onChange={(e) => setAvanceInput(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gasto Ejecutado del Día (S/)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 4500"
                    value={gastoInput}
                    onChange={(e) => setGastoInput(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estado de Calidad / Incidencia
                  </label>
                  <select
                    value={incidenciaTipo}
                    onChange={(e) => setIncidenciaTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Ninguna">Ejecución Normal (Sin incidencias)</option>
                    <option value="Observación Preventiva">Observación Preventiva (Material / Rendimiento)</option>
                    <option value="No Conformidad de Calidad">No Conformidad de Calidad (Bloquea avance)</option>
                    <option value="Subsanación Aprobada">Subsanación Aprobada (Desbloquea partida)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Evidencia Fotográfica / Sustento
                  </label>
                  <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50">
                    <Camera className="w-4 h-4 text-blue-700 shrink-0" />
                    <input
                      type="text"
                      placeholder="Ej. foto_probeta_concreto.jpg"
                      value={evidenciaNombre}
                      onChange={(e) => setEvidenciaNombre(e.target.value)}
                      className="bg-transparent w-full text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detalle Técnico u Observación en Cuaderno de Obra
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe los trabajos realizados, ensayos de calidad o motivo de la incidencia..."
                  value={comentarioCampo}
                  onChange={(e) => setComentarioCampo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm shadow-sm transition cursor-pointer"
              >
                Guardar Registro y Actualizar Indicadores
              </button>
            </form>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 3: GESTIÓN DE TRÁMITES Y PLAZOS CONTRACTUALES
           ===================================================================== */}
        {activeTab === 'tramites' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h2 className="text-base font-bold text-blue-950 mb-1">Nueva Actuación Contractual</h2>
              <p className="text-xs text-slate-500 mb-5">
                Control de plazos legales para pronunciamientos (Ley N° 32069)
              </p>
              <form onSubmit={handleAgregarTramite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Trámite</label>
                  <select
                    value={nuevoTramiteTipo}
                    onChange={(e) => setNuevoTramiteTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option>Ampliación de Plazo</option>
                    <option>Prestación Adicional</option>
                    <option>Suspensión de Plazo</option>
                    <option>Consulta Técnica / Absolución</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sustento / Asunto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ampliación por lluvias intensas"
                    value={nuevoTramiteAsunto}
                    onChange={(e) => setNuevoTramiteAsunto(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Días hábiles para pronunciamiento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={nuevoTramiteDias}
                    onChange={(e) => setNuevoTramiteDias(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Registrar y Activar Alerta
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-bold text-blue-950">
                  Seguimiento de Solicitudes y Vencimientos Contractuales
                </h2>
                <p className="text-xs text-slate-500">
                  Prevención de consentimientos tácitos o pronunciamientos tardíos
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {tramites.map((t) => (
                  <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{t.tipo}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5">{t.asunto}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Responsable:</strong> {t.responsable} • <strong>Pendiente:</strong> {t.docsPendientes}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                            t.estado === 'Crítico'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : t.estado === 'Preventivo'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {t.estado === 'Atendido' ? 'Atendido' : `Vence en ${t.diasRestantes} días`}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">Límite: {t.fechaLimite}</p>
                      </div>

                      {t.estado !== 'Atendido' && (
                        <button
                          onClick={() =>
                            setTramites(prev =>
                              prev.map(item =>
                                item.id === t.id ? { ...item, estado: 'Atendido', diasRestantes: 0 } : item
                              )
                            )
                          }
                          className="text-xs bg-blue-900 hover:bg-blue-800 text-white font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Marcar Atendido
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  OBRA<span className="text-blue-400">TRAZA</span>
                </span>
              </div>
              <p className="text-xs text-blue-300 leading-relaxed">
                Plataforma digital orientada al seguimiento preventivo, trazabilidad documental y control de ejecución física y financiera en obras públicas.
              </p>
            </div>

            {/* Columna 2: Módulos del Sistema */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Arquitectura Funcional
              </h4>
              <ul className="space-y-2 text-xs text-blue-300">
                <li>
                  <button onClick={() => setActiveTab('contrato')} className="hover:text-white transition cursor-pointer">
                    • Carga Contractual y Validación Documental
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('campo')} className="hover:text-white transition cursor-pointer">
                    • Control de Ejecución y Calidad en Campo
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('tramites')} className="hover:text-white transition cursor-pointer">
                    • Seguimiento de Plazos y Trámites Contractuales
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition cursor-pointer">
                    • Tablero de Alertas Tempranas y Curva S
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 3: Marco Normativo y Concurso */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                Marco de Referencia
              </h4>
              <ul className="space-y-2 text-xs text-blue-300">
                <li>• Ley N° 32069 — Ley General de Contrataciones Públicas</li>
                <li>• D.S. N° 009-2025-EF — Reglamento de Contrataciones</li>
                <li>• Desafío 01: Contrataciones públicas y ejecución de obras</li>
                <li>• Hackathon Innova Norte 3G — UNT / RUI (2026)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-blue-400">
            <p>© 2026 OBRA TRAZA • Prototipo Funcional (TRL 3–4) desarrollado para fines de demostración académica.</p>
            <p className="text-blue-300">Opera exclusivamente con datos sintéticos • Sin conexión a sistemas productivos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}