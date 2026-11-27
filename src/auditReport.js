import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const money = value => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function crearInformeAuditoria({ partidas, validacionesDoc, tramites, bitacora, usuario, evaluarEstadoPartida, fecha = new Date() }) {
  const doc = new jsPDF();
  const azul = [18, 55, 123];
  const fechaTexto = fecha.toLocaleString('es-PE', { timeZone: 'America/Lima' });
  let y = 40;
  const nuevaPagina = () => { doc.addPage(); y = 40; };
  const titulo = texto => {
    if (y > 245) nuevaPagina();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...azul);
    doc.text(texto, 16, y); y += 8;
  };
  const parrafo = texto => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(45, 55, 72);
    for (const linea of doc.splitTextToSize(texto, 178)) {
      if (y > 270) nuevaPagina();
      doc.text(linea, 16, y); y += 5;
    }
    y += 4;
  };
  const tabla = (head, body) => {
    autoTable(doc, {
      startY: y, head: [head], body: body.length ? body : [head.map((_, i) => i === 0 ? 'Sin registros disponibles' : '')],
      margin: { top: 38, bottom: 22, left: 16, right: 16 },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: azul }, alternateRowStyles: { fillColor: [241, 245, 251] },
      rowPageBreak: 'avoid',
    });
    y = doc.lastAutoTable.finalY + 12;
  };
  const evaluadas = partidas.map(p => ({ ...p, estado: evaluarEstadoPartida(p) }));
  const hallazgos = evaluadas.filter(p => p.estado.nivel !== 'VERDE');
  const presupuesto = partidas.reduce((n, p) => n + p.presupuestoContratado, 0);
  const gasto = partidas.reduce((n, p) => n + p.gastoEjecutado, 0);
  doc.setProperties({ title: 'Informe de auditoría de seguimiento de obra', author: 'OBRA TRAZA', subject: 'Control contractual y trazabilidad - demostración académica' });
  titulo('INFORME DE AUDITORÍA DE SEGUIMIENTO');
  parrafo(`Contrato N° 014-2026-UNT/OAB\nObra: Mejoramiento de Pabellón Académico e Infraestructura Educativa\nEmitido: ${fechaTexto} (hora de Lima)\nGenerado por: ${usuario.nombre} | ${usuario.etiquetaRol}`);
  titulo('1. Objetivo y alcance');
  parrafo('Revisar el avance de las partidas, el gasto registrado, la consistencia documental y el seguimiento de trámites. El informe refleja los datos disponibles al momento de exportar. Demostración académica con datos sintéticos; no constituye un dictamen de auditoría oficial ni acredita una inspección de campo.');
  titulo('2. Resumen ejecutivo');
  tabla(['Indicador', 'Resultado'], [
    ['Partidas revisadas', String(partidas.length)],
    ['Alertas críticas / preventivas', `${evaluadas.filter(p => p.estado.nivel === 'ROJO').length} / ${evaluadas.filter(p => p.estado.nivel === 'AMARILLO').length}`],
    ['Presupuesto contratado', money(presupuesto)], ['Gasto ejecutado', money(gasto)],
    ['Ejecución financiera', presupuesto > 0 ? `${(gasto / presupuesto * 100).toFixed(1)}%` : 'Sin presupuesto'],
    ['Verificaciones con inconsistencias', String(validacionesDoc.filter(v => v.estado !== 'Conforme').length)],
    ['Trámites pendientes de atención', String(tramites.filter(t => t.estado !== 'Atendido').length)],
  ]);
  titulo('3. Criterios de revisión');
  parrafo('Se compara el metrado ejecutado con el programado de cada partida y el gasto con su presupuesto contratado. El sistema clasifica como crítico el incumplimiento de calidad, un cumplimiento inferior al 75% o un exceso de gasto superior al 10%; como preventivo, un cumplimiento inferior al 95% o un exceso superior al 2%. Son reglas del prototipo, no umbrales normativos.');
  titulo('4. Hallazgos y acciones recomendadas');
  if (!hallazgos.length) parrafo('No se identificaron alertas en las partidas bajo los criterios automáticos del sistema. La documentación y los trámites se detallan en las secciones siguientes.');
  hallazgos.forEach((p, i) => {
    titulo(`H-${String(i + 1).padStart(2, '0')} | Partida ${p.codigo}`);
    parrafo(`${p.descripcion}\nEstado: ${p.estado.etiqueta}. Cumplimiento: ${p.estado.cumplimiento}%.\nCondición registrada: ${p.observacion || 'Sin observación registrada.'}\nReferencia técnica: ${p.especificacion || 'No consignada.'}\nContratista registrado: ${p.subcontratista}\nCausa: pendiente de evaluación por el responsable.`);
    parrafo(p.noConformidad
      ? 'Riesgo: validar trabajos con una no conformidad pendiente. Acción recomendada: solicitar el sustento de calidad, verificar la subsanación y documentar su aprobación por supervisión antes de validar la partida.'
      : 'Riesgo: desviación del avance programado o del presupuesto. Acción recomendada: revisar rendimientos y costos, identificar la causa y acordar un plan correctivo con el residente y la supervisión.');
  });
  nuevaPagina();
  titulo('5. Detalle de partidas');
  tabla(['Partida / contratista', 'Metrado prog. / ejec.', 'Cumpl.', 'Presupuesto / gasto', 'Estado'], evaluadas.map(p => [
    `${p.codigo} - ${p.descripcion}\n${p.subcontratista}`, `${p.metradoProgramado} / ${p.metradoEjecutado} ${p.unidad}`,
    `${p.estado.cumplimiento}%`, `${money(p.presupuestoContratado)}\n${money(p.gastoEjecutado)}`, p.estado.etiqueta,
  ]));
  titulo('6. Consistencia documental');
  tabla(['Verificación', 'Estado', 'Detalle registrado'], validacionesDoc.map(v => [v.item, v.estado, v.detalle]));
  titulo('7. Seguimiento de trámites');
  tabla(['Referencia / asunto', 'Responsable', 'Fecha límite', 'Estado / sustento pendiente'], tramites.map(t => [`${t.id}\n${t.tipo}\n${t.asunto}`, t.responsable, t.fechaLimite, `${t.estado}\n${t.docsPendientes}`]));
  titulo('8. Trazabilidad y referencias de evidencia');
  parrafo('Se incluyen las referencias consignadas en la bitácora. Los archivos de evidencia no se adjuntan ni se verifican automáticamente.');
  tabla(['Fecha / responsable', 'Referencia', 'Registro / evidencia'], bitacora.map(b => [`${b.fecha}\n${b.usuario}`, b.partida, `${b.accion}\nEvidencia: ${b.evidencia || 'No consignada'}`]));
  titulo('9. Conclusiones y seguimiento');
  parrafo(`${hallazgos.length} partida(s) requieren seguimiento según los criterios del sistema. Priorizar las alertas críticas, subsanar las inconsistencias documentales y revisar los trámites pendientes. La entidad y la supervisión deben asignar responsables y fechas de cierre, y dejar constancia de la revisión de los sustentos.`);
  parrafo('Elaborado por: ____________________\nRevisado por: _____________________\nFecha de revisión: __________________');
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFillColor(...azul); doc.rect(0, 0, 210, 27, 'F');
    doc.setFillColor(230, 173, 9); doc.rect(0, 27, 210, 1.5, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('OBRA TRAZA', 16, 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('Control contractual y trazabilidad de obras', 16, 20);
    doc.setDrawColor(210, 220, 235); doc.line(16, 279, 194, 279);
    doc.setFontSize(8); doc.setTextColor(85); doc.text('Demostración académica | MVP 1.0 | Datos sintéticos', 16, 285);
    doc.text(`Página ${page} de ${pages}`, 194, 285, { align: 'right' });
  }
  return doc;
}
