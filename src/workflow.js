export const TRAMITE_STAGES = [
  'Solicitud recibida',
  'Recepción registrada',
  'En revisión del supervisor',
  'Opinión del supervisor registrada',
  'Evaluación de Entidad',
  'Resuelta y notificada'
];

function parseLocalDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isBusinessDay(date) {
  return date.getDay() !== 0 && date.getDay() !== 6;
}

export function addBusinessDays(startDate, days) {
  const date = parseLocalDate(startDate);
  if (!date || !Number.isInteger(days) || days < 0) {
    throw new RangeError('Se requiere una fecha válida y un número de días hábiles igual o mayor que cero.');
  }

  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (isBusinessDay(date)) remaining -= 1;
  }
  return formatLocalDate(date);
}

export function businessDaysRemaining(deadline, today = formatLocalDate(new Date())) {
  const deadlineDate = parseLocalDate(deadline);
  const todayDate = parseLocalDate(today);
  if (!deadlineDate || !todayDate) return null;

  const direction = deadlineDate >= todayDate ? 1 : -1;
  const date = new Date(todayDate);
  let remaining = 0;
  while (formatLocalDate(date) !== formatLocalDate(deadlineDate)) {
    date.setDate(date.getDate() + direction);
    if (isBusinessDay(date)) remaining += direction;
  }
  return remaining;
}

export function getTramiteStageIndex(tramite) {
  const storedStage = TRAMITE_STAGES.indexOf(tramite?.etapa);
  if (storedStage >= 0) return storedStage;
  if (tramite?.estado === 'Atendido') return TRAMITE_STAGES.length - 1;
  if (tramite?.opinion) return 3;
  return 0;
}

export function isTramiteResolved(tramite) {
  return getTramiteStageIndex(tramite) === TRAMITE_STAGES.length - 1;
}

export function getTramiteDaysRemaining(tramite, today) {
  if (tramite?.fechaLimite) return businessDaysRemaining(tramite.fechaLimite, today);
  return Number.isFinite(Number(tramite?.diasRestantes)) ? Number(tramite.diasRestantes) : null;
}
