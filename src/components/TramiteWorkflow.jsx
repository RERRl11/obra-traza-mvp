import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileClock, Plus } from 'lucide-react';
import {
  TRAMITE_STAGES,
  getTramiteDaysRemaining,
  getTramiteStageIndex,
  isTramiteResolved
} from '../workflow';

const STAGE_DETAILS = [
  'La entidad y el supervisor reciben la solicitud.',
  'Gestión Contractual registra la recepción y deriva el expediente.',
  'El Supervisor revisa el sustento presentado.',
  'La opinión del Supervisor queda registrada y se deriva a la Entidad.',
  'La Entidad evalúa la solicitud y emite una decisión.',
  'La decisión queda registrada y se notifica a los participantes.'
];

const RESPONSABLE_POR_ETAPA = [
  'Gestión Contractual',
  'Supervisor de Obra',
  'Supervisor de Obra',
  'Entidad',
  'Entidad',
  'Trámite resuelto'
];

const TIPOS_TRAMITE = [
  'Ampliación de plazo',
  'Prestación adicional',
  'Suspensión de plazo',
  'Consulta técnica / absolución'
];

function formatDate(value) {
  if (!value) return 'Sin fecha';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day, 12);
    return parsedDate.toLocaleDateString('es-PE');
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('es-PE');
}

function plazoLabel(tramite, resuelto) {
  if (resuelto) return 'Resuelta';
  const remaining = getTramiteDaysRemaining(tramite);
  if (remaining === null) return 'Fecha límite no válida';
  if (remaining < 0) {
    const days = Math.abs(remaining);
    return `Vencido hace ${days} ${days === 1 ? 'día hábil' : 'días hábiles'}`;
  }
  return `Vence en ${remaining} días hábiles`;
}

