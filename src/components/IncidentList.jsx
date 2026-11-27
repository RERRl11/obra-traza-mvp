import { CheckCircle2, Clock3 } from 'lucide-react';

export default function IncidentList({ incidencias, role, userId, onApprove }) {
  const esSupervisor = role === 'SUPERVISOR';
  const esEntidad = role === 'ENTIDAD';
  const visibles = esSupervisor || esEntidad
    ? incidencias
    : incidencias.filter(incidencia => incidencia.registradaPorId === userId);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-blue-950">
          {esSupervisor
            ? 'Revisión de incidencias'
            : esEntidad ? 'Incidencias del contrato' : 'Incidencias reportadas por mí'}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {esSupervisor
            ? 'Revisa los reportes del contrato seleccionado y da el visto bueno.'
            : esEntidad
              ? 'Consulta los reportes recibidos y su estado de revisión.'
              : 'Consulta el estado de revisión de tus reportes.'}
        </p>
      </div>
      {visibles.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          {esSupervisor || esEntidad ? 'No hay incidencias reportadas para este contrato.' : 'Aún no has registrado incidencias.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visibles.map(incidencia => {
            const aprobada = incidencia.estadoRevision === 'Visto bueno';
            return (
              <article key={incidencia.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-blue-950">{incidencia.tipo}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Partida {incidencia.partida} · {incidencia.registradaPor}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    aprobada
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}>
                    {aprobada ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    {aprobada ? 'Visto bueno' : 'Pendiente de revisión'}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{incidencia.detalle}</p>
                {incidencia.evidencia && (
                  <p className="mt-2 text-xs text-slate-500">Evidencia: {incidencia.evidencia}</p>
                )}
                {incidencia.evidenciaDataUrl && (
                  <a
                    href={incidencia.evidenciaDataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block"
                  >
                    <img
                      src={incidencia.evidenciaDataUrl}
                      alt={`Evidencia fotográfica de la partida ${incidencia.partida}`}
                      loading="lazy"
                      className="max-h-56 max-w-full rounded-lg border border-slate-200 object-contain"
                    />
                  </a>
                )}
                <p className="mt-2 text-[11px] text-slate-500">
                  Reportada: {new Date(incidencia.fecha).toLocaleString('es-PE')}
                </p>
                {aprobada && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-800">
                    Revisada por {incidencia.revisadaPor} · {new Date(incidencia.fechaRevision).toLocaleString('es-PE')}
                  </p>
                )}
                {esSupervisor && !aprobada && (
                  <button
                    type="button"
                    onClick={() => onApprove(incidencia.id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Dar visto bueno
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
