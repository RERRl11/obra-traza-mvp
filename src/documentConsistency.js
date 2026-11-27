const STATUS_OPTIONS = ['Conforme', 'Inconsistencia', 'Pendiente'];
const CURRENCY_FORMAT = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 });

function compareValues({ id, item, expected, actual, label, format = value => String(value) }) {
  const hasExpected = expected !== '' && expected !== null && expected !== undefined && Number.isFinite(Number(expected));
  const hasActual = actual !== '' && actual !== null && actual !== undefined && Number.isFinite(Number(actual));
  if (!hasExpected || !hasActual) {
    return {
      id,
      item,
      estado: 'Pendiente',
      detalle: `Falta registrar ${label}; comparación pendiente.`
    };
  }

  const expectedValue = Number(expected);
  const actualValue = Number(actual);
  const matches = Math.abs(expectedValue - actualValue) < 0.01;
  return {
    id,
    item,
    estado: matches ? 'Conforme' : 'Inconsistencia',
    detalle: `${label}: contrato ${format(expectedValue)}; documento relacionado ${format(actualValue)}.`
  };
}

function documentStatus({ id, item, status, detail, name }) {
  if (!STATUS_OPTIONS.includes(status)) {
    return {
      id,
      item,
      estado: 'Pendiente',
      detalle: `No se indicó el estado de ${name}; verificación pendiente.`
    };
  }
  return {
    id,
    item,
    estado: status,
    detalle: detail || `${name}: ${status.toLowerCase()}.`
  };
}

export function crearValidacionesDocumentales(project) {
  return [
    compareValues({
      id: 'plazo-cronograma',
      item: 'Concordancia de plazo contractual (Contrato vs. Cronograma Gantt)',
      expected: project.plazoDias,
      actual: project.plazoCronogramaDias,
      label: 'plazo',
      format: value => `${value} días`
    }),
    compareValues({
      id: 'presupuesto-partidas',
      item: 'Coherencia de presupuesto adjudicado vs. Desagregado de partidas',
      expected: project.montoContrato,
      actual: project.presupuestoPartidas,
      label: 'monto',
      format: value => CURRENCY_FORMAT.format(value)
    }),
    documentStatus({
      id: 'permisos-terreno',
      item: 'Disponibilidad de terreno y permisos municipales previos',
      status: project.permisoTerreno,
      detail: project.detallePermisoTerreno,
      name: 'Disponibilidad de terreno y permisos'
    }),
    documentStatus({
      id: 'especificaciones-tecnicas',
      item: 'Especificaciones técnicas de acero y concreto (Bases vs. Oferta)',
      status: project.especificacionesTecnicas,
      detail: project.detalleEspecificacionesTecnicas,
      name: 'Especificaciones técnicas'
    })
  ];
}