export default function TramiteWorkflow({
  contract,
  tramites,
  role,
  canSolicitar,
  onCreate,
  onRegisterReceipt,
  onStartReview,
  onOpinion,
  onStartEvaluation,
  onResolve,
  selectedTramiteId
}) {
  const [tipo, setTipo] = useState(TIPOS_TRAMITE[0]);
  const [asunto, setAsunto] = useState('');
  const [dias, setDias] = useState(15);
  const [opiniones, setOpiniones] = useState({});
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedTramiteId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedTramiteId]);

  const handleSubmit = event => {
    event.preventDefault();
    if (onCreate(tipo, asunto, dias)) setAsunto('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {canSolicitar && (
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-blue-950">Nueva solicitud de trámite</h2>
          <p className="mb-5 text-xs text-slate-500">
            Registra el sustento y el plazo solicitado para iniciar el seguimiento.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">
              Tipo de trámite
              <select
                value={tipo}
                onChange={event => setTipo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {TIPOS_TRAMITE.map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Sustento / asunto
              <input
                type="text"
                required
                value={asunto}
                onChange={event => setAsunto(event.target.value)}
                placeholder="Ej. Interferencia eléctrica en sector B"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Días hábiles solicitados
              <input
                type="number"
                min="1"
                max="30"
                required
                value={dias}
                onChange={event => setDias(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              <Plus className="h-4 w-4" />
              Registrar solicitud
            </button>
          </form>
        </section>
      )}

      <section className={`${canSolicitar ? 'lg:col-span-2' : 'lg:col-span-3'} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}>
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-blue-950">
            <FileClock className="h-5 w-5" />
            Seguimiento de solicitudes
          </h2>
          <p className="mt-1 text-xs text-slate-500">Trazabilidad por etapa y responsable del trámite.</p>
        </div>
        {tramites.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aún no hay solicitudes registradas para este contrato.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tramites.map(tramite => {
              const stageIndex = getTramiteStageIndex(tramite);
              const resuelto = isTramiteResolved(tramite);
              const registroAnteriorResuelto = !tramite.etapa && tramite.estado === 'Atendido';
              const isSelected = tramite.id === selectedTramiteId;
              const diasSolicitados = tramite.diasSolicitados ?? '—';
              const idNumber = tramite.id?.match(/-(\d+)$/)?.[1];
              const title = /\bN\s*[°º.]?\s*\d+/i.test(tramite.tipo)
                ? tramite.tipo
                : `${tramite.tipo}${idNumber ? ` N.° ${idNumber}` : ''}`;

              return (
                <article
                  key={tramite.id}
                  id={`tramite-${tramite.id}`}
                  ref={isSelected ? selectedRef : null}
                  className={`p-5 transition ${isSelected ? 'bg-amber-50/60 ring-2 ring-inset ring-amber-400' : 'hover:bg-slate-50/70'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-800">{tramite.id}</span>
                      <h3 className="mt-1 text-base font-bold text-blue-950">{title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{tramite.asunto}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      resuelto
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : stageIndex <= 1
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-blue-200 bg-blue-50 text-blue-800'
                    }`}>
                      {registroAnteriorResuelto ? 'Atendido (registro anterior)' : TRAMITE_STAGES[stageIndex]}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Días solicitados</p>
                      <p className="text-xl font-bold text-blue-950">{diasSolicitados} días</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Responsable actual</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {resuelto ? RESPONSABLE_POR_ETAPA[5] : RESPONSABLE_POR_ETAPA[stageIndex]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-1" aria-label={`Etapa ${stageIndex + 1} de ${TRAMITE_STAGES.length}`}>
                    {TRAMITE_STAGES.map((stage, index) => (
                      <span
                        key={stage}
                        className={`h-2 flex-1 rounded-full ${index <= stageIndex ? 'bg-amber-400' : 'bg-blue-950'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Etapa {stageIndex + 1} de {TRAMITE_STAGES.length}</p>
                  <p className="mt-3 text-sm text-slate-700">
                    {registroAnteriorResuelto ? 'Este registro ya figuraba como atendido antes del seguimiento por etapas.' : STAGE_DETAILS[stageIndex]}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <span>Solicitante: {tramite.solicitante || contract?.contratista || 'No especificado'}</span>
                    <span>Ingreso: {formatDate(tramite.fechaIngreso)}</span>
                    <span className={getTramiteDaysRemaining(tramite) !== null && getTramiteDaysRemaining(tramite) <= 3 && !resuelto ? 'font-semibold text-red-700' : ''}>
                      {plazoLabel(tramite, resuelto)} · Límite: {tramite.fechaLimite || 'Sin fecha'}
                    </span>
                  </div>

                  {tramite.opinion && (
                    <p className="mt-2 text-xs font-semibold text-blue-800">Opinión del Supervisor: {tramite.opinion}</p>
                  )}
                  {tramite.decision && (
                    <p className="mt-2 text-xs font-semibold text-emerald-800">Decisión de Entidad: {tramite.decision}</p>
                  )}

                  {tramite.historial?.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-800">Ver historial del trámite</summary>
                      <ol className="mt-2 space-y-2 border-l-2 border-slate-200 pl-3">
                        {tramite.historial.map((entry, index) => (
                          <li key={`${tramite.id}-${index}`} className="text-xs">
                            <p className="font-semibold text-slate-800">{entry.etapa}</p>
                            <p className="text-slate-500">{entry.usuario} · {formatDate(entry.fecha)}</p>
                            {entry.detalle && <p className="mt-0.5 text-slate-600">{entry.detalle}</p>}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}

                  {!resuelto && (
                    <div className="mt-4 flex flex-wrap items-end gap-2">
                      {stageIndex === 0 && role === 'CONTRACTUAL' && (
                        <button type="button" onClick={() => onRegisterReceipt(tramite.id)} className="rounded-lg bg-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900">
                          Registrar recepción
                        </button>
                      )}
                      {stageIndex === 1 && role === 'SUPERVISOR' && (
                        <button type="button" onClick={() => onStartReview(tramite.id)} className="rounded-lg bg-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900">
                          Iniciar revisión
                        </button>
                      )}
                      {stageIndex === 2 && role === 'SUPERVISOR' && (
                        <>
                          <label className="text-xs font-semibold text-slate-600">
                            Opinión
                            <select
                              value={opiniones[tramite.id] || ''}
                              onChange={event => setOpiniones(current => ({ ...current, [tramite.id]: event.target.value }))}
                              className="mt-1 block rounded-md border border-slate-300 bg-white px-2 py-2 text-xs"
                            >
                              <option value="">Selecciona opinión</option>
                              <option value="Conforme">Conforme</option>
                              <option value="Observado">Observado</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            disabled={!opiniones[tramite.id]}
                            onClick={() => {
                              onOpinion(tramite.id, opiniones[tramite.id]);
                              setOpiniones(current => ({ ...current, [tramite.id]: '' }));
                            }}
                            className="rounded-lg bg-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Registrar opinión
                          </button>
                        </>
                      )}
                      {stageIndex === 3 && role === 'ENTIDAD' && (
                        <button type="button" onClick={() => onStartEvaluation(tramite.id)} className="rounded-lg bg-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900">
                          Iniciar evaluación de Entidad
                        </button>
                      )}
                      {stageIndex === 4 && role === 'ENTIDAD' && (
                        <>
                          <button type="button" onClick={() => onResolve(tramite.id, 'Aprobada')} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                            Aprobar y notificar
                          </button>
                          <button type="button" onClick={() => onResolve(tramite.id, 'Denegada')} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-100">
                            Denegar y notificar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {resuelto && (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      {registroAnteriorResuelto ? 'Registro anterior atendido' : 'Decisión notificada'}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
