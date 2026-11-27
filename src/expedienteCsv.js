import { parseCSVRows } from './csvRows.js';

const REQUIRED_COLUMNS = ['numero', 'nombre', 'cui', 'contratista', 'montoContrato'];
const PROCEDIMIENTOS = ['Licitación Pública', 'Concurso Público', 'Adjudicación Simplificada', 'Contratación Directa'];
const SISTEMAS = ['Suma Alzada', 'Precios Unitarios', 'Llave en Mano', 'Concurso Oferta'];
const MODALIDADES = ['Por contrata', 'Administración directa'];
const ESTADOS = ['Convocatoria', 'Ejecución', 'Paralizada', 'Recepcionada', 'Liquidación'];
const DATE_COLUMNS = ['fechaConvocatoria', 'fechaBuenaPro', 'fechaFirma', 'fechaInicio', 'fechaTermino', 'garantiaVence'];
const OPTIONAL_NUMERIC_COLUMNS = [
  'expedienteTecnico',
  'valorReferencial',
  'plazoDias',
  'adelantos',
  'montoGarantia',
  'penalidades',
  'avanceProgramado',
  'presupuestoModificado'
];
const COMPARISON_COLUMNS = ['plazoCronogramaDias', 'presupuestoPartidas'];
const DOCUMENT_STATUS_FIELDS = ['permisoTerreno', 'especificacionesTecnicas'];
const DOCUMENT_STATUS_OPTIONS = ['Conforme', 'Inconsistencia', 'Pendiente'];

function parseNumber(value, column, rowNumber, defaultValue) {
  if (!value) return defaultValue;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Fila ${rowNumber}: "${column}" debe ser un número igual o mayor a cero.`);
  }
  return number;
}

function validateDate(value, column, rowNumber) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Fila ${rowNumber}: "${column}" debe usar el formato AAAA-MM-DD.`);
  }
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    throw new Error(`Fila ${rowNumber}: "${column}" debe ser una fecha válida.`);
  }
  return value;
}

export function parseExpedienteCSV(text, existingContracts = []) {
  const rows = parseCSVRows(text);
  if (rows.length < 2) throw new Error('El CSV debe incluir encabezados y al menos un expediente.');

  const headers = rows[0].map(header => header.trim().toLowerCase());
  const missingColumns = REQUIRED_COLUMNS.filter(column => !headers.includes(column.toLowerCase()));
  if (missingColumns.length) {
    throw new Error(`Faltan encabezados obligatorios: ${missingColumns.join(', ')}.`);
  }

  const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
  const contractNumbers = new Set(existingContracts.map(contract => contract.numero.trim().toLowerCase()));
  const importedExpedientes = [];

  rows.slice(1).forEach((values, index) => {
    const rowNumber = index + 2;
    const getValue = column => values[columnIndex[column.toLowerCase()]]?.trim() || '';
    if (values.length > headers.length) {
      throw new Error(`Fila ${rowNumber}: hay más columnas que encabezados.`);
    }

    const numero = getValue('numero');
    const nombre = getValue('nombre');
    const cui = getValue('cui');
    const contratista = getValue('contratista');
    if (!numero || !nombre || !cui || !contratista) {
      throw new Error(`Fila ${rowNumber}: numero, nombre, cui y contratista son obligatorios.`);
    }
    if (contractNumbers.has(numero.toLowerCase())) {
      throw new Error(`Fila ${rowNumber}: ya existe el contrato "${numero}".`);
    }

    const expediente = {
      numero,
      nombre,
      cui,
      contratista,
      ubicacion: getValue('ubicacion'),
      areaUsuaria: getValue('areaUsuaria'),
      procedimiento: getValue('procedimiento') || PROCEDIMIENTOS[0],
      sistema: getValue('sistema') || SISTEMAS[1],
      modalidad: getValue('modalidad') || MODALIDADES[0],
      estado: getValue('estado'),
      montoContrato: parseNumber(getValue('montoContrato'), 'montoContrato', rowNumber, 0)
    };

    OPTIONAL_NUMERIC_COLUMNS.forEach(column => {
      expediente[column] = parseNumber(
        getValue(column),
        column,
        rowNumber,
        column === 'plazoDias' ? 180 : 0
      );
    });
    COMPARISON_COLUMNS.forEach(column => {
      expediente[column] = parseNumber(getValue(column), column, rowNumber, null);
    });
    DATE_COLUMNS.forEach(column => {
      expediente[column] = validateDate(getValue(column), column, rowNumber);
    });

    if (expediente.montoContrato <= 0) {
      throw new Error(`Fila ${rowNumber}: "montoContrato" debe ser mayor a cero.`);
    }
    if (expediente.plazoDias <= 0) {
      throw new Error(`Fila ${rowNumber}: "plazoDias" debe ser mayor a cero.`);
    }
    if (expediente.plazoCronogramaDias !== null && expediente.plazoCronogramaDias <= 0) {
      throw new Error(`Fila ${rowNumber}: "plazoCronogramaDias" debe ser mayor a cero.`);
    }
    DOCUMENT_STATUS_FIELDS.forEach(column => {
      expediente[column] = getValue(column);
      if (expediente[column] && !DOCUMENT_STATUS_OPTIONS.includes(expediente[column])) {
        throw new Error(`Fila ${rowNumber}: "${column}" debe ser Conforme, Inconsistencia o Pendiente.`);
      }
    });
    expediente.detallePermisoTerreno = getValue('detallePermisoTerreno');
    expediente.detalleEspecificacionesTecnicas = getValue('detalleEspecificacionesTecnicas');
    if (expediente.procedimiento && !PROCEDIMIENTOS.includes(expediente.procedimiento)) {
      throw new Error(`Fila ${rowNumber}: procedimiento de selección no reconocido.`);
    }
    if (expediente.sistema && !SISTEMAS.includes(expediente.sistema)) {
      throw new Error(`Fila ${rowNumber}: sistema de contratación no reconocido.`);
    }
    if (expediente.modalidad && !MODALIDADES.includes(expediente.modalidad)) {
      throw new Error(`Fila ${rowNumber}: modalidad no reconocida.`);
    }
    if (expediente.estado && !ESTADOS.includes(expediente.estado)) {
      throw new Error(`Fila ${rowNumber}: estado no reconocido.`);
    }
    expediente.estado = expediente.estado || (expediente.fechaFirma ? 'Ejecución' : 'Convocatoria');

    contractNumbers.add(numero.toLowerCase());
    importedExpedientes.push(expediente);
  });

  return importedExpedientes;
}
