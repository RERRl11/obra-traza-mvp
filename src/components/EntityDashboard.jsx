import React, { useState } from 'react';
import { calcularAvanceFisico } from '../physicalProgress';

const ESTADOS_OBRA = ['Convocatoria', 'Ejecución', 'Paralizada', 'Recepcionada', 'Liquidación'];

const formatoMoneda = (monto) => new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0
}).format(Number(monto) || 0);

function diasHasta(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(`${fecha}T00:00:00`);
  return Math.ceil((limite.getTime() - hoy.getTime()) / 86400000);
}

function metricasContrato(contract) {
  const partidas = Array.isArray(contract.partidas) ? contract.partidas : [];
  const presupuestoEjecutado = partidas.reduce((total, item) => total + Number(item.gastoEjecutado || 0), 0);
  return { ...calcularAvanceFisico(partidas), presupuestoEjecutado };
}

export default function EntityDashboard({ entity, onUpdateEntity, contracts, selectedContractId, onSelectContract }) {
  const [guardado, setGuardado] = useState(false);
  const cantidadPorEstado = (estado) => contracts.filter(contract => contract.estado === estado).length;
  const montoContratado = contracts.reduce((total, contract) => total + Number(contract.montoContrato || 0), 0);
  const montoEjecutado = contracts.reduce((total, contract) => total + metricasContrato(contract).presupuestoEjecutado, 0);
  const metricasContratos = contracts
    .map(contract => ({ contract, metrics: metricasContrato(contract) }))
    .filter(item => item.metrics.avance !== null);
  const metradosInconsistentes = contracts.filter(contract => metricasContrato(contract).metradoInconsistente);
  const contratosConMetrados = metricasContratos;
  const progresoProgramado = contratosConMetrados.length
    ? contratosConMetrados.reduce((total, item) => total + Number(item.contract.avanceProgramado || 0), 0) / contratosConMetrados.length
    : null;
  const progresoReal = contratosConMetrados.length
    ? contratosConMetrados.reduce((total, item) => total + item.metrics.avance, 0) / contratosConMetrados.length
    : null;
  const obrasAtrasadas = contratosConMetrados.filter(({ contract, metrics }) =>
    contract.estado === 'Ejecución' &&
    Number(contract.avanceProgramado || 0) - metrics.avance >= 5
  );
  const vencimientos = contracts.flatMap(contract => [
    { contract, tipo: 'Garantía', fecha: contract.garantiaVence },
    { contract, tipo: 'Término de contrato', fecha: contract.fechaTermino }
  ]).filter(item => {
    const dias = diasHasta(item.fecha);
    return dias !== null && dias <= 30;
  }).sort((a, b) => diasHasta(a.fecha) - diasHasta(b.fecha));

  const actualizar = (campo, valor) => {
    onUpdateEntity({ ...entity, [campo]: valor });
    setGuardado(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Ficha institucional</p>
            <h2 className="mt-1 text-lg font-bold text-blue-950">Datos de la entidad</h2>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            Datos de demostración
          </span>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setGuardado(true);
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2 xl:col-span-2">
            Nombre de la entidad
            <input
              value={entity.nombre}
              onChange={(event) => actualizar('nombre', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
              required
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            RUC
            <input
              value={entity.ruc}
              onChange={(event) => actualizar('ruc', event.target.value)}
              inputMode="numeric"
              maxLength={11}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
              required
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Nivel de gobierno
            <select
              value={entity.nivelGobierno}
              onChange={(event) => actualizar('nivelGobierno', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
            >
              <option>Nacional</option>
              <option>Regional</option>
              <option>Local</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Presupuesto PIA (S/)
            <input
              type="number"
              min="0"
              value={entity.pia}
              onChange={(event) => actualizar('pia', Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Presupuesto PIM (S/)
            <input
              type="number"
              min="0"
              value={entity.pim}
              onChange={(event) => actualizar('pim', Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            />
          </label>
          <div className="flex items-end sm:col-span-2 xl:col-span-3">
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              {guardado ? 'Ficha guardada' : 'Guardar ficha'}
            </button>
            {guardado && <span className="ml-3 self-center text-xs font-medium text-emerald-700" role="status">Cambios guardados en este navegador.</span>}
          </div>
        </form>
      </section>

      <section aria-label="Indicadores de la cartera de obras" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cartera de inversión</p>
            <h2 className="mt-1 text-lg font-bold text-blue-950">Resumen de obras y contratos</h2>
          </div>
          <p className="text-xs text-slate-500">{contracts.length} contrato(s) cargado(s)</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {ESTADOS_OBRA.map((estado, index) => (
            <div key={estado} className={`rounded-xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm ${index === 0 ? 'border-t-blue-700' : index === 1 ? 'border-t-amber-500' : index === 2 ? 'border-t-red-600' : 'border-t-emerald-600'}`}>
              <p className="text-xs font-semibold text-slate-500">{estado}</p>
              <p className="mt-2 text-2xl font-extrabold text-blue-950">{cantidadPorEstado(estado)}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monto contratado</p>
            <p className="mt-2 text-xl font-extrabold text-blue-950">{formatoMoneda(montoContratado)}</p>
            <p className="mt-1 text-xs text-slate-500">Ejecutado: {formatoMoneda(montoEjecutado)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-800" style={{ width: `${montoContratado > 0 ? Math.min(100, (montoEjecutado / montoContratado) * 100) : 0}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avance físico promedio</p>
            <p className="mt-2 text-xl font-extrabold text-blue-950">{progresoReal === null ? '—' : `${progresoReal.toFixed(1)}%`}</p>
            <p className="mt-1 text-xs text-slate-500">
              Programado: {progresoProgramado === null ? 'Sin datos' : `${progresoProgramado.toFixed(1)}%`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Expedientes con metrados: {contratosConMetrados.length}/{contracts.length}.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-unt-gold" style={{ width: `${Math.min(100, progresoReal || 0)}%` }} />
            </div>
          </div>
          <div className={`rounded-xl border p-5 shadow-sm ${obrasAtrasadas.length || metradosInconsistentes.length ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Alertas de atraso</p>
            <p className="mt-2 text-xl font-extrabold text-blue-950">{obrasAtrasadas.length} obra(s)</p>
            {metradosInconsistentes.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-amber-800" role="alert">
                {metradosInconsistentes.length} expediente(s) con metrados inconsistentes. Revisa la carga del presupuesto.
              </p>
            )}
            <p className="mt-1 text-xs text-slate-600">Se alerta cuando el avance real está 5 puntos o más debajo del programado.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-blue-950">Expedientes y contratos</h2>
            <p className="mt-1 text-xs text-slate-500">Cada expediente muestra el contrato asociado.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Expediente</th>
                  <th scope="col" className="px-4 py-3">Contrato asociado</th>
                  <th scope="col" className="px-4 py-3">Estado</th>
                  <th scope="col" className="px-4 py-3">Monto</th>
                  <th scope="col" className="px-4 py-3">Avance</th>
                  <th scope="col" className="px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(contract => {
                  const metrics = metricasContrato(contract);
                  const selected = contract.id === selectedContractId;
                  return (
                    <tr key={contract.id} className={selected ? 'bg-blue-50/70' : 'hover:bg-slate-50'}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-blue-950">{contract.nombre}</p>
                        <p className="mt-1 text-xs text-slate-500">CUI {contract.cui}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-blue-950">N.° {contract.numero}</p>
                        <p className="mt-1 text-xs text-slate-500">{contract.contratista}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">{contract.estado}</td>
                      <td className="px-4 py-3 text-xs">{formatoMoneda(contract.montoContrato)}</td>
                      <td className="px-4 py-3 text-xs">
                        {metrics.metradoInconsistente ? 'Revisar metrados' : metrics.avance === null ? 'Sin metrados' : `${metrics.avance.toFixed(1)}%`}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => onSelectContract(contract.id)}
                          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                        >
                          {selected ? 'Seleccionado' : 'Abrir expediente'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="border-b border-amber-100 px-5 py-4">
            <h2 className="font-bold text-blue-950">Contratos y garantías por vencer</h2>
            <p className="mt-1 text-xs text-slate-500">Vencimientos dentro de los próximos 30 días o ya vencidos.</p>
          </div>
          <div className="space-y-3 p-5">
            {vencimientos.length === 0 && <p className="text-sm text-slate-500">No hay vencimientos próximos.</p>}
            {vencimientos.map(item => {
              const dias = diasHasta(item.fecha);
              return (
                <button
                  type="button"
                  key={`${item.contract.id}-${item.tipo}`}
                  onClick={() => onSelectContract(item.contract.id)}
                  className="block min-h-0 w-full rounded-lg border border-slate-200 p-3 text-left hover:border-amber-300 hover:bg-amber-50"
                >
                  <p className="text-xs font-bold text-blue-900">{item.tipo} · {item.contract.numero}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.fecha} · {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `Vence en ${dias} días`}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
