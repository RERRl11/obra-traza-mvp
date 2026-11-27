import test from 'node:test';
import assert from 'node:assert/strict';
import { addBusinessDays, businessDaysRemaining, getTramiteStageIndex } from './workflow.js';

test('addBusinessDays skips weekends', () => {
  assert.equal(addBusinessDays('2026-11-27', 1), '2026-11-30');
  assert.equal(addBusinessDays('2026-11-27', 15), '2026-12-18');
});

test('businessDaysRemaining calculates overdue and upcoming deadlines', () => {
  assert.equal(businessDaysRemaining('2026-11-30', '2026-11-27'), 1);
  assert.equal(businessDaysRemaining('2026-11-26', '2026-11-27'), -1);
  assert.equal(businessDaysRemaining('2026-11-30', '2026-11-30'), 0);
});

test('getTramiteStageIndex supports new and legacy records', () => {
  assert.equal(getTramiteStageIndex({ etapa: 'En revisión del supervisor' }), 2);
  assert.equal(getTramiteStageIndex({ estado: 'Atendido' }), 5);
  assert.equal(getTramiteStageIndex({ opinion: 'Conforme' }), 3);
  assert.equal(getTramiteStageIndex({ estado: 'Preventivo' }), 0);
});
