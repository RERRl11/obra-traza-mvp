import { parseCSVRows } from './csvRows.js';

const REQUIRED_COLUMNS = [
  'codigo',
  'descripcion',
  'unidad',
  'metradocontratado',
  'metradoprogramado',
  'metradoejecutado',
  'presupuestocontratado',
  'gastoejecutado',
  'subcontratista'
];

function readNumber(value, column, rowNumber) {
  if (!value) throw new Error(`Fila ${rowNumber}: falta el valor de "${column}".`);
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Fila ${rowNumber}: "${column}" debe ser un número igual o mayor a cero.`);
  }
  return number;
}

export function parsePartidasCSV(text) {
  const rows = parseCSVRows(text);
  if (rows.length < 2) throw new Error('El CSV debe incluir encabezados y al menos una partida.');

  const headers = rows[0].map(header => header.trim().toLowerCase());
  const missingColumns = REQUIRED_COLUMNS.filter(column => !headers.includes(column));
  if (missingColumns.length) {
    throw new Error(`Este archivo no tiene el formato de presupuesto de partidas. Faltan: ${missingColumns.join(', ')}.`);
  }
  const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
  const codes = new Set();

  return rows.slice(1).map((values, index) => {
    const rowNumber = index + 2;
    if (values.length > headers.length) {
      throw new Error(`Fila ${rowNumber}: hay más columnas que encabezados.`);
    }
    const getValue = column => values[columnIndex[column.toLowerCase()]]?.trim() || '';
    const codigo = getValue('codigo');
    const descripcion = getValue('descripcion');
    const unidad = getValue('unidad');
    const subcontratista = getValue('subcontratista');
    if (!codigo || !descripcion || !unidad || !subcontratista) {
      throw new Error(`Fila ${rowNumber}: código, descripción, unidad y subcontratista son obligatorios.`);
    }
    if (codes.has(codigo.toLowerCase())) {
      throw new Error(`Fila ${rowNumber}: el código de partida "${codigo}" está duplicado.`);
    }

    const metradoContratado = readNumber(getValue('metradoContratado'), 'metradoContratado', rowNumber);
    const metradoProgramado = readNumber(getValue('metradoProgramado'), 'metradoProgramado', rowNumber);
    const metradoEjecutado = readNumber(getValue('metradoEjecutado'), 'metradoEjecutado', rowNumber);
    if (metradoContratado <= 0) {
      throw new Error(`Fila ${rowNumber}: "metradoContratado" debe ser mayor a cero.`);
    }
    if (metradoProgramado > metradoContratado || metradoEjecutado > metradoContratado) {
      throw new Error(`Fila ${rowNumber}: el metrado programado o ejecutado no puede superar el contratado.`);
    }

    codes.add(codigo.toLowerCase());
    return {
      codigo,
      descripcion,
      unidad,
      metradoContratado,
      metradoProgramado,
      metradoEjecutado,
      presupuestoContratado: readNumber(getValue('presupuestoContratado'), 'presupuestoContratado', rowNumber),
      gastoEjecutado: readNumber(getValue('gastoEjecutado'), 'gastoEjecutado', rowNumber),
      jornadas: 0,
      subcontratista,
      especificacion: 'Según archivo CSV importado',
      noConformidad: false,
      observacion: 'Cargado desde CSV contractual.'
    };
  });
}
