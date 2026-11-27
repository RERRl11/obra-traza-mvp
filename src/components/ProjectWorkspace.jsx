import React, { useEffect, useState } from 'react';
import { parseExpedienteCSV } from '../expedienteCsv';
import { calcularAvanceFisico } from '../physicalProgress';

const INPUT_CLASS = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-500';
const CURRENCY_FORMAT = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });
const formatCurrency = (value) => CURRENCY_FORMAT.format(Number(value) || 0);
const localDateValue = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

function Field({ label, value, onChange, type = 'text', options, disabled, required = false }) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      {options ? (
        <select
          value={value || ''}
          disabled={disabled}
          required={required}
          onChange={event => onChange(event.target.value)}
          className={INPUT_CLASS}
        >
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value ?? ''}
          disabled={disabled}
          required={required}
          min={type === 'number' ? '0' : undefined}
          onChange={event => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
          className={INPUT_CLASS}
        />
      )}
    </label>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-bold text-blue-950">{title}</h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

const NEW_CONTRACT = {
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
  plazoDias: 180
};

export default function ProjectWorkspace({
  section,
  contract,
  contracts,
  canEdit,
  canControl,
  canValidate,
  canLiquidate,
  onUpdateContract,
  onCreateContract,
  onImportExpedientes
}) {
  const [draft, setDraft] = useState(contract);
  const [newContract, setNewContract] = useState(NEW_CONTRACT);
  const [guardado, setGuardado] = useState(false);
  const [valorizationDate, setValorizationDate] = useState('');
  const [valorizationAmount, setValorizationAmount] = useState('');
  const [csvFeedback, setCsvFeedback] = useState(null);
  const [importandoCSV, setImportandoCSV] = useState(false);
  const [closureFeedback, setClosureFeedback] = useState('');

  useEffect(() => {
    setDraft(contract);
    setGuardado(false);
  }, [contract]);

  const updateDraft = (field, value) => {
    setDraft(current => ({ ...current, [field]: value }));
    setGuardado(false);
    setClosureFeedback('');
  };

  const saveDraft = (event) => {
    event.preventDefault();
    onUpdateContract(draft);
    setGuardado(true);
  };

  const handleImportCSV = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setCsvFeedback(null);
    setImportandoCSV(true);
    try {
      const importedExpedientes = parseExpedienteCSV(await file.text());
      const result = onImportExpedientes(importedExpedientes);
      setCsvFeedback({ text: `${result.text} Archivo: ${file.name}.` });
    } catch (error) {
      setCsvFeedback({ error: true, text: error instanceof Error ? error.message : 'No se pudo leer el archivo CSV.' });
    } finally {
      input.value = '';
      setImportandoCSV(false);
    }
  };

  const canEditControlFields = canEdit || canControl;

  if (!contract) return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Selecciona o crea un expediente para continuar.</p>;
  if (section === 'cierre' && !canLiquidate) {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Recepción y liquidación son gestionadas exclusivamente por el perfil Entidad.</p>;
  }

  if (section === 'expediente') {
    return (
      <div className="space-y-6">
        <SectionCard title="Expediente de obra" description="Información principal, selección y fechas del procedimiento.">
          <form onSubmit={saveDraft} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Nombre de la obra" value={draft.nombre} onChange={value => updateDraft('nombre', value)} disabled={!canEdit} required />
            <Field label="Código CUI" value={draft.cui} onChange={value => updateDraft('cui', value)} disabled={!canEdit} required />
            <Field label="N.° de contrato" value={draft.numero} onChange={value => updateDraft('numero', value)} disabled={!canEdit} required />
            <Field label="Ubicación" value={draft.ubicacion} onChange={value => updateDraft('ubicacion', value)} disabled={!canEdit} />
            <Field label="Área usuaria" value={draft.areaUsuaria} onChange={value => updateDraft('areaUsuaria', value)} disabled={!canEdit} />
            <Field label="Estado de la obra" value={draft.estado} onChange={value => updateDraft('estado', value)} options={['Convocatoria', 'Ejecución', 'Paralizada', 'Recepcionada', 'Liquidación']} disabled={!canEdit} />
            <Field label="Valor del expediente técnico (S/)" type="number" value={draft.expedienteTecnico} onChange={value => updateDraft('expedienteTecnico', value)} disabled={!canEdit} />
            <Field label="Valor referencial (S/)" type="number" value={draft.valorReferencial} onChange={value => updateDraft('valorReferencial', value)} disabled={!canEdit} />
            <Field label="Procedimiento de selección" value={draft.procedimiento} onChange={value => updateDraft('procedimiento', value)} options={['Licitación Pública', 'Concurso Público', 'Adjudicación Simplificada', 'Contratación Directa']} disabled={!canEdit} />
            <Field label="Sistema de contratación" value={draft.sistema} onChange={value => updateDraft('sistema', value)} options={['Suma Alzada', 'Precios Unitarios', 'Llave en Mano', 'Concurso Oferta']} disabled={!canEdit} />
            <Field label="Modalidad" value={draft.modalidad} onChange={value => updateDraft('modalidad', value)} options={['Por contrata', 'Administración directa']} disabled={!canEdit} />
            <Field label="Fecha de convocatoria" type="date" value={draft.fechaConvocatoria} onChange={value => updateDraft('fechaConvocatoria', value)} disabled={!canEdit} />
            <Field label="Fecha de buena pro" type="date" value={draft.fechaBuenaPro} onChange={value => updateDraft('fechaBuenaPro', value)} disabled={!canEdit} />
            <Field label="Fecha de firma de contrato" type="date" value={draft.fechaFirma} onChange={value => updateDraft('fechaFirma', value)} disabled={!canEdit} />
            {canEdit && (
              <div className="flex items-end gap-3">
                <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Guardar expediente
                </button>
                {guardado && <span className="text-xs font-medium text-emerald-700" role="status">Cambios guardados.</span>}
              </div>
            )}
          </form>
        </SectionCard>

        {canEdit && (
          <SectionCard title="Agregar contrato a la lista" description="Los contratos creados aquí estarán disponibles en el selector de contratos.">
            <form
              onSubmit={event => {
                event.preventDefault();
                if (contracts.some(item => item.numero.trim().toLowerCase() === newContract.numero.trim().toLowerCase())) {
                  return;
                }
                onCreateContract({
                  ...newContract,
                  numero: newContract.numero.trim(),
                  nombre: newContract.nombre.trim(),
                  estado: newContract.fechaFirma ? 'Ejecución' : 'Convocatoria',
                  montoContrato: Number(newContract.montoContrato) || 0,
                  presupuestoModificado: Number(newContract.montoContrato) || 0
                });
                setNewContract(NEW_CONTRACT);
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <Field label="Nombre de la obra" value={newContract.nombre} onChange={value => setNewContract(current => ({ ...current, nombre: value }))} required />
              <Field label="CUI" value={newContract.cui} onChange={value => setNewContract(current => ({ ...current, cui: value }))} required />
              <Field label="N.° de contrato" value={newContract.numero} onChange={value => setNewContract(current => ({ ...current, numero: value }))} required />
              <Field label="Ubicación" value={newContract.ubicacion} onChange={value => setNewContract(current => ({ ...current, ubicacion: value }))} />
              <Field label="Área usuaria" value={newContract.areaUsuaria} onChange={value => setNewContract(current => ({ ...current, areaUsuaria: value }))} />
              <Field label="Contratista" value={newContract.contratista} onChange={value => setNewContract(current => ({ ...current, contratista: value }))} />
              <Field label="Monto contractual (S/)" type="number" value={newContract.montoContrato} onChange={value => setNewContract(current => ({ ...current, montoContrato: value }))} />
              <Field label="Valor expediente técnico (S/)" type="number" value={newContract.expedienteTecnico} onChange={value => setNewContract(current => ({ ...current, expedienteTecnico: value }))} />
              <Field label="Valor referencial (S/)" type="number" value={newContract.valorReferencial} onChange={value => setNewContract(current => ({ ...current, valorReferencial: value }))} />
              <Field label="Procedimiento" value={newContract.procedimiento} onChange={value => setNewContract(current => ({ ...current, procedimiento: value }))} options={['Licitación Pública', 'Concurso Público', 'Adjudicación Simplificada', 'Contratación Directa']} />
              <Field label="Sistema de contratación" value={newContract.sistema} onChange={value => setNewContract(current => ({ ...current, sistema: value }))} options={['Suma Alzada', 'Precios Unitarios', 'Llave en Mano', 'Concurso Oferta']} />
              <Field label="Modalidad" value={newContract.modalidad} onChange={value => setNewContract(current => ({ ...current, modalidad: value }))} options={['Por contrata', 'Administración directa']} />
              <Field label="Fecha de convocatoria" type="date" value={newContract.fechaConvocatoria} onChange={value => setNewContract(current => ({ ...current, fechaConvocatoria: value }))} />
              <Field label="Fecha de buena pro" type="date" value={newContract.fechaBuenaPro} onChange={value => setNewContract(current => ({ ...current, fechaBuenaPro: value }))} />
              <Field label="Fecha de firma" type="date" value={newContract.fechaFirma} onChange={value => setNewContract(current => ({ ...current, fechaFirma: value }))} />
              <Field label="Plazo contractual (días)" type="number" value={newContract.plazoDias} onChange={value => setNewContract(current => ({ ...current, plazoDias: value }))} />
              <button type="submit" className="min-h-11 self-end rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 sm:w-fit">
                Crear y seleccionar contrato
              </button>
              {contracts.some(item => item.numero.trim().toLowerCase() === newContract.numero.trim().toLowerCase()) && newContract.numero && (
                <p className="self-center text-xs font-semibold text-red-700" role="alert">Ya existe un contrato con ese número.</p>
              )}
            </form>
          </SectionCard>
        )}

        {canEdit && (
          <SectionCard title="Importar expedientes desde CSV" description="Una fila por expediente, con los datos del contrato asociado. Los números existentes se actualizan con los campos no vacíos del archivo y conservan sus partidas y registros de ejecución.">
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 text-center hover:bg-blue-50">
              <span className="text-sm font-bold text-blue-950">{importandoCSV ? 'Cargando contratos…' : 'Seleccionar archivo CSV'}</span>
              <span className="mt-1 text-xs text-slate-500">Los contratos con el mismo número se actualizarán; los demás se agregarán.</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCSV}
                disabled={importandoCSV}
                className="sr-only"
              />
            </label>
            {csvFeedback && (
              <p className={`mt-3 text-sm ${csvFeedback.error ? 'text-red-700' : 'text-emerald-700'}`} role={csvFeedback.error ? 'alert' : 'status'}>
                {csvFeedback.text}
              </p>
            )}
          </SectionCard>
        )}
      </div>
    );
  }

  if (section === 'contrato') {
    return (
      <SectionCard title="Datos del contrato y garantías" description="Control de monto, plazo, contratista, adelantos, garantías y penalidades.">
        <form onSubmit={saveDraft} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Contratista" value={draft.contratista} onChange={value => updateDraft('contratista', value)} disabled={!canEdit} />
          <Field label="Monto contractual (S/)" type="number" value={draft.montoContrato} onChange={value => updateDraft('montoContrato', value)} disabled={!canEdit} />
          <Field label="Plazo (días calendario)" type="number" value={draft.plazoDias} onChange={value => updateDraft('plazoDias', value)} disabled={!canEdit} />
          <Field label="Adelantos (S/)" type="number" value={draft.adelantos} onChange={value => updateDraft('adelantos', value)} disabled={!canEdit} />
          <Field label="Fecha de inicio" type="date" value={draft.fechaInicio} onChange={value => updateDraft('fechaInicio', value)} disabled={!canEdit} />
          <Field label="Fecha de término contractual" type="date" value={draft.fechaTermino} onChange={value => updateDraft('fechaTermino', value)} disabled={!canEditControlFields} />
          <Field label="Garantía (S/)" type="number" value={draft.montoGarantia} onChange={value => updateDraft('montoGarantia', value)} disabled={!canEdit} />
          <Field label="Vencimiento de garantía" type="date" value={draft.garantiaVence} onChange={value => updateDraft('garantiaVence', value)} disabled={!canEditControlFields} />
          <Field label="Penalidades aplicadas (S/)" type="number" value={draft.penalidades} onChange={value => updateDraft('penalidades', value)} disabled={!canEditControlFields} />
          {canEditControlFields && (
            <div className="flex items-end gap-3">
              <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Guardar contrato</button>
              {guardado && <span className="text-xs font-medium text-emerald-700" role="status">Cambios guardados.</span>}
            </div>
          )}
        </form>
      </SectionCard>
    );
  }

  if (section === 'ejecucion') {
    const avanceFisico = calcularAvanceFisico(contract.partidas);
    const { avance: avanceReal, metradoInconsistente } = avanceFisico;
    const executedBudget = metradoInconsistente
      ? null
      : (contract.partidas || []).reduce((total, item) => total + Number(item.gastoEjecutado || 0), 0);
    const retraso = avanceReal === null ? null : Number(contract.avanceProgramado || 0) - avanceReal;
    const agregarValorizacion = (event) => {
      event.preventDefault();
      const monto = Number(valorizationAmount);
      if (!valorizationDate || !Number.isFinite(monto) || monto <= 0) return;
      const nuevoAcumulado = Number((Number(contract.valorizaciones?.[contract.valorizaciones.length - 1]?.acumulado || 0) + (monto / Math.max(Number(contract.montoContrato), 1)) * 100).toFixed(1));
      onUpdateContract({
        valorizaciones: [...(contract.valorizaciones || []), { id: Date.now(), fecha: valorizationDate, monto, acumulado: nuevoAcumulado }]
      });
      setValorizationDate('');
      setValorizationAmount('');
    };

    return (
      <div className="space-y-6">
        <SectionCard title="Ejecución física y financiera" description="Entrega de terreno, avance acumulado, presupuesto y valorizaciones.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Avance físico real</p>
              <p className="mt-1 text-xl font-extrabold text-blue-950">
                {metradoInconsistente ? 'Revisar metrados' : avanceReal === null ? 'Sin datos' : `${avanceReal.toFixed(1)}%`}
              </p>
              <p className="mt-1 text-xs text-slate-600">Programado: {Number(contract.avanceProgramado || 0).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Presupuesto contractual</p>
              <p className="mt-1 text-lg font-extrabold text-blue-950">{formatCurrency(contract.montoContrato)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Presupuesto modificado</p>
              <p className="mt-1 text-lg font-extrabold text-blue-950">{formatCurrency(contract.presupuestoModificado)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Presupuesto ejecutado</p>
              <p className="mt-1 text-lg font-extrabold text-blue-950">
                {executedBudget === null ? 'Revisar metrados' : formatCurrency(executedBudget)}
              </p>
            </div>
          </div>
          {retraso !== null && retraso >= 5 && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">
              Alerta de atraso: el avance está {retraso.toFixed(1)} puntos porcentuales por debajo de lo programado.
            </p>
          )}
          {metradoInconsistente && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">
              Hay metrados negativos, no numéricos o que superan lo contratado. Se ocultan los totales derivados; revisa las partidas importadas.
            </p>
          )}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Entrega de terreno" type="date" value={draft.entregaTerrenoFecha} onChange={value => updateDraft('entregaTerrenoFecha', value)} disabled={!canEdit && !canValidate} />
            <Field label="Acta de entrega" value={draft.entregaTerrenoActa} onChange={value => updateDraft('entregaTerrenoActa', value)} disabled={!canEdit && !canValidate} />
            <Field label="Avance programado (%)" type="number" value={draft.avanceProgramado} onChange={value => updateDraft('avanceProgramado', value)} disabled={!canEdit} />
            <Field label="Presupuesto modificado (S/)" type="number" value={draft.presupuestoModificado} onChange={value => updateDraft('presupuestoModificado', value)} disabled={!canEdit} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Ampliaciones de plazo (días)" type="number" value={draft.ampliacionesDias} onChange={value => updateDraft('ampliacionesDias', value)} disabled={!canEditControlFields} />
            <Field label="Adicionales de obra (S/)" type="number" value={draft.adicionales} onChange={value => updateDraft('adicionales', value)} disabled={!canEditControlFields} />
            <Field label="Paralizaciones (días)" type="number" value={draft.paralizacionesDias} onChange={value => updateDraft('paralizacionesDias', value)} disabled={!canEditControlFields} />
          </div>
          {(canEdit || canValidate || canControl) && (
            <form onSubmit={saveDraft} className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Guardar ejecución</button>
              {guardado && <span className="text-xs font-medium text-emerald-700" role="status">Cambios guardados.</span>}
            </form>
          )}
        </SectionCard>

        <SectionCard title="Valorizaciones" description="Historial de pagos y porcentaje acumulado del contrato.">
          <div className="mb-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th scope="col" className="px-4 py-3">Fecha</th><th scope="col" className="px-4 py-3">Monto valorizado</th><th scope="col" className="px-4 py-3">Acumulado</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(contract.valorizaciones || []).map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.fecha}</td>
                    <td className="px-4 py-3">{formatCurrency(item.monto)}</td>
                    <td className="px-4 py-3">{item.acumulado}%</td>
                  </tr>
                ))}
                {!(contract.valorizaciones || []).length && <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-500">Aún no hay valorizaciones registradas.</td></tr>}
              </tbody>
            </table>
          </div>
          {canEdit || canValidate ? (
            <form onSubmit={agregarValorizacion} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
              <Field label="Fecha" type="date" value={valorizationDate} onChange={setValorizationDate} required />
              <Field label="Monto (S/)" type="number" value={valorizationAmount} onChange={value => setValorizationAmount(String(value))} required />
              <button type="submit" className="min-h-11 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Agregar valorización</button>
            </form>
          ) : null}
        </SectionCard>
      </div>
    );
  }

  if (section === 'cierre') {
    const marcarRecepcion = () => {
      if (!canLiquidate) return;
      if (!String(draft.recepcionActa || '').trim()) {
        setClosureFeedback('Registra el número o referencia del acta antes de confirmar la recepción.');
        return;
      }
      const changes = {
        recepcionEstado: 'Recepcionada',
        recepcionFecha: draft.recepcionFecha || localDateValue(),
        recepcionActa: String(draft.recepcionActa || '').trim(),
        estado: 'Recepcionada'
      };
      onUpdateContract(changes);
      setClosureFeedback('Recepción registrada por Entidad.');
    };
    const marcarLiquidacion = () => {
      if (!canLiquidate) return;
      if (draft.recepcionEstado !== 'Recepcionada') {
        setClosureFeedback('Registra la recepción de la obra antes de iniciar la liquidación.');
        return;
      }
      const changes = {
        liquidacionEstado: 'Liquidada',
        liquidacionFecha: draft.liquidacionFecha || localDateValue(),
        liquidacionMonto: Number(draft.liquidacionMonto) || 0,
        observacionesCierre: draft.observacionesCierre,
        estado: 'Liquidación'
      };
      onUpdateContract(changes);
      setClosureFeedback('Liquidación registrada por Entidad.');
    };

    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {closureFeedback && (
          <p className={`xl:col-span-2 rounded-lg p-3 text-sm ${closureFeedback.startsWith('Registra') ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`} role="status">
            {closureFeedback}
          </p>
        )}
        <SectionCard title="Recepción de obra" description="Registra fecha, acta y estado de recepción.">
          <div className="space-y-4">
            <p className="rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-900">Estado: {draft.recepcionEstado}</p>
            <Field label="Fecha de recepción" type="date" value={draft.recepcionFecha} onChange={value => updateDraft('recepcionFecha', value)} disabled={!canLiquidate} />
            <Field label="Acta de recepción" value={draft.recepcionActa} onChange={value => updateDraft('recepcionActa', value)} disabled={!canLiquidate} required={canLiquidate} />
            {canLiquidate && (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={saveDraft} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">Guardar datos</button>
                <button type="button" onClick={marcarRecepcion} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Registrar recepción</button>
              </div>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Liquidación" description="Controla el cierre económico y contractual de la obra.">
          <div className="space-y-4">
            <p className="rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-900">Estado: {draft.liquidacionEstado}</p>
            <Field label="Fecha de liquidación" type="date" value={draft.liquidacionFecha} onChange={value => updateDraft('liquidacionFecha', value)} disabled={!canLiquidate} />
            <Field label="Monto liquidado (S/)" type="number" value={draft.liquidacionMonto} onChange={value => updateDraft('liquidacionMonto', value)} disabled={!canLiquidate} />
            <label className="block text-xs font-semibold text-slate-700">
              Observaciones de cierre
              <textarea
                rows="3"
                value={draft.observacionesCierre}
                disabled={!canLiquidate}
                onChange={event => updateDraft('observacionesCierre', event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            {canLiquidate && (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={saveDraft} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">Guardar datos</button>
                <button type="button" onClick={marcarLiquidacion} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Marcar liquidada</button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  return null;
}
