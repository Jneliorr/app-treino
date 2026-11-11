import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as XLSX from 'xlsx';
import { parseSetPrescription, parseWorkoutWorkbook } from '../src/services/excelWorkoutParser';

function parse(rows: string[][], name = 'Ficha') {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), name);
  return parseWorkoutWorkbook(book);
}

test('planilha em grade preserva faixas de repetições e o descanso de cada treino', () => {
  const result = parse([
    ['CONSULTORIA TWIN - TREINO DE HIPERTROFIA'],
    ['Treino A: Peito', '', '', '', 'Treino B: Core'],
    ['Exercícios', 'SxR', 'Peso', 'Técnica Avançada', 'Exercícios', 'SxR'],
    ['Supino', '3 × 8–12', '', 'Drop set', 'Prancha', '2xFalha'],
    ['Intervalo entre séries e exercícios: 45 a 75 segundos', '', '', '', 'Intervalo: 2 a 3 minutos'],
  ]);
  assert.equal(result.detectedModel, 'grid');
  const [first, second] = result.routines;
  assert.equal(result.routines.length, 2);
  assert.deepEqual(first.exercises.map((ex) => [ex.name, ex.sets, ex.reps, ex.defaultRestSeconds]), [['Supino', 3, '8-12', 60]]);
  assert.equal(first.exercises[0].advancedTechniqueId, 'drop-set');
  assert.deepEqual(second.exercises.map((ex) => [ex.name, ex.sets, ex.reps, ex.defaultRestSeconds]), [['Prancha', 2, 'F', 150]]);
});

test('aba individual mantém a faixa e ignora prescrições inválidas', () => {
  const result = parse([
    ['Remada', '4x10 a 12'],
    ['Prescrição inválida', '0x8'],
  ], 'Treino C');
  assert.equal(result.detectedModel, 'multi_sheet');
  assert.deepEqual(result.routines[0].exercises.map((ex) => [ex.name, ex.sets, ex.reps]), [['Remada', 4, '10-12']]);
  assert.equal(parseSetPrescription('9999999x8'), null);
  assert.equal(parseSetPrescription('3x12-8'), null);
});
